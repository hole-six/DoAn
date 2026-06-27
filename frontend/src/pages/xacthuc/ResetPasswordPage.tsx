import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import { API_URL } from '../../lib/env'
import './forgot-password.css'
import './reset-password.css'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [matKhau, setMatKhau] = useState('')
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('')
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [hienXacNhan, setHienXacNhan] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [thanhCong, setThanhCong] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (matKhau !== xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/xacthuc/dat-lai-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, matKhauMoi: matKhau }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.thongBao ?? 'Không thể đặt lại mật khẩu.')
      setThanhCong(true)
      setMessage(result.thongBao ?? 'Mật khẩu đã được đặt lại thành công.')
      setTimeout(() => navigate('/dang-nhap'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="forgot-page reset-page">
      <section className="forgot-card reset-card" aria-labelledby="reset-title">
        <div className="forgot-topbar">
          <Link to="/dang-nhap" className="forgot-back">
            <ArrowLeft size={17} />
            <span>Đăng nhập</span>
          </Link>
          <img src={logoWeb} alt="Effort Job" className="forgot-logo" />
        </div>

        <div className="forgot-heading reset-heading">
          <span className="forgot-icon">
            <KeyRound size={22} />
          </span>
          <p>Đặt lại mật khẩu</p>
          <h1 id="reset-title">Tạo mật khẩu mới</h1>
          <span>Nhập mật khẩu mới cho tài khoản của bạn. Mật khẩu phải có ít nhất 6 ký tự.</span>
        </div>

        {!token && (
          <div className="forgot-alert forgot-alert-error">
            <span>Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng <Link to="/quen-mat-khau">yêu cầu lại</Link>.</span>
          </div>
        )}

        {thanhCong ? (
          <div className="forgot-alert forgot-alert-success">
            <CheckCircle2 size={18} />
            <span>{message} Đang chuyển về trang đăng nhập...</span>
          </div>
        ) : (
          <form className="forgot-form reset-form" onSubmit={submit}>
            <div>
              <label htmlFor="reset-password">Mật khẩu mới</label>
              <div className="forgot-input reset-input" style={{ gridTemplateColumns: '22px minmax(0,1fr) 22px' }}>
                <KeyRound size={18} />
                <input
                  id="reset-password"
                  type={hienMatKhau ? 'text' : 'password'}
                  value={matKhau}
                  onChange={e => setMatKhau(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setHienMatKhau(prev => !prev)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm">Xác nhận mật khẩu</label>
              <div className="forgot-input reset-input" style={{ gridTemplateColumns: '22px minmax(0,1fr) 22px' }}>
                <ShieldCheck size={18} />
                <input
                  id="reset-confirm"
                  type={hienXacNhan ? 'text' : 'password'}
                  value={xacNhanMatKhau}
                  onChange={e => setXacNhanMatKhau(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setHienXacNhan(prev => !prev)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  aria-label={hienXacNhan ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {hienXacNhan ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="forgot-alert forgot-alert-error">
                <span>{error}</span>
              </div>
            )}

            <button className="forgot-submit" disabled={loading || !token}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <p className="forgot-note">
          Nhớ mật khẩu rồi? <Link to="/dang-nhap">Quay lại đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}
