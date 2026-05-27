import { Link } from 'react-router-dom'
import logoWeb from '../assets/logoweb.png'

const techStack = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#61dafb' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', color: '#3178c6' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', color: '#339933' },
  { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', color: '#ffffff' },
  { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', color: '#4169e1' },
  { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: '#2496ed' },
  { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', color: '#f05032' },
  { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', color: '#646cff' },
]

export default function Footer() {
  return (
    <footer className="footer">
      {/* Tech Stack Marquee */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderTop: '1px solid rgba(151,190,255,0.2)',
        borderBottom: '1px solid rgba(151,190,255,0.2)',
        overflow: 'hidden',
        padding: '20px 0',
        marginBottom: 40,
      }}>
        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Powered by Modern Tech Stack
        </p>
        <div style={{
          display: 'flex',
          animation: 'marquee-tech 25s linear infinite',
          gap: 50,
          paddingLeft: '100%',
        }}>
          {[...techStack, ...techStack, ...techStack].map((tech, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minWidth: 60,
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
              }}>
                <img
                  src={tech.icon}
                  alt={tech.name}
                  style={{
                    width: 32,
                    height: 32,
                    filter: tech.name === 'Express' ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </div>
              <span style={{
                color: tech.color,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-grid">
        <div>
          <Link to="/" className="brand">
            <img src={logoWeb} alt="ITJob" className="logo-thuonghieu" style={{ height: 40 }} />
          </Link>
          <p style={{ marginTop: 14, color: '#cbd5e1', lineHeight: 1.7 }}>
            Nền tảng tuyển dụng IT hàng đầu Việt Nam.<br />
            Kết nối lập trình viên với cơ hội tốt nhất.
          </p>
        </div>
        <div>
          <h3>Ứng viên</h3>
          <Link to="/viec-lam">Tìm việc làm</Link>
          <Link to="/ung-vien/ho-so">Tạo CV</Link>
          <Link to="/luong">Báo cáo lương</Link>
          <Link to="/blog">Blog IT</Link>
        </div>
        <div>
          <h3>Nhà tuyển dụng</h3>
          <Link to="/nha-tuyen-dung">Đăng tin</Link>
          <Link to="/nha-tuyen-dung/ung-vien">Tìm ứng viên</Link>
          <Link to="/nha-tuyen-dung/bang-gia">Bảng giá</Link>
        </div>
        <div>
          <h3>Về chúng tôi</h3>
          <Link to="/gioi-thieu">Giới thiệu</Link>
          <Link to="/lien-he">Liên hệ</Link>
          <Link to="/dieu-khoan">Điều khoản</Link>
          <Link to="/bao-mat">Bảo mật</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 ITJob Vietnam. Bảo lưu mọi quyền.
      </div>
    </footer>
  )
}
