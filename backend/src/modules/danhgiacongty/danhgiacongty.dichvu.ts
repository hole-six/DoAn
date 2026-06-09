import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { coId, ganNguoiDungChoUngVien } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { layHoSoUngTuyenDayDuNoiBo } from '../hosoungtuyen/hosoungtuyen.dichvu.js'
import { DanhGiaCongTy } from './danhgiacongty.mohinh.js'

type NguoiDungHienTai = { id: string; vaiTro: string }
type DuLieuTaoTuHoSo = { diem: number; noiDung: string; anDanh?: boolean }

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

async function hydrate(rows: any[]) {
  const [ungVienRows, congTyRows, hoSoRows] = await Promise.all([
    prisma.ungVien.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maUngVien).filter(Boolean))] } } }),
    prisma.nhaTuyenDung.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maNhaTuyenDung).filter(Boolean))] } } }),
    prisma.hoSoUngTuyen.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maHoSoUngTuyen).filter(Boolean))] } } }),
  ])
  const ungVienDayDu = await ganNguoiDungChoUngVien(ungVienRows as any[])
  const ungVienMap = new Map(ungVienDayDu.map(row => [row.id, coId(row)]))
  const congTyMap = new Map(congTyRows.map(row => [row.id, coId(row)]))
  const hoSoMap = new Map(hoSoRows.map(row => [row.id, coId(row)]))
  return rows.map(row => coId({
    ...row,
    maUngVien: ungVienMap.get(row.maUngVien) ?? row.maUngVien,
    maNhaTuyenDung: congTyMap.get(row.maNhaTuyenDung) ?? row.maNhaTuyenDung,
    maHoSoUngTuyen: row.maHoSoUngTuyen ? (hoSoMap.get(row.maHoSoUngTuyen) ?? row.maHoSoUngTuyen) : null,
  }))
}

function chuanHoaDanhGia(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maUngVien: duLieu.maUngVien?._id ? String(duLieu.maUngVien._id) : String(duLieu.maUngVien),
    maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
    maHoSoUngTuyen: duLieu.maHoSoUngTuyen?._id ? String(duLieu.maHoSoUngTuyen._id) : duLieu.maHoSoUngTuyen ? String(duLieu.maHoSoUngTuyen) : undefined,
    ungVien: duLieu.maUngVien?._id
      ? {
          id: String(duLieu.maUngVien._id),
          maNguoiDung: duLieu.maUngVien.maNguoiDung?._id ? String(duLieu.maUngVien.maNguoiDung._id) : String(duLieu.maUngVien.maNguoiDung),
          hoTen: duLieu.maUngVien.maNguoiDung?.hoTen,
          email: duLieu.maUngVien.maNguoiDung?.email,
          viTriMongMuon: duLieu.maUngVien.viTriMongMuon,
        }
      : undefined,
    nhaTuyenDung: duLieu.maNhaTuyenDung?._id
      ? { id: String(duLieu.maNhaTuyenDung._id), tenCongTy: duLieu.maNhaTuyenDung.tenCongTy, logo: duLieu.maNhaTuyenDung.logo }
      : undefined,
    diem: duLieu.diem,
    noiDung: duLieu.noiDung,
    anDanh: duLieu.anDanh,
    daDuyet: duLieu.daDuyet,
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

async function layUngVienCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  if (nguoiDung.vaiTro !== 'ung_vien') throw new LoiUngDung('Bạn cần đăng nhập bằng tài khoản ứng viên để đánh giá công ty', 403, 'FORBIDDEN')
  const ungVien = await prisma.ungVien.findUnique({ where: { maNguoiDung: nguoiDung.id } })
  if (!ungVien) throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước khi đánh giá công ty', 422, 'CANDIDATE_PROFILE_REQUIRED')
  return coId(ungVien) as any
}

