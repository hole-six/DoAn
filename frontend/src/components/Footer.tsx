import { Link } from 'react-router-dom'
import { Globe, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import logoWeb from '../assets/logoweb.png'

const danhMucKyNang = ['Frontend', 'Backend', 'DevOps', 'Data', 'Mobile', 'QA']

export default function Footer() {
  return (
    <footer className="footer footer-home">
      <div className="footer-top">
        <div className="footer-brand-block">
          <Link to="/" className="brand" aria-label="Effort Job">
            <img src={logoWeb} alt="Effort Job" className="logo-thuonghieu footer-logo" />
          </Link>
          <p className="footer-brand-copy">
            Nền tảng tuyển dụng IT tại Đà Nẵng, kết nối ứng viên có CV rõ ràng với doanh nghiệp công nghệ đã được kiểm duyệt.
          </p>
          <div className="footer-author">
            <UserRound size={18} />
            <span>Tác giả</span>
            <strong>Lê Hòa</strong>
          </div>
          <div className="footer-skill-row">
            {danhMucKyNang.map(muc => (
              <span key={muc}>{muc}</span>
            ))}
          </div>
          <div className="footer-social-row">
            <a href="https://effortit.site" aria-label="Website">
              <Globe size={18} />
            </a>
            <a href="mailto:contact@effortit.site" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <section>
            <h3>Ứng viên</h3>
            <Link to="/viec-lam">Tìm việc IT</Link>
            <Link to="/cong-ty">Khám phá công ty</Link>
            <Link to="/ung-vien/ho-so">Tạo CV</Link>
            <Link to="/dang-ky">Đăng ký ứng viên</Link>
          </section>
          <section>
            <h3>Nhà tuyển dụng</h3>
            <Link to="/dang-ky">Đăng ký công ty</Link>
            <Link to="/nha-tuyen-dung/cong-ty">Thông tin công ty</Link>
            <Link to="/nha-tuyen-dung/quan-ly-tin">Quản lý tin</Link>
            <Link to="/nha-tuyen-dung/bang-gia">Bảng giá</Link>
          </section>
          <section>
            <h3>Liên hệ</h3>
            <p><MapPin size={16} /> Đà Nẵng, Việt Nam</p>
            <p><Phone size={16} /> 0336487534</p>
            <p><Mail size={16} /> contact@effortit.site</p>
          </section>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Effort Job · Thiết kế và phát triển bởi Lê Hòa.
      </div>
    </footer>
  )
}
