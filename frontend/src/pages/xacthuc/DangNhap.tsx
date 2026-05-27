import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import logoWeb from '../../assets/logoweb.png'
import dangNhapImg from '../../assets/dangnhap.png'
import { duongDanTheoVaiTro, luuPhienDangNhap } from '../../lib/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
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

export default function DangNhap() {
  const [email, setEmail] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [hienMatKhau, setHienMatKhau] = useState(false)
  const [vaiTro, setVaiTro] = useState<keyof typeof vaiTroApi>('ungvien')
  const [dangXuLy, setDangXuLy] = useState(false)
  const [loi, setLoi] = useState('')
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  const hoanTatDangNhap = (duLieu: any) => {
    luuPhienDangNhap(duLieu)
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
    <div className="auth-page">
      <div className="auth-visual">
        <img src={dangNhapImg} alt="Đăng nhập ITJob" />
        <div>
          <Link to="/" style={{ color: '#dbeafe', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          <Link to="/" className="brand" style={{ marginBottom: 32, display: 'block' }}>
            <img src={logoWeb} alt="ITJob" style={{ height: 48, objectFit: 'contain' }} />
          </Link>
          <h1>Chào mừng trở lại</h1>
          <p>Đăng nhập bằng access token ngắn hạn và refresh token dài hạn, tách rõ 3 vai trò ứng viên, nhà tuyển dụng và quản trị viên.</p>
        </div>
      </div>

      <div className="auth-panel">
        <p className="eyebrow">Đăng nhập</p>
        <h1>Tiếp tục hành trình</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Chưa có tài khoản? <Link to="/dang-ky" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Đăng ký miễn phí</Link>
        </p>

        <div className="role-tabs">
          {(['ungvien', 'nhatuyendung', 'quantrivien'] as const).map(role => (
            <button key={role} className={vaiTro === role ? 'active' : ''} onClick={() => chonVaiTro(role)}>
              {role === 'ungvien' ? 'Ứng viên' : role === 'nhatuyendung' ? 'Nhà tuyển dụng' : 'Quản trị viên'}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14, border: '1px solid #dbe4f0', background: '#f8fafc', borderRadius: 8, padding: '12px 14px', color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
          <strong style={{ color: '#0b1c30' }}>Tài khoản seed:</strong> {taiKhoanMau[vaiTro].email} / {taiKhoanMau[vaiTro].matKhau}
        </div>

        <form className="form-grid" onSubmit={xuLyDangNhap}>
          <label>
            EMAIL
            <span>
              <Mail size={16} />
              <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </span>
          </label>

          <label>
            MẬT KHẨU
            <span>
              <Lock size={16} />
              <input type={hienMatKhau ? 'text' : 'password'} placeholder="••••••••" value={matKhau} onChange={e => setMatKhau(e.target.value)} required />
              <button type="button" onClick={() => setHienMatKhau(!hienMatKhau)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline-strong)', padding: 0 }}>
                {hienMatKhau ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {loi && <div style={{ border: '1px solid rgba(225, 29, 72, 0.24)', background: 'rgba(225, 29, 72, 0.08)', color: '#be123c', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700 }}>{loi}</div>}

          <button type="submit" className="primary-button large" style={{ marginTop: 8 }} disabled={dangXuLy}>
            {dangXuLy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
            <span style={{ height: 1, background: '#dbe4f0', flex: 1 }} />
            hoặc
            <span style={{ height: 1, background: '#dbe4f0', flex: 1 }} />
          </div>
          {GOOGLE_CLIENT_ID ? (
            <div ref={googleButtonRef} style={{ minHeight: 44 }} />
          ) : (
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: 12, color: '#64748b', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <ShieldCheck size={16} /> Thêm `VITE_GOOGLE_CLIENT_ID` ở frontend và `GOOGLE_CLIENT_ID` ở backend để bật Google Login.
            </div>
          )}
        </div>

        <div className="auth-switch">
          <Link to="/quen-mat-khau" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Quên mật khẩu?</Link>
          <Link to="/dang-ky" style={{ color: 'var(--secondary)', fontWeight: 900 }}>Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  )
}
