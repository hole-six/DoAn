import { useState } from 'react'
import { CheckCircle, Settings } from 'lucide-react'
import AppIcon from '../../components/AppIcon'
import { apiCoXacThuc, layNguoiDung } from '../../lib/auth'

const pageClass = 'mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-3 pb-4 lg:gap-4'
const panelClass = 'flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] lg:p-5'
const primaryBtn = 'btn-primary'
const fieldClass = 'grid gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600'
const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10'

type NotificationSettings = {
  kiemDuyetTin: boolean
  kiemDuyetReview: boolean
  baoTri: boolean
}

const SETTINGS_KEY = 'itjob_admin_settings'

function loadSettings(): NotificationSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '')
    return {
      kiemDuyetTin: parsed.kiemDuyetTin !== false,
      kiemDuyetReview: parsed.kiemDuyetReview !== false,
      baoTri: parsed.baoTri === true,
    }
  } catch {
    return { kiemDuyetTin: true, kiemDuyetReview: true, baoTri: false }
  }
}

export default function CaiDatQuanTriPage() {
  const current = layNguoiDung()
  const [account, setAccount] = useState({
    id: current?.id ?? '',
    email: current?.email ?? '',
    hoTen: current?.hoTen ?? '',
    soDienThoai: current?.soDienThoai ?? '',
    matKhau: '',
  })
  const [settings, setSettings] = useState<NotificationSettings>(() => loadSettings())
  const [savingAccount, setSavingAccount] = useState(false)
  const [savedAccount, setSavedAccount] = useState(false)
  const [savedSettings, setSavedSettings] = useState(false)
  const [error, setError] = useState('')

  const saveAccount = async () => {
    if (!account.id) return
    setSavingAccount(true)
    setError('')
    try {
      const payload: Record<string, string | undefined> = {
        hoTen: account.hoTen.trim(),
        soDienThoai: account.soDienThoai.trim() || undefined,
      }
      if (account.matKhau.trim()) payload.matKhau = account.matKhau.trim()
      await apiCoXacThuc(`/nguoidung/${account.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      localStorage.setItem('itjob_nguoidung', JSON.stringify({
        ...current,
        hoTen: payload.hoTen,
        soDienThoai: payload.soDienThoai,
      }))
      window.dispatchEvent(new Event('itjob-auth-change'))
      setAccount(prev => ({ ...prev, matKhau: '' }))
      setSavedAccount(true)
      setTimeout(() => setSavedAccount(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được tài khoản quản trị.')
    } finally {
      setSavingAccount(false)
    }
  }

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSavedSettings(true)
    setTimeout(() => setSavedSettings(false), 2000)
  }

  return (
    <div className={pageClass}>
      <header className="relative grid min-w-0 gap-1 overflow-visible rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:p-5">
        <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.1em] text-[#0e4d7d]">ITJob Admin</span>
        <h1 className="break-words text-2xl font-black leading-tight text-slate-950">Cài đặt quản trị</h1>
        <p className="text-sm font-semibold leading-relaxed text-slate-500">Quản lý tài khoản quản trị viên và cấu hình vận hành dành riêng cho vai trò admin.</p>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-extrabold text-rose-700">{error}</div>}

      <section className={panelClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-950">Tài khoản quản trị</h2>
          <button className={primaryBtn} onClick={() => void saveAccount()} disabled={savingAccount}>
            <AppIcon icon={Settings} size={16} /> {savingAccount ? 'Đang lưu...' : 'Lưu tài khoản'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={fieldClass}>Họ tên
            <input className={inputClass} value={account.hoTen} onChange={e => setAccount({ ...account, hoTen: e.target.value })} />
          </label>
          <label className={fieldClass}>Số điện thoại
            <input className={inputClass} value={account.soDienThoai} onChange={e => setAccount({ ...account, soDienThoai: e.target.value })} />
          </label>
          <label className={fieldClass}>Email đăng nhập
            <input className={inputClass} value={account.email} disabled />
          </label>
          <label className={fieldClass}>Mật khẩu mới
            <input className={inputClass} type="password" value={account.matKhau} onChange={e => setAccount({ ...account, matKhau: e.target.value })} placeholder="Để trống nếu không đổi mật khẩu" />
          </label>
        </div>
        {savedAccount && <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><AppIcon icon={CheckCircle} size={15} /> Đã lưu tài khoản quản trị</span>}
      </section>

      <section className={panelClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-950">Cấu hình hệ thống</h2>
          <button className={primaryBtn} onClick={saveSettings}>
            <AppIcon icon={Settings} size={16} /> Lưu cấu hình
          </button>
        </div>
        <div className="flex flex-col divide-y divide-slate-100">
          {[
            ['kiemDuyetTin', 'Bật kiểm duyệt tin tuyển dụng', 'Tin mới cần admin duyệt trước khi công khai.'],
            ['kiemDuyetReview', 'Bật kiểm duyệt review công ty', 'Review chỉ hiển thị sau khi đạt chuẩn nội dung.'],
            ['baoTri', 'Chế độ bảo trì', 'Tạm giới hạn thao tác khi hệ thống cần xử lý kỹ thuật.'],
          ].map(([key, label, desc]) => (
            <label key={key} className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <span>
                <span className="block text-sm font-black text-slate-950">{label}</span>
                <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{desc}</span>
              </span>
              <div className="relative mt-0.5 flex-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings[key as keyof NotificationSettings]}
                  onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                />
                <div className={`h-6 w-11 rounded-full transition-colors ${settings[key as keyof NotificationSettings] ? 'bg-[#0e4d7d]' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[key as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
          ))}
        </div>
        {savedSettings && <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><AppIcon icon={CheckCircle} size={15} /> Đã lưu cấu hình hệ thống</span>}
      </section>
    </div>
  )
}
