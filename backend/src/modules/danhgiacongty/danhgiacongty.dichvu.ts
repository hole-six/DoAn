import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { prisma } from '../../cauhinh/prisma.js'
import { layHoSoUngTuyenDayDuNoiBo } from '../hosoungtuyen/hosoungtuyen.dichvu.js'
import { DanhGiaCongTy } from './danhgiacongty.mohinh.js'

type NguoiDungHienTai = { id: string; vaiTro: string }
type DuLieuTaoTuHoSo = { diem: number; noiDung: string; anDanh?: boolean }

function idOf(value: any): string {
  return String(value?._id ?? value?.id ?? value ?? '')
}

// Include cho ungVien và nhaTuyenDung (UngVien không có relation nguoiDung trong schema)
const includeDefault = {
  ungVien: {
    select: {
      id: true,
      viTriMongMuon: true,
      maNguoiDung: true,
    },
  },
  nhaTuyenDung: {
    select: { id: true, tenCongTy: true, logo: true },
  },
  hoSoUngTuyen: {
    select: { id: true, trangThai: true },
  },
} as const

// Fetch nguoiDung cho danh sách ungVien (UngVien.maNguoiDung -> NguoiDung)
async function ganNguoiDungVaoUngVien(rows: any[]) {
  const maNguoiDungIds = [...new Set(rows.map(r => r.ungVien?.maNguoiDung).filter(Boolean))]
  if (!maNguoiDungIds.length) return new Map<string, any>()
  const nguoiDungRows = await prisma.nguoiDung.findMany({
    where: { id: { in: maNguoiDungIds } },
    select: { id: true, hoTen: true, email: true },
  })
  return new Map(nguoiDungRows.map(nd => [nd.id, nd]))
}

function mapDanhGia(row: any, nguoiDungMap: Map<string, any>) {
  if (!row) return row
  const nguoiDung = row.ungVien?.maNguoiDung ? nguoiDungMap.get(row.ungVien.maNguoiDung) : undefined
  return {
    id: row.id,
    _id: row.id,
    maUngVien: row.maUngVien,
    maNhaTuyenDung: row.maNhaTuyenDung,
    maHoSoUngTuyen: row.maHoSoUngTuyen ?? undefined,
    ungVien: row.ungVien
      ? {
          id: row.ungVien.id,
          viTriMongMuon: row.ungVien.viTriMongMuon,
          hoTen: nguoiDung?.hoTen,
          email: nguoiDung?.email,
        }
      : undefined,
    nhaTuyenDung: row.nhaTuyenDung
      ? {
          id: row.nhaTuyenDung.id,
          tenCongTy: row.nhaTuyenDung.tenCongTy,
          logo: row.nhaTuyenDung.logo,
        }
      : undefined,
    diem: row.diem,
    noiDung: row.noiDung,
    anDanh: row.anDanh,
    daDuyet: row.daDuyet,
    ngayTao: row.ngayTao,
    ngayCapNhat: row.ngayCapNhat,
  }
}

async function mapNhieu(rows: any[]) {
  const nguoiDungMap = await ganNguoiDungVaoUngVien(rows)
  return rows.map(row => mapDanhGia(row, nguoiDungMap))
}

async function layUngVienCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  if (nguoiDung.vaiTro !== 'ung_vien')
    throw new LoiUngDung('Bạn cần đăng nhập bằng tài khoản ứng viên để đánh giá công ty', 403, 'FORBIDDEN')
  const ungVien = await prisma.ungVien.findUnique({ where: { maNguoiDung: nguoiDung.id } })
  if (!ungVien)
    throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi đánh giá công ty', 422, 'CANDIDATE_PROFILE_REQUIRED')
  return ungVien
}

async function damBaoDaCoKetQuaPhongVan(maHoSoUngTuyen: string) {
  const lichPhongVan = await prisma.lichPhongVan.findFirst({
    where: {
      maHoSoUngTuyen,
      trangThai: 'hoan_thanh',
      ketQua: { in: ['dat', 'khong_dat'] },
    },
    select: { id: true },
  })
  if (!lichPhongVan) {
    throw new LoiUngDung(
      'Bạn chỉ có thể đánh giá công ty sau khi phỏng vấn hoàn tất và đã có kết quả.',
      409,
      'REVIEW_REQUIRES_INTERVIEW_RESULT',
    )
  }
}

export const dichVuDanhGiaCongTy = {
  async layDanhSach() {
    const rows = await DanhGiaCongTy.findMany({
      orderBy: { ngayTao: 'desc' },
      take: 300,
      include: includeDefault,
    })
    return mapNhieu(rows)
  },

  async layCuaUngVien(nguoiDung: NguoiDungHienTai) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const rows = await DanhGiaCongTy.findMany({
      where: { maUngVien: ungVien.id },
      orderBy: { ngayTao: 'desc' },
      take: 300,
      include: includeDefault,
    })
    return mapNhieu(rows)
  },

  async layTheoMa(ma: string) {
    const row = await DanhGiaCongTy.findUnique({ where: { id: ma }, include: includeDefault })
    if (!row) throw new LoiUngDung('Không tìm thấy đánh giá công ty', 404)
    return mapNhieu([row]).then(list => list[0])
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await DanhGiaCongTy.create({ data: duLieu as any })
    return this.layTheoMa(ketQua.id)
  },

  async taoTuHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, duLieu: DuLieuTaoTuHoSo) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const hoSo = await layHoSoUngTuyenDayDuNoiBo(maHoSoUngTuyen)
    if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
    if (idOf(hoSo.maUngVien) !== ungVien.id)
      throw new LoiUngDung('Bạn không có quyền đánh giá từ hồ sơ ứng tuyển này', 403, 'FORBIDDEN')

    await damBaoDaCoKetQuaPhongVan(maHoSoUngTuyen)

    const maNhaTuyenDung = idOf(hoSo.maTinTuyenDung?.maNhaTuyenDung)
    if (!maNhaTuyenDung)
      throw new LoiUngDung('Không tìm thấy công ty của hồ sơ ứng tuyển', 404, 'COMPANY_NOT_FOUND')

    const daCoDanhGia = await DanhGiaCongTy.findFirst({ where: { maHoSoUngTuyen }, select: { id: true } })
    if (daCoDanhGia)
      throw new LoiUngDung('Bạn đã đánh giá công ty từ hồ sơ ứng tuyển này.', 409, 'REVIEW_ALREADY_EXISTS')

    const ketQua = await DanhGiaCongTy.create({
      data: {
        maUngVien: ungVien.id,
        maNhaTuyenDung,
        maHoSoUngTuyen,
        diem: duLieu.diem,
        noiDung: duLieu.noiDung,
        anDanh: duLieu.anDanh ?? false,
        daDuyet: false,
      },
    })
    return this.layTheoMa(ketQua.id)
  },

  async capNhat(ma: string, duLieu: unknown) {
    const hienTai = await DanhGiaCongTy.findUnique({ where: { id: ma }, select: { id: true } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy đánh giá công ty để cập nhật', 404)
    await DanhGiaCongTy.update({ where: { id: ma }, data: duLieu as any })
    return this.layTheoMa(ma)
  },

  async xoa(ma: string) {
    const row = await DanhGiaCongTy.findUnique({ where: { id: ma }, include: includeDefault })
    if (!row) throw new LoiUngDung('Không tìm thấy đánh giá công ty để xóa', 404)
    await DanhGiaCongTy.delete({ where: { id: ma } })
    const mapped = await mapNhieu([row])
    return mapped[0]
  },
}
