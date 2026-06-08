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
  const lich = await LichPhongVan.findUnique({ where: { id: ma } })
  if (!lich) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn', 404, 'NOT_FOUND')

  const hoSo = await HoSoUngTuyen.findUnique({ where: { id: lich.maHoSoUngTuyen }, select: { maUngVien: true, maTinTuyenDung: true } })
  if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'NOT_FOUND')

  const vaiTro = String(nguoiDung.vaiTro ?? '')
  if (vaiTro === 'ung_vien') {
    const ungVien = await UngVien.findUnique({ where: { maNguoiDung: nguoiDung.id }, select: { id: true } })
    if (!ungVien || String(ungVien.id) !== String(hoSo.maUngVien)) {
      throw new LoiUngDung('Bạn không có quyền cập nhật lịch phỏng vấn này', 403, 'FORBIDDEN')
    }
  }

  if (vaiTro === 'nha_tuyen_dung') {
    const congTy = await NhaTuyenDung.findUnique({ where: { maNguoiDung: nguoiDung.id }, select: { id: true } })
    const tin = await TinTuyenDung.findUnique({ where: { id: hoSo.maTinTuyenDung }, select: { maNhaTuyenDung: true } })
    if (!congTy || !tin || String(tin.maNhaTuyenDung) !== String(congTy.id)) {
      throw new LoiUngDung('Bạn không có quyền cập nhật lịch phỏng vấn này', 403, 'FORBIDDEN')
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
  throw new LoiUngDung('Hãy tạo lịch phỏng vấn qua endpoint /hosoungtuyen/:ma/moi-phong-van để đồng bộ trạng thái hồ sơ', 409, 'BUSINESS_ENDPOINT_REQUIRED')
}))
dinhTuyenLichPhongVan.patch('/:ma', yeuCauVaiTro(['ung_vien', 'nha_tuyen_dung', 'admin']), batLoiBatDongBo(async (yeuCau, _phanHoi, tiepTheo) => {
  if ('trangThai' in (yeuCau.body ?? {}) || 'ketQua' in (yeuCau.body ?? {})) {
    throw new LoiUngDung('Không cập nhật trực tiếp trạng thái hoặc kết quả phỏng vấn; hãy dùng endpoint nghiệp vụ', 409, 'BUSINESS_ENDPOINT_REQUIRED')
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


