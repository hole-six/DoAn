import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import dangKyImg from '../../assets/dangky.png'

export default function DangKy() {
  const [vaiTro, setVaiTro] = useState<'ungvien' | 'nhatuyendung'>('ungvien')
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', matKhau: '', xacNhanMatKhau: '' })
  const navigate = useNavigate()

  const cap = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const xuLy = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dang-nhap')
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src={dangKyImg} alt="Đăng ký ITJob" />
        <div>
          <Link to="/" style={{ color: '#dbeafe', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          <Link to="/" className="brand" style={{ marginBottom: 32, display: 'block' }}>
            <img src={logoWeb} alt="ITJob" style={{ height: 48, objectFit: 'contain' }} />
          </Link>
          <h1>Bắt đầu hành trình</h1>
          <p>Tạo tài khoản miễn phí và kết nối với hàng nghìn cơ hội IT hàng đầu Việt Nam.</p>
        </div>
      </div>

      <div className="auth-panel">
        <p className="eyebrow">Đăng ký</p>
        <h1>Tạo tài khoản</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Đã có tài khoản? <Link to="/dang-nhap" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Đăng nhập</Link>
        </p>

        <div className="role-tabs">
          <button className={vaiTro === 'ungvien' ? 'active' : ''} onClick={() => setVaiTro('ungvien')}>
            Ứng viên
          </button>
          <button className={vaiTro === 'nhatuyendung' ? 'active' : ''} onClick={() => setVaiTro('nhatuyendung')}>
            Nhà tuyển dụng
          </button>
        </div>

        <form className="form-grid" onSubmit={xuLy}>
          <label>
            HỌ VÀ TÊN
            <span><User size={16} /><input type="text" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={cap('hoTen')} required /></span>
          </label>
          <label>
            EMAIL
            <span><Mail size={16} /><input type="email" placeholder="email@example.com" value={form.email} onChange={cap('email')} required /></span>
          </label>
          <label>
            SỐ ĐIỆN THOẠI
            <span><Phone size={16} /><input type="tel" placeholder="0901234567" value={form.soDienThoai} onChange={cap('soDienThoai')} /></span>
          </label>
          <label>
            MẬT KHẨU
            <span><Lock size={16} /><input type="password" placeholder="Tối thiểu 8 ký tự" value={form.matKhau} onChange={cap('matKhau')} required /></span>
          </label>
          <label>
            XÁC NHẬN MẬT KHẨU
            <span><Lock size={16} /><input type="password" placeholder="Nhập lại mật khẩu" value={form.xacNhanMatKhau} onChange={cap('xacNhanMatKhau')} required /></span>
          </label>
          <button type="submit" className="primary-button large" style={{ marginTop: 8 }}>
            Tạo tài khoản miễn phí
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 16, textAlign: 'center' }}>
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Link to="/dieu-khoan" style={{ color: 'var(--secondary)' }}>Điều khoản sử dụng</Link> và{' '}
          <Link to="/bao-mat" style={{ color: 'var(--secondary)' }}>Chính sách bảo mật</Link>
        </p>
      </div>
    </div>
  )
}
