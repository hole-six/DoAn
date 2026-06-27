import { useEffect, useState } from 'react'
import { Bell, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { toast } from '../../../lib/toast'
import { ErrorState, Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

type AccountForm = {
  hoTen: string
  soDienThoai: string
  matKhau: string
}

type CareerForm = {
  viTriMongMuon: string
  diaChi: string
  tomTat: string
}

type NotificationPrefs = {
  email: boolean
  interview: boolean
  job: boolean
}

const emptyAccountForm: AccountForm = {
  hoTen: '',
  soDienThoai: '',
  matKhau: '',
}

const emptyCareerForm: CareerForm = {
  viTriMongMuon: '',
  diaChi: '',
  tomTat: '',
}

const PREFS_KEY = 'itjob_candidate_notification_prefs'

function loadPrefs(): NotificationPrefs {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '')
    return {
      email: parsed.email !== false,
      interview: parsed.interview !== false,
      job: parsed.job !== false,
    }
  } catch {
    return { email: true, interview: true, job: true }
  }
}

function validateAccount(form: AccountForm) {
  const errors: Partial<Record<keyof AccountForm, string>> = {}
  if (!form.hoTen.trim() || form.hoTen.trim().length < 2) errors.hoTen = 'Họ tên tối thiểu 2 ký tự.'
  if (form.soDienThoai.trim() && !/^(0|\+84)[0-9\s.-]{8,13}$/.test(form.soDienThoai.trim())) errors.soDienThoai = 'Số điện thoại chưa đúng định dạng.'
  if (form.matKhau.trim() && form.matKhau.trim().length < 6) errors.matKhau = 'Mật khẩu mới tối thiểu 6 ký tự.'
  return errors
}

function validateCareer(form: CareerForm) {
  const errors: Partial<Record<keyof CareerForm, string>> = {}
  if (form.viTriMongMuon.trim().length > 120) errors.viTriMongMuon = 'Vị trí mong muốn tối đa 120 ký tự.'
  if (form.diaChi.trim().length > 180) errors.diaChi = 'Địa chỉ tối đa 180 ký tự.'
  if (form.tomTat.trim().length > 1000) errors.tomTat = 'Tóm tắt tối đa 1000 ký tự.'
  return errors
}

function FieldError({ message }: { message?: string }) {
  return <p className="min-h-5 text-xs font-bold text-red-600">{message ?? ''}</p>
}

