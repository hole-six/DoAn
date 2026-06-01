import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Search, Briefcase,
  TrendingUp, Star, FileText, Sparkles, ChevronRight,
  Award, Zap, Globe, Shield,
  ArrowRight, CheckCircle,
} from 'lucide-react'
import effortBg from './assets/EffortBackground.png'
import './ungdung.css'
import './pages/trangchu/trangchu-styles.css'
import './realtime.css'
import './components/chat-notification.css'

// ✨ Import Real-time Components
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import { khoiTaoSocket, ngatketnoisocket } from './lib/socket'
import { dangKyPushSubscription, langNgheNotificationClick as langNghePushClick } from './lib/pushNotifications'
import { ChatProvider } from './contexts/ChatContext'
import { ThongBaoProvider } from './contexts/ThongBaoContext'
import { ThongBaoToastContainer } from './components/ThongBaoCenter'
import { layAccessToken } from './lib/auth'

// ─── Dữ liệu tĩnh ────────────────────────────────────────────────────────────

const thongDiepChayNgang =
  '🔥 Hơn 12.000 việc làm IT đang tuyển · Lương Backend Senior lên đến 80 triệu · ' +
  'Mở CV ẩn danh – nhà tuyển dụng tìm bạn · Phỏng vấn thực tế mỗi tuần · ' +
  'Top công ty công nghệ đang tuyển gấp · Nộp hồ sơ chỉ 1 click · '

const tinhNangNoiBat: Array<{
  icon: React.ElementType
  label: string
  to: string
  badge?: string
  badgeLoai?: 'hot' | 'moi'
}> = [
  { icon: Briefcase,   label: 'Tìm việc thụ động',  to: '/candidate',         badge: 'HOT', badgeLoai: 'hot' },
  { icon: FileText,    label: 'Mẫu CV chuẩn IT',     to: '/candidate/profile' },
  { icon: Sparkles,    label: 'Story Hub',            to: '/blog',              badge: 'MỚI', badgeLoai: 'moi' },
  { icon: Star,        label: 'Review công ty',       to: '/companies' },
  { icon: TrendingUp,  label: 'Báo cáo lương IT',    to: '/salary' },
]

const nhaTuyenDung = [
  {
    id: 1,
    ten: 'Samsung Electronics HCMC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    logoBg: '#000000',
    diaDiem: 'TP Hồ Chí Minh',
    soViec: 2,
    kyNang: ['Embedded', 'Android', 'ReactJS', 'OOP', 'C++', 'Python'],
  },
  {
    id: 2,
    ten: 'FPT Software',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png',
    logoBg: '#ffffff',
    diaDiem: 'Hà Nội · TP.HCM · Đà Nẵng',
    soViec: 142,
    kyNang: ['Java', 'React', '.NET', 'Python', 'AWS', 'DevOps'],
  },
  {
    id: 3,
    ten: 'Viettel Group',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Viettel_logo_2021.svg',
    logoBg: '#ffffff',
    diaDiem: 'Hà Nội · TP Hồ Chí Minh',
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
    tieuDe: '[Đà Nẵng] Senior Backend Engineer (Node.js)',
    congTy: 'VNEXT SOFTWARE',
    logo: 'https://placehold.co/80x80/fff3e8/f97316?text=VN',
    diaDiem: 'Tại văn phòng · Đà Nẵng',
    luong: '30.000.000 - 45.000.000 VND',
    loaiViec: 'backend',
    kyNang: ['Node.js', 'PostgreSQL', 'Redis'],
    badge: 'SUPER HOT',
    ngayDang: '1 ngày trước',
    featured: true,
  },
  {
    id: 2,
    tieuDe: 'Frontend Engineer React/TypeScript',
    congTy: 'VisionTech Global',
    logo: 'https://placehold.co/80x80/e0f2fe/2563eb?text=VT',
    diaDiem: 'Làm từ xa · TP Hồ Chí Minh',
    luong: '25.000.000 - 38.000.000 VND',
    loaiViec: 'frontend',
    kyNang: ['React', 'TypeScript', 'Tailwind CSS'],
    badge: 'SUPER HOT',
    ngayDang: '3 ngày trước',
    featured: true,
  },
  {
    id: 3,
    tieuDe: '[Remote] DevOps Engineer (AWS/Kubernetes)',
    congTy: 'Edge8',
    logo: 'https://placehold.co/80x80/111827/ffffff?text=E8',
    diaDiem: 'Làm từ xa · Hà Nội',
    luong: '35.000.000 - 55.000.000 VND',
    loaiViec: 'devops',
    kyNang: ['AWS', 'Kubernetes', 'CI/CD'],
    badge: null,
    ngayDang: '4 ngày trước',
    featured: false,
  },
  {
    id: 4,
    tieuDe: 'Senior Full-stack Developer (React/Node.js)',
    congTy: 'CodeLink',
    logo: 'https://placehold.co/80x80/ecfeff/0891b2?text=CL',
    diaDiem: 'Linh hoạt · TP Hồ Chí Minh',
    luong: '32.000.000 - 48.000.000 VND',
    loaiViec: 'fullstack',
    kyNang: ['React', 'Node.js', 'MongoDB'],
    badge: 'HOT',
    ngayDang: '13 ngày trước',
    featured: false,
  },
]



