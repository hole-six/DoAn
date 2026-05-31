import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../danhmuckynang/danhmuckynang.mohinh.js'
import '../nguoidung/nguoidung.mohinh.js'
import { UngVien } from './ungvien.mohinh.js'

function chuanHoaUngVien(taiLieu: any) {
  const duLieu = typeof taiLieu.toObject === 'function' ? taiLieu.toObject() : taiLieu
  return {
    id: String(duLieu._id),
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
    kyNang: (duLieu.kyNang ?? []).map((muc: any) => ({
      maKyNang: muc.maKyNang?._id ? String(muc.maKyNang._id) : String(muc.maKyNang),
      tenKyNang: muc.maKyNang?.tenKyNang,
      loaiKyNang: muc.maKyNang?.loaiKyNang,
      mucDo: muc.mucDo,
    })),
    portfolio: duLieu.portfolio ?? [],
    ngayTao: duLieu.ngayTao,
    ngayCapNhat: duLieu.ngayCapNhat,
  }
}

export const dichVuUngVien = {
  async layDanhSach() {
    try {
      const danhSach = await (UngVien as any)
        .find()
        .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
        .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
        .sort({ ngayTao: -1 })
        .limit(200)
      return danhSach.map(chuanHoaUngVien)
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách ứng viên:', error)
      throw error
    }
  },

  async layTheoMa(ma: string) {
    try {
      const duLieu = await (UngVien as any)
        .findById(ma)
        .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
        .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
      
      if (!duLieu) {
        throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
      }
      
      return chuanHoaUngVien(duLieu)
    } catch (error) {
      console.error('❌ Lỗi khi lấy hồ sơ ứng viên:', error)
      throw error
    }
  },

  async layTheoMaNguoiDung(maNguoiDung: string) {
    try {
      const duLieu = await (UngVien as any)
        .findOne({ maNguoiDung })
        .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
        .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
      
      if (!duLieu) {
        throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
      }
      
      return chuanHoaUngVien(duLieu)
    } catch (error) {
      console.error('❌ Lỗi khi lấy hồ sơ theo mã người dùng:', error)
      throw error
    }
  },

  async taoMoi(duLieu: unknown) {
    try {
      const ketQua = await (UngVien as any).create(duLieu)
      console.log('✅ Tạo hồ sơ ứng viên thành công:', ketQua._id)
      return this.layTheoMa(String(ketQua._id))
    } catch (error) {
      console.error('❌ Lỗi khi tạo hồ sơ ứng viên:', error)
      throw error
    }
  },

  async capNhat(ma: string, duLieu: unknown, maNguoiDungHienTai?: string) {
    try {
      // Kiểm tra quyền nếu có maNguoiDungHienTai
      if (maNguoiDungHienTai) {
        const ungVien = await (UngVien as any).findById(ma)
        if (!ungVien) {
          throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
        }
        
        if (String(ungVien.maNguoiDung) !== maNguoiDungHienTai) {
          throw new LoiUngDung('Bạn không có quyền cập nhật hồ sơ này', 403)
        }
      }
      
      const ketQua = await (UngVien as any)
        .findByIdAndUpdate(ma, duLieu, { returnDocument: 'after', runValidators: true })
        .populate('maNguoiDung', 'hoTen email soDienThoai trangThai')
        .populate('kyNang.maKyNang', 'tenKyNang loaiKyNang')
      
      if (!ketQua) {
        throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên để cập nhật', 404)
      }
      
      console.log('✅ Cập nhật hồ sơ ứng viên thành công:', ma)
      return chuanHoaUngVien(ketQua)
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật hồ sơ ứng viên:', error)
      throw error
    }
  },

  async xoa(ma: string, maNguoiDungHienTai?: string) {
    try {
      // Kiểm tra quyền nếu có maNguoiDungHienTai
      if (maNguoiDungHienTai) {
        const ungVien = await (UngVien as any).findById(ma)
        if (!ungVien) {
          throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên', 404)
        }
        
        if (String(ungVien.maNguoiDung) !== maNguoiDungHienTai) {
          throw new LoiUngDung('Bạn không có quyền xóa hồ sơ này', 403)
        }
      }
      
      const ketQua = await (UngVien as any).findByIdAndDelete(ma)
      if (!ketQua) {
        throw new LoiUngDung('Không tìm thấy hồ sơ ứng viên để xóa', 404)
      }
      
      console.log('✅ Xóa hồ sơ ứng viên thành công:', ma)
      return chuanHoaUngVien(ketQua)
    } catch (error) {
      console.error('❌ Lỗi khi xóa hồ sơ ứng viên:', error)
      throw error
    }
  },
}
