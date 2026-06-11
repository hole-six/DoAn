import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, Briefcase, Globe, MapPin, Star, ThumbsUp, Users } from 'lucide-react'
import { API_URL, taoUrlTaiNguyen } from '../../lib/env'
import { useSeo } from '../../lib/seo'
import './congty-styles.css'

const logoDuPhong = 'https://placehold.co/160x160/eaf2ff/2563eb?text=IT'
const bannerDuPhong = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80'

// Helper function để lấy URL đầy đủ cho logo
function layUrlLogo(logo?: string) {
  if (!logo) return logoDuPhong
  if (logo.startsWith('http://') || logo.startsWith('https://')) return logo
  return taoUrlTaiNguyen(logo)
}

type CongTy = {
  id: string
  tenCongTy: string
  logo?: string
  diaChi?: string
  website?: string
  quyMo?: number
  moTa?: string
  nganh?: string
  trangThaiDuyet?: string
  ngayTao?: string
}

type TinTuyenDung = {
  id: string
  maNhaTuyenDung: string
  tieuDe: string
  diaChi?: string
  luongMin?: number
  luongMax?: number
  loaiHinh?: string
  capBac?: string
  trangThai?: string
  ngayDang?: string
  kyNang?: Array<{ tenKyNang?: string }>
}

