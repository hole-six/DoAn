import { prisma } from '../../cauhinh/prisma.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined } from '../../dungchung/prismaHelper.js'
import { layLimit, locVaXepHangTheoTuKhoa } from '../../dungchung/timkiem.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { thongBaoAdminCongTyCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetCongTy } from '../thongbao/thongbao.helper.js'
import { NhaTuyenDung } from './nhatuyendung.mohinh.js'

// ─── helpers nội bộ ───────────────────────────────────────────────────────────

async function layAdminIds() {
  const admins = await NguoiDung.findMany({
    where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
    select: { id: true },
  })
  return admins.map(item => item.id)
}

async function guiThongBaoAdminCongTy(params: {
  tenCongTy: string
  tenNguoiDangKy: string
  maNhaTuyenDung: string
  capNhatLai?: boolean
}) {
  const adminIds = await layAdminIds()
  await Promise.all(adminIds.map((maAdmin: string) => thongBaoAdminCongTyCanDuyet({ maAdmin, ...params })))
}

/** Fetch NguoiDung cho danh sách công ty và trả về Map<maNguoiDung, nguoiDung> */
async function ganNguoiDung(rows: any[]) {
  const ids = [...new Set(rows.map(r => r.maNguoiDung).filter(Boolean))]
  if (!ids.length) return new Map<string, any>()
  const nguoiDungs = await prisma.nguoiDung.findMany({
    where: { id: { in: ids } },
    select: { id: true, hoTen: true, email: true, soDienThoai: true },
  })
  return new Map(nguoiDungs.map(nd => [nd.id, nd]))
}

function dinhDangCongTy(row: any, nguoiDungMap: Map<string, any>) {
  const nd = nguoiDungMap.get(row.maNguoiDung)
  return {
    id: String(row.id),
    _id: String(row.id),
    maNguoiDung: String(row.maNguoiDung),
    nguoiDung: nd
      ? { id: String(nd.id), hoTen: nd.hoTen, email: nd.email, soDienThoai: nd.soDienThoai }
      : undefined,
    tenCongTy: row.tenCongTy,
    maSoThue: row.maSoThue,
    moTa: row.moTa,
    diaChi: row.diaChi,
    website: row.website,
    logo: row.logo,
    quyMo: row.quyMo,
    nganh: row.nganh,
    trangThaiDuyet: row.trangThaiDuyet,
    lyDoTuChoi: row.lyDoTuChoi,
    ngayDuyet: row.ngayDuyet,
    ngayTao: row.ngayTao,
    ngayCapNhat: row.ngayCapNhat,
  }
}

// ─── service ─────────────────────────────────────────────────────────────────

export const dichVuNhaTuyenDung = {
  async layDanhSach(boLoc: Record<string, unknown> = {}) {
    const rows = await NhaTuyenDung.findMany({ orderBy: { ngayTao: 'desc' }, take: 200 })
    const nguoiDungMap = await ganNguoiDung(rows)
    const danhSach = rows.map(r => dinhDangCongTy(r, nguoiDungMap))
    const daLoc = locVaXepHangTheoTuKhoa(danhSach, boLoc.tuKhoa, item => [
      item.tenCongTy,
      item.nganh,
      item.diaChi,
      item.moTa,
      item.website,
    ])
    return daLoc.slice(0, layLimit(boLoc.limit, 50, 100))
  },

  async layTheoMa(ma: string) {
    const row = await NhaTuyenDung.findUnique({ where: { id: ma } })
    if (!row) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng', 404)
    const nguoiDungMap = await ganNguoiDung([row])
    return dinhDangCongTy(row, nguoiDungMap)
  },

  async taoMoi(duLieu: unknown) {
    const ketQua = await NhaTuyenDung.create({ data: boUndefined(duLieu as Record<string, any>) as any })
    const nguoiDungMap = await ganNguoiDung([ketQua])
    const chuanHoa = dinhDangCongTy(ketQua, nguoiDungMap)
    if (ketQua.trangThaiDuyet === 'cho_duyet') {
      await guiThongBaoAdminCongTy({
        tenCongTy: ketQua.tenCongTy,
        tenNguoiDangKy: nguoiDungMap.get(ketQua.maNguoiDung)?.hoTen ?? 'Nha tuyen dung',
        maNhaTuyenDung: String(ketQua.id),
      })
    }
    return chuanHoa
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, any>
    const hienTai = await NhaTuyenDung.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để cập nhật', 404)

    if (hienTai.trangThaiDuyet === 'da_duyet' && duLieu.trangThaiDuyet === 'tu_choi') {
      throw new LoiUngDung(
        'Không thể từ chối công ty đã được duyệt. Nếu hồ sơ có vấn đề, hãy xóa hoặc khóa công ty.',
        409,
        'COMPANY_ALREADY_APPROVED',
      )
    }

    const duLieuCapNhat = boUndefined({
      ...duLieu,
      ...(duLieu.trangThaiDuyet === 'da_duyet' ? { ngayDuyet: new Date(), lyDoTuChoi: null } : {}),
    })
    await NhaTuyenDung.update({ where: { id: ma }, data: duLieuCapNhat as any })
    const ketQua = await NhaTuyenDung.findUnique({ where: { id: ma } }) as any
    const nguoiDungMap = await ganNguoiDung([ketQua])

    const trangThaiCu = hienTai.trangThaiDuyet
    const trangThaiMoi = ketQua.trangThaiDuyet
    if (trangThaiCu !== trangThaiMoi && ['da_duyet', 'tu_choi'].includes(trangThaiMoi)) {
      await thongBaoNhaTuyenDungKetQuaDuyetCongTy({
        maNguoiDung: String(ketQua.maNguoiDung),
        tenCongTy: ketQua.tenCongTy,
        trangThaiDuyet: trangThaiMoi,
        lyDoTuChoi: ketQua.lyDoTuChoi,
      })
    }

    const coCapNhatNoiDung = Object.keys(duLieu).some(
      key => !['trangThaiDuyet', 'lyDoTuChoi', 'ngayDuyet'].includes(key),
    )
    if (trangThaiCu === 'tu_choi' && coCapNhatNoiDung && trangThaiMoi !== 'da_duyet') {
      await guiThongBaoAdminCongTy({
        tenCongTy: ketQua.tenCongTy,
        tenNguoiDangKy: nguoiDungMap.get(ketQua.maNguoiDung)?.hoTen ?? 'Nha tuyen dung',
        maNhaTuyenDung: String(ketQua.id),
        capNhatLai: true,
      })
    }
    return dinhDangCongTy(ketQua, nguoiDungMap)
  },

  async xoa(ma: string) {
    const hienTai = await NhaTuyenDung.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy nhà tuyển dụng để xóa', 404)
    await NhaTuyenDung.delete({ where: { id: ma } })
    // Trả về bản ghi đã xóa với cấu trúc chuẩn (không có nguoiDung vì đã xóa)
    const emptyMap = new Map<string, any>()
    return dinhDangCongTy(hienTai, emptyMap)
  },
}
