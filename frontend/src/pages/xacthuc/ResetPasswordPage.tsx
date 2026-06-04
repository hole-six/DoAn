import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import { API_URL } from '../../lib/env'
import './auth-styles.css'

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

  useEffect(() => {
    if (!token) {
      setError('Thiếu token đặt lại mật khẩu.')
      return
    }
    fetch(`${API_URL}/xacthuc/dat-lai-mat-khau/${encodeURIComponent(token)}`)
      .then(async response => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.thongBao ?? 'Token không hợp lệ hoặc đã hết hạn')
        setMessage(result.duLieu?.email ? `Đang đặt lại mật khẩu cho ${result.duLieu.email}` : 'Token hợp lệ.')
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Token không hợp lệ hoặc đã hết hạn'))
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
      if (!response.ok) throw new Error(result.thongBao ?? 'Không thể đặt lại mật khẩu')
      setMessage('Đặt lại mật khẩu thành công. Đang chuyển về đăng nhập...')
      setTimeout(() => navigate('/dang-nhap'), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#071327] px-4 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-lg items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/15 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link to="/dang-nhap" className="inline-flex items-center gap-2 rounded-full bg-[#062a4d] px-4 py-2 text-sm font-black text-white">
              <ArrowLeft size={18} /> Đăng nhập
            </Link>
            <img src={logoWeb} alt="Effort Job" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0b5c91]">Đặt lại mật khẩu</p>
          <h1 className="mt-3 text-3xl font-black text-[#062a4d]">Tạo mật khẩu mới</h1>

          {validating ? (
            <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">Đang kiểm tra token...</div>
          ) : (
            <form className="mt-7 grid gap-5" onSubmit={submit}>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Mật khẩu mới
                <span className="mt-2 flex h-14 items-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#0b5c91] focus-within:ring-4 focus-within:ring-[#0b5c91]/10">
                  <span className="flex h-full w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#0b5c91]"><Lock size={18} /></span>
                  <input className="h-full min-w-0 flex-1 bg-transparent px-4 text-base font-bold outline-none" type="password" value={matKhau} onChange={event => setMatKhau(event.target.value)} minLength={6} required disabled={Boolean(error && !message)} />
                </span>
              </label>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Xác nhận mật khẩu
                <span className="mt-2 flex h-14 items-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#0b5c91] focus-within:ring-4 focus-within:ring-[#0b5c91]/10">
                  <span className="flex h-full w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#0b5c91]"><Lock size={18} /></span>
                  <input className="h-full min-w-0 flex-1 bg-transparent px-4 text-base font-bold outline-none" type="password" value={xacNhan} onChange={event => setXacNhan(event.target.value)} minLength={6} required disabled={Boolean(error && !message)} />
                </span>
              </label>
              {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}
              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
              <button className="min-h-14 rounded-xl bg-[#062a4d] px-6 text-lg font-black text-white shadow-xl shadow-[#062a4d]/25 hover:bg-[#0b5c91] disabled:opacity-60" disabled={loading || Boolean(error && !message)}>
                {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
