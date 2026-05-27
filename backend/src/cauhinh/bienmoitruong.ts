import dotenv from 'dotenv'

dotenv.config()

export const bienMoiTruong = {
  cong: Number(process.env.PORT ?? 5000),
  chuoiKetNoiMongo: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/da_nang_it_jobs',
  khoaJwt: process.env.JWT_SECRET ?? 'development-secret',
  duongDanFrontend: process.env.CLIENT_URL ?? 'http://localhost:5173',
}
