import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId, ganNguoiDungChoUngVien } from '../../dungchung/prismaHelper.js'
import { prisma } from '../../cauhinh/prisma.js'
import { UngVien } from './ungvien.mohinh.js'

function chuanHoaUngVien(taiLieu: any) {
  const duLieu = taiLieu ?? {}
  return {
    id: String(duLieu.id ?? duLieu._id),
    _id: String(duLieu.id ?? duLieu._id),
    maNguoiDung: duLieu.maNguoiDung?._id ? String(duLieu.maNguoiDung._id) : String(duLieu.maNguoiDung),
    nguoiDung: duLieu.maNguoiDung?._id
      ? {
          id: String(duLieu.maNguoiDung._id),
          hoTen: duLieu.maNguoiDung.hoTen,
          email: duLieu.maNguoiDung.email,
          soDienThoai: duLieu.maNguoiDung.soDienThoai,
          trangThai: duLieu.maNguoiDung.trangThai,
        }
      : undefined,
    ngaySinh: duLieu.ngaySinh,
    gioiTinh: duLieu.gioiTinh,
    diaChi: duLieu.diaChi,
    anhDaiDien: duLieu.anhDaiDien,
    tomTat: duLieu.tomTat,
    kinhNghiem: duLieu.kinhNghiem,
    viTriMongMuon: duLieu.viTriMongMuon,
    mucLuongMongMuon: duLieu.mucLuongMongMuon,
    // ✅ Lấy từ bảng quan hệ UngVienKyNang
    kyNang: (duLieu.kyNangLienKet ?? []).map((lienKet: any) => ({
      maKyNang: String(lienKet.kyNang?.id ?? lienKet.maKyNang),
      tenKyNang: lienKet.kyNang?.tenKyNang,
      loaiKyNang: lienKet.kyNang?.loaiKyNang,
      mucDo: lienKet.mucDo,
      soNamKinhNghiem: lienKet.soNamKinhNghiem,
    })),
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

async function layDayDu(where: any, many = false) {
  // ✅ Query với include để lấy relations
  const rows = many
    ? await UngVien.findMany({ 
        where, 
        orderBy: { ngayTao: 'desc' }, 
        take: 200,
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
    : await UngVien.findMany({ 
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
  
  // Hydrate NguoiDung
  const hydrated = await ganNguoiDungChoUngVien(rows as any[])
  return many ? hydrated : hydrated[0]
}

export const dichVuUngVien = {
  async layDanhSach() {
    const danhSach = await layDayDu({}, true)
    return (danhSach as any[]).map(chuanHoaUngVien)
  },

  async layTheoMa(ma: string) {
    const duLieu = await layDayDu({ id: ma })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    return chuanHoaUngVien(duLieu)
  },

  async layTheoMaNguoiDung(maNguoiDung: string) {
    const duLieu = await layDayDu({ maNguoiDung })
    if (!duLieu) throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
    return chuanHoaUngVien(duLieu)
  },

  async damBaoHoSoTheoNguoiDung(maNguoiDung: string) {
    const hienTai = await UngVien.findUnique({ 
      where: { maNguoiDung },
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
    if (hienTai) {
      const [dayDu] = await ganNguoiDungChoUngVien([hienTai] as any[])
      return chuanHoaUngVien(dayDu)
    }
    const daTao = await UngVien.create({ data: { maNguoiDung, kinhNghiem: 0 } })
    const [dayDu] = await ganNguoiDungChoUngVien([daTao] as any[])
    return chuanHoaUngVien(dayDu)
  },

  async taoMoi(duLieu: unknown) {
    const payload = duLieu as Record<string, any>
    const { kyNang, ...ungVienData } = payload
    
    // Tạo ứng viên
    const ketQua = await UngVien.create({ data: boUndefined(ungVienData) as any })
    
    // Tạo kỹ năng nếu có
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
        await prisma.ungVienKyNang.createMany({ 
          data: kyNangData,
          skipDuplicates: true 
        })
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
    
    // Cập nhật ứng viên
    await UngVien.update({ where: { id: ma }, data: boUndefined(ungVienData) as any })
    
    // Cập nhật kỹ năng nếu có
    if (kyNang !== undefined) {
      // Xóa kỹ năng cũ
      await prisma.ungVienKyNang.deleteMany({ where: { maUngVien: ma } })
      
      // Thêm kỹ năng mới
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
          await prisma.ungVienKyNang.createMany({ 
            data: kyNangData,
            skipDuplicates: true 
          })
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
    return chuanHoaUngVien(coId(hienTai))
  },
}
