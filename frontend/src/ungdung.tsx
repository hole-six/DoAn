import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Search, Briefcase,
  TrendingUp, Star, FileText, Sparkles, ChevronRight,
  Award, Zap, Globe, Shield,
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

// âœ¨ Import Real-time Components
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { khoiTaoSocket, ngatketnoisocket } from './lib/socket'
import { dangKyPushSubscription, langNgheNotificationClick as langNghePushClick } from './lib/pushNotifications'
import { ChatProvider } from './contexts/ChatContext'
import { ThongBaoProvider } from './contexts/ThongBaoContext'
import { ThongBaoToastContainer } from './components/ThongBaoCenter'
import { layAccessToken } from './lib/auth'
import { API_URL } from './lib/env'

// â”€â”€â”€ Dá»¯ liá»‡u tÄ©nh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const thongDiepChayNgang =
  'ðŸ”¥ HÆ¡n 12.000 viá»‡c lÃ m IT Ä‘ang tuyá»ƒn Â· LÆ°Æ¡ng Backend Senior lÃªn Ä‘áº¿n 80 triá»‡u Â· ' +
  'Má»Ÿ CV áº©n danh â€“ nhÃ  tuyá»ƒn dá»¥ng tÃ¬m báº¡n Â· Phá»ng váº¥n thá»±c táº¿ má»—i tuáº§n Â· ' +
  'Top cÃ´ng ty cÃ´ng nghá»‡ Ä‘ang tuyá»ƒn gáº¥p Â· Ná»™p há»“ sÆ¡ chá»‰ 1 click Â· '

const tinhNangNoiBat: Array<{
  icon: React.ElementType
  label: string
  to: string
  badge?: string
  badgeLoai?: 'hot' | 'moi'
}> = [
  { icon: Briefcase, label: 'Tìm việc IT', to: '/viec-lam', badge: 'HOT', badgeLoai: 'hot' },
  { icon: FileText, label: 'Tạo CV', to: '/ung-vien/ho-so' },
  { icon: Star, label: 'Khám phá công ty', to: '/cong-ty', badge: 'MỚI', badgeLoai: 'moi' },
]
const nhaTuyenDung = [
  {
    id: 1,
    ten: 'Samsung Electronics HCMC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    logoBg: '#000000',
    diaDiem: 'TP Há»“ ChÃ­ Minh',
    soViec: 2,
    kyNang: ['Embedded', 'Android', 'ReactJS', 'OOP', 'C++', 'Python'],
  },
  {
    id: 2,
    ten: 'FPT Software',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'HÃ  Ná»™i Â· TP.HCM Â· ÄÃ  Náºµng',
    soViec: 142,
    kyNang: ['Java', 'React', '.NET', 'Python', 'AWS', 'DevOps'],
  },
  {
    id: 3,
    ten: 'Viettel Group',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Viettel_logo_2021.svg',
    logoBg: '#ffffff',
    diaDiem: 'HÃ  Ná»™i Â· TP Há»“ ChÃ­ Minh',
    soViec: 7,
    kyNang: ['JavaScript', 'Python', 'PHP', 'UI/UX', 'MySQL', 'MVC'],
  },
  {
    id: 4,
    ten: 'VNG Corporation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VNG_Corporation_logo.svg/200px-VNG_Corporation_logo.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 87,
    kyNang: ['Go', 'Kubernetes', 'React', 'AI/ML', 'gRPC', 'Redis'],
  },
  {
    id: 5,
    ten: 'Tiki',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tiki_logo.svg/200px-Tiki_logo.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 63,
    kyNang: ['Node.js', 'Vue', 'AWS', 'Data', 'Kafka', 'Spark'],
  },
  {
    id: 6,
    ten: 'MoMo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_MoMo_Square.svg/200px-Logo_MoMo_Square.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'TP.HCM',
    soViec: 55,
    kyNang: ['Kotlin', 'Swift', 'Spring', 'Kafka', 'iOS', 'Android'],
  },
]

