import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { coId, ganCongTyChoTin, ganNguoiDungChoUngVien } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { dichVuHoSoUngTuyen, layHoSoUngTuyenDayDuNoiBo } from '../hosoungtuyen/hosoungtuyen.dichvu.js'
import { dichVuLichPhongVan, layLichPhongVanDayDuNoiBo } from '../lichphongvan/lichphongvan.dichvu.js'
import { thongBaoAdminUngVienYeuCauDoiLich, thongBaoHeThong, thongBaoHoSoDuocXem, thongBaoHoSoMoiUngTuyen, thongBaoKetQuaPhongVan, thongBaoLichPhongVanThayDoi, thongBaoMoiPhongVan, thongBaoUngVienChapNhanLich, thongBaoUngVienYeuCauDoiLich } from '../thongbao/thongbao.helper.js'

type NguoiDungHienTai = { id: string; vaiTro: string }
type LichInput = {
  thoiGianBatDau: Date | string
  thoiGianKetThuc?: Date | string
  diaChi?: string
  hinhThuc?: 'online' | 'offline'
  linkHop?: string
  ghiChu?: string
}

const TRANG_THAI_HO_SO_CHUA_KET_THUC = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van']

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

function damBaoVaiTro(nguoiDung: NguoiDungHienTai, vaiTro: string) {
  if (nguoiDung.vaiTro !== vaiTro) throw new LoiUngDung('Ban khong co quyen thuc hien thao tac nay', 403, 'FORBIDDEN')
}

async function layUngVienCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  damBaoVaiTro(nguoiDung, 'ung_vien')
  const ungVien = await prisma.ungVien.findUnique({ where: { maNguoiDung: nguoiDung.id } })
  if (!ungVien) throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi thao tác', 422, 'CANDIDATE_PROFILE_REQUIRED')
  const hydrated = await ganNguoiDungChoUngVien([ungVien as any])
  return hydrated[0]
}

async function layCongTyCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  damBaoVaiTro(nguoiDung, 'nha_tuyen_dung')
  const congTy = await prisma.nhaTuyenDung.findUnique({ where: { maNguoiDung: nguoiDung.id } })
  if (!congTy) throw new LoiUngDung('Tài khoản này chưa có hồ sơ nhà tuyển dụng', 422, 'EMPLOYER_PROFILE_REQUIRED')
  return coId(congTy) as any
}

async function layTinDayDu(maTinTuyenDung: string) {
  const tin = await prisma.tinTuyenDung.findUnique({ where: { id: maTinTuyenDung } })
  if (!tin) return null
  return (await ganCongTyChoTin([tin as any]))[0]
}

async function layHoSoDayDu(maHoSoUngTuyen: string) {
  const hoSo = await layHoSoUngTuyenDayDuNoiBo(maHoSoUngTuyen)
  if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
  return hoSo
}

async function damBaoHoSoThuocUngVien(maHoSoUngTuyen: string, nguoiDung: NguoiDungHienTai) {
  const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
  const hoSo = await layHoSoDayDu(maHoSoUngTuyen)
  if (id(hoSo.maUngVien) !== id(ungVien)) throw new LoiUngDung('Bạn không có quyền thao tác với hồ sơ ứng tuyển này', 403, 'FORBIDDEN')
  return { hoSo, ungVien }
}

async function damBaoHoSoThuocCongTy(maHoSoUngTuyen: string, nguoiDung: NguoiDungHienTai) {
  const congTy = await layCongTyCuaNguoiDung(nguoiDung)
  const hoSo = await layHoSoDayDu(maHoSoUngTuyen)
  if (id(hoSo.maTinTuyenDung?.maNhaTuyenDung) !== id(congTy)) {
    throw new LoiUngDung('Bạn không có quyền thao tác với hồ sơ ứng tuyển này', 403, 'FORBIDDEN')
  }
  return { hoSo, congTy }
}

async function layLichVaHoSo(maLichPhongVan: string) {
  const lich = await prisma.lichPhongVan.findUnique({ where: { id: maLichPhongVan } })
  if (!lich) throw new LoiUngDung('Không tìm thấy lịch phỏng vấn', 404, 'INTERVIEW_NOT_FOUND')
  const hoSo = await layHoSoDayDu(lich.maHoSoUngTuyen)
  return { lich: coId(lich) as any, hoSo }
}