export default function CaiDatUngVienPage() {
  const data = useUngVienData()
  const [accountForm, setAccountForm] = useState<AccountForm>(emptyAccountForm)
  const [careerForm, setCareerForm] = useState<CareerForm>(emptyCareerForm)
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs())
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof AccountForm, string>>>({})
  const [careerErrors, setCareerErrors] = useState<Partial<Record<keyof CareerForm, string>>>({})
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingCareer, setSavingCareer] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  useEffect(() => {
    setAccountForm({
      hoTen: data.current?.hoTen ?? '',
      soDienThoai: data.current?.soDienThoai ?? '',
      matKhau: '',
    })
  }, [data.current?.hoTen, data.current?.soDienThoai])

  useEffect(() => {
    setCareerForm({
      viTriMongMuon: data.ungVien?.viTriMongMuon ?? '',
      diaChi: data.ungVien?.diaChi ?? '',
      tomTat: data.ungVien?.tomTat ?? '',
    })
  }, [data.ungVien?.viTriMongMuon, data.ungVien?.diaChi, data.ungVien?.tomTat])

  const updateAccount = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) => {
    setAccountForm(prev => ({ ...prev, [key]: value }))
    setAccountErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const updateCareer = <K extends keyof CareerForm>(key: K, value: CareerForm[K]) => {
    setCareerForm(prev => ({ ...prev, [key]: value }))
    setCareerErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const saveAccount = async () => {
    const nextErrors = validateAccount(accountForm)
    setAccountErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (!data.current?.id) {
      toast.error('Không tìm thấy tài khoản để cập nhật.')
      return
    }

    setSavingAccount(true)
    try {
      const payload: Record<string, string | undefined> = {
        hoTen: accountForm.hoTen.trim(),
        soDienThoai: accountForm.soDienThoai.trim() || undefined,
      }
      if (accountForm.matKhau.trim()) payload.matKhau = accountForm.matKhau.trim()

      await apiCoXacThuc(`/nguoidung/${data.current.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      localStorage.setItem('itjob_nguoidung', JSON.stringify({
        ...data.current,
        hoTen: payload.hoTen,
        soDienThoai: payload.soDienThoai,
      }))
      window.dispatchEvent(new Event('itjob-auth-change'))
      setAccountForm(prev => ({ ...prev, matKhau: '' }))
      toast.success('Đã cập nhật tài khoản ứng viên.')
      await data.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được tài khoản.')
    } finally {
      setSavingAccount(false)
    }
  }

  const saveCareer = async () => {
    const nextErrors = validateCareer(careerForm)
    setCareerErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (!data.ungVien?.id) {
      toast.error('Không tìm thấy hồ sơ ứng viên để cập nhật.')
      return
    }

    setSavingCareer(true)
    try {
      await apiCoXacThuc(`/ungvien/${data.ungVien.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          viTriMongMuon: careerForm.viTriMongMuon.trim() || undefined,
          diaChi: careerForm.diaChi.trim() || undefined,
          tomTat: careerForm.tomTat.trim() || undefined,
        }),
      })

      toast.success('Đã cập nhật hồ sơ nghề nghiệp.')
      await data.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được hồ sơ nghề nghiệp.')
    } finally {
      setSavingCareer(false)
    }
  }

  const savePrefs = async () => {
    setSavingPrefs(true)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
      toast.success('Đã lưu tùy chọn thông báo.')
    } finally {
      setSavingPrefs(false)
    }
  }

  return (
    <Page
      title="Cài đặt tài khoản"
      desc="Quản lý thông tin tài khoản, hồ sơ nghề nghiệp và tùy chọn thông báo."
    >
      <ErrorState message={data.error} />

      {/* Panel tài khoản */}
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">Tài khoản</h2>
              <p className="text-xs font-semibold text-slate-500">Thông tin đăng nhập và mật khẩu</p>
            </div>
          </div>
          <Button variant="primary" size="sm" loading={savingAccount} icon={<Save size={14} />} onClick={() => void saveAccount()}>
            Lưu
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Họ tên *</span>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              value={accountForm.hoTen}
              onChange={e => updateAccount('hoTen', e.target.value)}
            />
            <FieldError message={accountErrors.hoTen} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Số điện thoại</span>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              value={accountForm.soDienThoai}
              onChange={e => updateAccount('soDienThoai', e.target.value)}
            />
            <FieldError message={accountErrors.soDienThoai} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Mật khẩu mới</span>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              type="password"
              value={accountForm.matKhau}
              onChange={e => updateAccount('matKhau', e.target.value)}
              placeholder="Để trống nếu không đổi"
            />
            <FieldError message={accountErrors.matKhau} />
          </label>

          <div className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Email</span>
            <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500">
              <Mail size={14} className="mr-2 shrink-0 text-slate-400" />
              {data.current?.email ?? '-'}
            </div>
            <p className="text-[11px] font-semibold text-slate-400">Email cố định, không thể thay đổi.</p>
          </div>
        </div>
      </Panel>

      {/* Panel nghề nghiệp */}
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">Mục tiêu nghề nghiệp</h2>
              <p className="text-xs font-semibold text-slate-500">AI dùng thông tin này để gợi ý việc làm phù hợp khi chưa có CV</p>
            </div>
          </div>
          <Button variant="primary" size="sm" loading={savingCareer} icon={<Save size={14} />} onClick={() => void saveCareer()}>
            Lưu
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Vị trí mong muốn</span>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              value={careerForm.viTriMongMuon}
              onChange={e => updateCareer('viTriMongMuon', e.target.value)}
              placeholder="VD: Frontend Developer"
            />
            <FieldError message={careerErrors.viTriMongMuon} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Địa chỉ</span>
            <input
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              value={careerForm.diaChi}
              onChange={e => updateCareer('diaChi', e.target.value)}
              placeholder="VD: Đà Nẵng"
            />
            <FieldError message={careerErrors.diaChi} />
          </label>

          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Tóm tắt cá nhân</span>
            <textarea
              className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
              value={careerForm.tomTat}
              onChange={e => updateCareer('tomTat', e.target.value)}
              placeholder="Mô tả ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
            />
            <FieldError message={careerErrors.tomTat} />
          </label>
        </div>
      </Panel>

      {/* Panel thông báo */}
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Bell size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">Tùy chọn thông báo</h2>
              <p className="text-xs font-semibold text-slate-500">Chọn loại thông báo muốn nhận</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" loading={savingPrefs} icon={<Save size={14} />} onClick={() => void savePrefs()}>
            Lưu
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ['email', 'Email hệ thống', 'Thông báo tổng hợp qua email'],
            ['interview', 'Lịch phỏng vấn', 'Lời mời, đổi lịch, kết quả phỏng vấn'],
            ['job', 'Trạng thái ứng tuyển', 'Hồ sơ được xem, duyệt hoặc từ chối'],
          ] as const).map(([key, label, desc]) => {
            const checked = prefs[key as keyof NotificationPrefs]
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  checked ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Toggle */}
                <div className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-sky-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  <input
                    type="checkbox"
                    className="absolute inset-0 opacity-0"
                    checked={checked}
                    onChange={e => setPrefs(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                </div>
                <span>
                  <strong className={`block text-sm font-black ${checked ? 'text-sky-900' : 'text-slate-700'}`}>{label}</strong>
                  <span className="mt-0.5 block text-xs font-semibold leading-relaxed text-slate-500">{desc}</span>
                </span>
              </label>
            )
          })}
        </div>
      </Panel>
    </Page>
  )
}
