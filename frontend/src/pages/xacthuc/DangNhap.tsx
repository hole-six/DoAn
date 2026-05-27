import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import dangNhapImg from '../../assets/dangnhap.png'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const vaiTroApi = {
  ungvien: 'ung_vien',
  nhatuyendung: 'nha_tuyen_dung',
  quantrivien: 'admin',
} as const

const duongDanTheoVaiTro = {
  ung_vien: '/ung-vien',
  nha_tuyen_dung: '/nha-tuyen-dung/dashboard',
  admin: '/quan-tri/dashboard',
} as const

const taiKhoanMau = {
  ungvien: { email: 'ungvien@itjob.vn', matKhau: '123456' },
  nhatuyendung: { email: 'nhatuyendung@itjob.vn', matKhau: '123456' },
  quantrivien: { email: 'admin@itjob.vn', matKhau: '123456' },
} as const

export default function DangNhap() {
  const [email, setEmail] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [vaiTro, setVaiTro] = useState<'ungvien' | 'nhatuyendung' | 'quantrivien'>('ungvien')
  const [dangXuLy, setDangXuLy] = useState(false)
  const [loi, setLoi] = useState('')
  const navigate = useNavigate()

  const xuLyDangNhap = async (e: React.FormEvent) => {
    e.preventDefault()
    setDangXuLy(true)
    setLoi('')

    try {
      const phanHoi = await fetch(`${API_URL}/xacthuc/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          matKhau,
          vaiTro: vaiTroApi[vaiTro],
        }),
      })
      const ketQua = await phanHoi.json()

      if (!phanHoi.ok) {
        throw new Error(ketQua.thongBao ?? 'Dang nhap that bai')
      }

      localStorage.setItem('itjob_token', ketQua.duLieu.token)
      localStorage.setItem('itjob_nguoidung', JSON.stringify(ketQua.duLieu.nguoiDung))
      navigate(duongDanTheoVaiTro[ketQua.duLieu.nguoiDung.vaiTro as keyof typeof duongDanTheoVaiTro])
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Dang nhap that bai')
    } finally {
      setDangXuLy(false)
    }
  }

  const chonVaiTro = (role: typeof vaiTro) => {
    setVaiTro(role)
    setEmail(taiKhoanMau[role].email)
    setMatKhau(taiKhoanMau[role].matKhau)
    setLoi('')
  }

  return (
    <div className="auth-page">
      {/* Visual side */}
      <div className="auth-visual">
        <img
          src={dangNhapImg}
          alt="Đăng nhập ITJob"
        />
        <div>
          <Link to="/" style={{ color: '#dbeafe', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          <Link to="/" className="brand" style={{ marginBottom: 32, display: 'block' }}>
            <img src={logoWeb} alt="ITJob" style={{ height: 48, objectFit: 'contain' }} />
          </Link>
          <h1>Chào mừng trở lại</h1>
          <p>Đăng nhập để tiếp tục hành trình sự nghiệp IT của bạn. Hơn 12.000 cơ hội đang chờ.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-panel">
        <p className="eyebrow">Đăng nhập</p>
        <h1>Tiếp tục hành trình</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Chưa có tài khoản? <Link to="/dang-ky" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Đăng ký miễn phí</Link>
        </p>

        {/* Role tabs */}
        <div className="role-tabs">
          {(['ungvien', 'nhatuyendung', 'quantrivien'] as const).map(r => (
            <button
              key={r}
              className={vaiTro === r ? 'active' : ''}
              onClick={() => chonVaiTro(r)}
            >
              {r === 'ungvien' ? 'Ứng viên' : r === 'nhatuyendung' ? 'Nhà tuyển dụng' : 'Quản trị viên'}
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 14,
          border: '1px solid #dbe4f0',
          background: '#f8fafc',
          borderRadius: 8,
          padding: '12px 14px',
          color: '#475569',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: '#0b1c30' }}>Tài khoản seed:</strong>{' '}
          {taiKhoanMau[vaiTro].email} / {taiKhoanMau[vaiTro].matKhau}
        </div>

        <form className="form-grid" onSubmit={xuLyDangNhap}>
          <label>
            EMAIL
            <span>
              <Mail size={16} />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </span>
          </label>

          <label>
            MẬT KHẨU
            <span>
              <Lock size={16} />
              <input
                type={hienMatKhau ? 'text' : 'password'}
                placeholder="••••••••"
                value={matKhau}
                onChange={e => setMatKhau(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setHienMatKhau(!hienMatKhau)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline-strong)', padding: 0 }}
              >
                {hienMatKhau ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {loi && (
            <div style={{
              border: '1px solid rgba(225, 29, 72, 0.24)',
              background: 'rgba(225, 29, 72, 0.08)',
              color: '#be123c',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 700,
            }}>
              {loi}
            </div>
          )}

          <button type="submit" className="primary-button large" style={{ marginTop: 8 }} disabled={dangXuLy}>
            {dangXuLy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-switch">
          <Link to="/quen-mat-khau" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Quên mật khẩu?</Link>
          <Link to="/dang-ky" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  )
}
