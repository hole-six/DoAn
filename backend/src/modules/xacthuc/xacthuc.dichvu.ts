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
  if (!nguoiDung) throw new LoiUngDung('Email hoac mat khau khong dung', 401)
  if (nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403)
  if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) throw new LoiUngDung('Tai khoan khong thuoc vai tro da chon', 403)
  if (!await bcrypt.compare(duLieu.matKhau, nguoiDung.matKhau)) throw new LoiUngDung('Email hoac mat khau khong dung', 401)

  const nguoiDungCongKhai = taoNguoiDungCongKhai(nguoiDung)
  return { ...taoToken(nguoiDungCongKhai), nguoiDung: nguoiDungCongKhai }
}

export async function lamMoiToken(duLieu: DuLieuLamMoiToken) {
  let payload: TokenPayload
  try {
    payload = jwt.verify(duLieu.refreshToken, bienMoiTruong.khoaJwtLamMoi) as TokenPayload
  } catch {
    throw new LoiUngDung('Refresh token khong hop le hoac da het han', 401)
  }

  if (payload.loai !== 'refresh') throw new LoiUngDung('Refresh token khong hop le', 401)

  const nguoiDung = await NguoiDung.findUnique({ where: { id: payload.sub } }) as NguoiDungDangNhap | null
  if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tai khoan khong con hieu luc', 401)

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
    subject: 'Dat lai mat khau Effort Job',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Dat lai mat khau Effort Job</h2>
        <p>Chao ${escapeHtml(nguoiDung.hoTen || email)},</p>
        <p>Ban vua yeu cau dat lai mat khau. Link nay co hieu luc trong 30 phut va chi dung mot lan.</p>
        <p><a href="${link}" style="display:inline-block;background:#0b5c91;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Dat lai mat khau</a></p>
        <p>Neu ban khong yeu cau, hay bo qua email nay.</p>
      </div>
    `,
  })

  return { ok: true }
}

export async function kiemTraTokenDatLaiMatKhau(token: string) {
  const nguoiDung = await NguoiDung.findFirst({
    where: { maDatLaiMatKhauHash: hashToken(token), maDatLaiMatKhauHetHan: { gt: new Date() } },
  }) as NguoiDungDangNhap | null
  if (!nguoiDung) throw new LoiUngDung('Token dat lai mat khau khong hop le hoac da het han', 400, 'RESET_TOKEN_INVALID')
  return { ok: true, email: nguoiDung.email.replace(/^(.{2}).+(@.+)$/, '$1***$2') }
}

export async function datLaiMatKhau(duLieu: DuLieuDatLaiMatKhau) {
  const nguoiDung = await NguoiDung.findFirst({
    where: { maDatLaiMatKhauHash: hashToken(duLieu.token), maDatLaiMatKhauHetHan: { gt: new Date() } },
  }) as NguoiDungDangNhap | null
  if (!nguoiDung) throw new LoiUngDung('Token dat lai mat khau khong hop le hoac da het han', 400, 'RESET_TOKEN_INVALID')

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
    throw new LoiUngDung('Access token khong hop le hoac da het han', 401)
  }

  if (payload.loai && payload.loai !== 'access') throw new LoiUngDung('Access token khong hop le', 401)

  const nguoiDung = await NguoiDung.findUnique({ where: { id: payload.sub } }) as NguoiDungDangNhap | null
  if (!nguoiDung || nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tai khoan khong con hieu luc', 401)
  const congKhai = taoNguoiDungCongKhai(nguoiDung)
  nguoiDungTheoToken.set(token, { nguoiDung: congKhai, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS })
  return congKhai
}

async function xacThucGoogleCredential(credential: string) {
  if (!bienMoiTruong.googleClientId) throw new LoiUngDung('Chua cau hinh GOOGLE_CLIENT_ID tren backend', 503)
  const phanHoi = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
  const googleUser = await phanHoi.json() as Record<string, string>
  if (!phanHoi.ok || googleUser.aud !== bienMoiTruong.googleClientId || googleUser.email_verified !== 'true') {
    throw new LoiUngDung('Google credential khong hop le', 401)
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

  if (nguoiDung.trangThai !== 'hoat_dong') throw new LoiUngDung('Tai khoan khong o trang thai hoat dong', 403)
  if (duLieu.vaiTro && nguoiDung.vaiTro !== duLieu.vaiTro) throw new LoiUngDung('Tai khoan Google nay da duoc gan vai tro khac', 403)

  const nguoiDungCongKhai = taoNguoiDungCongKhai(coId(nguoiDung) as any)
  if (nguoiDungCongKhai.vaiTro === 'ung_vien') {
    await dichVuUngVien.damBaoHoSoTheoNguoiDung(nguoiDungCongKhai.id)
  }

  return { ...taoToken(nguoiDungCongKhai), nguoiDung: nguoiDungCongKhai }
}
