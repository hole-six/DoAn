import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, Building2, Clock, DollarSign, FileText, Globe, MapPin, Share2, UploadCloud, Users, X } from 'lucide-react'
import { apiCoXacThuc, apiUploadCoXacThuc, duongDanTheoVaiTro, layNguoiDung } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import { imageUrl } from '../../lib/format'
import './vieclam-styles.css'

const logoDuPhong = 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT'

type TinTuyenDung = {
  id: string
  maNhaTuyenDung: string
  nhaTuyenDung?: {
    id: string
    tenCongTy: string
    logo?: string
  }
  tieuDe: string
  yeuCauKinhNghiem?: string
  diaChi?: string
  luongMin?: number
  luongMax?: number
  loaiHinh?: string
  capBac?: string
  hanNop?: string
  soLuong?: number
  moTa?: string
  yeuCau?: string
  quyenLoi?: string
  luotXem?: number
  trangThai?: string
  ngayDang?: string
  kyNang?: Array<{ tenKyNang?: string }>
  anhDaiDien?: string
}

type HoSoNangLuc = {
  id: string
  maUngVien: string
  tieuDe?: string
  cvChinh?: boolean
  loaiHoSo?: 'builder' | 'file_upload'
  fileCvTen?: string
  fileCvLoai?: string
  fileCvData?: string
  fileCvText?: string
  fileCvPath?: string
  fileCvTextStatus?: 'ok' | 'empty' | 'gemini_pdf' | 'failed'
}

type CongTy = {
  id: string
  tenCongTy: string
  logo?: string
  diaChi?: string
  website?: string
  quyMo?: number
  nganh?: string
  moTa?: string
}

function layJson(path: string) {
  return fetch(`${API_URL}${path}`).then(async res => {
    const body = await res.json()
    if (!res.ok) throw new Error(body.thongBao ?? 'Không tải được dữ liệu')
    return body.duLieu
  })
}

function formatLuong(min?: number, max?: number) {
  if (!min && !max) return 'Thỏa thuận'
  return `${min?.toLocaleString('vi-VN') ?? '?'} - ${max?.toLocaleString('vi-VN') ?? '?'} VND`
}

function formatQuyMo(quyMo?: number) {
  if (!quyMo) return 'Đang cập nhật'
  if (quyMo >= 1000) return `${quyMo.toLocaleString('vi-VN')}+ nhân viên`
  return `${quyMo} nhân viên`
}

function tachDong(value?: string) {
  return (value ?? '')
    .split(/\n|\. /)
    .map(item => item.trim())
    .filter(Boolean)
}

async function uploadFileCv(file: File) {
  const formData = new FormData()
  formData.append('tep', file)
  const ketQua = await apiUploadCoXacThuc('/hosonangluc/upload-file', formData)
  const url = ketQua.url || ketQua.duongDan
  if (!url) throw new Error('Upload khong tra ve duong dan file')
  return {
    url,
    fileCvText: ketQua.fileCvText ?? '',
    fileCvPath: ketQua.fileCvPath ?? ketQua.duongDan,
    fileCvTextStatus: ketQua.fileCvTextStatus ?? (ketQua.fileCvText ? 'ok' : 'empty'),
  }
}