const lyDo = [
  { icon: Zap,          tieu: 'Ứng tuyển siêu nhanh',    mo: 'Chỉ 1 click để nộp hồ sơ. Hệ thống tự điền thông tin từ CV của bạn.' },
  { icon: Shield,       tieu: 'CV ẩn danh bảo mật',      mo: 'Bật chế độ tìm việc thụ động. Nhà tuyển dụng tìm bạn mà không lộ danh tính.' },
  { icon: Globe,        tieu: 'Mạng lưới rộng khắp',     mo: 'Kết nối với 3.200+ công ty từ startup đến tập đoàn đa quốc gia.' },
  { icon: CheckCircle,  tieu: 'Xác thực công ty',         mo: 'Mọi nhà tuyển dụng đều được xác minh. Không lo lừa đảo, không lo mất thời gian.' },
  { icon: TrendingUp,   tieu: 'Báo cáo lương thực tế',   mo: 'Dữ liệu lương từ 50.000+ lập trình viên. Biết giá trị thực của bạn trên thị trường.' },
  { icon: Award,        tieu: 'Hỗ trợ phỏng vấn',        mo: 'Câu hỏi phỏng vấn thực tế, tips từ senior developer, mock interview online.' },
]

// ─── Brand ───────────────────────────────────────────────────────────────────

// ─── Header + Brand ───────────────────────────────────────────────────────────
// (moved to components/Header.tsx)