const tinTuyenDung = [
  {
    id: 1,
    tieuDe: '[ÄÃ  Náºµng] Senior Backend Engineer (Node.js)',
    congTy: 'VNEXT SOFTWARE',
    logo: 'https://placehold.co/80x80/fff3e8/f97316?text=VN',
    diaDiem: 'Táº¡i vÄƒn phÃ²ng Â· ÄÃ  Náºµng',
    luong: '30.000.000 - 45.000.000 VND',
    loaiViec: 'backend',
    kyNang: ['Node.js', 'PostgreSQL', 'Redis'],
    badge: 'SUPER HOT',
    ngayDang: '1 ngÃ y trÆ°á»›c',
    featured: true,
  },
  {
    id: 2,
    tieuDe: 'Frontend Engineer React/TypeScript',
    congTy: 'VisionTech Global',
    logo: 'https://placehold.co/80x80/e0f2fe/2563eb?text=VT',
    diaDiem: 'LÃ m tá»« xa Â· TP Há»“ ChÃ­ Minh',
    luong: '25.000.000 - 38.000.000 VND',
    loaiViec: 'frontend',
    kyNang: ['React', 'TypeScript', 'Tailwind CSS'],
    badge: 'SUPER HOT',
    ngayDang: '3 ngÃ y trÆ°á»›c',
    featured: true,
  },
  {
    id: 3,
    tieuDe: '[Remote] DevOps Engineer (AWS/Kubernetes)',
    congTy: 'Edge8',
    logo: 'https://placehold.co/80x80/111827/ffffff?text=E8',
    diaDiem: 'LÃ m tá»« xa Â· HÃ  Ná»™i',
    luong: '35.000.000 - 55.000.000 VND',
    loaiViec: 'devops',
    kyNang: ['AWS', 'Kubernetes', 'CI/CD'],
    badge: null,
    ngayDang: '4 ngÃ y trÆ°á»›c',
    featured: false,
  },
  {
    id: 4,
    tieuDe: 'Senior Full-stack Developer (React/Node.js)',
    congTy: 'CodeLink',
    logo: 'https://placehold.co/80x80/ecfeff/0891b2?text=CL',
    diaDiem: 'Linh hoáº¡t Â· TP Há»“ ChÃ­ Minh',
    luong: '32.000.000 - 48.000.000 VND',
    loaiViec: 'fullstack',
    kyNang: ['React', 'Node.js', 'MongoDB'],
    badge: 'HOT',
    ngayDang: '13 ngÃ y trÆ°á»›c',
    featured: false,
  },
]



const lyDo = [
  { icon: Zap,          tieu: 'á»¨ng tuyá»ƒn siÃªu nhanh',    mo: 'Chá»‰ 1 click Ä‘á»ƒ ná»™p há»“ sÆ¡. Há»‡ thá»‘ng tá»± Ä‘iá»n thÃ´ng tin tá»« CV cá»§a báº¡n.' },
  { icon: Shield,       tieu: 'CV áº©n danh báº£o máº­t',      mo: 'Báº­t cháº¿ Ä‘á»™ tÃ¬m viá»‡c thá»¥ Ä‘á»™ng. NhÃ  tuyá»ƒn dá»¥ng tÃ¬m báº¡n mÃ  khÃ´ng lá»™ danh tÃ­nh.' },
  { icon: Globe,        tieu: 'Máº¡ng lÆ°á»›i rá»™ng kháº¯p',     mo: 'Káº¿t ná»‘i vá»›i 3.200+ cÃ´ng ty tá»« startup Ä‘áº¿n táº­p Ä‘oÃ n Ä‘a quá»‘c gia.' },
  { icon: CheckCircle,  tieu: 'XÃ¡c thá»±c cÃ´ng ty',         mo: 'Má»i nhÃ  tuyá»ƒn dá»¥ng Ä‘á»u Ä‘Æ°á»£c xÃ¡c minh. KhÃ´ng lo lá»«a Ä‘áº£o, khÃ´ng lo máº¥t thá»i gian.' },
  { icon: TrendingUp,   tieu: 'BÃ¡o cÃ¡o lÆ°Æ¡ng thá»±c táº¿',   mo: 'Dá»¯ liá»‡u lÆ°Æ¡ng tá»« 50.000+ láº­p trÃ¬nh viÃªn. Biáº¿t giÃ¡ trá»‹ thá»±c cá»§a báº¡n trÃªn thá»‹ trÆ°á»ng.' },
  { icon: Award,        tieu: 'Há»— trá»£ phá»ng váº¥n',        mo: 'CÃ¢u há»i phá»ng váº¥n thá»±c táº¿, tips tá»« senior developer, mock interview online.' },
]