export default function ChiTietViecLam() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const openedApplyRef = useRef(false)
  const [tab, setTab] = useState<'mo-ta' | 'cong-ty'>('mo-ta')
  const [viec, setViec] = useState<TinTuyenDung | null>(null)
  const [congTy, setCongTy] = useState<CongTy | null>(null)
  const [viecLienQuan, setViecLienQuan] = useState<TinTuyenDung[]>([])
  const [daUngTuyen, setDaUngTuyen] = useState(false)
  const [thongBaoUngTuyen, setThongBaoUngTuyen] = useState('')
  const [dangUngTuyen, setDangUngTuyen] = useState(false)
  const [moModalUngTuyen, setMoModalUngTuyen] = useState(false)
  const [ungVienHienTai, setUngVienHienTai] = useState<any>(null)
  const [cvList, setCvList] = useState<HoSoNangLuc[]>([])
  const [cvDangChon, setCvDangChon] = useState('')
  const [fileCvMoi, setFileCvMoi] = useState<File | null>(null)
  const [thuXinViec, setThuXinViec] = useState('')
  const [daLuu, setDaLuu] = useState(false)
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    let active = true
    setDangTai(true)
    layJson(`/tintuyendung/${id}`)
      .then(async job => {
        const [company, jobs] = await Promise.all([
          layJson(`/nhatuyendung/${job.maNhaTuyenDung}`),
          layJson('/tintuyendung'),
        ])
        if (!active) return
        setViec(job)
        setCongTy(company)
        setViecLienQuan((jobs ?? [])
          .filter((item: TinTuyenDung) => item.id !== job.id && item.trangThai === 'dang_mo')
          .filter((item: TinTuyenDung) => item.maNhaTuyenDung === job.maNhaTuyenDung || item.capBac === job.capBac)
          .slice(0, 5))
        setLoi('')

        const nguoiDung = layNguoiDung()
        if (nguoiDung?.vaiTro === 'ung_vien') {
          const [ungVienList, ungTuyenList, viecDaLuuList] = await Promise.all([
            apiCoXacThuc('/ungvien').catch(() => []),
            apiCoXacThuc('/hosoungtuyen').catch(() => []),
            apiCoXacThuc('/viec-lam-da-luu').catch(() => []),
          ])
          const ungVien = (ungVienList ?? []).find((item: any) => item.maNguoiDung === nguoiDung.id)
          setDaUngTuyen((ungTuyenList ?? []).some((item: any) => item.maUngVien === ungVien?.id && item.maTinTuyenDung === job.id && item.trangThai !== 'da_rut'))
          setDaLuu((viecDaLuuList ?? []).some((item: any) => item.maTinTuyenDung === job.id))
        } else {
          setDaUngTuyen(false)
          setDaLuu(JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]').includes(job.id))
        }
      })
      .catch(error => setLoi(error instanceof Error ? error.message : 'Không tải được chi tiết việc làm'))
      .finally(() => active && setDangTai(false))
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (openedApplyRef.current) return
    if (dangTai || loi || !viec || searchParams.get('apply') !== '1') return
    openedApplyRef.current = true
    void ungTuyenNgay()
  }, [dangTai, loi, viec, searchParams])

  const kyNang = useMemo(() => (viec?.kyNang ?? []).map(skill => skill.tenKyNang).filter(Boolean) as string[], [viec])
  const yeuCau = tachDong(viec?.yeuCau)
  const quyenLoi = tachDong(viec?.quyenLoi)
  const tenCongTy = congTy?.tenCongTy ?? viec?.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng'
  const logo = congTy?.logo ?? viec?.nhaTuyenDung?.logo ?? logoDuPhong

  const ungTuyenNgay = async () => {
    const nguoiDung = layNguoiDung()
    if (!nguoiDung) {
      window.location.href = `/dang-nhap?redirect=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`
      return
    }

    if (nguoiDung.vaiTro !== 'ung_vien') {
      setThongBaoUngTuyen('Chỉ tài khoản ứng viên mới được ứng tuyển. Bạn đang đăng nhập vai trò khác.')
      window.setTimeout(() => { window.location.href = duongDanTheoVaiTro[nguoiDung.vaiTro] }, 900)
      return
    }

    if (!viec) return
    setThongBaoUngTuyen('')

    try {
      const [ungVienList, ungTuyenList] = await Promise.all([
        apiCoXacThuc('/ungvien'),
        apiCoXacThuc('/hosoungtuyen'),
      ])
      const ungVien = (ungVienList ?? []).find((item: any) => item.maNguoiDung === nguoiDung.id)
      if (!ungVien) {
        setThongBaoUngTuyen('Bạn cần hoàn thiện hồ sơ ứng viên trước khi ứng tuyển.')
        window.setTimeout(() => { window.location.href = '/ung-vien/ho-so' }, 900)
        return
      }

      const daNop = (ungTuyenList ?? []).some((item: any) => item.maUngVien === ungVien.id && item.maTinTuyenDung === viec.id && item.trangThai !== 'da_rut')
      if (daNop) {
        setDaUngTuyen(true)
        setThongBaoUngTuyen('Bạn đã ứng tuyển tin này.')
        return
      }

      const hoSoNangLucList = await apiCoXacThuc('/hosonangluc').catch(() => [])
      const danhSachCv = (hoSoNangLucList ?? []).filter((item: HoSoNangLuc) => item.maUngVien === ungVien.id)
      setUngVienHienTai(ungVien)
      setCvList(danhSachCv)
      setCvDangChon(danhSachCv.find((item: HoSoNangLuc) => item.cvChinh)?.id ?? danhSachCv[0]?.id ?? '')
      setFileCvMoi(null)
      setThuXinViec(`Toi quan tam toi vi tri ${viec.tieuDe} tai ${tenCongTy} va mong muon duoc trao doi them.`)
      setMoModalUngTuyen(true)
    } catch (err) {
      setThongBaoUngTuyen(err instanceof Error ? err.message : 'Không mở được form ứng tuyển')
    }
  }

  const toggleSave = async () => {
    if (!viec) return
    const nguoiDung = layNguoiDung()
    const next = !daLuu
    setDaLuu(next)

    if (nguoiDung?.vaiTro === 'ung_vien') {
      try {
        await apiCoXacThuc(`/viec-lam-da-luu/${viec.id}`, { method: next ? 'POST' : 'DELETE' })
      } catch (err) {
        setDaLuu(!next)
        setThongBaoUngTuyen(err instanceof Error ? err.message : 'Không lưu được việc làm')
      }
      return
    }

    const saved: string[] = JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]')
    const updated = next ? Array.from(new Set([...saved, viec.id])) : saved.filter(item => item !== viec.id)
    localStorage.setItem('itjob_saved_jobs', JSON.stringify(updated))
  }

  const nopHoSoUngTuyen = async () => {
    if (!viec || !ungVienHienTai) return
    setDangUngTuyen(true)
    setThongBaoUngTuyen('')
    try {
      let maHoSoNangLuc = cvDangChon
      if (fileCvMoi) {
        if (fileCvMoi.type !== 'application/pdf' && !fileCvMoi.name.toLowerCase().endsWith('.pdf')) throw new Error('Chi ho tro upload CV dang PDF')
        if (fileCvMoi.size > 10 * 1024 * 1024) throw new Error('File CV PDF nen nho hon 10MB')
        const { url: fileCvData, fileCvText, fileCvPath, fileCvTextStatus } = await uploadFileCv(fileCvMoi)
        const cvMoi = await apiCoXacThuc('/hosonangluc', {
          method: 'POST',
          body: JSON.stringify({
            maUngVien: ungVienHienTai.id,
            tieuDe: fileCvMoi.name.replace(/\.[^.]+$/, '') || `CV ${viec.tieuDe}`,
            fileCvTen: fileCvMoi.name,
            fileCvLoai: 'application/pdf',
            fileCvData,
            fileCvText,
            fileCvPath,
            fileCvTextStatus,
            loaiHoSo: 'file_upload',
            cvChinh: cvList.length === 0,
            congKhai: false,
          }),
        })
        maHoSoNangLuc = cvMoi.id
      }
      if (!maHoSoNangLuc) throw new Error('Bạn cần chọn hoặc upload CV trước khi ứng tuyển')

      await apiCoXacThuc('/hosoungtuyen/ung-tuyen', {
        method: 'POST',
        body: JSON.stringify({
          maTinTuyenDung: viec.id,
          maHoSoNangLuc,
          thuXinViec: thuXinViec.trim() || undefined,
        }),
      })
      setDaUngTuyen(true)
      setMoModalUngTuyen(false)
      setThongBaoUngTuyen('Ứng tuyển thành công. Hồ sơ và CV đã được gửi tới nhà tuyển dụng.')
    } catch (err) {
      setThongBaoUngTuyen(err instanceof Error ? err.message : 'Không ứng tuyển được')
    } finally {
      setDangUngTuyen(false)
    }
  }

  if (dangTai) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>Đang tải chi tiết việc làm...</main>
  if (loi || !viec) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#991b1b' }}>{loi || 'Không tìm thấy việc làm'}</main>

  return (
    <main style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 0 }}>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: 'linear-gradient(135deg, #0b1c30 0%, #1e3a5f 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `url(${viec.anhDaiDien ? imageUrl(viec.anhDaiDien) : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: viec.anhDaiDien ? 0.32 : 0.15 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div style={{ width: 88, height: 88, background: '#fff', border: '2px solid rgba(255,255,255,0.9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <img src={logo} alt={tenCongTy} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).src = logoDuPhong }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{viec.tieuDe}</h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{tenCongTy}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 0 0', fontSize: 13, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 700 }}><DollarSign size={14} /> {formatLuong(viec.luongMin, viec.luongMax)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {viec.diaChi ?? 'Đà Nẵng'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Briefcase size={13} /> {viec.loaiHinh ?? 'toan_thoi_gian'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {viec.capBac ?? 'junior'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {viec.soLuong ?? 1} vị trí</span>
          </div>
          <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
            {[
              { key: 'mo-ta', label: 'Mô tả công việc' },
              { key: 'cong-ty', label: 'Về công ty' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{ padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === t.key ? '#e11d48' : '#6b7280', borderBottom: tab === t.key ? '2px solid #e11d48' : '2px solid transparent', marginBottom: -1, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {tab === 'mo-ta' && (
            <>
              <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[...kyNang, viec.capBac, viec.loaiHinh].filter(Boolean).map(kn => <span key={kn} style={{ background: '#f0f0f0', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{kn}</span>)}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={ungTuyenNgay} disabled={dangUngTuyen || daUngTuyen} style={{ flex: 1, minWidth: 200, background: daUngTuyen ? '#16a34a' : '#0058be', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: daUngTuyen ? 'default' : 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {dangUngTuyen ? 'Đang ứng tuyển...' : daUngTuyen ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
                </button>
                <button onClick={() => void toggleSave()} style={{ background: daLuu ? '#eff6ff' : '#f3f4f6', color: daLuu ? '#0058be' : '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Bookmark size={16} fill={daLuu ? '#0058be' : 'none'} /> {daLuu ? 'Đã lưu' : 'Lưu'}</button>
                <button style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Share2 size={16} /> Chia sẻ</button>
              </div>
              {thongBaoUngTuyen && <div style={{ background: '#fff', borderRadius: 8, padding: '14px 18px', border: '1px solid #dbe4f0', color: daUngTuyen ? '#166534' : '#334155', fontWeight: 700 }}>{thongBaoUngTuyen}</div>}
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>Mô tả công việc</h2>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{viec.moTa ?? 'Tin tuyển dụng chưa cập nhật mô tả.'}</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>Yêu cầu công việc</h2>
                <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
                  {(yeuCau.length ? yeuCau : ['Chưa cập nhật yêu cầu chi tiết.']).map((item, index) => <li key={index} style={{ marginBottom: 8 }}>{item}</li>)}
                </ul>
              </div>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>Quyền lợi</h2>
                <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20 }}>
                  {(quyenLoi.length ? quyenLoi : ['Chưa cập nhật quyền lợi chi tiết.']).map((item, index) => <li key={index} style={{ marginBottom: 8 }}>{item}</li>)}
                </ul>
              </div>
            </>
          )}

          {tab === 'cong-ty' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0b1c30' }}>Về {tenCongTy}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', marginBottom: 24 }}>
                {[
                  { label: 'Ngành nghề', val: congTy?.nganh ?? 'Công nghệ thông tin' },
                  { label: 'Quy mô', val: formatQuyMo(congTy?.quyMo) },
                  { label: 'Website', val: congTy?.website ?? 'Đang cập nhật' },
                  { label: 'Địa chỉ', val: congTy?.diaChi ?? viec.diaChi ?? 'Đà Nẵng' },
                ].map(item => (
                  <div key={item.label} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0b1c30' }}>{item.val}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 18 }}>{congTy?.moTa ?? 'Công ty chưa cập nhật mô tả.'}</p>
              <Link to={`/cong-ty/${viec.maNhaTuyenDung}`} style={{ display: 'block', textAlign: 'center', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#0058be', textDecoration: 'none' }}>Xem trang công ty</Link>
            </div>
          )}
        </div>

        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#fff' }}>
                <img src={logo} alt={tenCongTy} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).src = logoDuPhong }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{tenCongTy}</h3>
                <Link to={`/cong-ty/${viec.maNhaTuyenDung}`} style={{ color: '#0058be', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Xem công ty</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, fontSize: 13, color: '#6b7280' }}>
              {[
                { icon: Building2, label: congTy?.nganh ?? 'Công nghệ thông tin' },
                { icon: Users, label: formatQuyMo(congTy?.quyMo) },
                { icon: MapPin, label: congTy?.diaChi ?? viec.diaChi ?? 'Đà Nẵng' },
                { icon: Globe, label: congTy?.website ?? 'Đang cập nhật' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon size={15} style={{ marginTop: 2, flexShrink: 0, color: '#0058be' }} />
                  <span style={{ lineHeight: 1.5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#0b1c30' }}>Việc làm tương tự</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Các vị trí liên quan từ API</p>
            <div style={{ borderTop: '1px solid #f0f0f0' }}>
              {viecLienQuan.map(item => (
                <Link key={item.id} to={`/viec-lam/${item.id}`} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#0b1c30', lineHeight: 1.4 }}>{item.tieuDe}</h4>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{item.nhaTuyenDung?.tenCongTy ?? tenCongTy}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#374151' }}>{item.diaChi ?? 'Đà Nẵng'}</span>
                    <span style={{ background: '#f3f4f6', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#16a34a' }}>{formatLuong(item.luongMin, item.luongMax)}</span>
                  </div>
                </Link>
              ))}
              {viecLienQuan.length === 0 && <p style={{ padding: '14px 0', color: '#6b7280', fontSize: 14 }}>Chưa có việc liên quan.</p>}
            </div>
          </div>
        </div>
      </div>
      {moModalUngTuyen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.58)', display: 'grid', placeItems: 'center', padding: '88px 16px 18px' }}>
          <div style={{ width: 'min(720px, 100%)', maxHeight: 'calc(100vh - 106px)', overflow: 'hidden', background: '#fff', borderRadius: 12, boxShadow: '0 24px 80px rgba(15,23,42,0.28)', display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
            <div style={{ minHeight: 64, padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Ứng tuyển {viec.tieuDe}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Chọn CV trong hệ thống hoặc upload CV mới để gửi cho nhà tuyển dụng.</p>
              </div>
              <button onClick={() => setMoModalUngTuyen(false)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ overflow: 'auto', padding: 20, display: 'grid', gap: 14 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, display: 'grid', gap: 10 }}>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>CV có sẵn</strong>
                {cvList.length ? cvList.map(cv => (
                  <label key={cv.id} style={{ minHeight: 52, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: cvDangChon === cv.id && !fileCvMoi ? '#eff6ff' : '#fff' }}>
                    <input type="radio" checked={cvDangChon === cv.id && !fileCvMoi} onChange={() => { setCvDangChon(cv.id); setFileCvMoi(null) }} />
                    <FileText size={18} color="#2563eb" />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{cv.tieuDe || cv.fileCvTen || 'CV ứng viên'}</span>
                    {cv.cvChinh && <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>Mặc định</span>}
                  </label>
                )) : <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Bạn chưa có CV trong hệ thống. Hãy upload CV mới bên dưới.</p>}
              </div>
              <label style={{ border: '1px dashed #94a3b8', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: fileCvMoi ? '#f0fdf4' : '#f8fafc' }}>
                <UploadCloud size={20} color="#0f766e" />
                <span style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>{fileCvMoi ? fileCvMoi.name : 'Upload CV PDF mới'}</strong>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Chỉ hỗ trợ PDF để nhà tuyển dụng xem trực tiếp.</span>
                </span>
                <input type="file" className="hidden" accept="application/pdf,.pdf" onChange={event => { const file = event.target.files?.[0] ?? null; setFileCvMoi(file); if (file) setCvDangChon('') }} />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Thư xin việc</span>
                <textarea value={thuXinViec} onChange={event => setThuXinViec(event.target.value)} rows={5} style={{ borderRadius: 10, border: '1px solid #cbd5e1', padding: 12, fontSize: 14, lineHeight: 1.6, resize: 'vertical' }} />
              </label>
              {thongBaoUngTuyen && <div style={{ borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', padding: 12, fontSize: 14, fontWeight: 700 }}>{thongBaoUngTuyen}</div>}
            </div>
            <div style={{ minHeight: 64, padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setMoModalUngTuyen(false)} style={{ minWidth: 96, minHeight: 42, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 800, cursor: 'pointer' }}>Hủy</button>
              <button onClick={nopHoSoUngTuyen} disabled={dangUngTuyen || (!cvDangChon && !fileCvMoi)} style={{ minWidth: 150, minHeight: 42, borderRadius: 10, border: '1px solid #0058be', background: '#0058be', color: '#fff', fontWeight: 800, cursor: dangUngTuyen ? 'wait' : 'pointer', opacity: (!cvDangChon && !fileCvMoi) ? 0.55 : 1 }}>{dangUngTuyen ? 'Đang gửi...' : 'Gửi ứng tuyển'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
