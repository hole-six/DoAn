import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { coId, ganCongTyChoTin } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { ViecLamDaLuu } from './vieclamdaluu.mohinh.js'

function chuanHoa(taiLieu: any) {
  const obj = taiLieu ?? {}
  const tin = obj.maTinTuyenDung
  return {
    id: String(obj.id ?? obj._id),
    _id: String(obj.id ?? obj._id),
    maNguoiDung: String(obj.maNguoiDung?._id ?? obj.maNguoiDung),
    maTinTuyenDung: String(tin?._id ?? tin),
    ngayLuu: obj.ngayLuu,
    tinTuyenDung: tin?._id
      ? {
          id: String(tin._id),
          tieuDe: tin.tieuDe,
          trangThai: tin.trangThai,
          diaChi: tin.diaChi,
          luongMin: tin.luongMin,
          luongMax: tin.luongMax,
          hanNop: tin.hanNop,
          ngayDang: tin.ngayDang,
          nhaTuyenDung: tin.maNhaTuyenDung?._id
            ? { id: String(tin.maNhaTuyenDung._id), tenCongTy: tin.maNhaTuyenDung.tenCongTy, logo: tin.maNhaTuyenDung.logo }
            : undefined,
        }
      : undefined,
  }
}

async function hydrate(rows: any[]) {
  const tinRows = await prisma.tinTuyenDung.findMany({ where: { id: { in: [...new Set(rows.map(row => row.maTinTuyenDung))] } } })
  const tinDayDu = await ganCongTyChoTin(tinRows as any[])
  const tinMap = new Map(tinDayDu.map(row => [row.id, coId(row)]))
  return rows.map(row => coId({ ...row, maTinTuyenDung: tinMap.get(row.maTinTuyenDung) ?? row.maTinTuyenDung }))
}

export const dichVuViecLamDaLuu = {
  async layDanhSach(maNguoiDung: string) {
    const rows = await ViecLamDaLuu.findMany({ where: { maNguoiDung }, orderBy: { ngayLuu: 'desc' }, take: 200 })
    return (await hydrate(rows)).map(chuanHoa)
  },

  async luu(maNguoiDung: string, maTinTuyenDung: string) {
    const tin = await TinTuyenDung.findUnique({ where: { id: maTinTuyenDung }, select: { id: true } })
    if (!tin) throw new LoiUngDung('Không tìm thấy tin tuyển dụng để lưu', 404, 'JOB_NOT_FOUND')

    await ViecLamDaLuu.upsert({
      where: { maNguoiDung_maTinTuyenDung: { maNguoiDung, maTinTuyenDung } },
      update: {},
      create: { maNguoiDung, maTinTuyenDung, ngayLuu: new Date() },
    })
    const ketQua = await ViecLamDaLuu.findFirst({ where: { maNguoiDung, maTinTuyenDung } })
    return chuanHoa((await hydrate(ketQua ? [ketQua] : []))[0])
  },

  async boLuu(maNguoiDung: string, maTinTuyenDung: string) {
    await ViecLamDaLuu.deleteMany({ where: { maNguoiDung, maTinTuyenDung } })
    return { maTinTuyenDung }
  },
}
