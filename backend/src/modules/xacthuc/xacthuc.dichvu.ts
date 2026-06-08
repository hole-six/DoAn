import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { bienMoiTruong } from '../../cauhinh/bienmoitruong.js'
import { guiEmail } from '../../dungchung/email.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import { boUndefined, coId } from '../../dungchung/prismaHelper.js'
import { NguoiDung } from '../nguoidung/nguoidung.mohinh.js'
import { dichVuUngVien } from '../ungvien/ungvien.dichvu.js'
import type { kiemTraDangNhap, kiemTraDangNhapGoogle, kiemTraDatLaiMatKhau, kiemTraLamMoiToken, kiemTraQuenMatKhau } from './xacthuc.kiemtra.js'
import type { z } from 'zod'

type DuLieuDangNhap = z.infer<typeof kiemTraDangNhap>
type DuLieuLamMoiToken = z.infer<typeof kiemTraLamMoiToken>
type DuLieuDangNhapGoogle = z.infer<typeof kiemTraDangNhapGoogle>
type DuLieuQuenMatKhau = z.infer<typeof kiemTraQuenMatKhau>
type DuLieuDatLaiMatKhau = z.infer<typeof kiemTraDatLaiMatKhau>
type NguoiDungDangNhap = {
  id: string
  _id?: unknown
  email: string
  matKhau: string
  hoTen: string
  soDienThoai?: string | null
  vaiTro: string
  trangThai: string
  maDatLaiMatKhauHash?: string | null
  maDatLaiMatKhauHetHan?: Date | null
}

type TokenPayload = {
  sub: string
  vaiTro: string
  email: string
  loai?: string
}

const TOKEN_CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS ?? 15000)
const nguoiDungTheoToken = new Map<string, { expiresAt: number; nguoiDung: ReturnType<typeof taoNguoiDungCongKhai> }>()

function taoNguoiDungCongKhai(nguoiDung: NguoiDungDangNhap) {
  return {
    id: String(nguoiDung.id ?? nguoiDung._id),
    _id: String(nguoiDung.id ?? nguoiDung._id),
    email: nguoiDung.email,
    hoTen: nguoiDung.hoTen,
    soDienThoai: nguoiDung.soDienThoai,
    vaiTro: nguoiDung.vaiTro,
    trangThai: nguoiDung.trangThai,
  }
}

function taoToken(nguoiDungCongKhai: ReturnType<typeof taoNguoiDungCongKhai>) {
  const payload = {
    sub: nguoiDungCongKhai.id,
    vaiTro: nguoiDungCongKhai.vaiTro,
    email: nguoiDungCongKhai.email,
  }

  const accessToken = jwt.sign({ ...payload, loai: 'access' }, bienMoiTruong.khoaJwt, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ ...payload, loai: 'refresh' }, bienMoiTruong.khoaJwtLamMoi, { expiresIn: '30d' })
  nguoiDungTheoToken.set(accessToken, { nguoiDung: nguoiDungCongKhai, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS })

  return { accessToken, refreshToken, token: accessToken, expiresIn: 15 * 60, tokenType: 'Bearer' }
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function taoLinkDatLaiMatKhau(token: string) {
  return `${bienMoiTruong.duongDanFrontend.replace(/\/$/, '')}/dat-lai-mat-khau?token=${encodeURIComponent(token)}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function dangNhap(duLieu: DuLieuDangNhap) {
  const nguoiDung = await NguoiDung.findUnique({ where: { email: duLieu.email.toLowerCase().trim() } }) as NguoiDungDangNhap | null
  if (!nguoiDung) throw new LoiUngDung('Email hoặc mật khẩu không đúng', 401)
  if (nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tài khoản không ở trạng thái hoạt động', 403)
  if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) throw new LoiUngDung('Tài khoản không thuộc vai trò đã chọn', 403)
  if (!await bcrypt.compare(duLieu.matKhau, nguoiDung.matKhau)) throw new LoiUngDung('Email hoặc mật khẩu không đúng', 401)

  const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung)
  return { ...taoToken(nguoiDungCongKhai), nguoiDung: nguoiDungCongKhai }
}

export async function lamMoiToken(duLieu: DuLieuLamMoiToken) {
  let payload: TokenPayload
  try {
    payload = jwt.verify(duLieu.refreshToken, bienMoiTruong.khoaJwtLamMoi) as TokenPayload
  } catch {
    throw new LoiUngDung('Refresh token không hợp lệ hoặc đã hết hạn', 401)
  }

  if (payload.loai !== 'refresh') throw new LoiUngDung('Refresh token không hợp lệ', 401)

  const nguoiDung = await NguoiDung.findUnique({ where: { id: payload.sub } }) as NguoiDungDangNhap | null
  if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tài khoản không còn hiệu lực', 401)

  const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung)
  return { ...taoToken(nguoiDungCongKhai), nguoiDung: nguoiDungCongKhai }
}

export async function quenMatKhau(duLieu: DuLieuQuenMatKhau) {
  const email = duLieu.email.toLowerCase().trim()
  const nguoiDung = await NguoiDung.findUnique({ where: { email } }) as NguoiDungDangNhap | null
  if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') return { ok: true }

  const token = crypto.randomBytes(32).toString('hex')
  const hetHan = new Date(Date.now() + 30 * 60 * 1000)

  await NguoiDung.update({
    where: { id: nguoiDung.id },
    data: { maDatLaiMatKhauHash: hashToken(token), maDatLaiMatKhauHetHan: hetHan },
  })

  const link = taoLinkDatLaiMatKhau(token)
  await guiEmail({
    to: email,
    subject: 'Đặt lại mật khẩu Effort Job',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Đặt lại mật khẩu Effort Job</h2>
        <p>Chào ${escapeHtml(nguoiDung.hoTen || email)},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Link này có hiệu lực trong 30 phút và chỉ dùng một lần.</p>
        <p><a href="${link}" style="display:inline-block;background:#0b5c91;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Đặt lại mật khẩu</a></p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>
    `,
  })

  return { ok: true }
}

