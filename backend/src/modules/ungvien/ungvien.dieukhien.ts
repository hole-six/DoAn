import type { Request, Response } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { taoDieuKhienCoBan } from '../../dungchung/dieukhiencoban.js'
import { dichVuUngVien } from './ungvien.dichvu.js'
import { kiemTraCapNhatUngVien, kiemTraTaoUngVien } from './ungvien.kiemtra.js'

const dieuKhienCoBan = taoDieuKhienCoBan(dichVuUngVien, kiemTraTaoUngVien, kiemTraCapNhatUngVien)

export const dieuKhienUngVien = {
  ...dieuKhienCoBan,
  
  // Lấy hồ sơ của người dùng hiện tại
  layHoSoCuaToi: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    const maNguoiDung = (yeuCau as any).user?.id || (yeuCau as any).nguoiDung?.id
    if (!maNguoiDung) {
      return phanHoi.status(401).json({ 
        thanhCong: false,
        thongBao: 'Vui lòng đăng nhập để xem hồ sơ' 
      })
    }
    
    const nguoiDung = (yeuCau as any).user || (yeuCau as any).nguoiDung
    const duLieu = String(nguoiDung?.vaiTro ?? '') === 'ung_vien'
      ? await dichVuUngVien.damBaoHoSoTheoNguoiDung(maNguoiDung)
      : await dichVuUngVien.layTheoMaNguoiDung(maNguoiDung)
    return phanHoi.json({ duLieu })
  }),
  
  // Cập nhật với kiểm tra quyền
  capNhatCoQuyen: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    const duLieuHopLe = kiemTraCapNhatUngVien.parse(yeuCau.body)
    const ma = String(yeuCau.params.ma ?? '')
    const maNguoiDung = (yeuCau as any).user?.id || (yeuCau as any).nguoiDung?.id
    
    const duLieu = await dichVuUngVien.capNhat(ma, duLieuHopLe, maNguoiDung)
    return phanHoi.json({ 
      duLieu,
      thanhCong: true,
      thongBao: 'Cập nhật hồ sơ thành công'
    })
  }),
  
  // Xóa với kiểm tra quyền
  xoaCoQuyen: batLoiBatDongBo(async (yeuCau: Request, phanHoi: Response) => {
    const ma = String(yeuCau.params.ma ?? '')
    const maNguoiDung = (yeuCau as any).user?.id || (yeuCau as any).nguoiDung?.id
    
    await dichVuUngVien.xoa(ma, maNguoiDung)
    return phanHoi.json({ 
      thanhCong: true,
      thongBao: 'Xóa hồ sơ thành công'
    })
  }),
}