async function ghiLichSuHoSo(params: { maHoSoUngTuyen: string; trangThaiCu?: string; trangThaiMoi: string; ghiChu?: string; maNguoiDung?: string }) {
  await prisma.lichSuHoSoUngTuyen.create({ data: params })
}

async function capNhatTrangThaiHoSo(hoSo: any, trangThaiMoi: string, nguoiDung: NguoiDungHienTai, ghiChu?: string) {
  const trangThaiCu = String(hoSo.trangThai ?? '')
  if (trangThaiCu === trangThaiMoi) return hoSo
  await prisma.hoSoUngTuyen.update({ where: { id: id(hoSo) }, data: { trangThai: trangThaiMoi } })
  await ghiLichSuHoSo({ maHoSoUngTuyen: id(hoSo), trangThaiCu, trangThaiMoi, ghiChu, maNguoiDung: nguoiDung.id })
  return layHoSoDayDu(id(hoSo))
}

function thongTinThongBao(hoSo: any) {
  const ungVien = hoSo.maUngVien
  const tin = hoSo.maTinTuyenDung
  const congTy = tin?.maNhaTuyenDung
  return {
    maNguoiDungUngVien: id(ungVien?.maNguoiDung),
    maNguoiDungNhaTuyenDung: id(congTy?.maNguoiDung),
    tenUngVien: ungVien?.maNguoiDung?.hoTen ?? ungVien?.hoTen ?? 'Ứng viên',
    kinhNghiem: `${ungVien?.kinhNghiem ?? 0} nam kinh nghiem`,
    tenCongTy: congTy?.tenCongTy ?? 'Cong ty',
    viTriUngTuyen: tin?.tieuDe ?? 'Vi tri ung tuyen',
  }
}

function damBaoTinDangMo(tin: any) {
  if (!tin) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404, 'JOB_NOT_FOUND')
  if (String(tin.trangThai ?? '') !== 'dang_mo') throw new LoiUngDung('Chi co the ung tuyen tin dang mo', 409, 'JOB_NOT_OPEN')
  if (tin.hanNop && new Date(tin.hanNop).getTime() < Date.now()) throw new LoiUngDung('Tin tuyển dụng đã hết hạn nộp hồ sơ', 409, 'JOB_EXPIRED')
}

