import { useEffect, useState } from 'react'
import { Save, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { toast } from '../../../lib/toast'
import CvStudio from '../CvStudio'
import { ErrorState, Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

type ProfileForm = {
  hoTen: string
  soDienThoai: string
  viTriMongMuon: string
  diaChi: string
  tomTat: string
}

const emptyForm: ProfileForm = {
  hoTen: '',
  soDienThoai: '',
  viTriMongMuon: '',
  diaChi: '',
  tomTat: '',
}

function validate(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {}
  if (!form.hoTen.trim() || form.hoTen.trim().length < 2) errors.hoTen = 'Họ tên tối thiểu 2 ký tự.'
  if (form.soDienThoai.trim() && !/^(0|\+84)[0-9\s.-]{8,13}$/.test(form.soDienThoai.trim())) errors.soDienThoai = 'Số điện thoại chưa đúng định dạng.'
  if (form.viTriMongMuon.trim().length > 120) errors.viTriMongMuon = 'Vị trí mong muốn tối đa 120 ký tự.'
  if (form.diaChi.trim().length > 180) errors.diaChi = 'Địa chỉ tối đa 180 ký tự.'
  if (form.tomTat.trim().length > 1000) errors.tomTat = 'Tóm tắt tối đa 1000 ký tự.'
  return errors
}

function FieldError({ message }: { message?: string }) {
  return <p className="min-h-5 text-xs font-bold text-red-600">{message ?? ''}</p>
}

export default function HoSoUngVienPage() {
  const data = useUngVienData()
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      hoTen: data.current?.hoTen ?? '',
      soDienThoai: data.current?.soDienThoai ?? '',
      viTriMongMuon: data.ungVien?.viTriMongMuon ?? '',
      diaChi: data.ungVien?.diaChi ?? '',
      tomTat: data.ungVien?.tomTat ?? '',
    })
  }, [data.current?.hoTen, data.current?.soDienThoai, data.ungVien?.viTriMongMuon, data.ungVien?.diaChi, data.ungVien?.tomTat])

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const saveProfile = async () => {
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (!data.current?.id || !data.ungVien?.id) {
      toast.error('Không tìm thấy hồ sơ ứng viên để cập nhật.')
      return
    }

    setSaving(true)
    try {
      const userPayload = {
        hoTen: form.hoTen.trim(),
        soDienThoai: form.soDienThoai.trim() || undefined,
      }
      const candidatePayload = {
        viTriMongMuon: form.viTriMongMuon.trim() || undefined,
        diaChi: form.diaChi.trim() || undefined,
        tomTat: form.tomTat.trim() || undefined,
      }

      await Promise.all([
        apiCoXacThuc(`/nguoidung/${data.current.id}`, { method: 'PATCH', body: JSON.stringify(userPayload) }),
        apiCoXacThuc(`/ungvien/${data.ungVien.id}`, { method: 'PATCH', body: JSON.stringify(candidatePayload) }),
      ])

      localStorage.setItem('itjob_nguoidung', JSON.stringify({ ...data.current, ...userPayload }))
      window.dispatchEvent(new Event('itjob-auth-change'))
      toast.success('Đã cập nhật thông tin cá nhân.')
      await data.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được thông tin cá nhân.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page title="Hồ sơ năng lực" desc="Cập nhật thông tin cá nhân, tạo CV IT đầy đủ, upload file CV gốc, preview và in PDF.">
      <ErrorState message={data.error} />

      <Panel
        title="Thông tin cá nhân ứng viên"
        action={
          <Button variant="primary" loading={saving} icon={<Save size={16} />} onClick={() => void saveProfile()}>
            Lưu thông tin
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sky-900">
            <UserRound size={28} />
            <p className="mt-3 text-sm font-black">Thông tin này dùng cho dashboard, chat, ứng tuyển và các gợi ý hồ sơ.</p>
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
            <label className="grid gap-1.5">
              <span className="text-sm font-black text-slate-700">Vị trí mong muốn</span>
              <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.viTriMongMuon} onChange={event => update('viTriMongMuon', event.target.value)} />
              <FieldError message={errors.viTriMongMuon} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-black text-slate-700">Địa chỉ</span>
              <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.diaChi} onChange={event => update('diaChi', event.target.value)} />
              <FieldError message={errors.diaChi} />
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-black text-slate-700">Tóm tắt cá nhân</span>
              <textarea className="min-h-28 rounded-xl border border-slate-300 p-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.tomTat} onChange={event => update('tomTat', event.target.value)} />
              <FieldError message={errors.tomTat} />
            </label>
          </div>
        </div>
      </Panel>

      <CvStudio data={data} onReload={data.reload} />
    </Page>
  )
}
