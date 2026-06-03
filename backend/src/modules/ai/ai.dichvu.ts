import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { bienMoiTruong } from '../../cauhinh/bienmoitruong.js'
import { LoiUngDung } from '../../dungchung/loiungdung.js'
import '../danhmuckynang/danhmuckynang.mohinh.js'
import '../nhatuyendung/nhatuyendung.mohinh.js'
import { HoSoNangLuc } from '../hosonangluc/hosonangluc.mohinh.js'
import { TinTuyenDung } from '../tintuyendung/tintuyendung.mohinh.js'
import { UngVien } from '../ungvien/ungvien.mohinh.js'
import { GoiYViecLam } from './goiyvieclam.mohinh.js'

type NguoiDungHienTai = { id: string; vaiTro: string }
type MatchResult = {
  maTinTuyenDung: string
  diem: number
  lyDo: string
  kyNangKhop: string[]
  kyNangThieu: string[]
}

type ChatJobSuggestion = {
  id: string
  tieuDe: string
  congTy: string
  diaChi?: string
  luong?: string
  diem?: number
  lyDo?: string
  url: string
}

let dangChayCrawler = false
let crawlerTimer: NodeJS.Timeout | undefined

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

function asText(value: unknown, seen = new WeakSet<object>(), depth = 0): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value).trim()
  if (value instanceof Date) return value.toISOString()
  if (typeof value !== 'object') return ''

  const obj = value as any
  if (Buffer.isBuffer(obj)) return ''
  if (typeof obj.toHexString === 'function' && (obj._bsontype || obj.constructor?.name === 'ObjectId')) return String(obj)
  if (seen.has(obj) || depth > 8) return ''
  seen.add(obj)

  if (Array.isArray(obj)) return obj.map((item) => asText(item, seen, depth + 1)).filter(Boolean).join('\n')
  if (obj instanceof Map) return [...obj.values()].map((item) => asText(item, seen, depth + 1)).filter(Boolean).join('\n')

  if (typeof obj.toObject === 'function') {
    try {
      const plain = obj.toObject({ virtuals: false, depopulate: true, versionKey: false, flattenMaps: true })
      if (plain && plain !== obj) return asText(plain, seen, depth + 1)
    } catch {
      // Fall back to enumerable fields below.
    }
  }

  const ignoredKeys = new Set(['$__', '_doc', 'isNew', 'schema', 'collection', 'db', 'base', 'model'])
  return Object.entries(obj)
    .filter(([key, item]) => !key.startsWith('$') && !ignoredKeys.has(key) && typeof item !== 'function')
    .map(([, item]) => asText(item, seen, depth + 1))
    .filter(Boolean)
    .join('\n')
}

function lowerText(value: unknown): string {
  return asText(value).toLowerCase()
}

