import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { taoDinhTuyenCoBan } from '../../dungchung/dinhtuyencoban.js'
import { dieuKhienHoSoUngTuyen } from './hosoungtuyen.dieukhien.js'
import { layNguoiDungTuAccessToken } from '../xacthuc/xacthuc.dichvu.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { UngVien } from '../ungvien/ungvien.mohinh.js'
import { HoSoNangLuc } from '../hosonangluc/hosonangluc.mohinh.js'
import { dichVuHoSoUngTuyen } from './hosoungtuyen.dichvu.js'

export const dinhTuyenHoSoUngTuyen = Router()

dinhTuyenHoSoUngTuyen.post('/ung-tuyen-nhanh', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const nguoiDung = await layNguoiDungTuAccessToken(yeuCau.headers.authorization)
  if (nguoiDung.vaiTro !== 'ung_vien') {
    throw new LoiUngDung('Chi tai khoan ung vien moi duoc ung tuyen', 403)
  }

  const maTinTuyenDung = String(yeuCau.body?.maTinTuyenDung ?? '')
  if (!maTinTuyenDung) throw new LoiUngDung('Thieu ma tin tuyen dung', 422)

  const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id })
  if (!ungVien) throw new LoiUngDung('Ban can tao ho so ung vien truoc khi ung tuyen', 422)

  const hoSoChinh = await (HoSoNangLuc as any).findOne({ maUngVien: ungVien._id, cvChinh: true })
  if (!hoSoChinh) throw new LoiUngDung('Ban can co CV chinh truoc khi ung tuyen', 422)

  const duLieu = await dichVuHoSoUngTuyen.taoMoi({
    maUngVien: ungVien._id,
    maTinTuyenDung,
    maHoSoNangLuc: hoSoChinh._id,
    diemKhopKyNang: Number(yeuCau.body?.diemKhopKyNang ?? 75),
    thuXinViec: yeuCau.body?.thuXinViec,
  })

  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenHoSoUngTuyen.use(taoDinhTuyenCoBan(dieuKhienHoSoUngTuyen))
