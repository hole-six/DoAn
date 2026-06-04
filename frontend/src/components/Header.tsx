import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react'
import logoWeb from '../assets/logodai.png'
import { duongDanTheoVaiTro, layNguoiDung, xoaPhienDangNhap } from '../lib/auth'
import AppIcon from './AppIcon'
import { ThongBaoCenter } from './ThongBaoCenter'
import './header.css'
import './header-mobile-fix.css'

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
  ung_vien: 'á»¨ng viÃªn',
  nha_tuyen_dung: 'NhÃ  tuyá»ƒn dá»¥ng',
  admin: 'Quáº£n trá»‹ viÃªn',
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

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open-rong', menuMo)
    return () => document.body.classList.remove('mobile-menu-open-rong')
  }, [menuMo])

  const dashboardPath = nguoiDung ? duongDanTheoVaiTro[nguoiDung.vaiTro] : '/dang-nhap'
  const tenHienThi = nguoiDung?.hoTen?.trim() || nguoiDung?.email || 'TÃ i khoáº£n'

  const actionTheoVaiTro = !nguoiDung
    ? { to: '/dang-nhap', eyebrow: 'DÃ nh cho nhÃ  tuyá»ƒn dá»¥ng', label: 'ÄÄƒng tin tuyá»ƒn dá»¥ng' }
    : nguoiDung.vaiTro === 'nha_tuyen_dung'
      ? { to: '/nha-tuyen-dung/tao-tin', eyebrow: 'NhÃ  tuyá»ƒn dá»¥ng', label: 'ÄÄƒng tin tuyá»ƒn dá»¥ng' }
      : nguoiDung.vaiTro === 'admin'
        ? { to: '/quan-tri/dashboard', eyebrow: 'Quáº£n trá»‹ há»‡ thá»‘ng', label: 'VÃ o admin' }
        : { to: '/ung-vien', eyebrow: 'á»¨ng viÃªn', label: 'Há»“ sÆ¡ cá»§a tÃ´i' }

  const dangXuat = () => {
    xoaPhienDangNhap()
    setNguoiDung(null)
    setMenuMo(false)
  }

  const mobileLinks = [
    { to: '/', label: 'Trang chá»§' },
    { to: '/viec-lam', label: 'Viá»‡c lÃ m IT' },
    { to: '/cong-ty', label: 'CÃ´ng ty' },
    actionTheoVaiTro,
    ...(nguoiDung
      ? [{ to: dashboardPath, label: `Dashboard ${vaiTroLabel[nguoiDung.vaiTro]}` }]
      : [
          { to: '/dang-nhap', label: 'ÄÄƒng nháº­p' },
          { to: '/dang-ky', label: 'ÄÄƒng kÃ½' },
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
        <button className="menu-button" aria-label="Menu" onClick={() => setMenuMo(!menuMo)}>
          <AppIcon icon={menuMo ? X : Menu} size={20} />
        </button>

        <Link to="/" className="brand" aria-label="Effort Job">
          <img src={logoWeb} alt="Effort Job" className="logo-thuonghieu" />
        </Link>

        <nav aria-label="Äiá»u hÆ°á»›ng chÃ­nh">
          <NavLink to="/" end>Trang chá»§</NavLink>
          <NavLink to="/viec-lam">Viá»‡c lÃ m IT</NavLink>
          <NavLink to="/cong-ty">CÃ´ng ty</NavLink>
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
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="nav-pill-rong">
                <AppIcon icon={LogIn} size={17} />
                <span>ÄÄƒng nháº­p</span>
              </Link>
              <Link to="/dang-ky" className="nav-pill-rong strong">
                <AppIcon icon={UserPlus} size={17} />
                <span>ÄÄƒng kÃ½</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {menuMo && (
        <>
          <button
            className="mobile-menu-backdrop-rong"
            type="button"
            aria-label="ÄÃ³ng menu"
            onClick={() => setMenuMo(false)}
          />
          <div className="mobile-menu-rong">
          {mobileLinks.map(item => (
            <Link key={`${item.to}-${item.label}`} to={item.to} onClick={() => setMenuMo(false)}>
              {item.label}
            </Link>
          ))}
          {nguoiDung && (
            <button onClick={dangXuat}>
              <AppIcon icon={LogOut} size={18} />
              ÄÄƒng xuáº¥t
            </button>
          )}
          </div>
        </>
      )}
    </header>
  )
}

