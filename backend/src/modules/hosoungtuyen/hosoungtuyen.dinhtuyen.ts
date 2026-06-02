import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { damBaoTrangThaiHoSoUngTuyen } from '../workflow/trangthai.dichvu.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { UngVien } from '../ungvien/ungvien.mohinh.js'
import { dieuKhienHoSoUngTuyen } from './hosoungtuyen.dieukhien.js'
import { HoSoUngTuyen } from './hosoungtuyen.mohinh.js'
import { dichVuWorkflowUngTuyen } from '../workflow/ungtuyen.dichvu.js'

async function kiemTraQuyenCapNhatHoSoUngTuyen(yeuCau: any, _phanHoi: any, tiepTheo: any) {
  const nguoiDung = yeuCau.nguoiDung
  const ma = String(yeuCau.params.ma ?? '')
  const hoSo = await (HoSoUngTuyen as any).findById(ma).populate('maTinTuyenDung maUngVien')
  if (!hoSo) throw new LoiUngDung('Khong tim thay ho so ung tuyen', 404, 'NOT_FOUND')

  const trangThaiMoi = String(yeuCau.body?.trangThai ?? '')
  if (!trangThaiMoi) {
    tiepTheo()
    return
  }

  const trangThaiHienTai = String(hoSo.trangThai ?? '')
  const vaiTro = String(nguoiDung.vaiTro ?? '')

  if (vaiTro === 'ung_vien') {
    const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id }).select('_id')
    if (!ungVien || String(ungVien._id) !== String(hoSo.maUngVien?._id ?? hoSo.maUngVien)) {
      throw new LoiUngDung('Ban khong co quyen cap nhat ho so ung tuyen nay', 403, 'FORBIDDEN')
    }
  }

  if (vaiTro === 'nha_tuyen_dung') {
    const congTy = await (NhaTuyenDung as any).findOne({ maNguoiDung: nguoiDung.id }).select('_id')
    const tin = await (TinTuyenDung as any).findById(hoSo.maTinTuyenDung?._id ?? hoSo.maTinTuyenDung).select('maNhaTuyenDung')
    if (!congTy || !tin || String(tin.maNhaTuyenDung) !== String(congTy._id)) {
      throw new LoiUngDung('Ban khong co quyen cap nhat ho so ung tuyen nay', 403, 'FORBIDDEN')
    }
  }

  damBaoTrangThaiHoSoUngTuyen(vaiTro, trangThaiHienTai, trangThaiMoi)
  tiepTheo()
}

export const dinhTuyenHoSoUngTuyen = Router()

dinhTuyenHoSoUngTuyen.use(yeuCauDangNhap)

dinhTuyenHoSoUngTuyen.post('/ung-tuyen', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.ungTuyen((yeuCau as any).nguoiDung, {
    maTinTuyenDung: String(yeuCau.body?.maTinTuyenDung ?? ''),
    maHoSoNangLuc: yeuCau.body?.maHoSoNangLuc,
    thuXinViec: yeuCau.body?.thuXinViec,
  })
  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.post('/ung-tuyen-nhanh', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const maTinTuyenDung = String(yeuCau.body?.maTinTuyenDung ?? '')
  if (!maTinTuyenDung) throw new LoiUngDung('Thieu ma tin tuyen dung', 422, 'MISSING_JOB_ID')

  const duLieu = await dichVuWorkflowUngTuyen.ungTuyen((yeuCau as any).nguoiDung, {
    maTinTuyenDung,
    thuXinViec: yeuCau.body?.thuXinViec,
  })

  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.get('/', dieuKhienHoSoUngTuyen.layDanhSach)
dinhTuyenHoSoUngTuyen.get('/:ma', dieuKhienHoSoUngTuyen.layChiTiet)
dinhTuyenHoSoUngTuyen.post('/', yeuCauVaiTro(['ung_vien', 'admin']), dieuKhienHoSoUngTuyen.taoMoi)
dinhTuyenHoSoUngTuyen.patch('/:ma', yeuCauVaiTro(['ung_vien', 'nha_tuyen_dung', 'admin']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  if ('trangThai' in (yeuCau.body ?? {}) || 'diemKhopKyNang' in (yeuCau.body ?? {})) {
    throw new LoiUngDung('Khong cap nhat truc tiep trang thai hoac diem khop ky nang; hay dung endpoint nghiep vu', 409, 'BUSINESS_ENDPOINT_REQUIRED')
  }
  tiepTheo()
}), batLoiBatDongBo(kiemTraQuyenCapNhatHoSoUngTuyen), dieuKhienHoSoUngTuyen.capNhat)
dinhTuyenHoSoUngTuyen.delete('/:ma', yeuCauVaiTro(['ung_vien', 'nha_tuyen_dung', 'admin']), batLoiBatDongBo(kiemTraQuyenCapNhatHoSoUngTuyen), dieuKhienHoSoUngTuyen.xoa)

dinhTuyenHoSoUngTuyen.post('/:ma/rut', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const ma = String(yeuCau.params.ma ?? '')
  const duLieu = await dichVuWorkflowUngTuyen.rutHoSo((yeuCau as any).nguoiDung, ma, yeuCau.body?.ghiChu)
  phanHoi.json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.post('/:ma/xem', yeuCauVaiTro(['nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.xemHoSo((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''))
  phanHoi.json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.post('/:ma/danh-gia', yeuCauVaiTro(['nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.danhGiaHoSo((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''), {
    trangThai: String(yeuCau.body?.trangThai ?? 'dang_xet_duyet') as 'dang_xet_duyet' | 'tu_choi',
    ghiChu: yeuCau.body?.ghiChu,
    giaiDoanTuChoi: yeuCau.body?.giaiDoanTuChoi,
  })
  phanHoi.json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.post('/:ma/moi-phong-van', yeuCauVaiTro(['nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.moiPhongVan((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body)
  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.post('/:ma/chuyen-trang-thai', yeuCauVaiTro(['nha_tuyen_dung', 'admin']), batLoiBatDongBo(async () => {
  throw new LoiUngDung('Khong chuyen trang thai truc tiep; hay dung endpoint nghiep vu phu hop', 409, 'BUSINESS_ENDPOINT_REQUIRED')
}))
