import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

const cacDuongDanMoiTruong = [
  path.resolve(process.cwd(), '.env.production'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env.production'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '../backend/.env.production'),
  path.resolve(process.cwd(), '../backend/.env'),
]

for (const duongDan of cacDuongDanMoiTruong) {
  if (fs.existsSync(duongDan)) {
    dotenv.config({ path: duongDan })
    break
  }
}

function tachDanhSachMoiTruong(value?: string) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export const bienMoiTruong = {
  cong: Number(process.env.PORT ?? 5000),
  chuoiKetNoiMongo: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/da_nang_it_jobs',
  khoaJwt: process.env.JWT_SECRET ?? 'development-secret',
  khoaJwtLamMoi: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET ?? 'development-secret'}-refresh`,
  duongDanFrontend: process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? 'http://localhost:5173',
  corsOrigins: tachDanhSachMoiTruong(process.env.CORS_ORIGINS),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'Effort Job <no-reply@effortjob.local>',
  crawlerIntervalHours: Number(process.env.CRAWLER_INTERVAL_HOURS ?? 6),
  crawlerBatchLimit: Number(process.env.CRAWLER_BATCH_LIMIT ?? 5),
}