// ─── Hero trang chủ ───────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

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
              congTy: job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
              logo: job.nhaTuyenDung?.logo || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
              diaDiem: job.diaChi ?? 'Đà Nẵng',
              luong: job.luongMin || job.luongMax ? `${job.luongMin?.toLocaleString('vi-VN') ?? '?'} - ${job.luongMax?.toLocaleString('vi-VN') ?? '?'} VND` : 'Thỏa thuận',
              loaiViec: job.loaiHinh ?? 'toan_thoi_gian',
              kyNang: (job.kyNang ?? []).map((skill: any) => skill.tenKyNang ?? skill.maKyNang?.tenKyNang).filter(Boolean).slice(0, 4),
              badge: index < 2 ? 'HOT' : null,
              ngayDang: job.ngayDang ? new Date(job.ngayDang).toLocaleDateString('vi-VN') : 'Mới đăng',
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
          </label>
          <button className="primary-button large" onClick={timKiem}>
            <Search size={18} />
            Tìm kiếm
          </button>
          {searchActive && (
            <SearchSuggestionPanel groups={groups} loading={loading} query={tuKhoa} onSelect={chonGoiY} />
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
          <span className="bang-chay-icon">🔥</span>
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

// ─── Thống kê ─────────────────────────────────────────────────────────────────



// ─── Nhà tuyển dụng nổi bật ───────────────────────────────────────────────────

function SectionNhaTuyenDung({ companies }: { companies?: HomeCompany[] }) {
  const items = companies?.length ? companies : nhaTuyenDung.map(item => ({ ...item, id: String(item.id) }))
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Đối tác tuyển dụng</p>
          <h2>Nhà tuyển dụng hàng đầu</h2>
          <p>Các công ty công nghệ lớn nhất Việt Nam đang tuyển dụng tích cực</p>
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
                <span>{cty.soViec} Việc làm</span>
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
  const items = jobs?.length ? jobs : tinTuyenDung.map(item => ({ ...item, id: String(item.id) }))
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
              <span className={`vl-badge${tin.badge === 'SUPER HOT' ? ' vl-badge--super' : ''}`}>
                {nhanBadge(tin.badge)}
              </span>
            )}

            <p className="vl-time">Đăng {tin.ngayDang}</p>
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
          <p className="eyebrow">Công nghệ phổ biến</p>
          <h2>Kỹ năng được tuyển dụng nhiều nhất</h2>
          <p>Các công nghệ hàng đầu mà nhà tuyển dụng đang tìm kiếm</p>
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

// ─── Tại sao chọn ITJob ───────────────────────────────────────────────────────

function SectionLyDo() {
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Tại sao chọn ITJob</p>
          <h2>Nền tảng được tin dùng bởi<br />hàng trăm nghìn lập trình viên</h2>
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

// ─── CTA ─────────────────────────────────────────────────────────────────────

function SectionCTA() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div
        className="dashboard-hero"
        style={{ borderRadius: 24, marginTop: 0 }}
      >
        <div>
          <p className="eyebrow">Bắt đầu ngay hôm nay</p>
          <h2>Sẵn sàng bước vào<br />cơ hội tiếp theo?</h2>
          <p>Tạo hồ sơ miễn phí, kết nối với nhà tuyển dụng và nhận offer trong 7 ngày.</p>
          <div className="detail-actions" style={{ border: 0, padding: '20px 0 0' }}>
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

// ─── Trang chủ ────────────────────────────────────────────────────────────────

function TrangChu() {
  const data = useTrangChuData()

  return (
    <main className="app-page">
      <HeroTrangChu />
      <ThanhTinhNang />
      <SectionNhaTuyenDung companies={data.companies} />
      <SectionTinTuyenDung jobs={data.jobs} />
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
const PortfolioGeneratorPage = lazy(() => import('./pages/ungvien/PortfolioGenerator'))
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
  return <div className="route-loading">Dang tai...</div>
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
        <Route path="/quen-mat-khau" element={<TrangDangXayDungPage ten="Quên mật khẩu" />} />

        {/* Dashboard ứng viên */}
        <Route path="/ung-vien" element={<DashboardShell vaiTro="ungvien" />}>
          <Route index element={<DashboardUngVien />} />
          <Route path="ho-so" element={<HoSoUngVienPage />} />
          <Route path="portfolio" element={<PortfolioGeneratorPage />} />
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
          <Route path="quan-ly-tin" element={<QuanLyTinNhaTuyenDungPage />} />
          <Route path="tao-tin" element={<Navigate to="/nha-tuyen-dung/quan-ly-tin?new=1" replace />} />
          <Route path="ung-vien" element={<UngVienNhaTuyenDungPage />} />
          <Route path="lich-phong-van" element={<LichPhongVanNhaTuyenDungPage />} />
          <Route path="lich-phong-vaan" element={<Navigate to="/nha-tuyen-dung/lich-phong-van" replace />} />
          <Route path="cong-ty" element={<CongTyNhaTuyenDungPage />} />
          <Route path="chat" element={<ChatNhaTuyenDungPage />} />
          <Route path="thong-bao" element={<ThongBaoNhaTuyenDungPage />} />
          <Route path="bang-gia" element={<BangGiaNhaTuyenDungPage />} />
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
        </Route>

        <Route path="*" element={<TrangDangXayDungPage ten="404 – Không tìm thấy" />} />
      </Routes>
      </Suspense>
        </ChatProvider>
      </ThongBaoProvider>
    </BrowserRouter>
  )
}
