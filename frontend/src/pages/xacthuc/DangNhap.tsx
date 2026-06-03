import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import dangNhapImg from '../../assets/dangnhap.png'
import { duongDanTheoVaiTro, luuPhienDangNhap } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import './auth-styles.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

const vaiTroApi = {
  ungvien: 'ung_vien',
  nhatuyendung: 'nha_tuyen_dung',
  quantrivien: 'admin',
} as const

const taiKhoanMau = {
  ungvien: { email: 'ungvien@itjob.vn', matKhau: '123456' },
  nhatuyendung: { email: 'nhatuyendung@itjob.vn', matKhau: '123456' },
  quantrivien: { email: 'admin@itjob.vn', matKhau: '123456' },
} as const

const nhanVaiTro: Record<keyof typeof vaiTroApi, string> = {
  ungvien: 'Ứng viên',
  nhatuyendung: 'Nhà tuyển dụng',
  quantrivien: 'Quản trị viên',
}

const inputWrap =
  'mt-2 flex h-14 items-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition focus-within:border-[#0b5c91] focus-within:ring-4 focus-within:ring-[#0b5c91]/10'
const inputClass = 'h-full min-w-0 flex-1 bg-transparent px-4 text-base font-bold text-slate-950 outline-none placeholder:text-slate-400'
const iconSlot = 'flex h-full w-12 shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#0b5c91]'
const navyButtonStyle = {
  backgroundColor: '#062a4d',
  border: '1px solid #062a4d',
  color: '#ffffff',
  boxShadow: '0 18px 34px rgba(6, 42, 77, 0.24)',
}