// â”€â”€â”€ Brand â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Header + Brand â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// (moved to components/Header.tsx)

// â”€â”€â”€ Hero trang chá»§ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type HomeJob = {
  id: string
  tieuDe: string
  congTy: string
  logo: string
  diaDiem: string
  luong: string
  loaiViec: string
  kyNang: string[]
  badge: string | null
  ngayDang: string
  featured: boolean
}

type HomeCompany = {
  id: string
  ten: string
  logo: string
  logoBg: string
  diaDiem: string
  soViec: number
  kyNang: string[]
}

function useTrangChuData() {
  const [state, setState] = useState<{ jobs: HomeJob[]; companies: HomeCompany[]; loading: boolean }>({ jobs: [], companies: [], loading: true })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          fetch(`${API_URL}/tintuyendung`).then(res => res.json()),
          fetch(`${API_URL}/nhatuyendung`).then(res => res.json()),
        ])
        if (!active) return
        const rawJobs = jobsRes.duLieu ?? []
        const rawCompanies = companiesRes.duLieu ?? []
        const jobsByCompany = rawJobs.reduce((acc: Record<string, number>, job: any) => {
          acc[job.maNhaTuyenDung] = (acc[job.maNhaTuyenDung] ?? 0) + (job.trangThai === 'dang_mo' ? 1 : 0)
          return acc
        }, {})
        setState({
          loading: false,
          jobs: rawJobs
            .filter((job: any) => job.trangThai === 'dang_mo')
            .slice(0, 6)
            .map((job: any, index: number) => ({
              id: job.id,
              tieuDe: job.tieuDe,
              congTy: job.nhaTuyenDung?.tenCongTy ?? 'NhÃ  tuyá»ƒn dá»¥ng',
              logo: job.nhaTuyenDung?.logo || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
              diaDiem: job.diaChi ?? 'ÄÃ  Náºµng',
              luong: job.luongMin || job.luongMax ? `${job.luongMin?.toLocaleString('vi-VN') ?? '?'} - ${job.luongMax?.toLocaleString('vi-VN') ?? '?'} VND` : 'Thá»a thuáº­n',
              loaiViec: job.loaiHinh ?? 'toan_thoi_gian',
              kyNang: (job.kyNang ?? []).map((skill: any) => skill.tenKyNang ?? skill.maKyNang?.tenKyNang).filter(Boolean).slice(0, 4),
              badge: index < 2 ? 'HOT' : null,
              ngayDang: job.ngayDang ? new Date(job.ngayDang).toLocaleDateString('vi-VN') : 'Má»›i Ä‘Äƒng',
              featured: index < 2,
            })),
          companies: rawCompanies
            .filter((company: any) => company.trangThaiDuyet === 'da_duyet')
            .slice(0, 6)
            .map((company: any) => ({
              id: company.id,
              ten: company.tenCongTy,
              logo: company.logo || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80',
              logoBg: '#ffffff',
              diaDiem: company.diaChi ?? 'ÄÃ  Náºµng',
              soViec: jobsByCompany[company.id] ?? 0,
              kyNang: [company.nganh, company.quyMo ? `${company.quyMo}+ nhÃ¢n sá»±` : '', company.trangThaiDuyet === 'da_duyet' ? 'ÄÃ£ xÃ¡c thá»±c' : ''].filter(Boolean),
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
    if (item.type === 'company') {
      navigate(`/cong-ty?tuKhoa=${encodeURIComponent(item.queryValue)}`)
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
          aria-label="ÄÃ³ng gá»£i Ã½ tÃ¬m kiáº¿m"
        />
      )}


      <div className={`trangchu-hero-noidung${searchActive ? ' search-focus-active' : ''}`}>
        <p className="eyebrow">Ná»n táº£ng tuyá»ƒn dá»¥ng CNTT</p>
        <h1>
         TÃ¬m viá»‡c cháº¥t IT ÄÃ  Náºµng
        </h1>

        
        {/* Khung tÃ¬m kiáº¿m */}
        <div ref={searchWrapRef} className={`trangchu-khop-timkiem${searchActive ? ' search-shell-active' : ''}`}>
          <label className="trangchu-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="TÃªn vá»‹ trÃ­, cÃ´ng ty, ká»¹ nÄƒng..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              onFocus={() => setSearchActive(true)}
              onKeyDown={e => { if (e.key === 'Enter') timKiem() }}
            />
          </label>
          <button className="primary-button large" onClick={timKiem}>
            <Search size={18} />
            TÃ¬m kiáº¿m
          </button>
          {searchActive && (
            <SearchSuggestionPanel groups={groups} loading={loading} query={tuKhoa} onSelect={chonGoiY} />
          )}
        </div>

        {/* Gá»£i Ã½ tá»« khoÃ¡ */}
        <div className="trangchu-goiy">
          <span>Ká»¹ nÄƒng ná»•i báº­t:</span>
          {['React', 'Node.js', 'TypeScript', 'Java', 'DevOps', 'Data Engineer'].map(kn => (
            <button key={kn} onClick={() => navigate(`/viec-lam?tuKhoa=${encodeURIComponent(kn)}`)}>{kn}</button>
          ))}
        </div>

        {/* Thanh chá»¯ cháº¡y ngang */}
        <div className="bang-chay-thong-bao">
          <span className="bang-chay-icon">ðŸ”¥</span>
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

// â”€â”€â”€ Thanh tÃ­nh nÄƒng ná»•i báº­t (náº±m ngoÃ i hero Ä‘á»ƒ khÃ´ng bá»‹ overflow:hidden cáº¯t) â”€

function ThanhTinhNang() {
  return (
    <div className="thanh-tinh-nang-co-dinh">
      <div className="thanh-tinh-nang-khung">
        {tinhNangNoiBat.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.label} to={item.to} className="tinh-nang-item">
              <span className="tinh-nang-icon"><Icon size={18} /></span>
              <strong>{item.label}</strong>
              {item.badge && (
                <span className={`tinh-nang-badge ${item.badgeLoai === 'moi' ? 'moi' : 'hot'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// â”€â”€â”€ Thá»‘ng kÃª â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€



// â”€â”€â”€ NhÃ  tuyá»ƒn dá»¥ng ná»•i báº­t â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionNhaTuyenDung({ companies }: { companies?: HomeCompany[] }) {
  const items = companies?.length ? companies : nhaTuyenDung.map(item => ({ ...item, id: String(item.id) }))
  return (
    <section className="section section-why-full">
      <div className="section-title">
        <div>
          <p className="eyebrow">Äá»‘i tÃ¡c tuyá»ƒn dá»¥ng</p>
          <h2>NhÃ  tuyá»ƒn dá»¥ng hÃ ng Ä‘áº§u</h2>
          <p>CÃ¡c cÃ´ng ty cÃ´ng nghá»‡ lá»›n nháº¥t Viá»‡t Nam Ä‘ang tuyá»ƒn dá»¥ng tÃ­ch cá»±c</p>
        </div>
          <Link to="/cong-ty" className="text-link">
          Xem táº¥t cáº£ <ChevronRight size={16} />
        </Link>
      </div>

      <div className="ntd-grid">
        {items.map(cty => (
          <Link to={`/cong-ty/${cty.id}`} key={cty.id} className="ntd-card">
            {/* Pháº§n trÃªn: logo + tÃªn + tags */}
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

            {/* Pháº§n dÆ°á»›i: Ä‘á»‹a Ä‘iá»ƒm + sá»‘ viá»‡c */}
            <div className="ntd-card-bottom">
              <span className="ntd-dia-diem">{cty.diaDiem}</span>
              <div className="ntd-viec">
                <span className="ntd-dot" />
                <span>{cty.soViec} Viá»‡c lÃ m</span>
                <span className="ntd-arrow">â€º</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// â”€â”€â”€ Tin tuyá»ƒn dá»¥ng ná»•i báº­t â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionTinTuyenDung({ jobs }: { jobs?: HomeJob[] }) {
  const items = jobs?.length ? jobs : tinTuyenDung.map(item => ({ ...item, id: String(item.id) }))
  const nhanBadge = (badge: string | null) => {
    if (!badge) return null
    return badge === 'SUPER HOT' ? 'Æ¯u tiÃªn' : 'Ná»•i báº­t'
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
          <p className="eyebrow">CÆ¡ há»™i viá»‡c lÃ m</p>
          <h2>Viá»‡c lÃ m IT ná»•i báº­t</h2>
          <p>Cáº­p nháº­t má»›i nháº¥t tá»« cÃ¡c cÃ´ng ty cÃ´ng nghá»‡ hÃ ng Ä‘áº§u</p>
        </div>
        <Link to="/viec-lam" className="text-link">
          Xem táº¥t cáº£ <ChevronRight size={16} />
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
              <span className={`vl-badge${tin.badge === 'SUPER HOT' ? ' vl-badge--super' : ''}`}>
                {nhanBadge(tin.badge)}
              </span>
            )}

            <p className="vl-time">ÄÄƒng {tin.ngayDang}</p>
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
              <span className="vl-label">Má»©c lÆ°Æ¡ng</span>
              <p className="vl-salary">{tin.luong}</p>
            </div>
            <hr className="vl-divider" />
            <div className="vl-meta">
              <span><strong>NgÃ nh:</strong> {dinhDangLoaiViec(tin.loaiViec)}</span>
              <span><strong>Khu vá»±c:</strong> {tin.diaDiem}</span>
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

// â”€â”€â”€ Tech Stack Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const techCategories = [
  {
    category: 'Frontend',
    techs: [
      { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
      { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    ]
  },
  {
    category: 'Backend',
    techs: [
      { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
      { name: 'Go', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' },
      { name: '.NET', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
    ]
  },
  {
    category: 'DevOps & Cloud',
    techs: [
      { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
      { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
      { name: 'Jenkins', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg' },
      { name: 'Terraform', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg' },
    ]
  },
]

function SectionTechStack() {
  return (
    <section className="section section-tech-stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">CÃ´ng nghá»‡ phá»• biáº¿n</p>
          <h2>Ká»¹ nÄƒng Ä‘Æ°á»£c tuyá»ƒn dá»¥ng nhiá»u nháº¥t</h2>
          <p>CÃ¡c cÃ´ng nghá»‡ hÃ ng Ä‘áº§u mÃ  nhÃ  tuyá»ƒn dá»¥ng Ä‘ang tÃ¬m kiáº¿m</p>
        </div>
      </div>

      {techCategories.map(cat => (
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

// â”€â”€â”€ Táº¡i sao chá»n Effort Job â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionLyDo() {
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Táº¡i sao chá»n Effort Job</p>
          <h2>Ná»n táº£ng Ä‘Æ°á»£c tin dÃ¹ng bá»Ÿi<br />hÃ ng trÄƒm nghÃ¬n láº­p trÃ¬nh viÃªn</h2>
        </div>
      </div>
      <div className="bento-grid">
        {lyDo.map((item, idx) => {
          const Icon = item.icon
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

// â”€â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionCTA() {
  return (
    <section className="section home-cta-section" style={{ paddingBottom: 0 }}>
      <div
        className="dashboard-hero home-cta-card"
        style={{ borderRadius: 24, marginTop: 0 }}
      >
        <div>
          <p className="eyebrow">Báº¯t Ä‘áº§u ngay hÃ´m nay</p>
          <h2>Sáºµn sÃ ng bÆ°á»›c vÃ o<br />cÆ¡ há»™i tiáº¿p theo?</h2>
          <p>Táº¡o há»“ sÆ¡ miá»…n phÃ­, káº¿t ná»‘i vá»›i nhÃ  tuyá»ƒn dá»¥ng vÃ  nháº­n offer trong 7 ngÃ y.</p>
          <div className="detail-actions home-cta-actions" style={{ border: 0, padding: '20px 0 0' }}>
            <Link to="/dang-ky" className="primary-button large">
              Táº¡o há»“ sÆ¡ miá»…n phÃ­ <ArrowRight size={18} />
            </Link>
            <Link to="/viec-lam" className="ghost-button large">
              KhÃ¡m phÃ¡ viá»‡c lÃ m
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=720&q=80"
          alt="Team lÃ m viá»‡c"
        />
      </div>
    </section>
  )
}

// â”€â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// (moved to components/Footer.tsx)

function HomeAiChat() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Há»i tÃ´i vá» viá»‡c lÃ m IT trong há»‡ thá»‘ng: React á»Ÿ ÄÃ  Náºµng, job remote cho junior, cÃ´ng ty Ä‘ang tuyá»ƒn Backend...')
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
      if (!res.ok) throw new Error(data.thongBao ?? 'KhÃ´ng há»i Ä‘Æ°á»£c AI')
      setAnswer(data.duLieu?.traLoi ?? data.traLoi ?? 'ChÆ°a cÃ³ cÃ¢u tráº£ lá»i phÃ¹ há»£p trong há»‡ thá»‘ng.')
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'KhÃ´ng há»i Ä‘Æ°á»£c AI lÃºc nÃ y.')
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
        <Bot size={22} /> Há»i AI tÃ¬m viá»‡c
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
            <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Trá»£ lÃ½ tÃ¬m viá»‡c tá»« database</h2>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="ÄÃ³ng AI"
            style={{ width: 34, height: 34, borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 900, cursor: 'pointer' }}
          >
            Ã—
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
              placeholder="VÃ­ dá»¥: CÃ³ job React junior remote nÃ o cÃ²n háº¡n khÃ´ng?"
              style={{ flex: '1 1 320px', minHeight: 46, borderRadius: 14, border: '1px solid #cbd5e1', padding: '0 14px', fontWeight: 700, outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => void ask()}
              disabled={busy || !question.trim()}
              style={{ minHeight: 46, border: 0, borderRadius: 14, background: '#075985', color: '#fff', padding: '0 18px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: busy ? 'wait' : 'pointer', opacity: busy || !question.trim() ? .65 : 1 }}
            >
              {busy ? <Sparkles size={18} /> : <Send size={18} />} {busy ? 'Äang tráº£ lá»i...' : 'Há»i AI'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// â”€â”€â”€ Trang chá»§ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
const homeAiQuickPrompts = [
  'TÃ¬m job React ÄÃ  Náºµng',
  'CV tÃ´i há»£p job nÃ o?',
  'CÃ´ng ty nÃ o Ä‘ang tuyá»ƒn Backend?',
  'Lá»™ trÃ¬nh há»c Ä‘á»ƒ á»©ng tuyá»ƒn Frontend?',
]

function HomeAiMascotChat() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Xin chÃ o, mÃ¬nh lÃ  trá»£ lÃ½ Effort Job. Báº¡n cÃ³ thá»ƒ há»i mÃ¬nh vá» lá»™ trÃ¬nh nghá» nghiá»‡p, CV, phá»ng váº¥n hoáº·c tÃ¬m viá»‡c trong database.')
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
      if (!res.ok) throw new Error(data.thongBao ?? 'KhÃ´ng há»i Ä‘Æ°á»£c AI lÃºc nÃ y.')
      const payload = data.duLieu ?? data
      setAnswer(payload.traLoi ?? 'MÃ¬nh chÆ°a cÃ³ cÃ¢u tráº£ lá»i phÃ¹ há»£p, báº¡n thá»­ há»i cá»¥ thá»ƒ hÆ¡n nhÃ©.')
      setJobs(Array.isArray(payload.goiYViecLam) ? payload.goiYViecLam : [])
      if (Array.isArray(payload.goiYCauHoi) && payload.goiYCauHoi.length) {
        setQuickPrompts(payload.goiYCauHoi.slice(0, 4))
      }
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'KhÃ´ng há»i Ä‘Æ°á»£c AI lÃºc nÃ y.')
      setJobs([])
    } finally {
      setBusy(false)
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="home-ai-mascot-fab" onClick={() => setExpanded(true)} aria-label="Má»Ÿ trá»£ lÃ½ AI Effort Job">
        <span className="home-ai-mascot-glow" />
        <img src={mascotFrames[frameIndex]} alt="" />
        <span>Há»i AI</span>
      </button>
    )
  }

  return (
    <section className="home-ai-panel" aria-label="Trá»£ lÃ½ AI Effort Job">
      <div className="home-ai-panel-header">
        <div className="home-ai-avatar">
          <img src={mascotFrames[frameIndex]} alt="Linh váº­t Effort Job" />
        </div>
        <div className="min-w-0">
          <p>Effort Job AI</p>
          <h2>Trá»£ lÃ½ nghá» nghiá»‡p</h2>
        </div>
        <button type="button" className="home-ai-close" onClick={() => setExpanded(false)} aria-label="ÄÃ³ng trá»£ lÃ½ AI">
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
                  <small>{job.congTy} Â· {job.diaChi || 'Äang cáº­p nháº­t'} Â· {job.luong || 'Thá»a thuáº­n'}</small>
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
          placeholder="Há»i AI vá» job, CV, phá»ng váº¥n hoáº·c lá»™ trÃ¬nh nghá» nghiá»‡p..."
        />
        <button type="button" onClick={() => void ask()} disabled={busy || !question.trim()}>
          {busy ? <Sparkles size={18} /> : <Send size={18} />}
          {busy ? 'Äang tráº£ lá»i' : 'Gá»­i'}
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
      <ThanhTinhNang />
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

// â”€â”€â”€ App root â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
const BangGiaNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/pricing/BangGiaNhaTuyenDungPage'))
const DashboardQuanTriVien = lazy(() => import('./pages/quantrivien/DashboardQuanTriVien'))
const QuanLyNguoiDung = lazy(() => import('./pages/quantrivien/QuanLyNguoiDung'))
const QuanLyCongTyAdmin = lazy(() => import('./pages/quantrivien/congty/QuanLyCongTyAdmin'))
const DuyetTinTuyenDungAdmin = lazy(() => import('./pages/quantrivien/tintuyendung/DuyetTinTuyenDungAdmin'))
const QuanLyKyNangAdmin = lazy(() => import('./pages/quantrivien/kynang/QuanLyKyNangAdmin'))
const QuanLyReviewCongTyAdmin = lazy(() => import('./pages/quantrivien/review/QuanLyReviewCongTyAdmin'))
const ChatUngVienPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatUngVienPage })))
const ChatNhaTuyenDungPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatNhaTuyenDungPage })))
const ChatAdminPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatAdminPage })))
const TrangDangXayDungPage = lazy(() => import('./pages/TrangDangXayDung'))

function RouteFallback() {
  return <div className="route-loading">Äang táº£i...</div>
}

export default function UngDung() {
  // âœ¨ Initialize real-time features
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
      <ThongBaoProvider>
        <ChatProvider>
          {/* âœ¨ Real-time UI Components */}
          <PWAInstallPrompt />
          <OfflineIndicator />
          <ThongBaoToastContainer />
      
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public routes vá»›i Header + Footer */}
        <Route element={<BoDinhTuyen />}>
          <Route path="/" element={<TrangChu />} />
          <Route path="/viec-lam" element={<TimKiemViecLam />} />
          <Route path="/viec-lam/:id" element={<ChiTietViecLam />} />
          <Route path="/cong-ty" element={<DanhSachCongTy />} />
          <Route path="/cong-ty/:id" element={<HoSoCongTy />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<TrangDangXayDungPage ten="BÃ i viáº¿t" />} />
          <Route path="/luong" element={<TrangDangXayDungPage ten="BÃ¡o cÃ¡o lÆ°Æ¡ng" />} />
          <Route path="/gioi-thieu" element={<TrangDangXayDungPage ten="Giá»›i thiá»‡u" />} />
          <Route path="/lien-he" element={<TrangDangXayDungPage ten="LiÃªn há»‡" />} />
          <Route path="/dieu-khoan" element={<TrangDangXayDungPage ten="Äiá»u khoáº£n" />} />
          <Route path="/bao-mat" element={<TrangDangXayDungPage ten="Báº£o máº­t" />} />
        </Route>

        {/* Auth routes (khÃ´ng cÃ³ Header/Footer) */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
        <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />

        {/* Dashboard á»©ng viÃªn */}
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

        {/* Dashboard nhÃ  tuyá»ƒn dá»¥ng */}
        <Route path="/nha-tuyen-dung" element={<DashboardShell vaiTro="nhatuyendung" />}>
          <Route index element={<DashboardNhaTuyenDung />} />
          <Route path="dashboard" element={<DashboardNhaTuyenDung />} />
          <Route path="quan-ly-tin" element={<QuanLyTinNhaTuyenDungPage />} />
          <Route path="tao-tin" element={<Navigate to="/nha-tuyen-dung/quan-ly-tin?new=1" replace />} />
          <Route path="ung-vien" element={<UngVienNhaTuyenDungPage />} />
          <Route path="lich-phong-van" element={<LichPhongVanNhaTuyenDungPage />} />
          <Route path="lich-phong-vaan" element={<Navigate to="/nha-tuyen-dung/lich-phong-van" replace />} />
          <Route path="hat" element={<Navigate to="/nha-tuyen-dung/chat" replace />} />
          <Route path="cong-ty" element={<CongTyNhaTuyenDungPage />} />
          <Route path="chat" element={<ChatNhaTuyenDungPage />} />
          <Route path="thong-bao" element={<ThongBaoNhaTuyenDungPage />} />
          <Route path="bang-gia" element={<BangGiaNhaTuyenDungPage />} />
        </Route>

        {/* Dashboard quáº£n trá»‹ viÃªn */}
        <Route path="/quan-tri" element={<DashboardShell vaiTro="quantrivien" />}>
          <Route path="dashboard" element={<DashboardQuanTriVien />} />
          <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
          <Route path="cong-ty" element={<QuanLyCongTyAdmin />} />
          <Route path="tin-tuyen-dung" element={<DuyetTinTuyenDungAdmin />} />
          <Route path="ky-nang" element={<QuanLyKyNangAdmin />} />
          <Route path="review" element={<QuanLyReviewCongTyAdmin />} />
          <Route path="chat" element={<ChatAdminPage />} />
        </Route>

        <Route path="*" element={<TrangDangXayDungPage ten="404 â€“ KhÃ´ng tÃ¬m tháº¥y" />} />
      </Routes>
      </Suspense>
        </ChatProvider>
      </ThongBaoProvider>
    </BrowserRouter>
  )
}

