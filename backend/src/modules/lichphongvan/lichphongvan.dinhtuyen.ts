import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { HoSoUngTuyen } from '../hosoungtuyen/hosoungtuyen.mohinh.js'
import { NhaTuyenDung } from '../nhatuyendung/nhatuyendung.mohinh.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { UngVien } from '../ungvien/ungvien.mohinh.js'
import { damBaoTrangThaiLichPhongVan } from '../workflow/trangthai.dichvu.js'
import { dichVuWorkflowUngTuyen } from '../workflow/ungtuyen.dichvu.js'
import { dieuKhienLichPhongVan } from './lichphongvan.dieukhien.js'
import { dichVuLichPhongVan } from './lichphongvan.dichvu.js'
import { LichPhongVan } from './lichphongvan.mohinh.js'

async function kiemTraQuyenLichPhongVan(yeuCau: any, _phanHoi: any, tiepTheo: any) {
  const nguoiDung = yeuCau.nguoiDung
  const ma = String(yeuCau.params.ma ?? '')
  const lich = await (LichPhongVan as any).findById(ma).populate('maHoSoUngTuyen')
  if (!lich) throw new LoiUngDung('Khong tim thay lich phong van', 404, 'NOT_FOUND')

  const hoSo = await (HoSoUngTuyen as any).findById(lich.maHoSoUngTuyen?._id ?? lich.maHoSoUngTuyen).select('maUngVien maTinTuyenDung')
  if (!hoSo) throw new LoiUngDung('Khong tim thay ho so ung tuyen', 404, 'NOT_FOUND')

  const vaiTro = String(nguoiDung.vaiTro ?? '')
  if (vaiTro === 'ung_vien') {
    const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id }).select('_id')
    if (!ungVien || String(ungVien._id) !== String(hoSo.maUngVien)) {
      throw new LoiUngDung('Ban khong co quyen cap nhat lich phong van nay', 403, 'FORBIDDEN')
    }
  }

  if (vaiTro === 'nha_tuyen_dung') {
    const congTy = await (NhaTuyenDung as any).findOne({ maNguoiDung: nguoiDung.id }).select('_id')
    const tin = await (TinTuyenDung as any).findById(hoSo.maTinTuyenDung).select('maNhaTuyenDung')
    if (!congTy || !tin || String(tin.maNhaTuyenDung) !== String(congTy._id)) {
      throw new LoiUngDung('Ban khong co quyen cap nhat lich phong van nay', 403, 'FORBIDDEN')
    }
  }

  const trangThaiMoi = String(yeuCau.body?.trangThai ?? '')
  if (trangThaiMoi) {
    damBaoTrangThaiLichPhongVan(vaiTro, String(lich.trangThai ?? ''), trangThaiMoi)
  }
  tiepTheo()
}

export const dinhTuyenLichPhongVan = Router()
dinhTuyenLichPhongVan.use(yeuCauDangNhap)

dinhTuyenLichPhongVan.get('/', dieuKhienLichPhongVan.layDanhSach)
dinhTuyenLichPhongVan.get('/:ma', dieuKhienLichPhongVan.layChiTiet)
dinhTuyenLichPhongVan.post('/', yeuCauVaiTro(['nha_tuyen_dung', 'admin']), batLoiBatDongBo(async () => {
  throw new LoiUngDung('Hay tao lich phong van qua endpoint /hosoungtuyen/:ma/moi-phong-van de dong bo trang thai ho so', 409, 'BUSINESS_ENDPOINT_REQUIRED')
}))
dinhTuyenLichPhongVan.patch('/:ma', yeuCauVaiTro(['ung_vien', 'nha_tuyen_dung', 'admin']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  if ('trangThai' in (yeuCau.body ?? {}) || 'ketQua' in (yeuCau.body ?? {})) {
    throw new LoiUngDung('Khong cap nhat truc tiep trang thai hoac ket qua phong van; hay dung endpoint nghiep vu', 409, 'BUSINESS_ENDPOINT_REQUIRED')
  }
  tiepTheo()
}), batLoiBatDongBo(kiemTraQuyenLichPhongVan), dieuKhienLichPhongVan.capNhat)
dinhTuyenLichPhongVan.delete('/:ma', yeuCauVaiTro(['nha_tuyen_dung', 'admin']), batLoiBatDongBo(kiemTraQuyenLichPhongVan), dieuKhienLichPhongVan.xoa)

async function thucThiHanhDongLichPhongVan(yeuCau: any, phanHoi: any, duLieuCapNhat: any) {
  const ma = String(yeuCau.params.ma ?? '')
  yeuCau.body = duLieuCapNhat
  await kiemTraQuyenLichPhongVan(yeuCau as any, phanHoi as any, () => undefined)
  const duLieu = await dichVuLichPhongVan.capNhat(ma, duLieuCapNhat)
  phanHoi.json({ duLieu })
}

dinhTuyenLichPhongVan.post('/:ma/xac-nhan', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.xacNhanLichPhongVan((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''))
  phanHoi.json({ duLieu })
}))

dinhTuyenLichPhongVan.post('/:ma/doi-lich', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.yeuCauDoiLich((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body?.ghiChu)
  phanHoi.json({ duLieu })
}))

dinhTuyenLichPhongVan.patch('/:ma/cap-nhat', yeuCauVaiTro(['nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.capNhatLichPhongVan((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''), yeuCau.body)
  phanHoi.json({ duLieu })
}))

dinhTuyenLichPhongVan.post('/:ma/hoan-thanh', yeuCauVaiTro(['nha_tuyen_dung']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuWorkflowUngTuyen.capNhatKetQuaPhongVan((yeuCau as any).nguoiDung, String(yeuCau.params.ma ?? ''), {
    ketQua: String(yeuCau.body?.ketQua ?? '') as 'dat' | 'khong_dat',
    ghiChu: yeuCau.body?.ghiChu,
  })
  phanHoi.json({ duLieu })
}))

dinhTuyenLichPhongVan.post('/:ma/huy', yeuCauVaiTro(['ung_vien', 'nha_tuyen_dung', 'admin']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const ghiChu = yeuCau.body?.ghiChu
  await thucThiHanhDongLichPhongVan(yeuCau, phanHoi, { trangThai: 'da_huy', ghiChu })
}))
