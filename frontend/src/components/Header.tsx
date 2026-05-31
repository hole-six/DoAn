import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react'
import logoWeb from '../assets/logoweb.png'
import { duongDanTheoVaiTro, layNguoiDung, xoaPhienDangNhap } from '../lib/auth'
import AppIcon from './AppIcon'
import { ThongBaoCenter } from './ThongBaoCenter'

const techLogos = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
  { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
  { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
  { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
  { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
]

const vaiTroLabel = {
  ung_vien: 'Ứng viên',
  nha_tuyen_dung: 'Nhà tuyển dụng',
  admin: 'Quản trị viên',
} as const

export default function Header() {
  const [menuMo, setMenuMo] = useState(false)
  const [nguoiDung, setNguoiDung] = useState(layNguoiDung())

  useEffect(() => {
    const capNhat = () => setNguoiDung(layNguoiDung())
    window.addEventListener('storage', capNhat)
    window.addEventListener('itjob-auth-change', capNhat)
    return () => {
      window.removeEventListener('storage', capNhat)
      window.removeEventListener('itjob-auth-change', capNhat)
    }
  }, [])

  const dashboardPath = nguoiDung ? duongDanTheoVaiTro[nguoiDung.vaiTro] : '/dang-nhap'
  const tenHienThi = nguoiDung?.hoTen?.trim() || nguoiDung?.email || 'Tài khoản'

  const actionTheoVaiTro = !nguoiDung
    ? { to: '/dang-nhap', eyebrow: 'Dành cho nhà tuyển dụng', label: 'Đăng tin tuyển dụng' }
    : nguoiDung.vaiTro === 'nha_tuyen_dung'
      ? { to: '/nha-tuyen-dung/tao-tin', eyebrow: 'Nhà tuyển dụng', label: 'Đăng tin tuyển dụng' }
      : nguoiDung.vaiTro === 'admin'
        ? { to: '/quan-tri/dashboard', eyebrow: 'Quản trị hệ thống', label: 'Vào admin' }
        : { to: '/ung-vien', eyebrow: 'Ứng viên', label: 'Hồ sơ của tôi' }

  const dangXuat = () => {
    xoaPhienDangNhap()
    setNguoiDung(null)
    setMenuMo(false)
  }

  const mobileLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/viec-lam', label: 'Việc làm IT' },
    { to: '/cong-ty', label: 'Công ty' },
    { to: '/luong', label: 'Báo cáo lương' },
    { to: '/blog', label: 'Blog' },
    actionTheoVaiTro,
    ...(nguoiDung
      ? [{ to: dashboardPath, label: `Dashboard ${vaiTroLabel[nguoiDung.vaiTro]}` }]
      : [
          { to: '/dang-nhap', label: 'Đăng nhập' },
          { to: '/dang-ky', label: 'Đăng ký' },
        ]),
  ]

  return (
    <header className="site-header-rong">
      <div className="tech-strip-rong" aria-hidden="true">
        <div className="tech-strip-track">
          {[...techLogos, ...techLogos].map((tech, idx) => (
            <div key={`${tech.name}-${idx}`} className="tech-strip-item">
              <img src={tech.icon} alt="" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-bar-rong">
        <Link to="/" className="brand" aria-label="ITJob">
          <img src={logoWeb} alt="ITJob" className="logo-thuonghieu" />
        </Link>

        <nav aria-label="Điều hướng chính">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/viec-lam">Việc làm IT</NavLink>
          <NavLink to="/cong-ty">Công ty</NavLink>
          <NavLink to="/luong">Báo cáo lương</NavLink>
          <NavLink to="/blog">Blog</NavLink>
        </nav>

        <div className="nav-actions-rong">
          <Link to={actionTheoVaiTro.to} className="nav-cta-rong">
            <span>{actionTheoVaiTro.eyebrow}</span>
            <strong>{actionTheoVaiTro.label}</strong>
          </Link>

          {nguoiDung ? (
            <>
              <div className="nav-notification-rong">
                <ThongBaoCenter />
              </div>
              <Link to={dashboardPath} className="nav-user-rong" title={tenHienThi}>
                <span className="avatar-rong">{tenHienThi.slice(0, 2).toUpperCase()}</span>
                <span>
                  <small>{vaiTroLabel[nguoiDung.vaiTro]}</small>
                  <strong>{tenHienThi}</strong>
                </span>
              </Link>
              <button className="nav-icon-rong" aria-label="Đăng xuất" onClick={dangXuat} title="Đăng xuất">
                <AppIcon icon={LogOut} size={19} />
              </button>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="nav-pill-rong">
                <AppIcon icon={LogIn} size={17} />
                Đăng nhập
              </Link>
              <Link to="/dang-ky" className="nav-pill-rong strong">
                <AppIcon icon={UserPlus} size={17} />
                Đăng ký
              </Link>
            </>
          )}

          <button className="menu-button" aria-label="Menu" onClick={() => setMenuMo(!menuMo)}>
            <AppIcon icon={menuMo ? X : Menu} size={20} />
          </button>
        </div>
      </div>

      {menuMo && (
        <div className="mobile-menu-rong">
          {mobileLinks.map(item => (
            <Link key={`${item.to}-${item.label}`} to={item.to} onClick={() => setMenuMo(false)}>
              {item.label}
            </Link>
          ))}
          {nguoiDung && (
            <button onClick={dangXuat}>
              <AppIcon icon={LogOut} size={17} />
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </header>
  )
}
