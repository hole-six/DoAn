import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Filter, MapPin, Search, SlidersHorizontal, Star, Users, Zap } from 'lucide-react'
import congTyCongNgheBg from '../../assets/CongTyCongNGhe.png'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const logoDuPhong = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80'

type CongTy = {
  id: string
  tenCongTy: string
  diaChi?: string
  logo?: string
  moTa?: string
  nganh?: string
  quyMo?: number
  trangThaiDuyet?: string
}

type TinTuyenDung = {
  id: string
  maNhaTuyenDung: string
  trangThai?: string
}

type DanhGia = {
  maNhaTuyenDung: string
  diem: number
  daDuyet: boolean
}

function layJson(path: string) {
  return fetch(`${API_URL}${path}`).then(async res => {
    const body = await res.json()
    if (!res.ok) throw new Error(body.thongBao ?? 'Không tải được dữ liệu')
    return body.duLieu
  })
}

function formatQuyMo(quyMo?: number) {
  if (!quyMo) return 'Đang cập nhật'
  if (quyMo >= 1000) return `${quyMo.toLocaleString('vi-VN')}+`
  return String(quyMo)
}

export default function DanhSachCongTy() {
  const [tuKhoa, setTuKhoa] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ quyMo: true, linhVuc: true, danhGia: false })
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)
  const [companies, setCompanies] = useState<CongTy[]>([])
  const [jobs, setJobs] = useState<TinTuyenDung[]>([])
  const [reviews, setReviews] = useState<DanhGia[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([layJson('/nhatuyendung'), layJson('/tintuyendung'), layJson('/danhgiacongty')])
      .then(([companyData, jobData, reviewData]) => {
        if (!active) return
        setCompanies((companyData ?? []).filter((item: CongTy) => item.trangThaiDuyet === 'da_duyet'))
        setJobs(jobData ?? [])
        setReviews(reviewData ?? [])
        setLoi('')
      })
      .catch(error => setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu công ty'))
      .finally(() => active && setDangTai(false))
    return () => { active = false }
  }, [])

  const stats = useMemo(() => {
    const jobCount = new Map<string, number>()
    const reviewMap = new Map<string, { total: number; count: number }>()

    jobs.filter(job => job.trangThai === 'dang_mo').forEach(job => {
      jobCount.set(job.maNhaTuyenDung, (jobCount.get(job.maNhaTuyenDung) ?? 0) + 1)
    })

    reviews.filter(review => review.daDuyet).forEach(review => {
      const current = reviewMap.get(review.maNhaTuyenDung) ?? { total: 0, count: 0 }
      reviewMap.set(review.maNhaTuyenDung, { total: current.total + review.diem, count: current.count + 1 })
    })

    return { jobCount, reviewMap }
  }, [jobs, reviews])

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const ketQua = companies.filter(c => {
    const keyword = tuKhoa.toLowerCase()
    return !keyword || `${c.tenCongTy} ${c.diaChi ?? ''} ${c.nganh ?? ''}`.toLowerCase().includes(keyword)
  })

  return (
    <main className="app-page" style={{ paddingTop: 0, background: '#ffffff' }}>
      <div style={{ position: 'relative', color: '#ffffff', minHeight: 360, padding: '58px max(24px, calc((100vw - 1280px)/2)) 52px', borderBottom: '1px solid #e5e7eb', backgroundImage: `linear-gradient(90deg, rgba(7, 18, 34, 0.82), rgba(7, 18, 34, 0.58), rgba(7, 18, 34, 0.20)), url(${congTyCongNgheBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ maxWidth: 720 }}>
          <p className="eyebrow" style={{ color: '#bfdbfe' }}>Khám phá</p>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>Top IT Companies</h1>
          <p style={{ color: '#e5edf8', fontSize: 18, marginBottom: 28, maxWidth: 620 }}>
            {dangTai ? 'Đang tải dữ liệu công ty...' : `Khám phá ${companies.length}+ công ty công nghệ từ API thật`}
          </p>
          <div style={{ display: 'flex', gap: 10, maxWidth: 680, background: '#ffffff', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 8, padding: 8, boxShadow: '0 18px 40px rgba(2, 6, 23, 0.28)' }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', border: '1px solid #d8dde6', borderRadius: 6, padding: '0 14px', minHeight: 46 }}>
              <Search size={18} style={{ color: '#64748b' }} />
              <input type="text" placeholder="Tìm kiếm công ty..." value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0b1c30', width: '100%', fontSize: 15 }} />
            </label>
            <button className="primary-button" style={{ background: '#0058be', minWidth: 126, borderRadius: 6 }}>Tìm kiếm</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '272px 1fr', gap: 24, alignItems: 'start' }}>
        <aside style={{ background: '#ffffff', borderRadius: 6, border: '1px solid #dfe3ea', overflow: 'hidden', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#0b1c30', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: '#ffffff' }}><SlidersHorizontal size={14} color="rgba(255,255,255,0.80)" />Bộ lọc</div>
            <button onClick={() => setTuKhoa('')} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)', borderRadius: 6, cursor: 'pointer', fontSize: 10.5, color: 'rgba(255,255,255,0.80)', fontWeight: 600, padding: '3px 8px' }}>Xóa</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {[
              { key: 'quyMo', label: 'QUY MÔ', items: ['1-50', '51-150', '151-300', '300+'] },
              { key: 'linhVuc', label: 'LĨNH VỰC', items: ['Outsourcing', 'Product', 'Fintech', 'E-commerce', 'AI/ML', 'Gaming'] },
              { key: 'danhGia', label: 'ĐÁNH GIÁ', items: ['5 sao', '4+ sao', '3+ sao'] },
            ].map(section => (
              <div key={section.key} style={{ borderBottom: '1px solid #e8eaf0' }}>
                <button onClick={() => toggleSection(section.key)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em' }}>{section.label}</span>
                  <ChevronDown size={13} color="#94a3b8" style={{ transform: openSections[section.key] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {openSections[section.key] && (
                  <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: section.items.length > 4 ? '1fr 1fr' : '1fr', gap: '4px 8px' }}>
                    {section.items.map(item => (
                      <label key={item} onMouseEnter={() => setHoveredFilter(`${section.key}-${item}`)} onMouseLeave={() => setHoveredFilter(null)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 6px', cursor: 'pointer', fontSize: 12.5, color: hoveredFilter === `${section.key}-${item}` ? '#0058be' : '#45464d', borderRadius: 4, background: hoveredFilter === `${section.key}-${item}` ? '#eff4ff' : 'transparent', lineHeight: 1.4 }}>
                        <input type="checkbox" style={{ width: 14, height: 14, accentColor: '#0058be', cursor: 'pointer', flexShrink: 0 }} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e8eaf0', background: '#fff', flexShrink: 0 }}>
            <button style={{ width: '100%', background: '#0058be', color: '#ffffff', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '10px 0', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Filter size={13} /> Áp dụng</button>
          </div>
        </aside>

        <div>
          <div className="result-toolbar">
            <p>{dangTai ? 'Đang tải...' : <>Tìm thấy <strong>{ketQua.length}</strong> công ty</>}</p>
            <select style={{ border: 'none', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}><option>Đề xuất</option><option>Đánh giá cao</option><option>Nhiều việc làm</option></select>
          </div>
          {loi && <div style={{ padding: 16, color: '#991b1b', background: '#fef2f2', borderRadius: 8, marginBottom: 16 }}>{loi}</div>}
          <div className="company-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {ketQua.map((cty, index) => {
              const reviewStat = stats.reviewMap.get(cty.id)
              const rating = reviewStat ? Math.round((reviewStat.total / reviewStat.count) * 10) / 10 : 5
              const soReview = reviewStat?.count ?? 0
              const soViec = stats.jobCount.get(cty.id) ?? 0
              const hot = index < 3 || soViec >= 3

              return (
                <div key={cty.id} className="company-card" style={{ position: 'relative', overflow: 'hidden', padding: 22, display: 'flex', flexDirection: 'column', border: hot ? '1px solid rgba(0,88,190,0.28)' : '1px solid #dfe3ea', borderRadius: 8, background: '#ffffff', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }}>
                  {hot && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,88,190,0.08)', color: 'var(--secondary)', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={11} /> Hot</div>}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                    <div className="logo-box" style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 6, border: '1px solid #e1e5ec', background: '#f8fafc', overflow: 'hidden' }}>
                      <img src={cty.logo || logoDuPhong} alt={cty.tenCongTy} onError={e => { if (e.currentTarget.src !== logoDuPhong) e.currentTarget.src = logoDuPhong }} style={{ width: '100%', height: '100%', objectFit: 'cover', padding: 0, display: 'block' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{cty.tenCongTy}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} /><span style={{ fontWeight: 700, fontSize: 13 }}>{rating}</span><span style={{ color: 'var(--on-surface-variant)', fontSize: 12 }}>({soReview} reviews)</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#667085', fontSize: 12.5, marginTop: 6 }}><MapPin size={13} /> {cty.diaChi ?? 'Đà Nẵng'}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{cty.moTa ?? 'Công ty chưa cập nhật mô tả.'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {[cty.nganh ?? 'Công nghệ thông tin', cty.trangThaiDuyet === 'da_duyet' ? 'Đã xác thực' : 'Chờ duyệt'].map(label => <span key={label} style={{ background: '#f4f6f9', border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>{label}</span>)}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(198,198,205,0.5)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: 13 }}><Users size={14} /> {formatQuyMo(cty.quyMo)} nhân viên</div>
                    <Link to={`/cong-ty/${cty.id}`} style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>{soViec} Việc làm <ArrowRight size={14} /></Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
