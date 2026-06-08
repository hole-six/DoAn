import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import { API_URL } from '../../lib/env'
import './auth-styles.css'
import './forgot-password.css'
import './reset-password.css'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [matKhau, setMatKhau] = useState('')
  const [xacNhan, setXacNhan] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(Boolean(token))

  const tokenKhongDung = useMemo(() => Boolean(error && !message), [error, message])

  useEffect(() => {
    if (!token) {
      setError('Thiếu token đặt lại mật khẩu.')
      setValidating(false)
      return
    }
    fetch(`${API_URL}/xacthuc/dat-lai-mat-khau/${encodeURIComponent(token)}`)
      .then(async response => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.thongBao ?? 'Token không hợp lệ hoặc đã hết hạn.')
        setMessage(result.duLieu?.email ? `Đang đặt lại mật khẩu cho ${result.duLieu.email}.` : 'Token hợp lệ.')
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Token không hợp lệ hoặc đã hết hạn.'))
      .finally(() => setValidating(false))
  }, [token])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (matKhau !== xacNhan) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/xacthuc/dat-lai-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, matKhau }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.thongBao ?? 'Không thể đặt lại mật khẩu.')
      setMessage('Đặt lại mật khẩu thành công. Đang chuyển về đăng nhập...')
      setTimeout(() => navigate('/dang-nhap'), 900)
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
            <ShieldCheck size={22} />
          </span>
          <p>Đặt lại mật khẩu</p>
          <h1 id="reset-title">Tạo mật khẩu mới an toàn</h1>
          <span>
            Nhập mật khẩu mới cho tài khoản của bạn. Mật khẩu nên có ít nhất 6 ký tự và khác với các mật khẩu bạn đang dùng ở nơi khác.
          </span>
        </div>

        <div className="reset-info-grid">
          <div className="reset-info-item">
            <ShieldCheck size={18} />
            <span>Token được kiểm tra trước khi cập nhật.</span>
          </div>
          <div className="reset-info-item">
            <CheckCircle2 size={18} />
            <span>Link đặt lại sẽ tự vô hiệu sau khi dùng thành công.</span>
          </div>
        </div>

        {validating ? (
          <div className="forgot-alert reset-alert-neutral">
            <span>Đang kiểm tra token đặt lại mật khẩu...</span>
          </div>
        ) : (
          <form className="forgot-form reset-form" onSubmit={submit}>
            <label htmlFor="reset-password">Mật khẩu mới</label>
            <div className="forgot-input reset-input">
              <Lock size={18} />
              <input
                id="reset-password"
                type="password"
                value={matKhau}
                onChange={event => setMatKhau(event.target.value)}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={tokenKhongDung}
              />
            </div>

            <label htmlFor="reset-confirm">Xác nhận mật khẩu</label>
            <div className="forgot-input reset-input">
              <Lock size={18} />
              <input
                id="reset-confirm"
                type="password"
                value={xacNhan}
                onChange={event => setXacNhan(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={tokenKhongDung}
              />
            </div>

            {message && (
              <div className="forgot-alert forgot-alert-success">
                <CheckCircle2 size={18} />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="forgot-alert forgot-alert-error">
                <span>{error}</span>
              </div>
            )}

            <button className="forgot-submit" disabled={loading || tokenKhongDung}>
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
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
