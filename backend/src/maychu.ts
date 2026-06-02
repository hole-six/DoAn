import { createServer } from 'http'
import { bienMoiTruong } from './cauhinh/bienmoitruong.js'
import { ketNoiDuLieu } from './cauhinh/ketnoidulieu.js'
import { khoiTaoSocket } from './cauhinh/socket.js'
import { khoiDongCrawlerGoiYViecLam } from './modules/ai/ai.dichvu.js'
import { khoiDongCronCanhBaoQuanTri } from './modules/canhbaoquantri/canhbaoquantri.dichvu.js'
import { taoUngDung } from './ungdung.js'

async function khoiDongMayChu() {
  await ketNoiDuLieu()
  khoiDongCronCanhBaoQuanTri()
  khoiDongCrawlerGoiYViecLam()
  const ungDung = taoUngDung()
  
  // Tạo HTTP server
  const httpServer = createServer(ungDung)
  
  // Khởi tạo Socket.IO
  khoiTaoSocket(httpServer)

  httpServer.listen(bienMoiTruong.cong, () => {
    console.log(`May chu dang chay tai cong ${bienMoiTruong.cong}`)
  })
}

khoiDongMayChu().catch((loi) => {
  console.error('Khoi dong that bai:', loi)
  process.exit(1)
})
