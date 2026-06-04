import { bienMoiTruong } from '../cauhinh/bienmoitruong.js'
import { LoiUngDung } from './loiungdung.js'

export async function guiEmail(params: { to: string; subject: string; html: string }) {
  if (!bienMoiTruong.smtpHost || !bienMoiTruong.smtpUser || !bienMoiTruong.smtpPass) {
    throw new LoiUngDung('Chua cau hinh SMTP tren backend', 503, 'SMTP_NOT_CONFIGURED')
  }

  const moduleName = 'nodemailer'
  const nodemailerModule = await import(moduleName).catch(() => null as any)
  const nodemailer = nodemailerModule?.default ?? nodemailerModule
  if (!nodemailer?.createTransport) {
    throw new LoiUngDung('Chua cai package nodemailer tren backend', 503, 'NODEMAILER_NOT_INSTALLED')
  }

  const transporter = nodemailer.createTransport({
    host: bienMoiTruong.smtpHost,
    port: bienMoiTruong.smtpPort,
    secure: bienMoiTruong.smtpSecure,
    auth: {
      user: bienMoiTruong.smtpUser,
      pass: bienMoiTruong.smtpPass,
    },
  })

  await transporter.sendMail({
    from: bienMoiTruong.smtpFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
}
