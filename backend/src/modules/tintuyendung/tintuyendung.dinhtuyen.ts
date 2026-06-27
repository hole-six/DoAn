import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { layNguoiDungTuAccessToken } from '../xacthuc/xacthuc.dichvu.js'
import { damBaoTrangThaiTinTuyenDung } from '../workflow/trangthai.dichvu.js'
import { dieuKhienTinTuyenDung } from './tintuyendung.dieukhien.js'
import { dichVuTinTuyenDung } from './tintuyendung.dichvu.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

const TRANG_THAI_KHOA_SUA = new Set(['dang_mo', 'tam_dong', 'het_han'])
const thuMucUpload = path.join(process.cwd(), 'uploads')
fs.mkdirSync(thuMucUpload, { recursive: true })

const taiAnhTin = multer({
  storage: multer.diskStorage({
    destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
    filename: (_yeuCau, tep, goiLai) => {
      const duoiTep = path.extname(tep.originalname).toLowerCase()
      goiLai(null, `tin-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_yeuCau, tep, goiLai) => {
    if (!tep.mimetype.startsWith('image/')) return goiLai(new Error('Chi cho phep upload file anh'))
    goiLai(null, true)
  },
})

async function layCongTyTheoNguoiDung(maNguoiDung: string) {
  return NhaTuyenDung.findUnique({ where: { maNguoiDung }, select: { id: true, trangThaiDuyet: true } })
}

async function layNguoiDungNeuCo(authorization?: string) {
  try {
    return await layNguoiDungTuAccessToken(authorization)
  } catch {
    return null
  }
}

async function taoBoLocTruyCapDanhSachTin(query: Record<string, unknown>, authorization?: string) {
  const nguoiDung = await layNguoiDungNeuCo(authorization)
  const base = {
    tuKhoa: query.tuKhoa,
    trang: query.trang,
    kichThuocTrang: query.kichThuocTrang ?? query.soPhanTu ?? query.limit,
    limit: query.limit,
    capBac: query.capBac,
    loaiHinh: query.loaiHinh,
    kyNang: query.kyNang,
    loaiKyNang: query.loaiKyNang ?? query.loai,
  }
  if (!nguoiDung || nguoiDung.vaiTro === 'ung_vien') return { ...base, cheDo: 'cong_khai' }
  if (nguoiDung.vaiTro === 'admin') return { ...base, cheDo: 'admin' }

  const congTy = await layCongTyTheoNguoiDung(nguoiDung.id)
  return {
    ...base,
    cheDo: 'nha_tuyen_dung',
    maNhaTuyenDungSoHuu: congTy?.id ? String(congTy.id) : '',
  }
}

async function coQuyenXemTin(maTin: string, authorization?: string) {
  const tin = await dichVuTinTuyenDung.layTheoMa(maTin) as any
  const nguoiDung = await layNguoiDungNeuCo(authorization)

  if (!nguoiDung || nguoiDung.vaiTro === 'ung_vien') {
    return { tin, hopLe: tin.trangThai === 'dang_mo' && tin.nhaTuyenDung?.trangThaiDuyet === 'da_duyet' }
  }

  if (nguoiDung.vaiTro === 'admin') return { tin, hopLe: true }

  const congTy = await layCongTyTheoNguoiDung(nguoiDung.id)
  const laChuTin = congTy?.id ? String(congTy.id) === String(tin.maNhaTuyenDung) : false
  return { tin, hopLe: laChuTin || (tin.trangThai === 'dang_mo' && tin.nhaTuyenDung?.trangThaiDuyet === 'da_duyet') }
}

const damBaoQuyenTaoTin = batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  const nguoiDung = await layNguoiDungTuAccessToken(yeuCau.headers.authorization)
  if (!['nha_tuyen_dung', 'admin'].includes(nguoiDung.vaiTro)) {
    throw new LoiUngDung('Bạn không có quyền tạo tin tuyển dụng', 403)
  }

  if (nguoiDung.vaiTro === 'nha_tuyen_dung') {
    const congTy = await layCongTyTheoNguoiDung(nguoiDung.id)
    if (!congTy) throw new LoiUngDung('Tài khoản này chưa có hồ sơ nhà tuyển dụng', 422)
    if (congTy.trangThaiDuyet !== 'da_duyet') {
      throw new LoiUngDung('Công ty chưa được duyệt nên chưa thể tạo tin tuyển dụng', 403, 'EMPLOYER_NOT_APPROVED')
    }

    yeuCau.body = {
      ...yeuCau.body,
      maNhaTuyenDung: String(congTy.id),
      trangThai: 'cho_duyet',
    }
  }

  tiepTheo()
})

const damBaoQuyenSuaXoaTin = batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  const nguoiDung = await layNguoiDungTuAccessToken(yeuCau.headers.authorization)
  if (!['nha_tuyen_dung', 'admin'].includes(nguoiDung.vaiTro)) {
    throw new LoiUngDung('Bạn không có quyền sửa tin tuyển dụng', 403)
  }

  const ma = String(yeuCau.params.ma ?? '')
  const tin = await TinTuyenDung.findUnique({ where: { id: ma } })
  if (!tin) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404)

  if (nguoiDung.vaiTro === 'admin') {
    if (yeuCau.body?.trangThai) {
      damBaoTrangThaiTinTuyenDung('admin', String(tin.trangThai ?? ''), String(yeuCau.body.trangThai))
    }
    tiepTheo()
    return
  }

  const congTy = await layCongTyTheoNguoiDung(nguoiDung.id)
  if (!congTy) throw new LoiUngDung('Tài khoản này chưa có hồ sơ nhà tuyển dụng', 422)

  if (String(tin.maNhaTuyenDung) !== String(congTy.id)) {
    throw new LoiUngDung('Bạn không có quyền sửa tin tuyển dụng nay', 403)
  }

  if (yeuCau.body?.trangThai) {
    const trangThaiMoi = String(yeuCau.body.trangThai)
    damBaoTrangThaiTinTuyenDung(nguoiDung.vaiTro, String(tin.trangThai ?? ''), trangThaiMoi)
  }

  if (String(yeuCau.method).toUpperCase() === 'PATCH') {
    if (TRANG_THAI_KHOA_SUA.has(String(tin.trangThai ?? ''))) {
      throw new LoiUngDung(
        'Tin đã duyệt chỉ cho phép đổi trạng thái đóng/mở, không thể chỉnh sửa nội dung',
        409,
        'JOB_POST_LOCKED',
        undefined,
        'Sử dụng thao tác tạm đóng/mở lại cho tin đã duyệt',
      )
    }

    yeuCau.body = {
      ...yeuCau.body,
      maNhaTuyenDung: String(congTy.id),
    }
  }

  tiepTheo()
})

export const dinhTuyenTinTuyenDung = Router()

dinhTuyenTinTuyenDung.get('/', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const boLoc = await taoBoLocTruyCapDanhSachTin(yeuCau.query as Record<string, unknown>, yeuCau.headers.authorization)
  const ketQua = await dichVuTinTuyenDung.layDanhSach(boLoc)
  return phanHoi.json(ketQua)
}))
dinhTuyenTinTuyenDung.get('/:ma', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const ma = String(yeuCau.params.ma ?? '')
  const { tin, hopLe } = await coQuyenXemTin(ma, yeuCau.headers.authorization)
  if (!hopLe) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404)
  return phanHoi.json({ duLieu: tin })
}))
dinhTuyenTinTuyenDung.use(yeuCauDangNhap)
dinhTuyenTinTuyenDung.post('/upload-anh', yeuCauVaiTro(['nha_tuyen_dung', 'admin']), taiAnhTin.single('anh'), (yeuCau, phanHoi) => {
  if (!yeuCau.file) return phanHoi.status(400).json({ thongBao: 'Chưa có file ảnh tin tuyển dụng' })
  const duongDan = `/uploads/${yeuCau.file.filename}`
  const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`
  return phanHoi.status(201).json({ duLieu: { duongDan, url: `${gocUrl}${duongDan}` } })
})
dinhTuyenTinTuyenDung.post('/', damBaoQuyenTaoTin, dieuKhienTinTuyenDung.taoMoi)
dinhTuyenTinTuyenDung.patch('/:ma', damBaoQuyenSuaXoaTin, dieuKhienTinTuyenDung.capNhat)
dinhTuyenTinTuyenDung.delete('/:ma', damBaoQuyenSuaXoaTin, dieuKhienTinTuyenDung.xoa)

dinhTuyenTinTuyenDung.post('/:ma/duyet', yeuCauVaiTro(['admin']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  yeuCau.body = { trangThai: 'dang_mo' }
  tiepTheo()
}), dieuKhienTinTuyenDung.capNhat)

dinhTuyenTinTuyenDung.post('/:ma/tu-choi', yeuCauVaiTro(['admin']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  yeuCau.body = { trangThai: 'tu_choi' }
  tiepTheo()
}), dieuKhienTinTuyenDung.capNhat)

dinhTuyenTinTuyenDung.post('/:ma/mo-lai', yeuCauVaiTro(['admin', 'nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  yeuCau.body = { trangThai: 'dang_mo' }
  tiepTheo()
}), damBaoQuyenSuaXoaTin, dieuKhienTinTuyenDung.capNhat)

dinhTuyenTinTuyenDung.post('/:ma/tam-dong', yeuCauVaiTro(['admin', 'nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  yeuCau.body = { trangThai: 'tam_dong' }
  tiepTheo()
}), damBaoQuyenSuaXoaTin, dieuKhienTinTuyenDung.capNhat)



