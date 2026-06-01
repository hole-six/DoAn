import { Link } from 'react-router-dom'
import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import logoWeb from '../assets/logoweb.png'

const danhMucKyNang = ['Frontend', 'Backend', 'DevOps', 'Data', 'Mobile', 'QA']

export default function Footer() {
  return (
    <footer className="footer footer-home">
      <div className="footer-top">
        <div className="footer-brand-block">
          <Link to="/" className="brand">
            <img src={logoWeb} alt="ITJob Vietnam" className="logo-thuonghieu footer-logo" />
          </Link>
          <p className="footer-brand-copy">
            Nền tảng kết nối kỹ sư phần mềm với doanh nghiệp công nghệ uy tín tại Việt Nam.
          </p>
          <div className="footer-skill-row">
            {danhMucKyNang.map((muc) => (
              <span key={muc}>{muc}</span>
            ))}
          </div>
          <div className="footer-social-row">
            <a href="#" aria-label="Website">
              <Globe size={18} />
            </a>
            <a href="#" aria-label="Blog">
              <Globe size={18} />
            </a>
            <a href="mailto:contact@itjob.vn" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <section>
            <h3>Ứng viên</h3>
            <Link to="/viec-lam">Tìm việc IT</Link>
            <Link to="/ung-vien/ho-so">Tạo CV</Link>
            <Link to="/blog">Cẩm nang nghề nghiệp</Link>
            <Link to="/luong">Báo cáo lương</Link>
          </section>
          <section>
            <h3>Nhà tuyển dụng</h3>
            <Link to="/nha-tuyen-dung">Đăng tuyển</Link>
            <Link to="/nha-tuyen-dung/ung-vien">Tìm ứng viên</Link>
            <Link to="/nha-tuyen-dung/bang-gia">Bảng giá</Link>
            <Link to="/cong-ty">Danh sách công ty</Link>
          </section>
          <section>
            <h3>Liên hệ</h3>
            <p><MapPin size={16} /> Đà Nẵng, Việt Nam</p>
            <p><Phone size={16} /> (+84) 905 123 456</p>
            <p><Mail size={16} /> contact@itjob.vn</p>
          </section>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 ITJob Vietnam · All rights reserved.
      </div>
    </footer>
  )
}