type DanhGia = {
  id: string
  maNhaTuyenDung: string
  diem: number
  noiDung: string
  daDuyet: boolean
  anDanh?: boolean
  ngayTao?: string
  ungVien?: {
    hoTen?: string
    viTriMongMuon?: string
  }
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

function CardViecLam({ tin, congTy }: { tin: TinTuyenDung; congTy: CongTy }) {
  const kyNang = (tin.kyNang ?? []).map(skill => skill.tenKyNang).filter(Boolean) as string[]

  return (
    <Link to={`/viec-lam/${tin.id}`} style={{ display: 'block', padding: '16px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{tin.ngayDang ? new Date(tin.ngayDang).toLocaleDateString('vi-VN') : 'Mới đăng'}</p>
        {tin.trangThai === 'dang_mo' && <span style={{ background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>ĐANG MỞ</span>}
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10, color: '#0b1c30' }}>{tin.tieuDe}</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
          <img src={layUrlLogo(congTy.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{congTy.tenCongTy}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>{formatLuong(tin.luongMin, tin.luongMax)}</p>
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={12} /> {tin.loaiHinh ?? 'toan_thoi_gian'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {tin.diaChi ?? 'Đà Nẵng'}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {kyNang.slice(0, 4).map(skill => <span key={skill} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#374151' }}>{skill}</span>)}
      </div>
    </Link>
  )
}

export default function HoSoCongTy() {
  const { id } = useParams()
  const [tab, setTab] = useState<'gioi-thieu' | 'danh-gia' | 'bai-viet'>('gioi-thieu')
  const [congTy, setCongTy] = useState<CongTy | null>(null)
  const [tinTuyenDung, setTinTuyenDung] = useState<TinTuyenDung[]>([])
  const [danhGia, setDanhGia] = useState<DanhGia[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    let active = true
    setDangTai(true)
    Promise.all([
      layJson(`/nhatuyendung/${id}`),
      layJson('/tintuyendung'),
      layJson('/danhgiacongty'),
    ])
      .then(([company, jobs, reviews]) => {
        if (!active) return
        setCongTy(company)
        setTinTuyenDung((jobs ?? []).filter((job: TinTuyenDung) => job.maNhaTuyenDung === company.id && job.trangThai === 'dang_mo'))
        setDanhGia((reviews ?? []).filter((review: DanhGia) => review.maNhaTuyenDung === company.id && review.daDuyet))
        setLoi('')
      })
      .catch(error => setLoi(error instanceof Error ? error.message : 'Không tải được hồ sơ công ty'))
      .finally(() => active && setDangTai(false))
    return () => { active = false }
  }, [id])

  const diemTrungBinh = useMemo(() => {
    if (!danhGia.length) return 0
    return Math.round((danhGia.reduce((sum, item) => sum + item.diem, 0) / danhGia.length) * 10) / 10
  }, [danhGia])

  const seoData = useMemo(() => {
    if (!congTy) return null
    const moTaRutGon = (congTy.moTa || `${congTy.tenCongTy} là doanh nghiệp công nghệ đang tuyển dụng trên Effort IT.`)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220)
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: congTy.tenCongTy,
      url: congTy.website || `https://effortit.site/cong-ty/${congTy.id}`,
      logo: layUrlLogo(congTy.logo),
      description: moTaRutGon,
      address: {
        '@type': 'PostalAddress',
        addressLocality: congTy.diaChi || 'Đà Nẵng',
        addressCountry: 'VN',
      },
    }

    if (danhGia.length > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: diemTrungBinh,
        reviewCount: danhGia.length,
      }
    }

    return {
      title: `${congTy.tenCongTy} - Công ty công nghệ tuyển dụng trên Effort IT`,
      description: `${congTy.tenCongTy}${congTy.diaChi ? ` tại ${congTy.diaChi}` : ''}. ${moTaRutGon}`,
      canonical: `/cong-ty/${congTy.id}`,
      keywords: [congTy.tenCongTy, congTy.nganh, congTy.diaChi, 'công ty IT Đà Nẵng'].filter(Boolean).join(', '),
      image: layUrlLogo(congTy.logo),
      schema,
    }
  }, [congTy, danhGia.length, diemTrungBinh])

  useSeo(seoData)

  if (dangTai) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>Đang tải hồ sơ công ty...</main>
  if (loi || !congTy) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#991b1b' }}>{loi || 'Không tìm thấy công ty'}</main>

  const quymo = formatQuyMo(congTy.quyMo)
  const moTa = congTy.moTa || 'Công ty chưa cập nhật mô tả.'

  return (
    <main className="company-profile-page" style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 0 }}>
      <div className="company-profile-hero" style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src={bannerDuPhong} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div className="company-profile-hero-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div className="company-profile-logo" style={{ width: 88, height: 88, background: '#fff', border: '2px solid rgba(255,255,255,0.9)', borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <img src={layUrlLogo(congTy.logo)} alt={congTy.tenCongTy} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 className="company-profile-title" style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 0, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{congTy.tenCongTy}</h1>
          </div>
        </div>
      </div>

      <div className="company-profile-tabs-shell" style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="company-profile-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 0 0', fontSize: 13, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Globe size={13} /> {congTy.website ?? 'Đang cập nhật'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {quymo}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {congTy.diaChi ?? 'Đà Nẵng'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontWeight: 700 }}><Star size={13} fill="#f59e0b" /> {diemTrungBinh || 'Chưa có'} ({danhGia.length} đánh giá)</span>
          </div>
          <div className="company-profile-tabs" style={{ display: 'flex', gap: 0, marginTop: 8 }}>
            {[
              { key: 'gioi-thieu', label: 'Giới thiệu' },
              { key: 'danh-gia', label: `Đánh giá ${danhGia.length}` },
              { key: 'bai-viet', label: `Bài viết ${tinTuyenDung.length}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{ padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === t.key ? '#e11d48' : '#6b7280', borderBottom: tab === t.key ? '2px solid #e11d48' : '2px solid transparent', marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="company-profile-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div className="company-profile-main" style={{ display: 'grid', gap: 16 }}>
          {tab === 'gioi-thieu' && (
            <>
              <div className="company-profile-card" style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0b1c30' }}>Thông tin chung</h2>
                <div className="company-profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                  {[
                    { label: 'Lĩnh vực công ty', val: congTy.nganh ?? 'Công nghệ thông tin' },
                    { label: 'Quy mô công ty', val: quymo },
                    { label: 'Quốc gia', val: 'Việt Nam' },
                    { label: 'Trạng thái', val: congTy.trangThaiDuyet === 'da_duyet' ? 'Đã xác thực' : 'Chờ duyệt' },
                    { label: 'Website', val: congTy.website ?? 'Đang cập nhật' },
                    { label: 'Việc đang tuyển', val: `${tinTuyenDung.length} vị trí` },
                  ].map(item => (
                    <div key={item.label} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0b1c30' }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="company-profile-card" style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #fed7aa' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f97316' }}><Award size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Điểm nổi bật</h2>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {diemTrungBinh || 5}/5</span>
                  <span style={{ fontWeight: 700 }}><ThumbsUp size={14} /> {Math.max(92, Math.round((diemTrungBinh || 4.6) * 20))}% khuyến nghị</span>
                  <span style={{ fontWeight: 700 }}><Briefcase size={14} /> {tinTuyenDung.length} tin đang mở</span>
                </div>
              </div>
              <div className="company-profile-card" style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}>Giới thiệu công ty</h2>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{moTa.split('\n').map((p, i) => p.trim() && <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}</div>
              </div>
              <div className="company-profile-card" style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0b1c30' }}><MapPin size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#e11d48' }} />Địa chỉ</h2>
                <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{congTy.diaChi ?? 'Đà Nẵng'}</p>
                <div className="company-profile-map" style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #ebebeb' }}>
                  <iframe title="Bản đồ" src={`https://maps.google.com/maps?q=${encodeURIComponent(congTy.diaChi ?? 'Đà Nẵng')}&output=embed`} width="100%" height="280" style={{ border: 'none', display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              </div>
            </>
          )}

          {tab === 'danh-gia' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              {danhGia.length === 0 && <p style={{ color: '#6b7280' }}>Chưa có đánh giá đã duyệt.</p>}
              <div style={{ display: 'grid', gap: 16 }}>
                {danhGia.map(dg => (
                  <div key={dg.id} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700 }}>{dg.anDanh ? 'Ẩn danh' : dg.ungVien?.hoTen ?? 'Ứng viên'}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>{dg.ungVien?.viTriMongMuon ?? 'Nhân sự IT'}</p>
                      </div>
                      <div>{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} style={{ color: j < dg.diem ? '#f59e0b' : '#e5e7eb', fill: j < dg.diem ? '#f59e0b' : 'none' }} />)}</div>
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{dg.noiDung}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{dg.ngayTao ? new Date(dg.ngayTao).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'bai-viet' && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#0b1c30' }}>Bài đăng tuyển dụng</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                Các tin tuyển dụng đang mở của {congTy.tenCongTy}
              </p>
              <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12 }}>
                {tinTuyenDung.map(tin => <CardViecLam key={tin.id} tin={tin} congTy={congTy} />)}
              </div>
              {tinTuyenDung.length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
                  Công ty chưa có bài đăng tuyển dụng đang mở.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="company-profile-sidebar" style={{ position: 'sticky', top: 90 }}>
          <div className="company-profile-card company-profile-sidebar-card" style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0b1c30', marginBottom: 4 }}>{tinTuyenDung.length} việc làm đang tuyển dụng</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>tại {congTy.tenCongTy}</p>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12 }}>
              {tinTuyenDung.map(tin => <CardViecLam key={tin.id} tin={tin} congTy={congTy} />)}
              {tinTuyenDung.length === 0 && <p style={{ padding: '18px 0', color: '#6b7280', fontSize: 14 }}>Công ty chưa có tin đang mở.</p>}
            </div>
            <Link to="/viec-lam" style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>Xem tất cả việc làm</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
