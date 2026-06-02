import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { taoDinhTuyenCoBan } from '../../dungchung/dinhtuyencoban.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { dieuKhienHoSoNangLuc } from './hosonangluc.dieukhien.js'

const thuMucUpload = path.join(process.cwd(), 'uploads')
fs.mkdirSync(thuMucUpload, { recursive: true })

function taoDuongDanUpload(tenTep: string, tienTo: string) {
  const duoiTep = path.extname(tenTep).toLowerCase()
  return `${tienTo}-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`
}

const taiAnhCv = multer({
  storage: multer.diskStorage({
    destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
    filename: (_yeuCau, tep, goiLai) => goiLai(null, taoDuongDanUpload(tep.originalname, 'cv-photo')),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_yeuCau, tep, goiLai) => {
    if (!tep.mimetype.startsWith('image/')) return goiLai(new Error('Chi cho phep upload file anh CV'))
    goiLai(null, true)
  },
})

const duoiTepCvHopLe = new Set(['.pdf'])
const mimeCvHopLe = new Set(['application/pdf'])

const taiFileCv = multer({
  storage: multer.diskStorage({
    destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
    filename: (_yeuCau, tep, goiLai) => goiLai(null, taoDuongDanUpload(tep.originalname, 'cv-file')),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_yeuCau, tep, goiLai) => {
    const duoiTep = path.extname(tep.originalname).toLowerCase()
    if (!duoiTepCvHopLe.has(duoiTep) && !mimeCvHopLe.has(tep.mimetype)) {
      return goiLai(new Error('Chi cho phep upload CV dang PDF'))
    }
    goiLai(null, true)
  },
})

function phanHoiTepDaTaiLen(yeuCau: any, phanHoi: any, thongBaoThieuTep: string) {
  if (!yeuCau.file) return phanHoi.status(400).json({ thongBao: thongBaoThieuTep })
  const duongDan = `/uploads/${yeuCau.file.filename}`
  const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`
  return phanHoi.status(201).json({
    duLieu: {
      duongDan,
      url: `${gocUrl}${duongDan}`,
      tenTep: yeuCau.file.originalname,
      mimeLoai: yeuCau.file.mimetype,
    },
  })
}

export const dinhTuyenHoSoNangLuc = taoDinhTuyenCoBan(dieuKhienHoSoNangLuc)

dinhTuyenHoSoNangLuc.post('/upload-anh', yeuCauDangNhap, yeuCauVaiTro(['ung_vien', 'admin']), taiAnhCv.single('anh'), (yeuCau, phanHoi) => {
  return phanHoiTepDaTaiLen(yeuCau, phanHoi, 'Chua co file anh CV')
})

dinhTuyenHoSoNangLuc.post('/upload-file', yeuCauDangNhap, yeuCauVaiTro(['ung_vien', 'admin']), taiFileCv.single('tep'), (yeuCau, phanHoi) => {
  return phanHoiTepDaTaiLen(yeuCau, phanHoi, 'Chua co file CV goc')
})


