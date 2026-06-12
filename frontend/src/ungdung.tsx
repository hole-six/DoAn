import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp, Sparkles, ChevronRight,
  Award, Flame, Zap, Globe, Shield,
  ArrowRight, Bot, CheckCircle, Send, X,
} from 'lucide-react'
import effortBg from './assets/EffortBackground.png'
import mascotFrame1 from './assets/anhdong1.png'
import mascotFrame2 from './assets/anhdong2.png'
import mascotFrame3 from './assets/anhdong3.png'
import './ungdung.css'
import './pages/trangchu/trangchu-styles.css'
import './realtime.css'
import './components/chat-notification.css'

// ✨ Import Real-time Components
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import SeoRouteManager from './components/SeoRouteManager'
import { khoiTaoSocket, ngatketnoisocket } from './lib/socket'
import { dangKyPushSubscription, langNgheNotificationClick as langNghePushClick } from './lib/pushNotifications'
import { ChatProvider } from './contexts/ChatContext'
import { ThongBaoProvider } from './contexts/ThongBaoContext'
import { ThongBaoToastContainer } from './components/ThongBaoCenter'
import { layAccessToken } from './lib/auth'
import { API_URL, taoUrlTaiNguyen } from './lib/env'
import { isPublicJobVisible } from './lib/jobVisibility'
import { formatJobDateLine, formatJobDeadlineState } from './lib/jobPresentation'
import { EmployerRecruitmentGate } from './pages/nhatuyendung/shared/EmployerRecruitmentGate'
import {
  homeAiQuickPrompts,
  thongDiepChayNgang,
  trangChuFallbackCompanies,
  trangChuFallbackJobs,
  trangChuLyDo,
  trangChuTechCategories,
  type HomeCompany,
  type HomeJob,
  type TrangChuLyDoIcon,
} from './data/trangChuData'

// ─── Dữ liệu tĩnh ────────────────────────────────────────────────────────────

// ─── Brand ───────────────────────────────────────────────────────────────────

// ─── Header + Brand ───────────────────────────────────────────────────────────
// (moved to components/Header.tsx)

// ─── Hero trang chủ ───────────────────────────────────────────────────────────

function useTrangChuData() {
  const [state, setState] = useState<{ jobs: HomeJob[]; companies: HomeCompany[]; loading: boolean }>({ jobs: [], companies: [], loading: true })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          fetch(`${API_URL}/tintuyendung`, { cache: 'no-store' }).then(res => res.json()),
          fetch(`${API_URL}/nhatuyendung`).then(res => res.json()),
        ])
        if (!active) return
        const rawJobs = jobsRes.duLieu ?? []
        const rawCompanies = companiesRes.duLieu ?? []
        const jobsByCompany = rawJobs.reduce((acc: Record<string, number>, job: any) => {
          acc[job.maNhaTuyenDung] = (acc[job.maNhaTuyenDung] ?? 0) + (isPublicJobVisible(job) ? 1 : 0)
          return acc
        }, {})
        setState({
          loading: false,
          jobs: rawJobs
            .filter((job: any) => isPublicJobVisible(job))
            .slice(0, 6)
            .map((job: any, index: number) => ({
              id: job.id,
              tieuDe: job.tieuDe,
              congTy: job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
              logo: taoUrlTaiNguyen(job.nhaTuyenDung?.logo) || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
              diaDiem: job.diaChi ?? 'Đà Nẵng',
              luong: job.luongMin || job.luongMax ? `${job.luongMin?.toLocaleString('vi-VN') ?? '?'} - ${job.luongMax?.toLocaleString('vi-VN') ?? '?'} VND` : 'Thỏa thuận',
              loaiViec: job.loaiHinh ?? 'toan_thoi_gian',
              kyNang: (job.kyNang ?? []).map((skill: any) => skill.tenKyNang ?? skill.maKyNang?.tenKyNang).filter(Boolean).slice(0, 4),
              badge: index < 2 ? 'HOT' : null,
              ngayDang: job.ngayDang,
              hanNop: job.hanNop,
              hanNopConLai: formatJobDeadlineState(job.hanNop),
              featured: index < 2,
            })),
          companies: rawCompanies
            .filter((company: any) => company.trangThaiDuyet === 'da_duyet')
            .slice(0, 6)
            .map((company: any) => ({
              id: company.id,
              ten: company.tenCongTy,
              logo: taoUrlTaiNguyen(company.logo) || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80',
              logoBg: '#ffffff',
              diaDiem: company.diaChi ?? 'Đà Nẵng',
              soViec: jobsByCompany[company.id] ?? 0,
              kyNang: [company.nganh, company.quyMo ? `${company.quyMo}+ nhân sự` : '', company.trangThaiDuyet === 'da_duyet' ? 'Đã xác thực' : ''].filter(Boolean),
            })),
        })
      } catch {
        if (active) setState({ jobs: [], companies: [], loading: false })
      }
    }
    load()
    return () => { active = false }
  }, [])

  return state
}

