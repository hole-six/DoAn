import { createServer } from 'http'
import { bienMoiTruong } from './cauhinh/bienmoitruong.js'
import { ketNoiDuLieu } from './cauhinh/ketnoidulieu.js'
import { khoiTaoSocket } from './cauhinh/socket.js'
import { taoUngDung } from './ungdung.js'

async function khoiDongMayChu() {
  await ketNoiDuLieu()
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
