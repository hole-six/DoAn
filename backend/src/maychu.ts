import { bienMoiTruong } from './cauhinh/bienmoitruong.js'
import { ketNoiDuLieu } from './cauhinh/ketnoidulieu.js'
import { taoUngDung } from './ungdung.js'

async function khoiDongMayChu() {
  await ketNoiDuLieu()
  const ungDung = taoUngDung()

  ungDung.listen(bienMoiTruong.cong, () => {
    console.log(`May chu dang chay tai cong ${bienMoiTruong.cong}`)
  })
}

khoiDongMayChu().catch((loi) => {
  console.error('Khoi dong that bai:', loi)
  process.exit(1)
})