export async function kiemTraTokenDatLaiMatKhau(token: string) {
  const nguoiDung = await NguoiDung.findFirst({
    where: { maDatLaiMatKhauHash: hashToken(token), maDatLaiMatKhauHetHan: { gt: new Date() } },
  }) as NguoiDungDangNhap | null
  if (!nguoiDung) throw new LoiUngDung('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400, 'RESET_TOKEN_INVALID')
  return { ok: true, email: nguoiDung.email.replace(/^(.{2}).+(@.+)$/, '$1***$2') }
}

export async function datLaiMatKhau(duLieu: DuLieuDatLaiMatKhau) {
  const nguoiDung = await NguoiDung.findFirst({
    where: { maDatLaiMatKhauHash: hashToken(duLieu.token), maDatLaiMatKhauHetHan: { gt: new Date() } },
  }) as NguoiDungDangNhap | null
  if (!nguoiDung) throw new LoiUngDung('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400, 'RESET_TOKEN_INVALID')

  await NguoiDung.update({
    where: { id: nguoiDung.id },
    data: {
      matKhau: await bcrypt.hash(duLieu.matKhau, 10),
      maDatLaiMatKhauHash: null,
      maDatLaiMatKhauHetHan: null,
    },
  })

  return { ok: true }
}

export async function layNguoiDungTuAccessToken(authorization?: string) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const cached = nguoiDungTheoToken.get(token)
  if (cached && cached.expiresAt > Date.now()) return cached.nguoiDung
  if (!token) throw new LoiUngDung('Thiếu access token', 401)

  let payload: TokenPayload
  try {
    payload = jwt.verify(token, bienMoiTruong.khoaJwt) as TokenPayload
  } catch {
    throw new LoiUngDung('Access token không hợp lệ hoặc đã hết hạn', 401)
  }

  if (payload.loai && payload.loai !== 'access') throw new LoiUngDung('Access token không hợp lệ', 401)

  const nguoiDung = await NguoiDung.findUnique({ where: { id: payload.sub } }) as NguoiDungDangNhap | null
  if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tài khoản không còn hiệu lực', 401)
  const congKhai = taoNguoiDungCongKhai(nguoiDung)
  nguoiDungTheoToken.set(token, { nguoiDung: congKhai, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS })
  return congKhai
}

async function xacThucGoogleCredential(credential: string) {
  if (!bienMoiTruong.googleClientId) throw new LoiUngDung('Chưa cấu hình GOOGLE_CLIENT_ID trên backend', 503)
  const phanHoi = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
  const googleUser = await phanHoi.json() as Record<string, string>
  if (!phanHoi.ok || googleUser.aud !== bienMoiTruong.googleClientId || googleUser.email_verified !== 'true') {
    throw new LoiUngDung('Google credential không hợp lệ', 401)
  }
  return googleUser
}

export async function dangNhapGoogle(duLieu: DuLieuDangNhapGoogle) {
  const googleUser = await xacThucGoogleCredential(duLieu.credential)
  const email = googleUser.email.toLowerCase().trim()
  const matKhauHeThong = await bcrypt.hash(`google:${googleUser.sub}:${bienMoiTruong.khoaJwt}`, 10)

  const nguoiDung = await NguoiDung.upsert({
    where: { email },
    update: {},
    create: boUndefined({
      email,
      matKhau: matKhauHeThong,
      hoTen: googleUser.name || email,
      soDienThoai: '',
      vaiTro: duLieu.vaiTro ?? 'ung_vien',
      trangThai: 'hoat_dong',
    }) as any,
  }) as NguoiDungDangNhap

  if (nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tài khoản không ở trạng thái hoạt động', 403)
  if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) throw new LoiUngDung('Tài khoản Google này đã được gán vai trò khác', 403)

  const nguoiDungCongKhai = taoNguoiDungCongKhai(coId(nguoiDung) as any)
  if (nguoiDungCongKhai.vaiTro === 'ung_vien') {
    await dichVuUngVien.damBaoHoSoTheoNguoiDung(nguoiDungCongKhai.id)
  }

  return { ...taoToken(nguoiDungCongKhai), nguoiDung: nguoiDungCongKhai }
}