export default function DangNhap() {
  const [email, setEmail] = useState<string>(taiKhoanMau.ungvien.email)
  const [matKhau, setMatKhau] = useState<string>(taiKhoanMau.ungvien.matKhau)
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [vaiTro, setVaiTro] = useState<keyof typeof vaiTroApi>('ungvien')
  const [dangXuLy, setDangXuLy] = useState(false)
  const [loi, setLoi] = useState('')
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const redirect = new URLSearchParams(window.location.search).get('redirect') ?? ''

  const hoanTatDangNhap = (duLieu: any) => {
    luuPhienDangNhap(duLieu)
    if (redirect.startsWith('/')) {
      navigate(redirect, { replace: true })
      return
    }
    navigate(duongDanTheoVaiTro[duLieu.nguoiDung.vaiTro as keyof typeof duongDanTheoVaiTro])
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return

    const renderButton = () => {
      const google = (window as any).google
      if (!google?.accounts?.id || !googleButtonRef.current) return

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setDangXuLy(true)
          setLoi('')
          try {
            const phanHoi = await fetch(`${API_URL}/xacthuc/dang-nhap-google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential, vaiTro: vaiTroApi[vaiTro] }),
            })
            const ketQua = await phanHoi.json()
            if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Đăng nhập Google thất bại')
            hoanTatDangNhap(ketQua.duLieu)
          } catch (err) {
            setLoi(err instanceof Error ? err.message : 'Đăng nhập Google thất bại')
          } finally {
            setDangXuLy(false)
          }
        },
      })

      googleButtonRef.current.innerHTML = ''
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
      })
    }

    const scriptId = 'google-identity-services'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = renderButton
      document.body.appendChild(script)
    } else {
      renderButton()
    }
  }, [vaiTro])

  const xuLyDangNhap = async (e: FormEvent) => {
    e.preventDefault()
    setDangXuLy(true)
    setLoi('')

    try {
      const phanHoi = await fetch(`${API_URL}/xacthuc/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, matKhau, vaiTro: vaiTroApi[vaiTro] }),
      })
      const ketQua = await phanHoi.json()
      if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Đăng nhập thất bại')
      hoanTatDangNhap(ketQua.duLieu)
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Đăng nhập thất bại')
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
    <main className="min-h-dvh bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
        <section className="relative hidden min-h-dvh overflow-hidden bg-[#020718] lg:block">
          <img className="absolute inset-0 h-full w-full object-cover opacity-70" src={dangNhapImg} alt="Đăng nhập ITJob" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,7,24,0.96),rgba(3,22,52,0.82),rgba(2,7,24,0.58))]" />
          <div className="relative z-10 flex min-h-dvh flex-col justify-between p-12 xl:p-16">
            <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-wide text-cyan-100 transition hover:text-white">
              <ArrowLeft size={18} /> Về trang chủ
            </Link>

            <div className="max-w-xl">
              <img src={logoWeb} alt="ITJob" className="mb-8 object-contain" style={{ height: 96, width: 'auto', maxWidth: 240 }} />
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200" style={{ color: '#a5f3fc' }}>ITJob Vietnam</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.08] text-white xl:text-5xl" style={{ color: '#f8fafc' }}>Đăng nhập hệ thống tuyển dụng IT</h1>
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-slate-200" style={{ color: '#dbeafe' }}>
                Một cổng truy cập riêng cho ứng viên, nhà tuyển dụng và quản trị viên với phiên đăng nhập bảo mật.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 text-white">
              {['Ứng viên', 'Nhà tuyển dụng', 'Quản trị viên'].map(item => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm font-black backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[560px] rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-[#0b5c91]">
                <ArrowLeft size={18} /> Trang chủ
              </Link>
              <img src={logoWeb} alt="ITJob" className="object-contain" style={{ height: 40, width: 'auto', maxWidth: 120 }} />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0b5c91]">Đăng nhập</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#062a4d] sm:text-5xl">Vào bảng điều khiển</h2>
            <p className="mt-3 text-base font-semibold text-slate-600">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="font-black text-[#0b5c91] hover:text-[#062a4d]">
                Đăng ký miễn phí
              </Link>
            </p>

            <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2">
              {(['ungvien', 'nhatuyendung', 'quantrivien'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => chonVaiTro(role)}
                  style={vaiTro === role ? navyButtonStyle : { backgroundColor: '#ffffff', border: '1px solid transparent', color: '#334155' }}
                  className={`min-h-14 rounded-xl px-2 text-sm font-black transition sm:text-base ${
                    vaiTro === role
                      ? '!bg-[#062a4d] !text-white shadow-lg shadow-[#062a4d]/25'
                      : '!bg-white !text-slate-700 hover:!bg-slate-50 hover:!text-[#062a4d]'
                  }`}
                >
                  {nhanVaiTro[role]}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#b8d7ef] bg-[#eff8ff] px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="font-black text-[#062a4d]">Tài khoản seed:</span> {taiKhoanMau[vaiTro].email} / {taiKhoanMau[vaiTro].matKhau}
            </div>

            <form className="mt-7 grid gap-5" onSubmit={xuLyDangNhap}>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Email
                <span className={inputWrap}>
                  <span className={iconSlot}>
                    <Mail size={18} />
                  </span>
                  <input className={inputClass} type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </span>
              </label>

              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Mật khẩu
                <span className={inputWrap}>
                  <span className={iconSlot}>
                    <Lock size={18} />
                  </span>
                  <input
                    className={inputClass}
                    type={hienMatKhau ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={matKhau}
                    onChange={e => setMatKhau(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setHienMatKhau(!hienMatKhau)} className="flex h-full w-12 shrink-0 items-center justify-center text-[#0b5c91] hover:bg-slate-50">
                    {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {loi && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loi}</div>}

              <button
                type="submit"
                disabled={dangXuLy}
                style={navyButtonStyle}
                className="min-h-14 rounded-xl !border !border-[#062a4d] !bg-[#062a4d] px-6 text-lg font-black !text-white shadow-xl shadow-[#062a4d]/25 transition hover:!bg-[#0b5c91] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {dangXuLy ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-7 grid gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <span className="h-px flex-1 bg-slate-200" />
                hoặc
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              {GOOGLE_CLIENT_ID ? (
                <div ref={googleButtonRef} className="min-h-11" />
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#0b5c91]" size={18} />
                  Thêm VITE_GOOGLE_CLIENT_ID ở frontend và GOOGLE_CLIENT_ID ở backend để bật Google Login.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm font-black text-[#0b5c91] sm:flex-row sm:items-center sm:justify-between">
              <Link to="/quen-mat-khau" className="hover:text-[#062a4d]">Quên mật khẩu?</Link>
              <Link to="/dang-ky" className="hover:text-[#062a4d]">Tạo tài khoản mới</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
