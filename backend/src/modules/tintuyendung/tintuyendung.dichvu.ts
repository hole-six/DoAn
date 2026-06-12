import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId, ganCongTyChoTin } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { layLimit, locVaXepHangTheoTuKhoa } from '../../dungchung/timkiem.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { thongBaoAdminTinTuyenDungCanDuyet, thongBaoNhaTuyenDungKetQuaDuyetTin } from '../thongbao/thongbao.helper.js'
import { TinTuyenDung } from './tintuyendung.mohinh.js'

function daHetHan(hanNop?: Date | string | null) {
  if (!hanNop) return false
  return new Date(hanNop).getTime() < Date.now()
}

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
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maNhaTuyenDung: duLieu.maNhaTuyenDung?._id ? String(duLieu.maNhaTuyenDung._id) : String(duLieu.maNhaTuyenDung),
    nhaTuyenDung: duLieu.maNhaTuyenDung?._id
      ? {
          id: String(duLieu.maNhaTuyenDung._id),
          tenCongTy: duLieu.maNhaTuyenDung.tenCongTy,
          logo: duLieu.maNhaTuyenDung.logo,
          trangThaiDuyet: duLieu.maNhaTuyenDung.trangThaiDuyet,
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

async function layDayDu(where: any, many = false) {
  const rows = many
    ? await TinTuyenDung.findMany({ 
        where, 
        orderBy: { ngayTao: 'desc' }, 
        take: 300,
        include: {
          kyNangLienKet: {
            include: {
              kyNang: {
                select: { id: true, tenKyNang: true, loaiKyNang: true }
              }
            }
          }
        }
      })
    : await TinTuyenDung.findMany({ 
        where, 
        take: 1,
        include: {
          kyNangLienKet: {
            include: {
              kyNang: {
                select: { id: true, tenKyNang: true, loaiKyNang: true }
              }
            }
          }
        }
      })
  const hydrated = await ganCongTyChoTin(rows as any[])
  return many ? hydrated : hydrated[0]
}

export const dichVuTinTuyenDung = {
  async layDanhSach(boLoc: Record<string, unknown> = {}) {
    await dongBoTinHetHan()
    const danhSach = await layDayDu({}, true)
    const cheDo = String(boLoc.cheDo ?? 'admin')
    const maNhaTuyenDungSoHuu = String(boLoc.maNhaTuyenDungSoHuu ?? '')
    const danhSachChuanHoa = (danhSach as any[]).map(chuanHoaTin).filter((item) => {
      if (cheDo === 'cong_khai') return item.trangThai === 'dang_mo' && item.nhaTuyenDung?.trangThaiDuyet === 'da_duyet' && !daHetHan(item.hanNop)
      if (cheDo === 'nha_tuyen_dung') return maNhaTuyenDungSoHuu ? item.maNhaTuyenDung === maNhaTuyenDungSoHuu : false
      return true
    })
    const daLoc = locVaXepHangTheoTuKhoa(danhSachChuanHoa, boLoc.tuKhoa, item => [
      item.tieuDe,
      item.nhaTuyenDung?.tenCongTy,
      item.diaChi,
      item.capBac,
      item.loaiHinh,
      ...(item.kyNang ?? []).flatMap((kyNang: any) => [kyNang.tenKyNang, kyNang.loaiKyNang]),
    ])
    return daLoc.slice(0, layLimit(boLoc.limit, 50, 100))
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