export const dichVuWorkflowUngTuyen = {
  async ungTuyen(nguoiDung: NguoiDungHienTai, duLieu: { maTinTuyenDung: string; maHoSoNangLuc?: string; thuXinViec?: string }) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const tin = await layTinDayDu(duLieu.maTinTuyenDung)
    damBaoTinDangMo(tin)
    if (!duLieu.maHoSoNangLuc) throw new LoiUngDung('Bạn cần chọn CV để ứng tuyển', 422, 'CV_REQUIRED')
    const hoSoNangLuc = await prisma.hoSoNangLuc.findFirst({ where: { id: duLieu.maHoSoNangLuc, maUngVien: id(ungVien) } })
    if (!hoSoNangLuc) throw new LoiUngDung('Bạn cần chọn CV hợp lệ để ứng tuyển', 422, 'CV_REQUIRED')

    try {
      const hoSo = await prisma.hoSoUngTuyen.create({
        data: { maUngVien: id(ungVien), maTinTuyenDung: id(tin), maHoSoNangLuc: hoSoNangLuc.id, thuXinViec: duLieu.thuXinViec, diemKhopKyNang: 0, trangThai: 'da_nop' },
      })
      await ghiLichSuHoSo({ maHoSoUngTuyen: hoSo.id, trangThaiMoi: 'da_nop', ghiChu: 'Ứng viên nộp hồ sơ', maNguoiDung: nguoiDung.id })
      const hoSoDayDu = await layHoSoDayDu(hoSo.id)
      const info = thongTinThongBao(hoSoDayDu)
      if (info.maNguoiDungNhaTuyenDung) await thongBaoHoSoMoiUngTuyen({ maNhaTuyenDung: info.maNguoiDungNhaTuyenDung, tenUngVien: info.tenUngVien, viTriUngTuyen: info.viTriUngTuyen, maHoSoUngTuyen: hoSo.id, kinhNghiem: info.kinhNghiem })
      return dichVuHoSoUngTuyen.layTheoMa(hoSo.id)
    } catch (loi: any) {
      if (loi?.code === 'P2002') throw new LoiUngDung('Ban da ung tuyen tin nay', 409, 'APPLICATION_EXISTS')
      throw loi
    }
  },

  async xemHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string) {
    let { hoSo } = await damBaoHoSoThuocCongTy(maHoSoUngTuyen, nguoiDung)
    if (hoSo.trangThai === 'da_nop') {
      hoSo = await capNhatTrangThaiHoSo(hoSo, 'da_xem', nguoiDung, 'Nhà tuyển dụng xem hồ sơ lần đầu')
      const info = thongTinThongBao(hoSo)
      if (info.maNguoiDungUngVien) await thongBaoHoSoDuocXem({ maUngVien: info.maNguoiDungUngVien, tenCongTy: info.tenCongTy, viTriUngTuyen: info.viTriUngTuyen, maHoSoUngTuyen })
    }
    return dichVuHoSoUngTuyen.layTheoMa(maHoSoUngTuyen)
  },

  async danhGiaHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, duLieu: { trangThai: 'dang_xet_duyet' | 'tu_choi'; ghiChu?: string; giaiDoanTuChoi?: 'sang_loc' | 'phong_van' }) {
    const { hoSo } = await damBaoHoSoThuocCongTy(maHoSoUngTuyen, nguoiDung)
    if (!['dang_xet_duyet', 'tu_choi'].includes(duLieu.trangThai)) throw new LoiUngDung('Trang thai danh gia khong hop le', 422, 'INVALID_REVIEW_STATUS')
    if (!['da_xem', 'dang_xet_duyet'].includes(String(hoSo.trangThai ?? ''))) throw new LoiUngDung('Ho so khong con o trang thai co the danh gia', 409, 'INVALID_APPLICATION_STATE')
    const ghiChu = duLieu.trangThai === 'tu_choi' ? `[tu_choi_${duLieu.giaiDoanTuChoi ?? 'sang_loc'}] ${duLieu.ghiChu ?? ''}`.trim() : duLieu.ghiChu
    const hoSoMoi = await capNhatTrangThaiHoSo(hoSo, duLieu.trangThai, nguoiDung, ghiChu)
    if (duLieu.trangThai === 'tu_choi') {
      const info = thongTinThongBao(hoSoMoi)
      if (info.maNguoiDungUngVien) await thongBaoHeThong({ maNguoiDung: info.maNguoiDungUngVien, tieuDe: 'Ho so ung tuyen chua phu hop', noiDung: `${info.tenCongTy} đã cập nhật kết quả hồ sơ vi tri ${info.viTriUngTuyen}.`, lienKet: '/ung-vien/ung-tuyen', mucDoUuTien: 'cao' })
    }
    return dichVuHoSoUngTuyen.layTheoMa(maHoSoUngTuyen)
  },

  async moiPhongVan(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, duLieu: LichInput) {
    const { hoSo } = await damBaoHoSoThuocCongTy(maHoSoUngTuyen, nguoiDung)
    if (!['da_xem', 'dang_xet_duyet'].includes(String(hoSo.trangThai ?? ''))) throw new LoiUngDung('Chỉ có thể mời phỏng vấn hồ sơ đã xem hoặc đang xét duyệt', 409, 'INVALID_APPLICATION_STATE')
    const lichCu = await prisma.lichPhongVan.findUnique({ where: { maHoSoUngTuyen } })
    if (lichCu) throw new LoiUngDung('Hồ sơ này đã có lịch phỏng vấn', 409, 'INTERVIEW_EXISTS')
    const lich = await prisma.lichPhongVan.create({ data: { maHoSoUngTuyen, thoiGianBatDau: duLieu.thoiGianBatDau, thoiGianKetThuc: duLieu.thoiGianKetThuc, diaChi: duLieu.diaChi, hinhThuc: duLieu.hinhThuc ?? 'online', linkHop: duLieu.linkHop, ghiChu: duLieu.ghiChu, trangThai: 'da_len_lich', ketQua: 'cho_ket_qua' } })
    const hoSoMoi = await capNhatTrangThaiHoSo(hoSo, 'moi_phong_van', nguoiDung, 'Nhà tuyển dụng mời phỏng vấn')
    const info = thongTinThongBao(hoSoMoi)
    if (info.maNguoiDungUngVien) await thongBaoMoiPhongVan({ maUngVien: info.maNguoiDungUngVien, tenCongTy: info.tenCongTy, viTriUngTuyen: info.viTriUngTuyen, thoiGian: new Date(duLieu.thoiGianBatDau), hinhThuc: duLieu.hinhThuc ?? 'online', diaChi: duLieu.diaChi ?? '', linkHop: duLieu.linkHop, maLichPhongVan: lich.id })
    return dichVuLichPhongVan.layTheoMa(lich.id)
  },

  async xacNhanLichPhongVan(nguoiDung: NguoiDungHienTai, maLichPhongVan: string) {
    const { lich, hoSo } = await layLichVaHoSo(maLichPhongVan)
    await damBaoHoSoThuocUngVien(id(hoSo), nguoiDung)
    if (lich.trangThai !== 'da_len_lich') throw new LoiUngDung('Chi co the xac nhan lich dang cho phan hoi', 409, 'INVALID_INTERVIEW_STATE')
    const lichMoi = await prisma.lichPhongVan.update({ where: { id: maLichPhongVan }, data: { trangThai: 'da_xac_nhan' } })
    const info = thongTinThongBao(hoSo)
    if (info.maNguoiDungNhaTuyenDung) await thongBaoUngVienChapNhanLich({ maNhaTuyenDung: info.maNguoiDungNhaTuyenDung, tenUngVien: info.tenUngVien, viTriUngTuyen: info.viTriUngTuyen, thoiGian: lichMoi.thoiGianBatDau, maLichPhongVan })
    return dichVuLichPhongVan.layTheoMa(maLichPhongVan)
  },

  async yeuCauDoiLich(nguoiDung: NguoiDungHienTai, maLichPhongVan: string, ghiChu?: string) {
    const { lich, hoSo } = await layLichVaHoSo(maLichPhongVan)
    await damBaoHoSoThuocUngVien(id(hoSo), nguoiDung)
    if (!['da_len_lich', 'da_xac_nhan'].includes(String(lich.trangThai ?? ''))) throw new LoiUngDung('Lịch phỏng vấn không thể yêu cầu đổi', 409, 'INVALID_INTERVIEW_STATE')
    await prisma.lichPhongVan.update({ where: { id: maLichPhongVan }, data: { trangThai: 'doi_lich', ghiChu } })
    const info = thongTinThongBao(hoSo)
    if (info.maNguoiDungNhaTuyenDung) await thongBaoUngVienYeuCauDoiLich({ maNhaTuyenDung: info.maNguoiDungNhaTuyenDung, tenUngVien: info.tenUngVien, viTriUngTuyen: info.viTriUngTuyen, lyDo: ghiChu, maLichPhongVan, maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) })
    const admins = await prisma.nguoiDung.findMany({ where: { vaiTro: 'admin' }, select: { id: true } })
    await Promise.all(admins.map(admin => thongBaoAdminUngVienYeuCauDoiLich({ maAdmin: admin.id, tenUngVien: info.tenUngVien, viTriUngTuyen: info.viTriUngTuyen, lyDo: ghiChu, maLichPhongVan, maHoSoUngTuyen: id(hoSo), maTinTuyenDung: id(hoSo.maTinTuyenDung) })))
    return dichVuLichPhongVan.layTheoMa(maLichPhongVan)
  },

  async capNhatLichPhongVan(nguoiDung: NguoiDungHienTai, maLichPhongVan: string, duLieu: LichInput) {
    const { lich, hoSo } = await layLichVaHoSo(maLichPhongVan)
    await damBaoHoSoThuocCongTy(id(hoSo), nguoiDung)
    if (['hoan_thanh', 'da_huy'].includes(String(lich.trangThai ?? ''))) throw new LoiUngDung('Không thể cập nhật lịch đã kết thúc hoặc đã hủy', 409, 'INVALID_INTERVIEW_STATE')
    const lichMoi = await prisma.lichPhongVan.update({
      where: { id: maLichPhongVan },
      data: { thoiGianBatDau: duLieu.thoiGianBatDau ?? lich.thoiGianBatDau, thoiGianKetThuc: duLieu.thoiGianKetThuc ?? lich.thoiGianKetThuc, diaChi: duLieu.diaChi ?? lich.diaChi, hinhThuc: duLieu.hinhThuc ?? lich.hinhThuc, linkHop: duLieu.linkHop ?? lich.linkHop, ghiChu: duLieu.ghiChu ?? lich.ghiChu, trangThai: lich.trangThai === 'doi_lich' ? 'da_len_lich' : lich.trangThai },
    })
    const info = thongTinThongBao(hoSo)
    if (info.maNguoiDungUngVien) await thongBaoLichPhongVanThayDoi({ maUngVien: info.maNguoiDungUngVien, tenCongTy: info.tenCongTy, viTriUngTuyen: info.viTriUngTuyen, thoiGianMoi: lichMoi.thoiGianBatDau, lyDo: duLieu.ghiChu, maLichPhongVan })
    return dichVuLichPhongVan.layTheoMa(maLichPhongVan)
  },

  async capNhatKetQuaPhongVan(nguoiDung: NguoiDungHienTai, maLichPhongVan: string, duLieu: { ketQua: 'dat' | 'khong_dat'; ghiChu?: string }) {
    const { lich, hoSo } = await layLichVaHoSo(maLichPhongVan)
    await damBaoHoSoThuocCongTy(id(hoSo), nguoiDung)
    if (!['da_len_lich', 'da_xac_nhan'].includes(String(lich.trangThai ?? ''))) throw new LoiUngDung('Chi co the hoan tat lich chua ket thuc', 409, 'INVALID_INTERVIEW_STATE')
    if (!['dat', 'khong_dat'].includes(duLieu.ketQua)) throw new LoiUngDung('Kết quả phỏng vấn không hợp lệ', 422, 'INVALID_INTERVIEW_RESULT')
    await prisma.lichPhongVan.update({ where: { id: maLichPhongVan }, data: { trangThai: 'hoan_thanh', ketQua: duLieu.ketQua, ghiChu: duLieu.ghiChu } })
    const trangThaiHoSo = duLieu.ketQua === 'dat' ? 'dat' : 'tu_choi'
    const ghiChuKetQua = duLieu.ketQua === 'dat' ? duLieu.ghiChu : `[tu_choi_phong_van] ${duLieu.ghiChu ?? ''}`.trim()
    const hoSoMoi = await capNhatTrangThaiHoSo(hoSo, trangThaiHoSo, nguoiDung, ghiChuKetQua)
    const info = thongTinThongBao(hoSoMoi)
    if (info.maNguoiDungUngVien) await thongBaoKetQuaPhongVan({ maUngVien: info.maNguoiDungUngVien, tenCongTy: info.tenCongTy, viTriUngTuyen: info.viTriUngTuyen, ketQua: duLieu.ketQua, ghiChu: duLieu.ghiChu, maLichPhongVan })
    return dichVuLichPhongVan.layTheoMa(maLichPhongVan)
  },

  async rutHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, ghiChu?: string) {
    const { hoSo } = await damBaoHoSoThuocUngVien(maHoSoUngTuyen, nguoiDung)
    if (!TRANG_THAI_HO_SO_CHUA_KET_THUC.includes(String(hoSo.trangThai ?? ''))) throw new LoiUngDung('Ho so da co ket qua nen khong the rut', 409, 'INVALID_APPLICATION_STATE')
    const hoSoMoi = await capNhatTrangThaiHoSo(hoSo, 'da_rut', nguoiDung, ghiChu)
    const lich = await prisma.lichPhongVan.findUnique({ where: { maHoSoUngTuyen } })
    if (lich && !['hoan_thanh', 'da_huy'].includes(String(lich.trangThai ?? ''))) await prisma.lichPhongVan.update({ where: { id: lich.id }, data: { trangThai: 'da_huy', ghiChu: ghiChu ?? 'Ứng viên rút hồ sơ' } })
    const info = thongTinThongBao(hoSoMoi)
    if (info.maNguoiDungNhaTuyenDung) await thongBaoHeThong({ maNguoiDung: info.maNguoiDungNhaTuyenDung, tieuDe: 'Ứng viên đã rút hồ sơ', noiDung: `${info.tenUngVien} đã rút hồ sơ ứng tuyển vị trí ${info.viTriUngTuyen}.`, lienKet: '/nha-tuyen-dung/ung-vien', mucDoUuTien: 'cao' })
    return dichVuHoSoUngTuyen.layTheoMa(maHoSoUngTuyen)
  },
}
