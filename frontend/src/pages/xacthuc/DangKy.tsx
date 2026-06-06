import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Lock, Mail, Phone, User } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import dangKyImg from '../../assets/dangky.png'
import { API_URL } from '../../lib/env'
import './auth-styles.css'

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
const homeLinkStyle = {
  backgroundColor: '#062a4d',
  border: '1px solid rgba(255, 255, 255, 0.22)',
  color: '#ffffff',
}

export default function DangKy() {
  const [vaiTro, setVaiTro] = useState<'ungvien' | 'nhatuyendung'>('ungvien')
  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: '',
    tenCongTy: '',
  })
  const [dangXuLy, setDangXuLy] = useState(false)
  const [loi, setLoi] = useState('')
  const navigate = useNavigate()

  const cap = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const goiApi = async (duongDan: string, body: Record<string, unknown>) => {
    const phanHoi = await fetch(`${API_URL}${duongDan}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const ketQua = await phanHoi.json().catch(() => ({}))
    if (!phanHoi.ok) throw new Error(ketQua.thongBao ?? 'Không thể tạo tài khoản')
    return ketQua.duLieu
  }

  const xuLy = async (e: FormEvent) => {
    e.preventDefault()
    setLoi('')

    if (form.matKhau !== form.xacNhanMatKhau) {
      setLoi('Mật khẩu xác nhận không khớp.')
      return
    }

    if (vaiTro === 'nhatuyendung' && !form.tenCongTy.trim()) {
      setLoi('Vui lòng nhập tên công ty.')
      return
    }

    setDangXuLy(true)
    try {
      const nguoiDung = await goiApi('/nguoidung', {
        hoTen: form.hoTen.trim(),
        email: form.email.trim(),
        soDienThoai: form.soDienThoai.trim() || undefined,
        matKhau: form.matKhau,
        vaiTro: vaiTro === 'ungvien' ? 'ung_vien' : 'nha_tuyen_dung',
      })

      if (vaiTro === 'ungvien') {
        await goiApi('/ungvien', { maNguoiDung: nguoiDung.id })
      } else {
        await goiApi('/nhatuyendung', {
          maNguoiDung: nguoiDung.id,
          tenCongTy: form.tenCongTy.trim(),
          trangThaiDuyet: 'cho_duyet',
        })
      }

      navigate('/dang-nhap')
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Không thể tạo tài khoản')
    } finally {
      setDangXuLy(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
        <section className="relative hidden min-h-dvh overflow-hidden bg-[#020718] lg:block">
          <img className="absolute inset-0 h-full w-full object-cover opacity-70" src={dangKyImg} alt="Đăng ký Effort Job" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,7,24,0.96),rgba(3,22,52,0.82),rgba(2,7,24,0.58))]" />
          <div className="relative z-10 flex min-h-dvh flex-col justify-between p-12 xl:p-16">
            <Link to="/" style={homeLinkStyle} className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-wide text-white ring-1 ring-white/20 transition hover:bg-white/20">
              <ArrowLeft size={18} /> Về trang chủ
            </Link>

            <div className="max-w-xl">
              <img src={logoWeb} alt="Effort Job" className="mb-8 object-contain" style={{ height: 96, width: 'auto', maxWidth: 240 }} />
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">Effort Job</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.08] text-white xl:text-5xl" style={{ color: '#ffffff', textShadow: '0 2px 18px rgba(0,0,0,0.35)' }}>Đăng ký nhanh, hoàn thiện hồ sơ sau</h1>
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-slate-200">
                Ứng viên dùng CV làm trung tâm. Nhà tuyển dụng đăng ký tối thiểu, sau đó cập nhật công ty và chờ admin duyệt.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-3 text-white">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-black">Ứng viên</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">Tạo CV, ứng tuyển, theo dõi lịch</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-black">Nhà tuyển dụng</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">Hoàn thiện công ty trước khi đăng tin</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[600px] rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link to="/" style={homeLinkStyle} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white">
                <ArrowLeft size={18} /> Trang chủ
              </Link>
              <img src={logoWeb} alt="Effort Job" className="object-contain" style={{ height: 40, width: 'auto', maxWidth: 120 }} />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0b5c91]">Đăng ký</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#062a4d] sm:text-5xl">Tạo tài khoản</h2>
            <p className="mt-3 text-base font-semibold text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="font-black text-[#0b5c91] hover:text-[#062a4d]">Đăng nhập</Link>
            </p>

            <div className="auth-role-switch auth-role-switch--register mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2">
              <button
                type="button"
                style={vaiTro === 'ungvien' ? navyButtonStyle : { backgroundColor: '#ffffff', border: '1px solid transparent', color: '#334155' }}
                className={`min-h-14 rounded-xl px-3 text-base font-black transition ${vaiTro === 'ungvien' ? '!bg-[#062a4d] !text-white shadow-lg shadow-[#062a4d]/25' : '!bg-white !text-slate-700 hover:!bg-slate-50 hover:!text-[#062a4d]'}`}
                onClick={() => setVaiTro('ungvien')}
              >
                Ứng viên
              </button>
              <button
                type="button"
                style={vaiTro === 'nhatuyendung' ? navyButtonStyle : { backgroundColor: '#ffffff', border: '1px solid transparent', color: '#334155' }}
                className={`min-h-14 rounded-xl px-3 text-base font-black transition ${vaiTro === 'nhatuyendung' ? '!bg-[#062a4d] !text-white shadow-lg shadow-[#062a4d]/25' : '!bg-white !text-slate-700 hover:!bg-slate-50 hover:!text-[#062a4d]'}`}
                onClick={() => setVaiTro('nhatuyendung')}
              >
                Nhà tuyển dụng
              </button>
            </div>

            <form className="mt-7 grid gap-5" onSubmit={xuLy}>
              <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                Họ và tên
                <span className={inputWrap}>
                  <span className={iconSlot}><User size={18} /></span>
                  <input className={inputClass} type="text" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={cap('hoTen')} required />
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                  Email
                  <span className={inputWrap}>
                    <span className={iconSlot}><Mail size={18} /></span>
                    <input className={inputClass} type="email" placeholder="email@example.com" value={form.email} onChange={cap('email')} required />
                  </span>
                </label>
                <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                  Số điện thoại
                  <span className={inputWrap}>
                    <span className={iconSlot}><Phone size={18} /></span>
                    <input className={inputClass} type="tel" placeholder="0901234567" value={form.soDienThoai} onChange={cap('soDienThoai')} required />
                  </span>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                  Mật khẩu
                  <span className={inputWrap}>
                    <span className={iconSlot}><Lock size={18} /></span>
                    <input className={inputClass} type="password" placeholder="Tối thiểu 6 ký tự" value={form.matKhau} onChange={cap('matKhau')} required />
                  </span>
                </label>
                <label className="block text-sm font-black uppercase tracking-wide text-slate-700">
                  Xác nhận mật khẩu
                  <span className={inputWrap}>
                    <span className={iconSlot}><Lock size={18} /></span>
                    <input className={inputClass} type="password" placeholder="Nhập lại mật khẩu" value={form.xacNhanMatKhau} onChange={cap('xacNhanMatKhau')} required />
                  </span>
                </label>
              </div>

              {vaiTro === 'nhatuyendung' && (
                <div className="rounded-2xl border border-[#b8d7ef] bg-[#f5fbff] p-4">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0b5c91]">Thông tin công ty tối thiểu</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Sau đăng ký, bạn cập nhật mã số thuế, website, địa chỉ, logo và mô tả tại trang Thông tin công ty.</p>
                  <label className="mt-4 block text-sm font-black uppercase tracking-wide text-slate-700">
                    Tên công ty
                    <span className={inputWrap}>
                      <span className={iconSlot}><Building2 size={18} /></span>
                      <input className={inputClass} type="text" placeholder="Công ty TNHH Effort IT" value={form.tenCongTy} onChange={cap('tenCongTy')} required />
                    </span>
                  </label>
                </div>
              )}

              {loi && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{loi}</div>}

              <button
                type="submit"
                disabled={dangXuLy}
                style={navyButtonStyle}
                className="min-h-14 rounded-xl !border !border-[#062a4d] !bg-[#062a4d] px-6 text-lg font-black !text-white shadow-xl shadow-[#062a4d]/25 transition hover:!bg-[#0b5c91] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {dangXuLy ? 'Đang tạo tài khoản...' : vaiTro === 'nhatuyendung' ? 'Đăng ký nhà tuyển dụng' : 'Tạo tài khoản ứng viên'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
