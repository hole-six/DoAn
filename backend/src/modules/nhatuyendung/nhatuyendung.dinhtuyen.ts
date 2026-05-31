import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { dieuKhienNhaTuyenDung } from './nhatuyendung.dieukhien.js'

const thuMucUpload = path.join(process.cwd(), 'uploads')
fs.mkdirSync(thuMucUpload, { recursive: true })

const taiLogo = multer({
  storage: multer.diskStorage({
    destination: (_yeuCau, _tep, goiLai) => goiLai(null, thuMucUpload),
    filename: (_yeuCau, tep, goiLai) => {
      const duoiTep = path.extname(tep.originalname).toLowerCase()
      const tenTep = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${duoiTep}`
      goiLai(null, tenTep)
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_yeuCau, tep, goiLai) => {
    if (!tep.mimetype.startsWith('image/')) return goiLai(new Error('Chi cho phep upload file anh'))
    goiLai(null, true)
  },
})

export const dinhTuyenNhaTuyenDung = Router()

dinhTuyenNhaTuyenDung.post('/upload-logo', taiLogo.single('logo'), (yeuCau, phanHoi) => {
  if (!yeuCau.file) return phanHoi.status(400).json({ thongBao: 'Chua co file logo' })
  const duongDan = `/uploads/${yeuCau.file.filename}`
  const gocUrl = `${yeuCau.protocol}://${yeuCau.get('host')}`
  return phanHoi.status(201).json({ duLieu: { duongDan, url: `${gocUrl}${duongDan}` } })
})

dinhTuyenNhaTuyenDung.get('/', dieuKhienNhaTuyenDung.layDanhSach)
dinhTuyenNhaTuyenDung.get('/:ma', dieuKhienNhaTuyenDung.layChiTiet)
dinhTuyenNhaTuyenDung.post('/', dieuKhienNhaTuyenDung.taoMoi)
dinhTuyenNhaTuyenDung.patch('/:ma', dieuKhienNhaTuyenDung.capNhat)
dinhTuyenNhaTuyenDung.delete('/:ma', dieuKhienNhaTuyenDung.xoa)
