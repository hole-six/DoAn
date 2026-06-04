import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import { API_URL } from '../../lib/env'
import './auth-styles.css'
import './forgot-password.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/xacthuc/quen-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.thongBao ?? 'Không thể gửi email đặt lại mật khẩu.')
      setMessage(result.thongBao ?? 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi email đặt lại mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card" aria-labelledby="forgot-title">
        <div className="forgot-topbar">
          <Link to="/dang-nhap" className="forgot-back">
            <ArrowLeft size={17} />
            <span>Đăng nhập</span>
          </Link>
          <img src={logoWeb} alt="Effort Job" className="forgot-logo" />
        </div>

        <div className="forgot-heading">
          <span className="forgot-icon">
            <ShieldCheck size={22} />
          </span>
          <p>Quên mật khẩu</p>
          <h1 id="forgot-title">Đặt lại mật khẩu</h1>
          <span>Dùng email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu có hiệu lực trong 30 phút.</span>
        </div>

        <form className="forgot-form" onSubmit={submit}>
          <label htmlFor="forgot-email">Email tài khoản</label>
          <div className="forgot-input">
            <Mail size={18} />
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              required
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

          <button className="forgot-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <p className="forgot-note">
          Nhớ mật khẩu rồi? <Link to="/dang-nhap">Quay lại đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}