function HeroTrangChu() {
  const [tuKhoa, setTuKhoa] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { groups, loading, hasAny } = useSearchSuggestions({
    query: tuKhoa,
    active: searchActive,
    apiUrl: API_URL,
  })

  const timKiem = () => {
    const params = new URLSearchParams()
    if (tuKhoa.trim()) params.set('tuKhoa', tuKhoa.trim())
    setSearchActive(false)
    navigate(`/viec-lam${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const chonGoiY = (item: SuggestionItem) => {
    setTuKhoa(item.queryValue)
    setSearchActive(false)
    if (item.href) {
      navigate(item.href)
      return
    }
    navigate(`/viec-lam?tuKhoa=${encodeURIComponent(item.queryValue)}`)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchActive(false)
    }
    const onMouseDown = (event: MouseEvent) => {
      if (!searchWrapRef.current) return
      if (!searchWrapRef.current.contains(event.target as Node)) setSearchActive(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [])

  return (
    <section className="trangchu-hero">
      <img
        src={effortBg}
        alt=""
        className="trangchu-hero-nen"
        aria-hidden="true"
      />
      {searchActive && (loading || hasAny) && (
        <button
          type="button"
          className="search-overlay"
          onClick={() => setSearchActive(false)}
          aria-label="Đóng gợi ý tìm kiếm"
        />
      )}


      <div className={`trangchu-hero-noidung${searchActive ? ' search-focus-active' : ''}`}>
        <p className="eyebrow">Nền tảng tuyển dụng CNTT</p>
        <h1>
         Tìm việc chất IT Đà Nẵng
        </h1>

        
        {/* Khung tìm kiếm */}
        <div ref={searchWrapRef} className={`trangchu-khop-timkiem${searchActive ? ' search-shell-active' : ''}`}>
          <label className="trangchu-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tên vị trí, công ty, kỹ năng..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              onFocus={() => setSearchActive(true)}
              onKeyDown={e => { if (e.key === 'Enter') timKiem() }}
            />
            {tuKhoa && (
              <button
                type="button"
                className="search-clear-button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setTuKhoa('')}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <button className="primary-button large" onClick={timKiem}>
            <Search size={18} />
            Tìm kiếm
          </button>
          {searchActive && (
            <SearchSuggestionPanel
              groups={groups}
              loading={loading}
              query={tuKhoa}
              onSelect={chonGoiY}
              onClearQuery={() => setTuKhoa('')}
            />
          )}
        </div>

        {/* Gợi ý từ khoá */}
        <div className="trangchu-goiy">
          <span>Kỹ năng nổi bật:</span>
          {['React', 'Node.js', 'TypeScript', 'Java', 'DevOps', 'Data Engineer'].map(kn => (
            <button key={kn} onClick={() => navigate(`/viec-lam?tuKhoa=${encodeURIComponent(kn)}`)}>{kn}</button>
          ))}
        </div>

        {/* Thanh chữ chạy ngang */}
        <div className="bang-chay-thong-bao">
          <span className="bang-chay-icon">HOT</span>
          <div className="bang-chay-cua-so">
            <div className="bang-chay-duong">
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Thanh tính năng nổi bật (nằm ngoài hero để không bị overflow:hidden cắt) ─

// ─── Thống kê ─────────────────────────────────────────────────────────────────



// ─── Nhà tuyển dụng nổi bật ───────────────────────────────────────────────────

function SectionNhaTuyenDung({ companies }: { companies?: HomeCompany[] }) {
  const items = companies?.length ? companies : trangChuFallbackCompanies
  return (
    <section className="section section-why-full">
      <div className="section-title">
        <div>
          <p className="eyebrow">Đối tác tuyển dụng</p>
          <h2>Nhà tuyển dụng hàng đầu</h2>
          <p>Các công ty công nghệ đang tuyển dụng tích cực trên Effort Job</p>
        </div>
          <Link to="/cong-ty" className="text-link">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="ntd-grid">
        {items.map(cty => (
          <Link to={`/cong-ty/${cty.id}`} key={cty.id} className="ntd-card">
            {/* Phần trên: logo + tên + tags */}
            <div className="ntd-card-top">
              <div className="ntd-logo-wrap" style={{ background: cty.logoBg }}>
                <img
                  src={cty.logo}
                  alt={`Logo ${cty.ten}`}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <h3 className="ntd-ten">{cty.ten}</h3>
              <div className="ntd-tags">
                {cty.kyNang.map(kn => (
                  <span key={kn} className="ntd-tag">{kn}</span>
                ))}
              </div>
            </div>

            {/* Phần dưới: địa điểm + số việc */}
            <div className="ntd-card-bottom">
              <span className="ntd-dia-diem">{cty.diaDiem}</span>
              <div className="ntd-viec">
                <span className="ntd-dot" />
                <span>{cty.soViec} việc làm</span>
                <span className="ntd-arrow">›</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Tin tuyển dụng nổi bật ───────────────────────────────────────────────────

function SectionTinTuyenDung({ jobs }: { jobs?: HomeJob[] }) {
  const items = jobs?.length ? jobs : trangChuFallbackJobs
  const nhanBadge = (badge: string | null) => {
    if (!badge) return null
    return badge === 'SUPER HOT' ? 'Ưu tiên' : 'Nổi bật'
  }

  const dinhDangLoaiViec = (loaiViec: string) =>
    loaiViec
      .replaceAll('_', ' ')
      .split(' ')
      .filter(Boolean)
      .map(tu => tu.charAt(0).toUpperCase() + tu.slice(1))
      .join(' ')

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Cơ hội việc làm</p>
          <h2>Việc làm IT nổi bật</h2>
          <p>Cập nhật mới nhất từ các công ty công nghệ hàng đầu</p>
        </div>
        <Link to="/viec-lam" className="text-link">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="vl-grid">
        {items.map(tin => (
          <Link
            to={`/viec-lam/${tin.id}`}
            key={tin.id}
            className={`vl-card${tin.featured ? ' vl-card--featured' : ''}`}
          >
            {nhanBadge(tin.badge) && (
              <span className={`vl-badge${tin.badge === 'SUPER HOT' ? ' vl-badge--super' : ''}`} title={nhanBadge(tin.badge) ?? undefined}>
                <Flame size={15} fill="currentColor" />
              </span>
            )}

            <p className="vl-time">{tin.hanNopConLai ? formatJobDateLine(tin.ngayDang, tin.hanNop) : `Đăng ${tin.ngayDang}`}</p>
            <h3 className="vl-title">{tin.tieuDe}</h3>
            <div className="vl-company">
              <img
                className="vl-logo"
                src={tin.logo}
                alt={tin.congTy}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="vl-company-name">{tin.congTy}</span>
            </div>
            <div className="vl-salary-wrap">
              <span className="vl-label">Mức lương</span>
              <p className="vl-salary">{tin.luong}</p>
            </div>
            <hr className="vl-divider" />
            <div className="vl-meta">
              <span><strong>Ngành:</strong> {dinhDangLoaiViec(tin.loaiViec)}</span>
              <span><strong>Khu vực:</strong> {tin.diaDiem}</span>
            </div>
            <div className="vl-tags">
              {tin.kyNang.map(kn => (
                <span key={kn} className="vl-tag">{kn}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Tech Stack Section ───────────────────────────────────────────────────────

function SectionTechStack() {
  return (
    <section className="section section-tech-stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">Công nghệ phổ biến</p>
          <h2>Kỹ năng được tuyển dụng nhiều nhất</h2>
          <p>Các công nghệ hàng đầu mà nhà tuyển dụng đang tìm kiếm</p>
        </div>
      </div>

      {trangChuTechCategories.map(cat => (
        <div key={cat.category} className="tech-category">
          <h3>{cat.category}</h3>
          <div className="tech-marquee">
            <div className="tech-marquee-track">
              {[...cat.techs, ...cat.techs, ...cat.techs, ...cat.techs].map((tech, idx) => (
                <div key={idx} className="tech-marquee-item">
                  <img
                    src={tech.icon}
                    alt={tech.name}
                  />
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

// ─── Tại sao chọn Effort Job ─────────────────────────────────────────────────

const trangChuLyDoIcons: Record<TrangChuLyDoIcon, typeof Zap> = {
  zap: Zap,
  shield: Shield,
  globe: Globe,
  check: CheckCircle,
  trending: TrendingUp,
  award: Award,
}

function SectionLyDo() {
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Tại sao chọn Effort Job</p>
          <h2>Nền tảng được xây dựng cho<br />ứng viên và nhà tuyển dụng IT</h2>
        </div>
      </div>
      <div className="bento-grid">
        {trangChuLyDo.map((item, idx) => {
          const Icon = trangChuLyDoIcons[item.icon]
          return (
            <div key={item.tieu} className={`bento-card${idx === 0 ? ' dark' : ''}`}>
              <div className="icon-shell"><Icon size={22} /></div>
              <h3>{item.tieu}</h3>
              <p>{item.mo}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function SectionCTA() {
  return (
    <section className="section home-cta-section" style={{ paddingBottom: 0 }}>
      <div
        className="dashboard-hero home-cta-card"
        style={{ borderRadius: 24, marginTop: 0 }}
      >
        <div>
          <p className="eyebrow">Bắt đầu ngay hôm nay</p>
          <h2>Sẵn sàng bước vào<br />cơ hội tiếp theo?</h2>
          <p>Tạo hồ sơ miễn phí, kết nối với nhà tuyển dụng và theo dõi quá trình ứng tuyển rõ ràng.</p>
          <div className="detail-actions home-cta-actions" style={{ border: 0, padding: '20px 0 0' }}>
            <Link to="/dang-ky" className="primary-button large">
              Tạo hồ sơ miễn phí <ArrowRight size={18} />
            </Link>
            <Link to="/viec-lam" className="ghost-button large">
              Khám phá việc làm
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=720&q=80"
          alt="Team làm việc"
        />
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
// (moved to components/Footer.tsx)

function HomeAiChat() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Hỏi tôi về việc làm IT trong hệ thống: React ở Đà Nẵng, job remote cho junior, công ty đang tuyển Backend...')
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const trongPhamViTuyenDungIt = (text: string) => {
    const normalized = text.toLowerCase()
    return [
      'it', 'job', 'việc', 'viec', 'tuyển', 'tuyen', 'cv', 'hồ sơ', 'ho so',
      'phỏng vấn', 'phong van', 'lương', 'luong', 'react', 'node', 'java',
      'python', 'backend', 'frontend', 'tester', 'devops', 'data', 'công ty', 'cong ty',
      'ứng tuyển', 'ung tuyen', 'career', 'developer', 'engineer',
    ].some(keyword => normalized.includes(keyword))
  }

  const ask = async () => {
    const cauHoi = question.trim()
    if (!cauHoi || busy) return
    if (!trongPhamViTuyenDungIt(cauHoi)) {
      setAnswer('Tôi chỉ hỗ trợ các nội dung liên quan tuyển dụng IT: tìm việc, CV, phỏng vấn, công ty, kỹ năng và định hướng nghề nghiệp. Bạn hãy hỏi theo phạm vi đó để tôi trả lời chính xác hơn.')
      setQuestion('')
      return
    }
    try {
      setBusy(true)
      const res = await fetch(`${API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.thongBao ?? 'Không hỏi được AI')
      setAnswer(data.duLieu?.traLoi ?? data.traLoi ?? 'Chưa có câu trả lời phù hợp trong hệ thống.')
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Không hỏi được AI lúc này.')
    } finally {
      setBusy(false)
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 220,
          minHeight: 54,
          border: 0,
          borderRadius: 18,
          background: '#075985',
          color: '#fff',
          padding: '0 18px',
          fontWeight: 900,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 20px 54px rgba(7,89,133,.35)',
          cursor: 'pointer',
        }}
      >
        <Bot size={22} /> Hỏi AI tìm việc
      </button>
    )
  }

  return (
    <section
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 220,
        width: 'min(430px, calc(100vw - 28px))',
      }}
    >
      <div style={{ display: 'grid', gap: 14, border: '1px solid #dbe7f3', borderRadius: 18, background: '#ffffff', padding: 16, boxShadow: '0 24px 70px rgba(15,23,42,.22)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 14, background: '#e0f2fe', color: '#075985' }}><Bot size={22} /></span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', color: '#075985' }}>Effort Job Gemini</p>
            <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Trợ lý tìm việc từ database</h2>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Đóng AI"
            style={{ width: 34, height: 34, borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 900, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ maxHeight: 190, overflowY: 'auto', minHeight: 88, borderRadius: 14, background: '#f8fafc', padding: 14, color: '#334155', fontWeight: 700, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{answer}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={question}
              onChange={event => setQuestion(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') void ask()
              }}
              placeholder="Ví dụ: Có job React junior remote nào còn hạn không?"
              style={{ flex: '1 1 320px', minHeight: 46, borderRadius: 14, border: '1px solid #cbd5e1', padding: '0 14px', fontWeight: 700, outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => void ask()}
              disabled={busy || !question.trim()}
              style={{ minHeight: 46, border: 0, borderRadius: 14, background: '#075985', color: '#fff', padding: '0 18px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: busy ? 'wait' : 'pointer', opacity: busy || !question.trim() ? .65 : 1 }}
            >
              {busy ? <Sparkles size={18} /> : <Send size={18} />} {busy ? 'Đang trả lời...' : 'Hỏi AI'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Trang chủ ────────────────────────────────────────────────────────────────

void HomeAiChat

type HomeAiJobSuggestion = {
  id: string
  tieuDe: string
  congTy: string
  diaChi?: string
  luong?: string
  diem?: number
  lyDo?: string
  url: string
}

const mascotFrames = [mascotFrame1, mascotFrame2, mascotFrame3]

function HomeAiMascotChat() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Xin chào, mình là trợ lý Effort Job. Bạn có thể hỏi mình về lộ trình nghề nghiệp, CV, phỏng vấn hoặc tìm việc trong database.')
  const [jobs, setJobs] = useState<HomeAiJobSuggestion[]>([])
  const [quickPrompts, setQuickPrompts] = useState(homeAiQuickPrompts)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex(value => (value + 1) % mascotFrames.length)
    }, busy ? 420 : 650)
    return () => window.clearInterval(timer)
  }, [busy])

  const ask = async (nextQuestion?: string) => {
    const cauHoi = (nextQuestion ?? question).trim()
    if (!cauHoi || busy) return
    try {
      setBusy(true)
      const res = await fetch(`${API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.thongBao ?? 'Không hỏi được AI lúc này.')
      const payload = data.duLieu ?? data
      setAnswer(payload.traLoi ?? 'Mình chưa có câu trả lời phù hợp, bạn thử hỏi cụ thể hơn nhé.')
      setJobs(Array.isArray(payload.goiYViecLam) ? payload.goiYViecLam : [])
      if (Array.isArray(payload.goiYCauHoi) && payload.goiYCauHoi.length) {
        setQuickPrompts(payload.goiYCauHoi.slice(0, 4))
      }
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Không hỏi được AI lúc này.')
      setJobs([])
    } finally {
      setBusy(false)
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="home-ai-mascot-fab" onClick={() => setExpanded(true)} aria-label="Mở trợ lý AI Effort Job">
        <span className="home-ai-mascot-glow" />
        <img src={mascotFrames[frameIndex]} alt="" />
        <span>Hỏi AI</span>
      </button>
    )
  }

  return (
    <section className="home-ai-panel" aria-label="Trợ lý AI Effort Job">
      <div className="home-ai-panel-header">
        <div className="home-ai-avatar">
          <img src={mascotFrames[frameIndex]} alt="Trợ lý Effort Job" />
        </div>
        <div className="min-w-0">
          <p>Effort Job AI</p>
          <h2>Trợ lý nghề nghiệp</h2>
        </div>
        <button type="button" className="home-ai-close" onClick={() => setExpanded(false)} aria-label="Đóng trợ lý AI">
          <X size={18} />
        </button>
      </div>

      <div className="home-ai-answer">
        <p>{answer}</p>
        {jobs.length > 0 && (
          <div className="home-ai-jobs">
            {jobs.map(job => (
              <Link key={job.id} to={job.url} className="home-ai-job-card">
                <span className="home-ai-score">{Math.round(Number(job.diem ?? 0)) || 'AI'}</span>
                <span className="home-ai-job-main">
                  <strong>{job.tieuDe}</strong>
                  <small>{job.congTy} · {job.diaChi || 'Đang cập nhật'} · {job.luong || 'Thỏa thuận'}</small>
                  {job.lyDo && <em>{job.lyDo}</em>}
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="home-ai-prompts">
        {quickPrompts.map(prompt => (
          <button key={prompt} type="button" onClick={() => void ask(prompt)} disabled={busy}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="home-ai-input-row">
        <input
          value={question}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') void ask()
          }}
          placeholder="Hỏi AI về job, CV, phỏng vấn hoặc lộ trình nghề nghiệp..."
        />
        <button type="button" onClick={() => void ask()} disabled={busy || !question.trim()}>
          {busy ? <Sparkles size={18} /> : <Send size={18} />}
          {busy ? 'Đang trả lời' : 'Gửi'}
        </button>
      </div>
    </section>
  )
}

function TrangChu() {
  const data = useTrangChuData()

  return (
    <main className="app-page">
      <HeroTrangChu />
      <SectionNhaTuyenDung companies={data.companies} />
      <SectionTinTuyenDung jobs={data.jobs} />
      <HomeAiMascotChat />
      <SectionTechStack />
      <SectionLyDo />
      <SectionCTA />
      <div style={{ height: 80 }} />
    </main>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

import BoDinhTuyen from './components/BoDinhTuyen'
import DashboardShell from './components/DashboardShell'
import SearchSuggestionPanel from './components/search/SearchSuggestionPanel'
import { type SuggestionItem, useSearchSuggestions } from './components/search/useSearchSuggestions'

const DangNhap = lazy(() => import('./pages/xacthuc/DangNhap'))
const DangKy = lazy(() => import('./pages/xacthuc/DangKy'))
const ForgotPasswordPage = lazy(() => import('./pages/xacthuc/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/xacthuc/ResetPasswordPage'))
const TimKiemViecLam = lazy(() => import('./pages/vieclam/TimKiemViecLam'))
const ChiTietViecLam = lazy(() => import('./pages/vieclam/ChiTietViecLam'))
const DanhSachCongTy = lazy(() => import('./pages/congty/DanhSachCongTy'))
const HoSoCongTy = lazy(() => import('./pages/congty/HoSoCongTy'))
const BlogPage = lazy(() => import('./pages/blog/Blog'))
const DashboardUngVien = lazy(() => import('./pages/ungvien/dashboard/DashboardUngVienPage'))
const HoSoUngVienPage = lazy(() => import('./pages/ungvien/hoso/HoSoUngVienPage'))
const ViecDaLuuPage = lazy(() => import('./pages/ungvien/viecdaluu/ViecDaLuuPage'))
const UngTuyenPage = lazy(() => import('./pages/ungvien/ungtuyen/UngTuyenPage'))
const LichPhongVanPage = lazy(() => import('./pages/ungvien/lichphongvan/LichPhongVanPage'))
const ThongBaoUngVienPage = lazy(() => import('./pages/ungvien/thongbao/ThongBaoUngVienPage'))
const CaiDatUngVienPage = lazy(() => import('./pages/ungvien/caidat/CaiDatUngVienPage'))
const DashboardNhaTuyenDung = lazy(() => import('./pages/nhatuyendung/dashboard/DashboardNhaTuyenDungPage'))
const QuanLyTinNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/jobs/QuanLyTinNhaTuyenDungPage'))
const UngVienNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/candidates/UngVienNhaTuyenDungPage'))
const LichPhongVanNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/interviews/LichPhongVanNhaTuyenDungPage'))
const CongTyNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/company/CongTyNhaTuyenDungPage'))
const ThongBaoNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/notifications/ThongBaoNhaTuyenDungPage'))
const CaiDatNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/DashboardNhaTuyenDung').then(module => ({ default: module.CaiDatNhaTuyenDungPage })))
const DashboardQuanTriVien = lazy(() => import('./pages/quantrivien/DashboardQuanTriVien'))
const QuanLyNguoiDung = lazy(() => import('./pages/quantrivien/QuanLyNguoiDung'))
const QuanLyCongTyAdmin = lazy(() => import('./pages/quantrivien/congty/QuanLyCongTyAdmin'))
const DuyetTinTuyenDungAdmin = lazy(() => import('./pages/quantrivien/tintuyendung/DuyetTinTuyenDungAdmin'))
const QuanLyKyNangAdmin = lazy(() => import('./pages/quantrivien/kynang/QuanLyKyNangAdmin'))
const QuanLyReviewCongTyAdmin = lazy(() => import('./pages/quantrivien/review/QuanLyReviewCongTyAdmin'))
const ThongBaoAdminPage = lazy(() => import('./pages/quantrivien/thongbao/ThongBaoAdminPage'))
const CaiDatAdminPage = lazy(() => import('./pages/quantrivien/CaiDatQuanTriPage'))
const ChatUngVienPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatUngVienPage })))
const ChatNhaTuyenDungPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatNhaTuyenDungPage })))
const ChatAdminPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatAdminPage })))
const TrangDangXayDungPage = lazy(() => import('./pages/TrangDangXayDung'))

function RouteFallback() {
  return <div className="route-loading">Đang tải...</div>
}

export default function UngDung() {
  // ✨ Initialize real-time features
  useEffect(() => {
    langNghePushClick()

    const capNhatSocket = () => {
      const token = layAccessToken()
      if (token) {
        khoiTaoSocket(token)
        dangKyPushSubscription().catch(console.error)
      } else {
        ngatketnoisocket()
      }
    }

    capNhatSocket()
    window.addEventListener('itjob-auth-change', capNhatSocket)
    return () => window.removeEventListener('itjob-auth-change', capNhatSocket)
  }, [])

  return (
    <BrowserRouter>
      <SeoRouteManager />
      <ThongBaoProvider>
        <ChatProvider>
          {/* ✨ Real-time UI Components */}
          <PWAInstallPrompt />
          <OfflineIndicator />
          <ThongBaoToastContainer />
      
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public routes với Header + Footer */}
        <Route element={<BoDinhTuyen />}>
          <Route path="/" element={<TrangChu />} />
          <Route path="/viec-lam" element={<TimKiemViecLam />} />
          <Route path="/viec-lam/:id" element={<ChiTietViecLam />} />
          <Route path="/cong-ty" element={<DanhSachCongTy />} />
          <Route path="/cong-ty/:id" element={<HoSoCongTy />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<TrangDangXayDungPage ten="Bài viết" />} />
          <Route path="/luong" element={<TrangDangXayDungPage ten="Báo cáo lương" />} />
          <Route path="/gioi-thieu" element={<TrangDangXayDungPage ten="Giới thiệu" />} />
          <Route path="/lien-he" element={<TrangDangXayDungPage ten="Liên hệ" />} />
          <Route path="/dieu-khoan" element={<TrangDangXayDungPage ten="Điều khoản" />} />
          <Route path="/bao-mat" element={<TrangDangXayDungPage ten="Bảo mật" />} />
        </Route>

        {/* Auth routes (không có Header/Footer) */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
        <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />

        {/* Dashboard ứng viên */}
        <Route path="/ung-vien" element={<DashboardShell vaiTro="ungvien" />}>
          <Route index element={<DashboardUngVien />} />
          <Route path="ho-so" element={<HoSoUngVienPage />} />
          <Route path="viec-da-luu" element={<ViecDaLuuPage />} />
          <Route path="ung-tuyen" element={<UngTuyenPage />} />
          <Route path="lich-phong-van" element={<LichPhongVanPage />} />
          <Route path="chat" element={<ChatUngVienPage />} />
          <Route path="thong-bao" element={<ThongBaoUngVienPage />} />
          <Route path="cai-dat" element={<CaiDatUngVienPage />} />
        </Route>

        {/* Dashboard nhà tuyển dụng */}
        <Route path="/nha-tuyen-dung" element={<DashboardShell vaiTro="nhatuyendung" />}>
          <Route index element={<DashboardNhaTuyenDung />} />
          <Route path="dashboard" element={<DashboardNhaTuyenDung />} />
          <Route path="quan-ly-tin" element={<EmployerRecruitmentGate><QuanLyTinNhaTuyenDungPage /></EmployerRecruitmentGate>} />
          <Route path="tao-tin" element={<EmployerRecruitmentGate><Navigate to="/nha-tuyen-dung/quan-ly-tin?new=1" replace /></EmployerRecruitmentGate>} />
          <Route path="ung-vien" element={<EmployerRecruitmentGate><UngVienNhaTuyenDungPage /></EmployerRecruitmentGate>} />
          <Route path="lich-phong-van" element={<EmployerRecruitmentGate><LichPhongVanNhaTuyenDungPage /></EmployerRecruitmentGate>} />
          <Route path="lich-phong-vaan" element={<Navigate to="/nha-tuyen-dung/lich-phong-van" replace />} />
          <Route path="hat" element={<Navigate to="/nha-tuyen-dung/chat" replace />} />
          <Route path="cong-ty" element={<CongTyNhaTuyenDungPage />} />
          <Route path="chat" element={<ChatNhaTuyenDungPage />} />
          <Route path="thong-bao" element={<ThongBaoNhaTuyenDungPage />} />
          <Route path="cai-dat" element={<CaiDatNhaTuyenDungPage />} />
        </Route>

        {/* Dashboard quản trị viên */}
        <Route path="/quan-tri" element={<DashboardShell vaiTro="quantrivien" />}>
          <Route path="dashboard" element={<DashboardQuanTriVien />} />
          <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
          <Route path="cong-ty" element={<QuanLyCongTyAdmin />} />
          <Route path="tin-tuyen-dung" element={<DuyetTinTuyenDungAdmin />} />
          <Route path="ky-nang" element={<QuanLyKyNangAdmin />} />
          <Route path="review" element={<QuanLyReviewCongTyAdmin />} />
          <Route path="chat" element={<ChatAdminPage />} />
          <Route path="thong-bao" element={<ThongBaoAdminPage />} />
          <Route path="cai-dat" element={<CaiDatAdminPage />} />
        </Route>

        <Route path="*" element={<TrangDangXayDungPage ten="404 - Không tìm thấy" />} />
      </Routes>
      </Suspense>
        </ChatProvider>
      </ThongBaoProvider>
    </BrowserRouter>
  )
}

