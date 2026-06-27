import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { layLimit } from '../../dungchung/timkiem.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { thongBaoAdminTinTuyenDungCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetTin } from '../thongbao/thongbao.helper.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

async function dongBoTinHetHan(where: Record<string, unknown> = {}) {
  await TinTuyenDung.updateMany({
    where: {
      ...where,
      trangThai: { in: ['dang_mo', 'tam_dong'] },
      hanNop: { not: null, lt: new Date() },
    },
    data: { trangThai: 'het_han' },
  })
}

async function layAdminIds() {
  const admins = await NguoiDung.findMany({
    where: { vaiTro: 'admin', trangThai: 'hoat_dong' },
    select: { id: true },
  })
  return admins.map(item => item.id)
}

async function guiThongBaoAdminTinCanDuyet(tin: any) {
  const adminIds = await layAdminIds()
  await Promise.all(adminIds.map((maAdmin: string) => thongBaoAdminTinTuyenDungCanDuyet({
    maAdmin,
    tenCongTy: tin.maNhaTuyenDung?.tenCongTy ?? 'Nha tuyen dung',
    tieuDeTin: tin.tieuDe,
    maTinTuyenDung: String(tin._id),
  })))
}

function chuanHoaTin(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  const congTy = duLieu.nhaTuyenDung ?? (duLieu.maNhaTuyenDung?._id ? duLieu.maNhaTuyenDung : null)
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maNhaTuyenDung: String(congTy?._id ?? congTy?.id ?? duLieu.maNhaTuyenDung),
    nhaTuyenDung: congTy
      ? {
          id: String(congTy._id ?? congTy.id),
          tenCongTy: congTy.tenCongTy,
          logo: congTy.logo,
          trangThaiDuyet: congTy.trangThaiDuyet,
        }
      : undefined,
    tieuDe: duLieu.tieuDe,
    yeuCauKinhNghiem: duLieu.yeuCauKinhNghiem,
    diaChi: duLieu.diaChi,
    luongMin: duLieu.luongMin,
    luongMax: duLieu.luongMax,
    loaiHinh: duLieu.loaiHinh,
    capBac: duLieu.capBac,
    anhDaiDien: duLieu.anhDaiDien,
    hanNop: duLieu.hanNop,
    soLuong: duLieu.soLuong,
    moTa: duLieu.moTa,
    yeuCau: duLieu.yeuCau,
    quyenLoi: duLieu.quyenLoi,
    luotXem: duLieu.luotXem,
    trangThai: duLieu.trangThai,
    ngayDang: duLieu.ngayDang,
    // ✅ Lấy từ bảng quan hệ TinTuyenDungKyNang
    kyNang: (duLieu.kyNangLienKet ?? []).map((lienKet: any) => ({
      maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
      tenKyNang: lienKet.kyNang?.tenKyNang,
      loaiKyNang: lienKet.kyNang?.loaiKyNang,
      batBuoc: lienKet.batBuoc,
      mucDo: lienKet.mucDo,
      trongSo: lienKet.trongSo,
    })),
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

const INCLUDE_KY_NANG = {
  kyNangLienKet: {
    include: {
      kyNang: { select: { id: true, tenKyNang: true, loaiKyNang: true } },
    },
  },
}

const INCLUDE_TIN_DAY_DU = {
  ...INCLUDE_KY_NANG,
  nhaTuyenDung: {
    select: {
      id: true,
      maNguoiDung: true,
      tenCongTy: true,
      logo: true,
      trangThaiDuyet: true,
    },
  },
}

function ganCongTyTuRelation(row: any) {
  if (!row?.nhaTuyenDung) return row
  return {
    ...row,
    _id: row.id,
    maNhaTuyenDung: { ...row.nhaTuyenDung, _id: row.nhaTuyenDung.id },
  }
}

async function layDayDu(where: any, many = false, options: { skip?: number; take?: number } = {}) {
  const rows = many
    ? await TinTuyenDung.findMany({
        where,
        orderBy: { ngayTao: 'desc' },
        skip: options.skip ?? 0,
        take: options.take ?? 500,
        include: INCLUDE_TIN_DAY_DU,
      })
    : await TinTuyenDung.findMany({ where, take: 1, include: INCLUDE_TIN_DAY_DU })
  const hydrated = rows.map(ganCongTyTuRelation)
  return many ? hydrated : hydrated[0]
}

async function demTong(where: any) {
  return TinTuyenDung.count({ where })
}

function tachDanhSach(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(tachDanhSach)
  return String(value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function taoDieuKienTimKiem(tuKhoa: string) {
  if (!tuKhoa) return undefined
  const chua = { contains: tuKhoa, mode: 'insensitive' }
  return [
    { tieuDe: chua },
    { diaChi: chua },
    { capBac: chua },
    { loaiHinh: chua },
    { yeuCauKinhNghiem: chua },
    { moTa: chua },
    { yeuCau: chua },
    { quyenLoi: chua },
    { nhaTuyenDung: { tenCongTy: chua } },
    { kyNangLienKet: { some: { kyNang: { tenKyNang: chua } } } },
    { kyNangLienKet: { some: { kyNang: { loaiKyNang: chua } } } },
  ]
}

export const dichVuTinTuyenDung = {
  async layDanhSach(boLoc: Record<string, unknown> = {}) {
    await dongBoTinHetHan()

    const cheDo = String(boLoc.cheDo ?? 'admin')
    const maNhaTuyenDungSoHuu = String(boLoc.maNhaTuyenDungSoHuu ?? '')
    const trang = layLimit(boLoc.trang, 1, 1_000_000)
    const kichThuocTrang = layLimit(boLoc.kichThuocTrang ?? boLoc.limit, 12, 50)
    const tuKhoa = String(boLoc.tuKhoa ?? '').trim()
    const capBac = tachDanhSach(boLoc.capBac)
    const loaiHinh = tachDanhSach(boLoc.loaiHinh)
    const kyNang = tachDanhSach(boLoc.kyNang)
    const loaiKyNang = tachDanhSach(boLoc.loaiKyNang ?? boLoc.loai)

    // Xây dựng where clause theo vai trò
    const where: any = {}
    if (cheDo === 'cong_khai') {
      where.trangThai = 'dang_mo'
      where.hanNop = { gte: new Date() }
      where.nhaTuyenDung = { trangThaiDuyet: 'da_duyet' }
    } else if (cheDo === 'nha_tuyen_dung') {
      if (!maNhaTuyenDungSoHuu) return { duLieu: [], tongSo: 0, trang: 1, kichThuocTrang, tongTrang: 0 }
      where.maNhaTuyenDung = maNhaTuyenDungSoHuu
    }
    // admin: không filter gì thêm

    // Lấy toàn bộ để search + filter công ty đã duyệt (cần join)
    // Với search text phức tạp (tên kỹ năng, tên công ty), vẫn cần app-layer search
    // nhưng giới hạn pool tối đa 500 thay vì load không giới hạn
    if (capBac.length) where.capBac = { in: capBac }
    if (loaiHinh.length) where.loaiHinh = { in: loaiHinh }
    if (kyNang.length) where.kyNangLienKet = { some: { maKyNang: { in: kyNang } } }
    if (loaiKyNang.length) {
      where.kyNangLienKet = {
        some: {
          ...(where.kyNangLienKet?.some ?? {}),
          kyNang: { loaiKyNang: { in: loaiKyNang } },
        },
      }
    }

    const dieuKienTimKiem = taoDieuKienTimKiem(tuKhoa)
    if (dieuKienTimKiem) where.OR = dieuKienTimKiem

    const skip = (trang - 1) * kichThuocTrang
    const [tongSo, rows] = await Promise.all([
      demTong(where),
      TinTuyenDung.findMany({
        where,
        orderBy: { ngayTao: 'desc' },
        skip,
        take: kichThuocTrang,
        include: INCLUDE_TIN_DAY_DU,
      }),
    ])

    const tongTrang = Math.max(1, Math.ceil(tongSo / kichThuocTrang))
    const duLieu = rows.map(ganCongTyTuRelation).map(chuanHoaTin)

    // Tính facet: đếm số tin theo loaiKyNang, capBac, loaiHinh (không bị ảnh hưởng bởi filter hiện tại)
    const whereFacet: any = {}
    if (cheDo === 'cong_khai') {
      whereFacet.trangThai = 'dang_mo'
      whereFacet.hanNop = { gte: new Date() }
      whereFacet.nhaTuyenDung = { trangThaiDuyet: 'da_duyet' }
    } else if (cheDo === 'nha_tuyen_dung' && maNhaTuyenDungSoHuu) {
      whereFacet.maNhaTuyenDung = maNhaTuyenDungSoHuu
    }
    if (dieuKienTimKiem) whereFacet.OR = dieuKienTimKiem

    // Tính facet bằng aggregation thủ công thay vì groupBy (tránh lỗi null với Prisma)
    const [kyNangFacetRows, capBacList, loaiHinhList] = await Promise.all([
      prisma.tinTuyenDungKyNang.groupBy({
        by: ['maKyNang'],
        where: { tinTuyenDung: whereFacet },
        _count: { maKyNang: true },
      }),
      TinTuyenDung.findMany({
        where: whereFacet,
        select: { capBac: true },
      }),
      TinTuyenDung.findMany({
        where: whereFacet,
        select: { loaiHinh: true },
      }),
    ])

    // Đếm capBac thủ công
    const capBacCountMap = new Map<string, number>()
    for (const row of capBacList as any[]) {
      if (!row.capBac) continue
      capBacCountMap.set(row.capBac, (capBacCountMap.get(row.capBac) ?? 0) + 1)
    }
    const capBacFacetRows = [...capBacCountMap.entries()].map(([capBac, soLuong]) => ({ capBac, soLuong })).sort((a, b) => b.soLuong - a.soLuong)

    // Đếm loaiHinh thủ công
    const loaiHinhCountMap = new Map<string, number>()
    for (const row of loaiHinhList as any[]) {
      if (!row.loaiHinh) continue
      loaiHinhCountMap.set(row.loaiHinh, (loaiHinhCountMap.get(row.loaiHinh) ?? 0) + 1)
    }
    const loaiHinhFacetRows = [...loaiHinhCountMap.entries()].map(([loaiHinh, soLuong]) => ({ loaiHinh, soLuong })).sort((a, b) => b.soLuong - a.soLuong)

    // Lấy tên kỹ năng và loại cho facet
    const maKyNangList = kyNangFacetRows.map((r: any) => r.maKyNang)
    const kyNangInfo = maKyNangList.length
      ? await prisma.danhMucKyNang.findMany({
          where: { id: { in: maKyNangList } },
          select: { id: true, tenKyNang: true, loaiKyNang: true },
        })
      : []
    const kyNangMap = new Map(kyNangInfo.map((k: any) => [k.id, k]))

    // Đếm số TIN duy nhất có loaiKyNang tương ứng
    // (mỗi tin-kỹ năng là unique theo khóa chính, nên _count.maKyNang = số tin)
    const tinTheoLoai = await prisma.tinTuyenDungKyNang.findMany({
      where: { tinTuyenDung: whereFacet },
      select: { maTinTuyenDung: true, kyNang: { select: { loaiKyNang: true } } },
    })
    const loaiKyNangTinMap = new Map<string, Set<string>>()
    for (const row of tinTheoLoai as any[]) {
      const loai = row.kyNang?.loaiKyNang
      if (!loai) continue
      if (!loaiKyNangTinMap.has(loai)) loaiKyNangTinMap.set(loai, new Set())
      loaiKyNangTinMap.get(loai)!.add(row.maTinTuyenDung)
    }

    const boLocFacet = {
      loaiKyNang: [...loaiKyNangTinMap.entries()]
        .map(([loai, tinSet]) => ({ loai, soLuong: tinSet.size }))
        .sort((a, b) => b.soLuong - a.soLuong),
      kyNang: (kyNangFacetRows as any[])
        .map((r: any) => {
          const info = kyNangMap.get(r.maKyNang) as any
          return info ? { id: r.maKyNang, ten: info.tenKyNang, loai: info.loaiKyNang, soLuong: r._count.maKyNang } : null
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.soLuong - a.soLuong),
      capBac: capBacFacetRows,
      loaiHinh: loaiHinhFacetRows,
    }

    return { duLieu, tongSo, trang, kichThuocTrang, tongTrang, boLocFacet }
  },

  async layTheoMa(ma: string) {
    await dongBoTinHetHan({ id: ma })
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy tin tuyển dụng', 404)
    return chuanHoaTin(duLieu)
  },

  async taoMoi(duLieu: unknown) {
    const payload = duLieu as Record<string, any>
    const { kyNang, ...tinData } = payload
    
    // Tạo tin tuyển dụng
    const ketQua = await TinTuyenDung.create({ data: boUndefined(tinData) as any })
    
    // Tạo kỹ năng nếu có
    if (Array.isArray(kyNang) && kyNang.length > 0) {
      const kyNangData = kyNang
        .map(item => ({
          maTinTuyenDung: ketQua.id,
          maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
          batBuoc: Boolean(item?.batBuoc),
          mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
          trongSo: item?.trongSo != null ? Number(item.trongSo) : (item?.batBuoc ? 1 : 0.5),
        }))
        .filter(item => item.maKyNang)
      
      if (kyNangData.length > 0) {
        await prisma.tinTuyenDungKyNang.createMany({ 
          data: kyNangData,
          skipDuplicates: true 
        })
      }
    }
    
    await dongBoTinHetHan({ id: ketQua.id })
    const dayDu = await layDayDu({ id: ketQua.id }) as any
    if (dayDu?.trangThai === 'cho_duyet') await guiThongBaoAdminTinCanDuyet(dayDu)
    return chuanHoaTin(dayDu)
  },

  async capNhat(ma: string, duLieuNhan: unknown) {
    const duLieu = duLieuNhan as Record<string, any>
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy tin tuyển dụng để cập nhật', 404)

    const { kyNang, ...tinData } = duLieu
    const duLieuCapNhat = {
      ...tinData,
      ...(tinData.trangThai === 'dang_mo' ? { ngayDang: new Date() } : {}),
    }
    
    // Cập nhật tin tuyển dụng
    await TinTuyenDung.update({ where: { id: ma }, data: boUndefined(duLieuCapNhat) as any })
    
    // Cập nhật kỹ năng nếu có
    if (kyNang !== undefined) {
      // Xóa kỹ năng cũ
      await prisma.tinTuyenDungKyNang.deleteMany({ where: { maTinTuyenDung: ma } })
      
      // Thêm kỹ năng mới
      if (Array.isArray(kyNang) && kyNang.length > 0) {
        const kyNangData = kyNang
          .map(item => ({
            maTinTuyenDung: ma,
            maKyNang: String(item?.maKyNang?.id ?? item?.maKyNang),
            batBuoc: Boolean(item?.batBuoc),
            mucDo: item?.mucDo != null ? Number(item.mucDo) : null,
            trongSo: item?.trongSo != null ? Number(item.trongSo) : (item?.batBuoc ? 1 : 0.5),
          }))
          .filter(item => item.maKyNang)
        
        if (kyNangData.length > 0) {
          await prisma.tinTuyenDungKyNang.createMany({ 
            data: kyNangData,
            skipDuplicates: true 
          })
        }
      }
    }
    
    await dongBoTinHetHan({ id: ma })
    const ketQua = await layDayDu({ id: ma }) as any

    if (hienTai.trangThai !== ketQua.trangThai && ['dang_mo', 'tu_choi'].includes(String(ketQua.trangThai))) {
      await thongBaoNhaTuyenDungKetQuaDuyetTin({
        maNguoiDung: String(ketQua.maNhaTuyenDung?.maNguoiDung ?? hienTai.maNhaTuyenDung?.maNguoiDung),
        tieuDeTin: ketQua.tieuDe,
        maTinTuyenDung: String(ketQua._id),
        trangThai: ketQua.trangThai,
      })
    }
    return chuanHoaTin(ketQua)
  },

  async xoa(ma: string) {
    const hienTai = await layDayDu({ id: ma }) as any
    if (!hienTai) throw new LoiUngDung('Không tìm thấy tin tuyển dụng để xóa', 404)
    await TinTuyenDung.delete({ where: { id: ma } })
    return chuanHoaTin(coId(hienTai))
  },
}
