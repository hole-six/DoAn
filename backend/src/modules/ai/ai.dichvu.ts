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

let dangChayCrawler = false
let crawlerTimer: NodeJS.Timeout | undefined

function id(value: any) {
  return String(value?._id ?? value?.id ?? value ?? '')
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join('\n')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(asText).filter(Boolean).join('\n')
  return String(value).trim()
}

function lowerText(value: unknown): string {
  return asText(value).toLowerCase()
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
    cv.hocVan,
    cv.kinhNghiemLam,
    cv.duAnChiTiet,
    ungVien.viTriMongMuon,
    ungVien.tomTat,
  ]
  return [...new Set(asText(nguon).split(/[\n,|;/]+/).map(item => item.trim()).filter(Boolean))]
}

function taoLyDoFallback(matchCount: number, matched: string[], missing: string[], tin: any) {
  const tieuDe = tin.tieuDe || 'vi tri nay'
  if (matchCount > 0) {
    return `Khop ${matchCount} ky nang voi ${tieuDe}.`
  }
  if (missing.length && matched.length === 0) {
    return `Xep hang theo tieu de va mo ta cua ${tieuDe}.`
  }
  return `Co dau hieu phu hop voi ${tieuDe}.`
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

async function layUngVienVaCv(nguoiDung: NguoiDungHienTai, maHoSoNangLuc?: string) {
  if (nguoiDung.vaiTro !== 'ung_vien') throw new LoiUngDung('Chi ung vien moi duoc quet goi y viec lam', 403, 'FORBIDDEN')
  const ungVien = await (UngVien as any).findOne({ maNguoiDung: nguoiDung.id }).populate('maNguoiDung', 'hoTen email')
  if (!ungVien) throw new LoiUngDung('Bạn cần tạo hồ sơ ứng viên trước', 422, 'CANDIDATE_PROFILE_REQUIRED')

  const query: Record<string, unknown> = { maUngVien: ungVien._id }
  if (maHoSoNangLuc) query._id = maHoSoNangLuc
  const cv = maHoSoNangLuc
    ? await (HoSoNangLuc as any).findOne(query)
    : await (HoSoNangLuc as any).findOne({ maUngVien: ungVien._id, cvChinh: true })
  if (!cv) throw new LoiUngDung('Bạn cần đặt CV chính trước khi quét việc phù hợp', 422, 'NO_PRIMARY_CV')
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
    `Ten: ${cv.hoTenHienThi || ungVien.maNguoiDung?.hoTen || ''}`,
    `Chuc danh: ${cv.chucDanh || ungVien.viTriMongMuon || ''}`,
    `Dia diem: ${cv.diaDiem || ungVien.diaChi || ''}`,
    `Kinh nghiem: ${ungVien.kinhNghiem ?? 0} nam`,
    `Tom tat: ${asText(cv.tomTatKinhNghiem) || ungVien.tomTat || ''}`,
    `Ky nang mem: ${asText(cv.kyNangMem)}`,
    `Ky nang lap trinh: ${asText(cv.kyNangLapTrinh)}`,
    `Hoc van: ${asText(cv.hocVan)}`,
    `Kinh nghiem lam viec: ${asText(cv.kinhNghiemLam)}`,
    `Du an: ${asText(cv.duAnChiTiet || cv.duAn)}`,
  ].join('\n').slice(0, 12000)
}

function taoNoiDungTin(tin: any) {
  const kyNang = (tin.kyNang ?? []).map((item: any) => item.maKyNang?.tenKyNang).filter(Boolean).join(', ')
  return {
    id: id(tin),
    tieuDe: tin.tieuDe,
    congTy: tin.maNhaTuyenDung?.tenCongTy,
    diaChi: tin.diaChi,
    capBac: tin.capBac,
    loaiHinh: tin.loaiHinh,
    hanNop: tin.hanNop,
    kyNang,
    moTa: String(tin.moTa ?? '').slice(0, 900),
    yeuCau: String(tin.yeuCau ?? '').slice(0, 900),
  }
}

function parseJsonGemini(text: string): MatchResult[] {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const jsonStart = cleaned.indexOf('[')
  const jsonEnd = cleaned.lastIndexOf(']')
  if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error('Gemini khong tra ve JSON hop le')
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

async function goiGemini(prompt: string, responseMimeType?: string) {
  if (!bienMoiTruong.geminiApiKey) {
    throw new LoiUngDung('Chua cau hinh GEMINI_API_KEY', 503, 'GEMINI_NOT_CONFIGURED')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(bienMoiTruong.geminiModel)}:generateContent?key=${encodeURIComponent(bienMoiTruong.geminiApiKey)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        ...(responseMimeType ? { responseMimeType } : {}),
      },
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new LoiUngDung(data?.error?.message || 'Gemini xu ly that bai', 502, 'GEMINI_FAILED')
  }
  return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '')
}