function absoluteFrontendUrl(pathname: string) {
  const base = String(bienMoiTruong.duongDanFrontend || 'http://localhost:5173').replace(/\/+$/, '')
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${path}`
}

function formatLuong(job: any) {
  if (!job?.luongMin && !job?.luongMax) return 'Thỏa thuận'
  const min = Number(job?.luongMin ?? 0).toLocaleString('vi-VN')
  const max = Number(job?.luongMax ?? 0).toLocaleString('vi-VN')
  return `${min} - ${max} VND`
}

function layKyNangTin(tin: any): string[] {
  const kyNang = (tin.kyNang ?? [])
    .map((item: any) => String(item?.maKyNang?.tenKyNang ?? item?.tenKyNang ?? item?.maKyNang ?? '').trim())
    .filter(Boolean)
  const boSung = [tin.capBac, tin.loaiHinh, tin.diaChi]
  return [...new Set([...kyNang, ...boSung.map(item => String(item ?? '').trim()).filter(Boolean)])]
}

function layChuoiKyNangCv(cv: any, ungVien: any): string[] {
  const nguon = [
    cv.chucDanh,
    cv.tomTatKinhNghiem,
    cv.kyNangMem,
    cv.kyNangLapTrinh,
    cv.fileCvText,
    cv.hocVan,
    cv.kinhNghiemLam,
    cv.duAnChiTiet,
    ungVien.viTriMongMuon,
    ungVien.tomTat,
  ]
  return [...new Set(asText(nguon).split(/[\n,|;/]+/).map(item => item.trim()).filter(Boolean))]
}

function taoLyDoFallback(matchCount: number, matched: string[], missing: string[], tin: any) {
  const tieuDe = tin.tieuDe || 'vị trí này'
  if (matchCount > 0) return `Khớp ${matchCount} tín hiệu/kỹ năng với ${tieuDe}${matched.length ? `: ${matched.join(', ')}` : ''}.`
  if (missing.length && matched.length === 0) return `Xếp hạng theo tiêu đề và mô tả của ${tieuDe}.`
  return `Có dấu hiệu phù hợp với ${tieuDe}.`
}

function chuanHoaKetQua(doc: any) {
  const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc
  return {
    id: id(obj),
    maUngVien: id(obj.maUngVien),
    maHoSoNangLuc: obj.maHoSoNangLuc ? id(obj.maHoSoNangLuc) : undefined,
    trangThai: obj.trangThai,
    loi: obj.loi,
    nguon: obj.nguon,
    lanQuet: obj.lanQuet,
    ketQua: (obj.ketQua ?? []).map((item: any) => {
      const tin = item.maTinTuyenDung
      return {
        maTinTuyenDung: id(tin),
        tinTuyenDung: tin?._id
          ? {
              id: id(tin),
              tieuDe: tin.tieuDe,
              diaChi: tin.diaChi,
              luongMin: tin.luongMin,
              luongMax: tin.luongMax,
              capBac: tin.capBac,
              loaiHinh: tin.loaiHinh,
              nhaTuyenDung: tin.maNhaTuyenDung?._id
                ? {
                    id: id(tin.maNhaTuyenDung),
                    tenCongTy: tin.maNhaTuyenDung.tenCongTy,
                    logo: tin.maNhaTuyenDung.logo,
                  }
                : undefined,
            }
          : undefined,
        diem: item.diem,
        lyDo: item.lyDo,
        kyNangKhop: item.kyNangKhop ?? [],
        kyNangThieu: item.kyNangThieu ?? [],
      }
    }),
  }
}

function ketQuaRong(ma?: string, thongBao?: string) {
  return {
    id: '',
    trangThai: 'can_hanh_dong',
    ketQua: [],
    canhBao: ma ? { ma, thongBao } : undefined,
  }
}

async function layUngVienCuaNguoiDung(nguoiDung: NguoiDungHienTai) {
  if (nguoiDung.vaiTro !== 'ung_vien') throw new LoiUngDung('Chỉ ứng viên mới được quét gợi ý việc làm', 403, 'FORBIDDEN')
  const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id }).populate('maNguoiDung', 'hoTen email')
  if (!ungVien) throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước', 422, 'CANDIDATE_PROFILE_REQUIRED')
  return ungVien
}

async function layCvChinh(ungVien: any, maHoSoNangLuc?: string) {
  if (maHoSoNangLuc) return (HoSoNangLuc as any).findOne({ _id: maHoSoNangLuc, maUngVien: ungVien._id })
  return (HoSoNangLuc as any).findOne({ maUngVien: ungVien._id, cvChinh: true })
}

async function layUngVienVaCv(nguoiDung: NguoiDungHienTai, maHoSoNangLuc?: string) {
  const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
  const cv = await layCvChinh(ungVien, maHoSoNangLuc)
  if (!cv) throw new LoiUngDung('Bạn cần đặt CV chính trước khi quét việc phù hợp', 422, 'NO_PRIMARY_CV')
  await damBaoNoiDungCvPdf(cv)
  return { ungVien, cv }
}

async function layTinDangMo() {
  const homNay = new Date()
  homNay.setHours(0, 0, 0, 0)
  return (TinTuyenDung as any)
    .find({
      trangThai: 'dang_mo',
      $or: [{ hanNop: { $exists: false } }, { hanNop: null }, { hanNop: { $gte: homNay } }],
    })
    .populate('maNhaTuyenDung', 'tenCongTy logo maNguoiDung')
    .populate('kyNang.maKyNang', 'tenKyNang')
    .sort({ ngayDang: -1, ngayTao: -1 })
    .limit(80)
}

function tinhDiemFallback(cv: any, ungVien: any, tin: any) {
  const cvText = lowerText([
    cv.hoTenHienThi,
    cv.chucDanh,
    cv.diaDiem,
    cv.tomTatKinhNghiem,
    cv.kyNangMem,
    cv.kyNangLapTrinh,
    cv.fileCvText,
    cv.hocVan,
    cv.kinhNghiemLam,
    cv.duAnChiTiet,
    ungVien.viTriMongMuon,
    ungVien.tomTat,
  ])
  const cvSkills = layChuoiKyNangCv(cv, ungVien)
  const titleText = lowerText([tin.tieuDe, tin.capBac, tin.loaiHinh, tin.diaChi, tin.moTa, tin.yeuCau])
  const kyNangTin = layKyNangTin(tin)
  const cvSkillText = cvSkills.join(' ').toLowerCase()
  const kyNangHop = kyNangTin.filter((skill) => cvText.includes(skill.toLowerCase()) || cvSkillText.includes(skill.toLowerCase()))
  const kyNangThieu = kyNangTin.filter((skill) => !cvText.includes(skill.toLowerCase()) && !cvSkillText.includes(skill.toLowerCase()))
  const titleHits = [tin.tieuDe, tin.capBac, tin.loaiHinh].filter(Boolean).reduce((count, value) => count + Number(cvText.includes(String(value).toLowerCase()) || cvSkillText.includes(String(value).toLowerCase())), 0)
  const skillScore = Math.min(60, kyNangHop.length * 14)
  const titleScore = Math.min(25, titleHits * 8)
  const locationScore = cvText.includes(String(tin.diaChi ?? '').toLowerCase()) ? 8 : 0
  const experienceScore = Number(ungVien.kinhNghiem ?? 0) > 0 && titleText.includes('senior') ? 6 : 0
  const diem = Math.max(0, Math.min(100, Math.round(skillScore + titleScore + locationScore + experienceScore + (kyNangHop.length ? 10 : 0))))
  return {
    diem,
    kyNangKhop: kyNangHop.slice(0, 8),
    kyNangThieu: kyNangThieu.slice(0, 8),
    lyDo: taoLyDoFallback(kyNangHop.length, kyNangHop.slice(0, 3), kyNangThieu.slice(0, 3), tin),
  }
}

function xepHangTheoDB(cv: any, ungVien: any, tinDangMo: any[]): MatchResult[] {
  return tinDangMo
    .map((tin) => {
      const fallback = tinhDiemFallback(cv, ungVien, tin)
      return {
        maTinTuyenDung: id(tin),
        diem: fallback.diem,
        lyDo: fallback.lyDo,
        kyNangKhop: fallback.kyNangKhop,
        kyNangThieu: fallback.kyNangThieu,
      }
    })
    .filter((item) => item.maTinTuyenDung)
    .sort((a, b) => b.diem - a.diem)
    .slice(0, 10)
}

function taoNoiDungCv(cv: any, ungVien: any) {
  return [
    `Tên: ${cv.hoTenHienThi || ungVien.maNguoiDung?.hoTen || ''}`,
    `Chức danh: ${cv.chucDanh || ungVien.viTriMongMuon || ''}`,
    `Địa điểm: ${cv.diaDiem || ungVien.diaChi || ''}`,
    `Kinh nghiệm: ${ungVien.kinhNghiem ?? 0} năm`,
    `Tóm tắt: ${asText(cv.tomTatKinhNghiem) || ungVien.tomTat || ''}`,
    `Kỹ năng mềm: ${asText(cv.kyNangMem)}`,
    `Kỹ năng lập trình: ${asText(cv.kyNangLapTrinh)}`,
    `Nội dung CV PDF: ${asText(cv.fileCvText)}`,
    `Học vấn: ${asText(cv.hocVan)}`,
    `Kinh nghiệm làm việc: ${asText(cv.kinhNghiemLam)}`,
    `Dự án: ${asText(cv.duAnChiTiet || cv.duAn)}`,
  ].join('\n').slice(0, 12000)
}

function taoNoiDungTin(tin: any) {
  const kyNang = (tin.kyNang ?? []).map((item: any) => item.maKyNang?.tenKyNang).filter(Boolean).join(', ')
  return {
    id: id(tin),
    tieuDe: tin.tieuDe,
    congTy: tin.maNhaTuyenDung?.tenCongTy,
    diaChi: tin.diaChi,
    luong: formatLuong(tin),
    capBac: tin.capBac,
    loaiHinh: tin.loaiHinh,
    hanNop: tin.hanNop,
    kyNang,
    moTa: String(tin.moTa ?? '').slice(0, 900),
    yeuCau: String(tin.yeuCau ?? '').slice(0, 900),
    url: `/viec-lam/${id(tin)}?apply=1`,
  }
}

function parseJsonGemini(text: string): MatchResult[] {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const jsonStart = cleaned.indexOf('[')
  const jsonEnd = cleaned.lastIndexOf(']')
  if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error('Gemini không trả về JSON hợp lệ')
  const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
  if (!Array.isArray(parsed)) return []
  return parsed.map((item) => ({
    maTinTuyenDung: String(item.maTinTuyenDung ?? item.id ?? ''),
    diem: Math.max(0, Math.min(100, Number(item.diem ?? 0))),
    lyDo: String(item.lyDo ?? '').slice(0, 500),
    kyNangKhop: Array.isArray(item.kyNangKhop) ? item.kyNangKhop.map(String).slice(0, 12) : [],
    kyNangThieu: Array.isArray(item.kyNangThieu) ? item.kyNangThieu.map(String).slice(0, 12) : [],
  })).filter((item) => item.maTinTuyenDung)
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('Gemini không trả về JSON object hợp lệ')
  return JSON.parse(cleaned.slice(start, end + 1))
}

async function goiGemini(prompt: string, responseMimeType?: string) {
  if (!bienMoiTruong.geminiApiKey) throw new LoiUngDung('Chưa cấu hình GEMINI_API_KEY', 503, 'GEMINI_NOT_CONFIGURED')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(bienMoiTruong.geminiModel)}:generateContent?key=${encodeURIComponent(bienMoiTruong.geminiApiKey)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: responseMimeType ? 0.2 : 0.55,
        ...(responseMimeType ? { responseMimeType } : {}),
      },
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new LoiUngDung(data?.error?.message || 'Gemini xử lý thất bại', 502, 'GEMINI_FAILED')
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '')
}

async function goiGeminiDocPdf(duongDanTep: string) {
  if (!bienMoiTruong.geminiApiKey) throw new LoiUngDung('Chưa cấu hình GEMINI_API_KEY', 503, 'GEMINI_NOT_CONFIGURED')
  const buffer = await readFile(duongDanTep)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(bienMoiTruong.geminiModel)}:generateContent?key=${encodeURIComponent(bienMoiTruong.geminiApiKey)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Hãy đọc CV PDF này và trích xuất nội dung văn bản quan trọng bằng tiếng Việt có dấu. Chỉ trả về nội dung CV, không giải thích.' },
          { inline_data: { mime_type: 'application/pdf', data: buffer.toString('base64') } },
        ],
      }],
      generationConfig: { temperature: 0.1 },
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new LoiUngDung(data?.error?.message || 'Gemini không đọc được PDF', 502, 'GEMINI_PDF_FAILED')
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 30_000)
}

function duongDanFileCv(cv: any) {
  const raw = String(cv.fileCvPath || cv.fileCvData || '')
  const match = raw.match(/\/uploads\/([^?#]+)/)
  if (!match) return ''
  const tenTep = path.basename(decodeURIComponent(match[1]))
  return path.join(process.cwd(), 'uploads', tenTep)
}

async function trichXuatPdfBangPdfParse(duongDanTep: string) {
  try {
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule
    const buffer = await readFile(duongDanTep)
    const ketQua = await pdfParse(buffer)
    return String(ketQua?.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 30_000)
  } catch {
    return ''
  }
}

async function damBaoNoiDungCvPdf(cv: any) {
  if (cv.loaiHoSo !== 'file_upload') return
  if (String(cv.fileCvText ?? '').trim()) return

  const duongDan = duongDanFileCv(cv)
  if (!duongDan) {
    cv.fileCvTextStatus = 'failed'
    cv.fileCvTextError = 'Không xác định được file PDF đã upload.'
    await cv.save()
    throw new LoiUngDung('CV PDF chính chưa có file gốc để đọc lại. Hãy upload lại CV PDF hoặc dùng CV tạo trong hệ thống.', 422, 'CV_TEXT_REQUIRED')
  }

  const textPdfParse = await trichXuatPdfBangPdfParse(duongDan)
  if (textPdfParse) {
    cv.fileCvText = textPdfParse
    cv.fileCvTextStatus = 'ok'
    cv.fileCvTextError = ''
    await cv.save()
    return
  }

  try {
    const textGemini = await goiGeminiDocPdf(duongDan)
    if (textGemini) {
      cv.fileCvText = textGemini
      cv.fileCvTextStatus = 'gemini_pdf'
      cv.fileCvTextError = ''
      await cv.save()
      return
    }
  } catch (error) {
    cv.fileCvTextError = error instanceof Error ? error.message : 'Gemini không đọc được PDF.'
  }

  cv.fileCvTextStatus = 'failed'
  await cv.save()
  throw new LoiUngDung('CV PDF chính chưa đọc được nội dung. PDF này có thể là ảnh scan; hãy upload PDF có text hoặc tạo CV trong hệ thống.', 422, 'CV_TEXT_REQUIRED')
}

async function layUngVienCoCvChinh() {
  const ungVienList = await (UngVien as any)
    .find()
    .populate('maNguoiDung', 'hoTen email trangThai')
    .sort({ ngayCapNhat: -1 })
    .limit(1000)
  const cvList = await (HoSoNangLuc as any).find({ cvChinh: true, maUngVien: { $in: ungVienList.map((item: any) => item._id) } })
  const cvTheoUngVien = new Map(cvList.map((cv: any) => [id(cv.maUngVien), cv]))
  return ungVienList.map((ungVien: any) => ({ ungVien, cv: cvTheoUngVien.get(id(ungVien)) })).filter((item: any) => item.cv)
}

function cvCoNoiDungDeMatch(cv: any) {
  if (cv.loaiHoSo === 'file_upload') return Boolean(String(cv.fileCvText ?? '').trim())
  return Boolean(asText([cv.chucDanh, cv.tomTatKinhNghiem, cv.kyNangLapTrinh, cv.kyNangMem, cv.hocVan, cv.kinhNghiemLam, cv.duAnChiTiet]).trim())
}

function taoKetQuaEmail(cv: any, ungVien: any, tinDangMo: any[], diemToiThieu: number, soJobMoiEmail: number) {
  if (!cvCoNoiDungDeMatch(cv)) return []
  return xepHangTheoDB(cv, ungVien, tinDangMo)
    .filter((item) => item.diem >= diemToiThieu)
    .slice(0, soJobMoiEmail)
}

function taoPreviewEmailHangLoat(dsUngVienCv: Array<{ ungVien: any; cv: any }>, tinDangMo: any[], diemToiThieu: number, soJobMoiEmail: number) {
  let coEmailVaCvChinh = 0
  let thieuEmail = 0
  let thieuNoiDungCv = 0
  let coKetQuaPhuHop = 0
  const mauGui = []

  for (const item of dsUngVienCv) {
    const email = item.ungVien.maNguoiDung?.email
    if (!email) {
      thieuEmail += 1
      continue
    }
    coEmailVaCvChinh += 1
    if (!cvCoNoiDungDeMatch(item.cv)) {
      thieuNoiDungCv += 1
      continue
    }
    const ketQua = taoKetQuaEmail(item.cv, item.ungVien, tinDangMo, diemToiThieu, soJobMoiEmail)
    if (!ketQua.length) continue
    coKetQuaPhuHop += 1
    if (mauGui.length < 10) {
      mauGui.push({
        maUngVien: id(item.ungVien),
        tenUngVien: item.ungVien.maNguoiDung?.hoTen,
        email,
        soJobPhuHop: ketQua.length,
        jobs: ketQua.map((kq) => {
          const job = tinDangMo.find((tin: any) => id(tin) === kq.maTinTuyenDung)
          return { maTinTuyenDung: kq.maTinTuyenDung, tieuDe: job?.tieuDe, diem: kq.diem }
        }),
      })
    }
  }

  return {
    tongUngVienCoCvChinh: dsUngVienCv.length,
    coEmailVaCvChinh,
    thieuEmail,
    thieuNoiDungCv,
    tongJobHopLe: tinDangMo.length,
    coKetQuaPhuHop,
    seGuiEmail: coKetQuaPhuHop,
    mauGui,
  }
}

async function luuKetQua(maUngVien: string, maHoSoNangLuc: string, ketQua: MatchResult[], nguon: string) {
  const ketQuaSapXep = ketQua
    .filter((item) => item.maTinTuyenDung)
    .sort((a, b) => b.diem - a.diem)
    .slice(0, 10)
    .map((item) => ({
      maTinTuyenDung: item.maTinTuyenDung,
      diem: item.diem,
      lyDo: item.lyDo,
      kyNangKhop: item.kyNangKhop,
      kyNangThieu: item.kyNangThieu,
    }))

  const doc = await (GoiYViecLam as any).create({
    maUngVien,
    maHoSoNangLuc,
    ketQua: ketQuaSapXep,
    trangThai: 'hoan_thanh',
    nguon,
    lanQuet: new Date(),
  })
  return layGoiYGanNhatTheoUngVien(maUngVien, id(doc))
}

export async function layGoiYGanNhatTheoUngVien(maUngVien: string, maGoiY?: string) {
  const query = maGoiY ? (GoiYViecLam as any).findById(maGoiY) : (GoiYViecLam as any).findOne({ maUngVien }).sort({ lanQuet: -1 })
  const doc = await query.populate({
    path: 'ketQua.maTinTuyenDung',
    populate: { path: 'maNhaTuyenDung', select: 'tenCongTy logo' },
  })
  return doc ? chuanHoaKetQua(doc) : null
}

function cauHoiLienQuanJob(cauHoi: string) {
  const text = lowerText(cauHoi)
  return /(job|việc|viec|tuyển|tuyen|ứng tuyển|ung tuyen|công ty|cong ty|lương|luong|cv|frontend|backend|react|node|java|python|tester|qa|devops|remote|intern|junior|senior|đà nẵng|da nang)/i.test(text)
}

function goiYTuMatch(ketQua: MatchResult[], tinDangMo: any[]): ChatJobSuggestion[] {
  return ketQua.slice(0, 5).map((item) => {
    const job = tinDangMo.find((tin: any) => id(tin) === item.maTinTuyenDung)
    return {
      id: item.maTinTuyenDung,
      tieuDe: job?.tieuDe ?? 'Việc làm IT',
      congTy: job?.maNhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
      diaChi: job?.diaChi,
      luong: formatLuong(job),
      diem: item.diem,
      lyDo: item.lyDo,
      url: `/viec-lam/${item.maTinTuyenDung}?apply=1`,
    }
  })
}

export const dichVuAi = {
  async layGoiY(nguoiDung: NguoiDungHienTai) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const cv = await layCvChinh(ungVien)
    const ganNhat = await layGoiYGanNhatTheoUngVien(id(ungVien))
    if (!cv) return ganNhat ?? ketQuaRong('NO_PRIMARY_CV', 'Bạn cần đặt CV chính trước khi quét việc phù hợp.')
    if (cv.loaiHoSo === 'file_upload' && !String(cv.fileCvText ?? '').trim()) {
      return ganNhat ?? ketQuaRong('CV_TEXT_REQUIRED', 'CV PDF chính chưa có nội dung đã đọc. Hãy bấm Quét nhanh để hệ thống thử đọc PDF bằng AI.')
    }
    return ganNhat ?? ketQuaRong()
  },

  async chayGoiY(nguoiDung: NguoiDungHienTai, maHoSoNangLuc?: string) {
    const { ungVien, cv } = await layUngVienVaCv(nguoiDung, maHoSoNangLuc)
    const tinDangMo = await layTinDangMo()
    if (!tinDangMo.length) throw new LoiUngDung('Hiện chưa có tin đang mở để gợi ý', 404, 'NO_OPEN_JOBS')

    const prompt = [
      'Bạn là hệ thống gợi ý việc làm Effort Job. Chỉ đánh giá dựa trên CV và danh sách job trong DB bên dưới.',
      'Trả về JSON array, mỗi item gồm: maTinTuyenDung, diem 0-100, lyDo, kyNangKhop array, kyNangThieu array.',
      'Chỉ trả về tối đa 10 job phù hợp nhất, không thêm chú giải ngoài JSON.',
      `CV:\n${taoNoiDungCv(cv, ungVien)}`,
      `JOBS:\n${JSON.stringify(tinDangMo.map(taoNoiDungTin))}`,
    ].join('\n\n')

    try {
      const text = await goiGemini(prompt, 'application/json')
      const ketQua = parseJsonGemini(text)
      if (!ketQua.length) throw new Error('Gemini không trả về kết quả phù hợp')
      return luuKetQua(id(ungVien), id(cv), ketQua, 'gemini')
    } catch (error) {
      console.warn('Gemini gợi ý thất bại, dùng fallback DB:', error)
      const ketQuaFallback = xepHangTheoDB(cv, ungVien, tinDangMo)
      return luuKetQua(id(ungVien), id(cv), ketQuaFallback, 'db_fallback')
    }
  },

  async guiEmailGoiY(nguoiDung: NguoiDungHienTai) {
    const ungVien = await layUngVienCuaNguoiDung(nguoiDung)
    const goiY = await layGoiYGanNhatTheoUngVien(id(ungVien))
    if (!goiY?.ketQua?.length) throw new LoiUngDung('Chưa có kết quả gợi ý để gửi email', 404, 'NO_RECOMMENDATIONS')
    const ketQuaPhuHop = goiY.ketQua.filter((item: any) => Number(item.diem ?? 0) >= 55).slice(0, 5)
    if (!ketQuaPhuHop.length) throw new LoiUngDung('Chưa có việc làm đủ phù hợp với CV chính để gửi email', 422, 'NO_QUALIFIED_RECOMMENDATIONS')
    const email = ungVien.maNguoiDung?.email
    if (!email) throw new LoiUngDung('Tài khoản ứng viên chưa có email', 422, 'EMAIL_REQUIRED')
    await guiEmail({
      to: email,
      subject: 'Effort Job gợi ý việc làm phù hợp với CV chính của bạn',
      html: taoHtmlEmailGoiY({ ...goiY, ketQua: ketQuaPhuHop }),
    })
    return { daGui: true, email }
  },

  async previewGuiEmailHangLoat(options: { diemToiThieu?: number; soJobMoiEmail?: number } = {}) {
    const diemToiThieu = Number(options.diemToiThieu ?? 55)
    const soJobMoiEmail = Math.max(1, Math.min(10, Number(options.soJobMoiEmail ?? 5)))
    const [tinDangMo, dsUngVienCv] = await Promise.all([layTinDangMo(), layUngVienCoCvChinh()])
    return taoPreviewEmailHangLoat(dsUngVienCv, tinDangMo, diemToiThieu, soJobMoiEmail)
  },

  async guiEmailHangLoat(options: { diemToiThieu?: number; soJobMoiEmail?: number } = {}) {
    const diemToiThieu = Number(options.diemToiThieu ?? 55)
    const soJobMoiEmail = Math.max(1, Math.min(10, Number(options.soJobMoiEmail ?? 5)))
    const [tinDangMo, dsUngVienCv] = await Promise.all([layTinDangMo(), layUngVienCoCvChinh()])
    if (!tinDangMo.length) throw new LoiUngDung('Hiện chưa có tin đang mở còn hạn để gửi email', 404, 'NO_OPEN_JOBS')

    const ketQuaGui: Array<{ maUngVien: string; email: string; soJob: number; daGui: boolean; loi?: string }> = []
    for (const item of dsUngVienCv) {
      const email = item.ungVien.maNguoiDung?.email
      if (!email || !cvCoNoiDungDeMatch(item.cv)) continue
      const ketQua = taoKetQuaEmail(item.cv, item.ungVien, tinDangMo, diemToiThieu, soJobMoiEmail)
      if (!ketQua.length) continue
      try {
        await guiEmail({
          to: email,
          subject: 'Effort Job gợi ý việc làm phù hợp với CV chính của bạn',
          html: taoHtmlEmailTuKetQua(ketQua, tinDangMo),
        })
        ketQuaGui.push({ maUngVien: id(item.ungVien), email, soJob: ketQua.length, daGui: true })
      } catch (error) {
        ketQuaGui.push({
          maUngVien: id(item.ungVien),
          email,
          soJob: ketQua.length,
          daGui: false,
          loi: error instanceof Error ? error.message : 'Gửi email thất bại',
        })
      }
    }

    return {
      tongUngVienCoCvChinh: dsUngVienCv.length,
      tongJobHopLe: tinDangMo.length,
      daGui: ketQuaGui.filter((item) => item.daGui).length,
      thatBai: ketQuaGui.filter((item) => !item.daGui).length,
      ketQua: ketQuaGui,
    }
  },

  async chatbot(cauHoi: string, lichSu?: unknown, boLoc?: unknown) {
    if (!cauHoi.trim()) throw new LoiUngDung('Thiếu nội dung câu hỏi', 422, 'QUESTION_REQUIRED')
    const jobMode = cauHoiLienQuanJob(cauHoi)
    const tinDangMo = jobMode ? await layTinDangMo() : []
    const ketQuaDb = jobMode
      ? xepHangTheoDB(
          { chucDanh: cauHoi, tomTatKinhNghiem: [cauHoi], kyNangLapTrinh: [], kyNangMem: [], fileCvText: cauHoi },
          { kinhNghiem: 0, viTriMongMuon: cauHoi, tomTat: cauHoi },
          tinDangMo,
        )
      : []
    const goiYViecLam = goiYTuMatch(ketQuaDb, tinDangMo)

    const prompt = jobMode
      ? [
          'Bạn là trợ lý AI của Effort Job. Bạn được trả lời tự nhiên bằng tiếng Việt có dấu.',
          'Nếu nói về công việc/công ty đang tuyển trong hệ thống, chỉ dùng dữ liệu JOBS bên dưới, không bịa job ngoài DB.',
          'Nếu câu hỏi có phần tư vấn chung, hãy tư vấn trước, sau đó nhắc người dùng xem các job gợi ý nếu có.',
          'Trả về JSON object: { "traLoi": string, "goiYCauHoi": string[] }.',
          `Câu hỏi: ${cauHoi}`,
          `Lịch sử ngắn: ${JSON.stringify(lichSu ?? [])}`.slice(0, 3000),
          `Bộ lọc UI: ${JSON.stringify(boLoc ?? {})}`.slice(0, 1500),
          `JOBS: ${JSON.stringify(tinDangMo.map(taoNoiDungTin).slice(0, 80))}`,
        ].join('\n\n')
      : [
          'Bạn là trợ lý AI của Effort Job. Hãy trả lời câu hỏi chung một cách hữu ích, thân thiện, tiếng Việt có dấu.',
          'Không tự nhận có dữ liệu nội bộ nếu câu hỏi không liên quan tới việc làm trong hệ thống.',
          'Trả về JSON object: { "traLoi": string, "goiYCauHoi": string[] }.',
          `Câu hỏi: ${cauHoi}`,
          `Lịch sử ngắn: ${JSON.stringify(lichSu ?? [])}`.slice(0, 3000),
        ].join('\n\n')

    try {
      const text = await goiGemini(prompt, 'application/json')
      const parsed = parseJsonObject(text)
      return {
        traLoi: String(parsed.traLoi ?? '').trim() || 'Mình đã sẵn sàng hỗ trợ bạn.',
        mode: jobMode ? 'job_assist' : 'general',
        goiYViecLam,
        goiYCauHoi: Array.isArray(parsed.goiYCauHoi) ? parsed.goiYCauHoi.map(String).slice(0, 4) : goiYCauHoiMacDinh(jobMode),
        nguonDuLieu: jobMode ? 'hybrid' : 'gemini',
        fallback: false,
      }
    } catch {
      return {
        traLoi: jobMode
          ? (goiYViecLam.length ? 'Mình chưa gọi được Gemini lúc này, nhưng đã tìm được một số việc làm phù hợp trong database của Effort Job.' : 'AI đang bận và hiện chưa tìm thấy việc phù hợp trong hệ thống. Bạn thử hỏi lại với kỹ năng, địa điểm hoặc vị trí cụ thể hơn nhé.')
          : 'AI đang bận, bạn có thể hỏi lại sau ít phút nhé.',
        mode: jobMode ? 'job_assist' : 'general',
        goiYViecLam,
        goiYCauHoi: goiYCauHoiMacDinh(jobMode),
        nguonDuLieu: jobMode ? 'database' : 'gemini',
        fallback: true,
      }
    }
  },
}

function goiYCauHoiMacDinh(jobMode: boolean) {
  return jobMode
    ? ['Tìm job React ở Đà Nẵng', 'Công ty nào đang tuyển Backend?', 'Job nào hợp với Fresher?', 'Lương Frontend hiện nay thế nào?']
    : ['Học React nên bắt đầu từ đâu?', 'Cách viết CV IT tốt hơn?', 'Nên chuẩn bị gì trước phỏng vấn?', 'Lộ trình trở thành Backend Developer?']
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function linkUngTuyen(maTinTuyenDung: string) {
  return absoluteFrontendUrl(`/viec-lam/${maTinTuyenDung}?apply=1`)
}

function taoCardEmail(item: any, job: any) {
  const link = linkUngTuyen(item.maTinTuyenDung)
  const kyNangKhop = (item.kyNangKhop ?? []).slice(0, 5).map((skill: string) => `<span style="display:inline-block;margin:4px 4px 0 0;padding:5px 9px;border-radius:999px;background:#e0f2fe;color:#075985;font-size:12px;font-weight:700">${escapeHtml(skill)}</span>`).join('')
  return `
    <tr>
      <td style="padding:18px 20px;border-top:1px solid #e5e7eb">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="58" valign="top">
              <div style="width:48px;height:48px;border-radius:14px;background:#0e4d7d;color:#fff;text-align:center;line-height:48px;font-weight:900">${Math.round(Number(item.diem ?? 0))}</div>
            </td>
            <td valign="top">
              <a href="${link}" style="color:#0058be;text-decoration:none;font-size:17px;font-weight:800">${escapeHtml(job?.tieuDe ?? 'Việc làm IT')}</a>
              <div style="margin-top:5px;color:#0f172a;font-size:14px;font-weight:700">${escapeHtml(job?.maNhaTuyenDung?.tenCongTy ?? job?.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng')}</div>
              <div style="margin-top:6px;color:#64748b;font-size:13px">${escapeHtml(job?.diaChi ?? 'Đang cập nhật')} · ${escapeHtml(formatLuong(job))}</div>
              <p style="margin:10px 0 0;color:#334155;font-size:13px;line-height:1.6">${escapeHtml(item.lyDo)}</p>
              <div style="margin-top:8px">${kyNangKhop || '<span style="color:#94a3b8;font-size:12px">Kỹ năng khớp sẽ được cập nhật khi CV có dữ liệu rõ hơn.</span>'}</div>
              <a href="${link}" style="display:inline-block;margin-top:14px;padding:10px 16px;border-radius:10px;background:#0058be;color:#fff;text-decoration:none;font-size:13px;font-weight:800">Xem và ứng tuyển</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function taoKhungEmail(noiDung: string) {
  return `
    <div style="margin:0;background:#eef4fb;padding:28px 12px;font-family:Arial,sans-serif;color:#0f172a">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #dbe7f3">
        <tr>
          <td style="padding:24px;background:#082f49;color:#fff">
            <div style="font-size:24px;font-weight:900;letter-spacing:.03em">Effort Job</div>
            <div style="margin-top:5px;font-size:13px;color:#bae6fd">Gợi ý việc làm dựa trên CV chính của bạn</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px">
            <h2 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#0f172a">Những công việc phù hợp đang mở</h2>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.7">Effort Job đã quét CV chính và chỉ gửi các công việc đạt ngưỡng phù hợp. Bạn có thể mở link để ứng tuyển ngay.</p>
          </td>
        </tr>
        ${noiDung}
        <tr>
          <td style="padding:18px 24px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6">
            Email được gửi tự động từ hệ thống Effort Job. Nếu link yêu cầu đăng nhập, hệ thống sẽ đưa bạn quay lại đúng trang ứng tuyển sau khi đăng nhập.
          </td>
        </tr>
      </table>
    </div>`
}

function taoHtmlEmailGoiY(goiY: any) {
  const items = goiY.ketQua.map((item: any) => taoCardEmail(item, item.tinTuyenDung)).join('')
  return taoKhungEmail(items)
}

function taoHtmlEmailTuKetQua(ketQua: MatchResult[], tinDangMo: any[]) {
  const items = ketQua.map((item) => {
    const job = tinDangMo.find((tin: any) => id(tin) === item.maTinTuyenDung)
    return taoCardEmail(item, job)
  }).join('')
  return taoKhungEmail(items)
}

async function guiEmail(params: { to: string; subject: string; html: string }) {
  if (!bienMoiTruong.smtpHost || !bienMoiTruong.smtpUser || !bienMoiTruong.smtpPass) {
    throw new LoiUngDung('Chưa cấu hình SMTP_HOST/SMTP_USER/SMTP_PASS', 503, 'SMTP_NOT_CONFIGURED')
  }
  const moduleName = 'nodemailer'
  const nodemailerModule = await import(moduleName).catch(() => null as any)
  const nodemailer = nodemailerModule?.default ?? nodemailerModule
  if (!nodemailer?.createTransport) throw new LoiUngDung('Chưa cài package nodemailer trên backend', 503, 'NODEMAILER_NOT_INSTALLED')
  const transporter = nodemailer.createTransport({
    host: bienMoiTruong.smtpHost,
    port: bienMoiTruong.smtpPort,
    secure: bienMoiTruong.smtpSecure,
    auth: { user: bienMoiTruong.smtpUser, pass: bienMoiTruong.smtpPass },
  })
  await transporter.sendMail({ from: bienMoiTruong.smtpFrom, ...params })
}

export async function chayCrawlerGoiYViecLam() {
  if (dangChayCrawler) return
  dangChayCrawler = true
  try {
    const ungVienList = await (UngVien as any).find().sort({ ngayCapNhat: -1 }).limit(bienMoiTruong.crawlerBatchLimit)
    for (const ungVien of ungVienList) {
      const nguoiDung = { id: id(ungVien.maNguoiDung), vaiTro: 'ung_vien' }
      if (!nguoiDung.id) continue
      try {
        await dichVuAi.chayGoiY(nguoiDung)
      } catch (error: any) {
        await (GoiYViecLam as any).create({
          maUngVien: ungVien._id,
          trangThai: 'loi',
          loi: error?.message || 'Crawler failed',
          lanQuet: new Date(),
          nguon: 'crawler',
        })
      }
    }
  } finally {
    dangChayCrawler = false
  }
}

export function khoiDongCrawlerGoiYViecLam() {
  if (crawlerTimer) return
  const intervalMs = Math.max(1, bienMoiTruong.crawlerIntervalHours) * 60 * 60 * 1000
  crawlerTimer = setInterval(() => {
    void chayCrawlerGoiYViecLam().catch((error) => console.error('Crawler gợi ý việc làm thất bại:', error))
  }, intervalMs)
}