async function damBaoDaCoKetQuaPhongVan(hoSo: any) {
  const lichPhongVan = await prisma.lichPhongVan.findFirst({
    where: {
      maHoSoUngTuyen: id(hoSo),
      trangThai: 'hoan_thanh',
      ketQua: { in: ['dat', 'khong_dat'] },
    },
    select: { id: true },
  })
  if (!lichPhongVan) {
    throw new LoiUngDung('Bạn chỉ có thể đánh giá công ty sau khi phỏng vấn hoàn tất và đã có kết quả.', 409, 'REVIEW_REQUIRES_INTERVIEW_RESULT')
  }
}

async function layDanhGiaDayDu(where: any, many = false) {
  const rows = many
    ? await DanhGiaCongTy.findMany({ where, orderBy: { ngayTao: 'desc' }, take: 300 })
    : await DanhGiaCongTy.findMany({ where, take: 1 })
  const hydrated = await hydrate(rows)
  return many ? hydrated : hydrated[0]
}

export const dichVuDanhGiaCongTy = {
  async layDanhSach() {
    const danhSach = await layDanhGiaDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaDanhGia)
  },

  async layCuaUngVien(nguoiDung: NguoiDungHienTai) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const danhSach = await layDanhGiaDayDu({ maUngVien: id(ungVien) }, true)
    return (danhSach as any[]).map(chuanHoaDanhGia)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDanhGiaDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy đánh giá công ty', 404)
    return chuanHoaDanhGia(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await DanhGiaCongTy.create({ data: duLieu as any })
    return this.layTheoMa(String(ketQua.id))
  },

  async taoTuHoSo(nguoiDung: NguoiDungHienTai, maHoSoUngTuyen: string, duLieu: DuLieuTaoTuHoSo) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const hoSo = await layHoSoUngTuyenDayDuNoiBo(maHoSoUngTuyen)
    if (!hoSo) throw new LoiUngDung('Không tìm thấy hồ sơ ứng tuyển', 404, 'APPLICATION_NOT_FOUND')
    if (id(hoSo.maUngVien) !== id(ungVien)) throw new LoiUngDung('Bạn không có quyền đánh giá từ hồ sơ ứng tuyển này', 403, 'FORBIDDEN')
    await damBaoDaCoKetQuaPhongVan(hoSo)

    const maNhaTuyenDung = id(hoSo.maTinTuyenDung?.maNhaTuyenDung)
    if (!maNhaTuyenDung) throw new LoiUngDung('Không tìm thấy công ty của hồ sơ ứng tuyển', 404, 'COMPANY_NOT_FOUND')

    const daCoDanhGia = await DanhGiaCongTy.findFirst({ where: { maHoSoUngTuyen }, select: { id: true } })
    if (daCoDanhGia) throw new LoiUngDung('Bạn đã đánh giá công ty từ hồ sơ ứng tuyển này.', 409, 'REVIEW_ALREADY_EXISTS')

    const ketQua = await DanhGiaCongTy.create({
      data: { maUngVien: id(ungVien), maNhaTuyenDung, maHoSoUngTuyen, diem: duLieu.diem, noiDung: duLieu.noiDung, anDanh: duLieu.anDanh ?? false, daDuyet: false },
    })
    return this.layTheoMa(id(ketQua))
  },

  async capNhat(ma: string, duLieu: unknown) {
    const hienTai = await DanhGiaCongTy.findUnique({ where: { id: ma }, select: { id: true } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy đánh giá công ty để cập nhật', 404)
    await DanhGiaCongTy.update({ where: { id: ma }, data: duLieu as any })
    return this.layTheoMa(ma)
  },

  async xoa(ma: string) {
    const ketQua = await layDanhGiaDayDu({ id: ma }) as any
    if (!ketQua) throw new LoiUngDung('Không tìm thấy đánh giá công ty để xóa', 404)
    await DanhGiaCongTy.delete({ where: { id: ma } })
    return chuanHoaDanhGia(ketQua)
  },
}
