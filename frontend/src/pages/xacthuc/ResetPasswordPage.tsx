import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react'
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
    <main className="min-h-dvh bg-[#eef5fb] px-4 py-6 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100dvh-48px)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden h-full min-h-[560px] overflow-hidden rounded-[28px] bg-[#062a4d] p-8 text-white shadow-2xl shadow-slate-900/20 lg:grid">
          <div className="flex h-full flex-col justify-between">
            <div>
              <img src={logoWeb} alt="Effort Job" className="h-14 w-auto object-contain brightness-0 invert" />
              <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Tạo mật khẩu mới</p>
              <h1 className="mt-3 text-4xl font-black leading-tight">Bảo vệ tài khoản trước khi quay lại</h1>
              <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-slate-200">
                Mật khẩu mới nên có tối thiểu 6 ký tự và không trùng với mật khẩu bạn đang dùng ở nơi khác.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-bold text-slate-100">
              <span className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <ShieldCheck size={20} /> Xác thực token trước khi đổi
              </span>
              <span className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <CheckCircle2 size={20} /> Token tự vô hiệu sau khi dùng
              </span>
            </div>
          </div>
        </section>

        <section className="w-full rounded-[28px] border border-white bg-white p-5 shadow-2xl shadow-slate-900/12 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link to="/dang-nhap" className="inline-flex items-center gap-2 rounded-full bg-[#062a4d] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#062a4d]/20">
              <ArrowLeft size={18} /> Đăng nhập
            </Link>
            <img src={logoWeb} alt="Effort Job" className="h-11 w-auto object-contain" />
          </div>

          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0b5c91]">Đặt lại mật khẩu</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#062a4d] sm:text-4xl">Tạo mật khẩu mới</h2>

          {validating ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">Đang kiểm tra token...</div>
          ) : (
            <form className="mt-7 grid gap-5" onSubmit={submit}>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Mật khẩu mới
                <span className="mt-2 flex h-14 items-center overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-[#0b5c91] focus-within:ring-4 focus-within:ring-[#0b5c91]/10">
                  <span className="flex h-full w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#0b5c91]"><Lock size={18} /></span>
                  <input className="h-full min-w-0 flex-1 bg-transparent px-4 text-base font-bold outline-none" type="password" value={matKhau} onChange={event => setMatKhau(event.target.value)} minLength={6} required disabled={tokenKhongDung} />
                </span>
              </label>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Xác nhận mật khẩu
                <span className="mt-2 flex h-14 items-center overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-[#0b5c91] focus-within:ring-4 focus-within:ring-[#0b5c91]/10">
                  <span className="flex h-full w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#0b5c91]"><Lock size={18} /></span>
                  <input className="h-full min-w-0 flex-1 bg-transparent px-4 text-base font-bold outline-none" type="password" value={xacNhan} onChange={event => setXacNhan(event.target.value)} minLength={6} required disabled={tokenKhongDung} />
                </span>
              </label>
              {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}
              {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
              <button className="min-h-14 rounded-2xl bg-[#0058be] px-6 text-lg font-black text-white shadow-xl shadow-[#0058be]/25 transition hover:bg-[#0b5c91] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading || tokenKhongDung}>
                {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
