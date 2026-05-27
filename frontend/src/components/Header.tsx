import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, User, Menu, X } from 'lucide-react'
import logoWeb from '../assets/logoweb.png'

// Tech logos marquee data
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

export default function Header() {
  const [menuMo, setMenuMo] = useState(false)

  return (
    <header className="site-header-rong">
      {/* Tech Stack Marquee */}
      <div style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(151,190,255,0.15)',
        overflow: 'hidden',
        height: 48,
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          animation: 'marquee-tech 30s linear infinite',
          gap: 40,
          paddingLeft: '0%',
        }}>
          {[...techLogos, ...techLogos, ...techLogos].map((tech, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              whiteSpace: 'nowrap',
              opacity: 0.85,
            }}>
              <img
                src={tech.icon}
                alt={tech.name}
                style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }}
              />
              <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-bar-rong">
        <Link to="/" className="brand">
          <img src={logoWeb} alt="ITJob" className="logo-thuonghieu" />
        </Link>

        <nav>
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/viec-lam">Việc làm IT</NavLink>
          <NavLink to="/cong-ty">Công ty</NavLink>
          <NavLink to="/luong">Báo cáo lương</NavLink>
          <NavLink to="/blog">Blog</NavLink>
        </nav>

        <div className="nav-actions-rong">
          <Link to="/nha-tuyen-dung/dashboard" className="nav-cta-rong">
            <span>Dành cho nhà tuyển dụng</span>
            <strong>Đăng tin tuyển dụng</strong>
          </Link>
          <button className="nav-icon-rong" aria-label="Thông báo">
            <Bell size={20} />
          </button>
          <Link to="/dang-nhap" className="nav-icon-rong" aria-label="Tài khoản">
            <User size={20} />
          </Link>
          <button
            className="menu-button"
            aria-label="Menu"
            onClick={() => setMenuMo(!menuMo)}
          >
            {menuMo ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuMo && (
        <div style={{
          background: 'rgba(4,14,40,0.98)',
          borderTop: '1px solid rgba(151,190,255,0.2)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {[
            { to: '/', label: 'Trang chủ' },
            { to: '/viec-lam', label: 'Việc làm IT' },
            { to: '/cong-ty', label: 'Công ty' },
            { to: '/luong', label: 'Báo cáo lương' },
            { to: '/blog', label: 'Blog' },
            { to: '/dang-nhap', label: 'Đăng nhập' },
            { to: '/dang-ky', label: 'Đăng ký' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{ color: '#dfebff', padding: '10px 0', fontWeight: 600 }}
              onClick={() => setMenuMo(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
