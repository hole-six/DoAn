import mongoose from 'mongoose'
import { bienMoiTruong } from './bienmoitruong.js'

export async function ketNoiDuLieu() {
  await mongoose.connect(bienMoiTruong.chuoiKetNoiMongo)
  console.log(`Da ket noi MongoDB: ${mongoose.connection.name}`)
}
