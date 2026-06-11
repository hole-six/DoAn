import { useEffect, useState } from 'react'
import { Bell, Mail, Save, Settings, ShieldCheck } from 'lucide-react'
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

type NotificationPrefs = {
  email: boolean
  interview: boolean
  job: boolean
}

const emptyForm: AccountForm = {
  hoTen: '',
  soDienThoai: '',
  matKhau: '',
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

function validate(form: AccountForm) {
  const errors: Partial<Record<keyof AccountForm, string>> = {}
  if (!form.hoTen.trim() || form.hoTen.trim().length < 2) errors.hoTen = 'Họ tên tối thiểu 2 ký tự.'
  if (form.soDienThoai.trim() && !/^(0|\+84)[0-9\s.-]{8,13}$/.test(form.soDienThoai.trim())) errors.soDienThoai = 'Số điện thoại chưa đúng định dạng.'
  if (form.matKhau.trim() && form.matKhau.trim().length < 6) errors.matKhau = 'Mật khẩu mới tối thiểu 6 ký tự.'
  return errors
}

function FieldError({ message }: { message?: string }) {
  return <p className="min-h-5 text-xs font-bold text-red-600">{message ?? ''}</p>
}

export default function CaiDatUngVienPage() {
  const data = useUngVienData()
  const [form, setForm] = useState<AccountForm>(emptyForm)
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs())
  const [errors, setErrors] = useState<Partial<Record<keyof AccountForm, string>>>({})
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  useEffect(() => {
    setForm({
      hoTen: data.current?.hoTen ?? '',
      soDienThoai: data.current?.soDienThoai ?? '',
      matKhau: '',
    })
  }, [data.current?.hoTen, data.current?.soDienThoai])

  const update = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const saveAccount = async () => {
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (!data.current?.id) {
      toast.error('Không tìm thấy tài khoản để cập nhật.')
      return
    }

    setSavingAccount(true)
    try {
      const payload: Record<string, string | undefined> = {
        hoTen: form.hoTen.trim(),
        soDienThoai: form.soDienThoai.trim() || undefined,
      }
      if (form.matKhau.trim()) payload.matKhau = form.matKhau.trim()

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
      setForm(prev => ({ ...prev, matKhau: '' }))
      toast.success('Đã cập nhật tài khoản ứng viên.')
      await data.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được tài khoản.')
    } finally {
      setSavingAccount(false)
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
      desc="Quản lý thông tin tài khoản gốc của ứng viên: họ tên, liên hệ, mật khẩu và tùy chọn thông báo."
      action={<Button icon={<Settings size={16} />} onClick={() => void data.reload()}>Đồng bộ</Button>}
    >
      <ErrorState message={data.error} />

      <Panel
        title="Tài khoản ứng viên"
        action={
          <Button variant="primary" loading={savingAccount} icon={<Save size={16} />} onClick={() => void saveAccount()}>
            Lưu tài khoản
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sky-900">
            <ShieldCheck size={28} />
            <p className="mt-3 text-sm font-black">Đây là thông tin tài khoản gốc dùng chung cho đăng nhập, dashboard và các thao tác hệ thống.</p>
            <div className="mt-4 grid gap-2 text-xs font-bold text-sky-800">
              <p><strong>Email:</strong> {data.current?.email ?? '-'}</p>
              <p><strong>Vai trò:</strong> Ứng viên</p>
              <p><strong>Trạng thái:</strong> {data.current?.trangThai ?? '-'}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-black text-slate-700">Họ tên *</span>
              <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.hoTen} onChange={event => update('hoTen', event.target.value)} />
              <FieldError message={errors.hoTen} />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-black text-slate-700">Số điện thoại</span>
              <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.soDienThoai} onChange={event => update('soDienThoai', event.target.value)} />
              <FieldError message={errors.soDienThoai} />
            </label>

            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-black text-slate-700">Mật khẩu mới</span>
              <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" type="password" value={form.matKhau} onChange={event => update('matKhau', event.target.value)} placeholder="Để trống nếu không đổi mật khẩu" />
              <FieldError message={errors.matKhau} />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Mail size={16} />
                <strong>Email đăng nhập:</strong>
                <span>{data.current?.email ?? '-'}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">Email đang được giữ cố định để tránh ảnh hưởng đăng nhập và các liên kết xác thực hiện tại.</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Tùy chọn thông báo"
        action={
          <Button variant="secondary" loading={savingPrefs} icon={<Bell size={16} />} onClick={() => void savePrefs()}>
            Lưu tùy chọn
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['email', 'Email hệ thống', 'Nhận các thông báo tổng hợp qua email khi hệ thống hỗ trợ.'],
            ['interview', 'Lịch phỏng vấn', 'Nhận cảnh báo khi có lời mời, đổi lịch hoặc cập nhật kết quả phỏng vấn.'],
            ['job', 'Trạng thái ứng tuyển', 'Nhận thông báo khi hồ sơ được xem, duyệt, từ chối hoặc có thay đổi mới.'],
          ].map(([key, label, desc]) => (
            <label key={key} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={prefs[key as keyof NotificationPrefs]}
                onChange={event => setPrefs(prev => ({ ...prev, [key]: event.target.checked }))}
              />
              <span>
                <strong className="block text-sm text-slate-900">{label}</strong>
                <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-600">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </Panel>
    </Page>
  )
}
