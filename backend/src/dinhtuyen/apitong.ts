import { Router } from 'express'
import { dinhTuyenCanhBaoQuanTri } from '../modules/canhbaoquantri/canhbaoquantri.dinhtuyen.js'
import { dinhTuyenDanhGiaCongTy } from '../modules/danhgiacongty/danhgiacongty.dinhtuyen.js'
import { dinhTuyenDanhMucKyNang } from '../modules/danhmuckynang/danhmuckynang.dinhtuyen.js'
import { dinhTuyenHoSoNangLuc } from '../modules/hosonangluc/hosonangluc.dinhtuyen.js'
import { dinhTuyenHoSoUngTuyen } from '../modules/hosoungtuyen/hosoungtuyen.dinhtuyen.js'
import { dinhTuyenLichPhongVan } from '../modules/lichphongvan/lichphongvan.dinhtuyen.js'
import { dinhTuyenLichSuHoSoUngTuyen } from '../modules/lichsuhosoungtuyen/lichsuhosoungtuyen.dinhtuyen.js'
import { dinhTuyenNguoiDung } from '../modules/nguoidung/nguoidung.dinhtuyen.js'
import { dinhTuyenNhaTuyenDung } from '../modules/nhatuyendung/nhatuyendung.dinhtuyen.js'
import { dinhTuyenPortfolio } from '../modules/portfolio/portfolio.dinhtuyen.js'
import { dinhTuyenThongBao } from '../modules/thongbao/thongbao.dinhtuyen.js'
import { dinhTuyenTinNhan } from '../modules/tinnhan/tinnhan.dinhtuyen.js'
import { dinhTuyenTinTuyenDung } from '../modules/tintuyendung/tintuyendung.dinhtuyen.js'
import { dinhTuyenUngVien } from '../modules/ungvien/ungvien.dinhtuyen.js'
import { dinhTuyenXacThuc } from '../modules/xacthuc/xacthuc.dinhtuyen.js'

export const apiTong = Router()

apiTong.get('/trangthai', (_yeuCau, phanHoi) => {
  phanHoi.json({ thongBao: 'API san sang', thoiGian: new Date().toISOString() })
})

apiTong.use('/nguoidung', dinhTuyenNguoiDung)
apiTong.use('/canhbaoquantri', dinhTuyenCanhBaoQuanTri)
apiTong.use('/xacthuc', dinhTuyenXacThuc)
apiTong.use('/ungvien', dinhTuyenUngVien)
apiTong.use('/hosonangluc', dinhTuyenHoSoNangLuc)
apiTong.use('/nhatuyendung', dinhTuyenNhaTuyenDung)
apiTong.use('/tintuyendung', dinhTuyenTinTuyenDung)
apiTong.use('/danhmuckynang', dinhTuyenDanhMucKyNang)
apiTong.use('/hosoungtuyen', dinhTuyenHoSoUngTuyen)
apiTong.use('/portfolio', dinhTuyenPortfolio)
apiTong.use('/lichsuhosoungtuyen', dinhTuyenLichSuHoSoUngTuyen)
apiTong.use('/lichphongvan', dinhTuyenLichPhongVan)
apiTong.use('/thongbao', dinhTuyenThongBao)
apiTong.use('/tinnhan', dinhTuyenTinNhan)
apiTong.use('/danhgiacongty', dinhTuyenDanhGiaCongTy)
