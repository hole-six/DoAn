import { Router } from 'express'
import { batLoiBatDongBo } from '../../dungchung/batloibatdongbo.js'
import { yeuCauDangNhap, yeuCauVaiTro } from '../../dungchung/xacthuc.js'
import { dichVuAi } from './ai.dichvu.js'

export const dinhTuyenAi = Router()

dinhTuyenAi.post('/chatbot', batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.chatbot(
    String(yeuCau.body?.cauHoi ?? yeuCau.body?.message ?? ''),
    yeuCau.body?.lichSu,
    yeuCau.body?.boLoc,
  )
  phanHoi.json({ duLieu })
}))

dinhTuyenAi.use(yeuCauDangNhap)

dinhTuyenAi.get('/goi-y-viec-lam', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.layGoiY((yeuCau as any).nguoiDung)
  phanHoi.json({ duLieu })
}))

dinhTuyenAi.post('/goi-y-viec-lam/chay-ngay', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.chayGoiY((yeuCau as any).nguoiDung)
  phanHoi.status(201).json({ duLieu })
}))

dinhTuyenAi.post('/goi-y-viec-lam/gui-email', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.guiEmailGoiY((yeuCau as any).nguoiDung)
  phanHoi.json({ duLieu })
}))

dinhTuyenAi.post('/goi-y-cv', yeuCauVaiTro(['ung_vien']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.goiYDienCv((yeuCau as any).nguoiDung, yeuCau.body)
  phanHoi.json({ duLieu })
}))

dinhTuyenAi.get('/goi-y-viec-lam/admin/preview', yeuCauVaiTro(['admin']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.previewGuiEmailHangLoat({
    diemToiThieu: yeuCau.query?.diemToiThieu ? Number(yeuCau.query.diemToiThieu) : undefined,
    soJobMoiEmail: yeuCau.query?.soJobMoiEmail ? Number(yeuCau.query.soJobMoiEmail) : undefined,
  })
  phanHoi.json({ duLieu })
}))

dinhTuyenAi.post('/goi-y-viec-lam/admin/gui-email-hang-loat', yeuCauVaiTro(['admin']), batLoiBatDongBo(async (yeuCau, phanHoi) => {
  const duLieu = await dichVuAi.guiEmailHangLoat({
    diemToiThieu: yeuCau.body?.diemToiThieu,
    soJobMoiEmail: yeuCau.body?.soJobMoiEmail,
  })
  phanHoi.status(202).json({ duLieu })
}))
