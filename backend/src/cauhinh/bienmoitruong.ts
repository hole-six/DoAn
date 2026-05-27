import dotenv from 'dotenv'

dotenv.config()

export const bienMoiTruong = {
  cong: Number(process.env.PORT ?? 5000),
  chuoiKetNoiMongo: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/da_nang_it_jobs',
  khoaJwt: process.env.JWT_SECRET ?? 'development-secret',
  khoaJwtLamMoi: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET ?? 'development-secret'}-refresh`,
  duongDanFrontend: process.env.CLIENT_URL ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
}