async function layUngVienCoCvChinh() {
  const ungVienList = await (UngVien as any)
    .find()
    .populate('maNguoiDung', 'hoTen email trangThai')
    .sort({ ngayCapNhat: -1 })
    .limit(1000)
  const cvList = await (HoSoNangLuc as any)
    .find({ cvChinh: true, maUngVien: { $in: ungVienList.map((item: any) => item._id) } })
  const cvTheoUngVien = new Map(cvList.map((cv: any) => [id(cv.maUngVien), cv]))
  return ungVienList.map((ungVien: any) => ({ ungVien, cv: cvTheoUngVien.get(id(ungVien)) })).filter((item: any) => item.cv)
}

function taoKetQuaEmail(cv: any, ungVien: any, tinDangMo: any[], diemToiThieu: number, soJobMoiEmail: number) {
  return xepHangTheoDB(cv, ungVien, tinDangMo)
    .filter((item) => item.diem >= diemToiThieu)
    .slice(0, soJobMoiEmail)
}

function taoPreviewEmailHangLoat(dsUngVienCv: Array<{ ungVien: any; cv: any }>, tinDangMo: any[], diemToiThieu: number, soJobMoiEmail: number) {
  let coEmailVaCvChinh = 0
  let thieuEmail = 0
  let coKetQuaPhuHop = 0
  const mauGui = []

  for (const item of dsUngVienCv) {
    const email = item.ungVien.maNguoiDung?.email
    if (!email) {
      thieuEmail += 1
      continue
    }
    coEmailVaCvChinh += 1
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

export const dichVuAi = {
  async layGoiY(nguoiDung: NguoiDungHienTai) {
    const { ungVien } = await layUngVienVaCv(nguoiDung)
    return layGoiYGanNhatTheoUngVien(id(ungVien))
  },

  async chayGoiY(nguoiDung: NguoiDungHienTai, maHoSoNangLuc?: string) {
    const { ungVien, cv } = await layUngVienVaCv(nguoiDung, maHoSoNangLuc)
    const tinDangMo = await layTinDangMo()
    if (!tinDangMo.length) throw new LoiUngDung('Hien chua co tin dang mo de goi y', 404, 'NO_OPEN_JOBS')

    const prompt = [
      'Ban la he thong goi y viec lam ITJob. Chi danh gia dua tren CV va danh sach job trong DB ben duoi.',
      'Tra ve JSON array, moi item gom: maTinTuyenDung, diem 0-100, lyDo, kyNangKhop array, kyNangThieu array.',
      'Chi tra ve toi da 10 job phu hop nhat, khong them chu giai ngoai JSON.',
      `CV:\n${taoNoiDungCv(cv, ungVien)}`,
      `JOBS:\n${JSON.stringify(tinDangMo.map(taoNoiDungTin))}`,
    ].join('\n\n')

    try {
      const text = await goiGemini(prompt, 'application/json')
      const ketQua = parseJsonGemini(text)
      if (!ketQua.length) throw new Error('Gemini khong tra ve ket qua phu hop')
      return luuKetQua(id(ungVien), id(cv), ketQua, 'gemini')
    } catch (error) {
      console.warn('Gemini goi y that bai, dung fallback DB:', error)
      const ketQuaFallback = xepHangTheoDB(cv, ungVien, tinDangMo)
      return luuKetQua(id(ungVien), id(cv), ketQuaFallback, 'db_fallback')
    }
  },

  async guiEmailGoiY(nguoiDung: NguoiDungHienTai) {
    const { ungVien } = await layUngVienVaCv(nguoiDung)
    const goiY = await layGoiYGanNhatTheoUngVien(id(ungVien))
    if (!goiY?.ketQua?.length) throw new LoiUngDung('Chua co ket qua goi y de gui email', 404, 'NO_RECOMMENDATIONS')
    const email = ungVien.maNguoiDung?.email
    if (!email) throw new LoiUngDung('Tai khoan ung vien chua co email', 422, 'EMAIL_REQUIRED')
    await guiEmail({
      to: email,
      subject: 'ITJob goi y viec lam phu hop voi CV cua ban',
      html: taoHtmlEmailGoiY(goiY),
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
    if (!tinDangMo.length) throw new LoiUngDung('Hien chua co tin dang mo con han de gui email', 404, 'NO_OPEN_JOBS')

    const ketQuaGui: Array<{ maUngVien: string; email: string; soJob: number; daGui: boolean; loi?: string }> = []
    for (const item of dsUngVienCv) {
      const email = item.ungVien.maNguoiDung?.email
      if (!email) continue
      const ketQua = taoKetQuaEmail(item.cv, item.ungVien, tinDangMo, diemToiThieu, soJobMoiEmail)
      if (!ketQua.length) continue
      try {
        await guiEmail({
          to: email,
          subject: 'ITJob goi y viec lam phu hop voi CV chinh cua ban',
          html: taoHtmlEmailTuKetQua(ketQua, tinDangMo),
        })
        ketQuaGui.push({ maUngVien: id(item.ungVien), email, soJob: ketQua.length, daGui: true })
      } catch (error) {
        ketQuaGui.push({
          maUngVien: id(item.ungVien),
          email,
          soJob: ketQua.length,
          daGui: false,
          loi: error instanceof Error ? error.message : 'Gui email that bai',
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
    if (!cauHoi.trim()) throw new LoiUngDung('Thieu noi dung cau hoi', 422, 'QUESTION_REQUIRED')
    const tinDangMo = await layTinDangMo()
    const prompt = [
      'Ban la tro ly tim viec cua ITJob. Chi duoc tra loi dua tren danh sach job trong DB.',
      'Neu khong co job phu hop, noi ro la chua tim thay trong he thong. Tuyet doi khong bia cong viec ngoai DB.',
      'Tra loi tieng Viet co dau, ro rang, uu tien dua ra job cu the kem link /viec-lam/{id}.',
      `Cau hoi: ${cauHoi}`,
      `Lich su ngan: ${JSON.stringify(lichSu ?? [])}`.slice(0, 3000),
      `Bo loc UI: ${JSON.stringify(boLoc ?? {})}`.slice(0, 1500),
      `JOBS: ${JSON.stringify(tinDangMo.map(taoNoiDungTin).slice(0, 80))}`,
    ].join('\n\n')
    try {
      const text = await goiGemini(prompt)
      return { traLoi: text.replace(/^"|"$/g, '').trim(), nguonDuLieu: 'database', fallback: false }
    } catch (error) {
      const boLoc = lowerText(cauHoi)
      const ketQua = xepHangTheoDB(
        { chucDanh: boLoc, tomTatKinhNghiem: [boLoc], kyNangLapTrinh: [], kyNangMem: [] },
        { kinhNghiem: 0, viTriMongMuon: boLoc, tomTat: boLoc },
        tinDangMo,
      )
      const top = ketQua[0]
      if (!top) return { traLoi: 'Hien chua tim thay viec phu hop trong he thong.' }
      const job = tinDangMo.find((item: any) => id(item) === top.maTinTuyenDung)
      return {
        traLoi: [
          `Mau cong viec phu hop nhat hien co la: ${job?.tieuDe ?? 'Viec lam IT'}.`,
          `Diem phu hop: ${top.diem}/100.`,
          `Xem tai: /viec-lam/${top.maTinTuyenDung}`,
        ].join(' '),
        nguonDuLieu: 'database',
        fallback: true,
        goiY: top ? [top] : [],
      }
    }
  },
}

function taoHtmlEmailGoiY(goiY: any) {
  const items = goiY.ketQua.map((item: any) => {
    const job = item.tinTuyenDung
    const link = `${bienMoiTruong.duongDanFrontend}/viec-lam/${item.maTinTuyenDung}?apply=1`
    return `<li style="margin:16px 0"><strong>${job?.tieuDe ?? 'Viec lam IT'}</strong><br/>Diem phu hop: ${item.diem}/100<br/>${item.lyDo}<br/><a href="${link}">Xem va ung tuyen</a></li>`
  }).join('')
  return `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Viec lam phu hop voi CV cua ban</h2><ul>${items}</ul></div>`
}

function taoHtmlEmailTuKetQua(ketQua: MatchResult[], tinDangMo: any[]) {
  const items = ketQua.map((item) => {
    const job = tinDangMo.find((tin: any) => id(tin) === item.maTinTuyenDung)
    const redirect = `/viec-lam/${item.maTinTuyenDung}?apply=1`
    const link = `${bienMoiTruong.duongDanFrontend}/dang-nhap?redirect=${encodeURIComponent(redirect)}`
    return `<li style="margin:16px 0"><strong>${job?.tieuDe ?? 'Viec lam IT'}</strong><br/>${job?.maNhaTuyenDung?.tenCongTy ? `Cong ty: ${job.maNhaTuyenDung.tenCongTy}<br/>` : ''}Diem phu hop: ${item.diem}/100<br/>${item.lyDo}<br/><a href="${link}">Xem va ung tuyen</a></li>`
  }).join('')
  return `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Viec lam phu hop voi CV chinh cua ban</h2><p>ITJob vua quet CV chinh cua ban va tim thay cac viec phu hop dang mo tren san.</p><ul>${items}</ul></div>`
}

async function guiEmail(params: { to: string; subject: string; html: string }) {
  if (!bienMoiTruong.smtpHost || !bienMoiTruong.smtpUser || !bienMoiTruong.smtpPass) {
    throw new LoiUngDung('Chua cau hinh SMTP_HOST/SMTP_USER/SMTP_PASS', 503, 'SMTP_NOT_CONFIGURED')
  }
  const moduleName = 'nodemailer'
  const nodemailerModule = await import(moduleName).catch(() => null as any)
  const nodemailer = nodemailerModule?.default ?? nodemailerModule
  if (!nodemailer?.createTransport) throw new LoiUngDung('Chua cai package nodemailer tren backend', 503, 'NODEMAILER_NOT_INSTALLED')
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
    void chayCrawlerGoiYViecLam().catch((error) => console.error('Crawler goi y viec lam that bai:', error))
  }, intervalMs)
}



