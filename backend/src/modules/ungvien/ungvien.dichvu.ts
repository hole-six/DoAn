import { prisma } from '../../cauhinh/prisma.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined } from '../../dungchung/prismaHelper.js'
import { UngVien } from './ungvien.mohinh.js'

// ─── helpers nội bộ ───────────────────────────────────────────────────────────

/** Fetch NguoiDung cho danh sách ứng viên và trả về Map<maNguoiDung, nguoiDung> */
async function layNguoiDungMap(rows: any[]) {
  const ids = [...new Set(rows.map(r => r.maNguoiDung).filter(Boolean))]
  if (!ids.length) return new Map<string, any>()
  const nguoiDungs = await prisma.nguoiDung.findMany({
    where: { id: { in: ids } },
    select: { id: true, hoTen: true, email: true, soDienThoai: true, trangThai: true },
  })
  return new Map(nguoiDungs.map(nd => [nd.id, nd]))
}

const includeKyNang = {
  kyNangLienKet: {
    include: {
      kyNang: {
        select: { id: true, tenKyNang: true, loaiKyNang: true },
      },
    },
  },
} as const

function dinhDangUngVien(row: any, nguoiDungMap: Map<string, any>) {
  const nd = nguoiDungMap.get(row.maNguoiDung)
  return {
    id: String(row.id),
    _id: String(row.id),
    maNguoiDung: String(row.maNguoiDung),
    nguoiDung: nd
      ? {
          id: String(nd.id),
          hoTen: nd.hoTen,
          email: nd.email,
          soDienThoai: nd.soDienThoai,
          trangThai: nd.trangThai,
        }
      : undefined,
    ngaySinh: row.ngaySinh,
    gioiTinh: row.gioiTinh,
    diaChi: row.diaChi,
    anhDaiDien: row.anhDaiDien,
    tomTat: row.tomTat,
    kinhNghiem: row.kinhNghiem,
    viTriMongMuon: row.viTriMongMuon,
    mucLuongMongMuon: row.mucLuongMongMuon,
    // ✅ Lấy từ bảng quan hệ UngVienKyNang
    kyNang: (row.kyNangLienKet ?? []).map((lienKet: any) => ({
      maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
      tenKyNang: lienKet.kyNang?.tenKyNang,
      loaiKyNang: lienKet.kyNang?.loaiKyNang,
      mucDo: lienKet.mucDo,
      soNamKinhNghiem: lienKet.soNamKinhNghiem,
    })),
    ngayTao: row.ngayTao,
    ngayCapNhat: row.ngayCapNhat,
  }
}

// ─── service ─────────────────────────────────────────────────────────────────

export const dichVuUngVien = {
  async layDanhSach() {
    const rows = await UngVien.findMany({ orderBy: { ngayTao: 'desc' }, take: 200, include: includeKyNang })
    const nguoiDungMap = await layNguoiDungMap(rows)
    return rows.map(r => dinhDangUngVien(r, nguoiDungMap))
  },

  async layTheoMa(ma: string) {
    const row = await UngVien.findUnique({ where: { id: ma }, include: includeKyNang })
    if (!row) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async layTheoMaNguoiDung(maNguoiDung: string) {
    const row = await UngVien.findUnique({ where: { maNguoiDung }, include: includeKyNang })
    if (!row) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async damBaoHoSoTheoNguoiDung(maNguoiDung: string) {
    const hienTai = await UngVien.findUnique({ where: { maNguoiDung }, include: includeKyNang })
    const row = hienTai ?? (await UngVien.create({ data: { maNguoiDung, kinhNghiem: 0 }, include: includeKyNang }))
    const nguoiDungMap = await layNguoiDungMap([row])
    return dinhDangUngVien(row, nguoiDungMap)
  },

  async taoMoi(duLieu: unknown) {
    const payload = duLieu as Record<string, any>
    const { kyNang, ...ungVienData } = payload

    const ketQua = await UngVien.create({ data: boUndefined(ungVienData) as any })

    if (Array.isArray(kyNang) && kyNang.length > 0) {
      const kyNangData = kyNang
        .map(item => ({
          maUngVien: ketQua.id,
          maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
          mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
          soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
        }))
        .filter(item => item.maKyNang)

      if (kyNangData.length > 0) {
        await prisma.ungVienKyNang.createMany({ data: kyNangData, skipDuplicates: true })
      }
    }

    return this.layTheoMa(String(ketQua.id))
  },

  async capNhat(ma: string, duLieu: unknown, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403)
    }

    const payload = duLieu as Record<string, any>
    const { kyNang, ...ungVienData } = payload

    await UngVien.update({ where: { id: ma }, data: boUndefined(ungVienData) as any })

    if (kyNang !== undefined) {
      await prisma.ungVienKyNang.deleteMany({ where: { maUngVien: ma } })

      if (Array.isArray(kyNang) && kyNang.length > 0) {
        const kyNangData = kyNang
          .map(item => ({
            maUngVien: ma,
            maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
            mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
            soNamKinhNghiem: item?.soNamKinhNghiem != null ? Number(item.soNamKinhNghiem) : null,
          }))
          .filter(item => item.maKyNang)

        if (kyNangData.length > 0) {
          await prisma.ungVienKyNang.createMany({ data: kyNangData, skipDuplicates: true })
        }
      }
    }

    return this.layTheoMa(ma)
  },

  async xoa(ma: string, maNguoiDungHienTai?: string) {
    const hienTai = await UngVien.findUnique({ where: { id: ma } })
    if (!hienTai) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)

    if (maNguoiDungHienTai && String(hienTai.maNguoiDung) !== maNguoiDungHienTai) {
      throw new LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403)
    }

    await UngVien.delete({ where: { id: ma } })
    // Trả về bản ghi đã xóa với cấu trúc chuẩn (không có nguoiDung / kyNang vì đã xóa)
    const emptyMap = new Map<string, any>()
    return dinhDangUngVien({ ...hienTai, kyNangLienKet: [] }, emptyMap)
  },
}
