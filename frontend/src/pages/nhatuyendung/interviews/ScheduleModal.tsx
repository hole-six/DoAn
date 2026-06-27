import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { Drawer } from '../shared/NtdAtoms'
import { InterviewTimeRangePicker } from './InterviewTimeRangePicker'

export type ScheduleValue = {
  thoiGianBatDau: string
  thoiGianKetThuc?: string
  hinhThuc: 'online' | 'offline'
  diaChi?: string
  linkHop?: string
  ghiChu?: string
}

type ScheduleErrors = Partial<Record<keyof ScheduleValue | 'form', string>>

function validateSchedule(form: ScheduleValue): ScheduleErrors {
  const errors: ScheduleErrors = {}
  const start = form.thoiGianBatDau ? new Date(form.thoiGianBatDau) : null
  const end = form.thoiGianKetThuc ? new Date(form.thoiGianKetThuc) : null

  if (!start || Number.isNaN(start.getTime())) {
    errors.thoiGianBatDau = 'Vui lòng chọn thời gian bắt đầu.'
  } else if (start.getTime() < Date.now() - 60_000) {
    errors.thoiGianBatDau = 'Thời gian phỏng vấn phải ở tương lai.'
  }

  if (!end || Number.isNaN(end.getTime())) {
    errors.thoiGianKetThuc = 'Vui lòng chọn thời gian kết thúc.'
  } else if (start && end <= start) {
    errors.thoiGianKetThuc = 'Thời gian kết thúc phải sau thời gian bắt đầu.'
  } else if (start) {
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
    if (durationMinutes < 15) errors.thoiGianKetThuc = 'Lịch phỏng vấn tối thiểu 15 phút.'
    if (durationMinutes > 240) errors.thoiGianKetThuc = 'Lịch phỏng vấn tối đa 4 giờ.'
  }

  if (form.hinhThuc === 'online') {
    if (!form.linkHop?.trim()) {
      errors.linkHop = 'Phỏng vấn online cần có link.'
    } else {
      try {
        const url = new URL(form.linkHop)
        if (!['http:', 'https:'].includes(url.protocol)) errors.linkHop = 'Link phải bắt đầu bằng http hoặc https.'
      } catch {
        errors.linkHop = 'Link phỏng vấn online không đúng định dạng.'
      }
    }
  }

  if (form.hinhThuc === 'offline' && !form.diaChi?.trim()) {
    errors.diaChi = 'Phỏng vấn offline cần có địa điểm.'
  }

  return errors
}

function FieldError({ message }: { message?: string }) {
  return <p className="min-h-5 text-xs font-bold text-red-600">{message ?? ''}</p>
}

export function ScheduleModal({
  title = 'Mời phỏng vấn',
  initial,
  onClose,
  onSubmit,
}: {
  title?: string
  initial?: Partial<ScheduleValue>
  onClose: () => void
  onSubmit: (value: ScheduleValue) => Promise<void>
}) {
  const [form, setForm] = useState<ScheduleValue>({ thoiGianBatDau: '', hinhThuc: 'online', ...initial })
  const [errors, setErrors] = useState<ScheduleErrors>({})
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof ScheduleValue>(key: K, value: ScheduleValue[K]) => {
    setForm(prev => {
      if (key === 'hinhThuc') {
        return value === 'offline'
          ? { ...prev, hinhThuc: 'offline', linkHop: undefined }
          : { ...prev, hinhThuc: 'online', diaChi: undefined }
      }
      return { ...prev, [key]: value }
    })
    setErrors(prev => ({ ...prev, [key]: undefined, form: undefined }))
  }

  const save = async () => {
    const nextErrors = validateSchedule(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await onSubmit({
        ...form,
        diaChi: form.hinhThuc === 'offline' ? form.diaChi?.trim() || undefined : undefined,
        linkHop: form.hinhThuc === 'online' ? form.linkHop?.trim() || undefined : undefined,
        ghiChu: form.ghiChu?.trim() || undefined,
      })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Không lưu được lịch phỏng vấn.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      title={title}
      onClose={onClose}
      footer={
        <ButtonGroup>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="primary" loading={saving} icon={<CalendarPlus size={16} />} onClick={() => void save()}>
            Lưu lịch
          </Button>
        </ButtonGroup>
      }
    >
      <div className="schedule-modal-form grid gap-3 sm:grid-cols-2">
        {errors.form && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{errors.form}</div>}

        <InterviewTimeRangePicker
          value={{ thoiGianBatDau: form.thoiGianBatDau, thoiGianKetThuc: form.thoiGianKetThuc }}
          errors={{ thoiGianBatDau: errors.thoiGianBatDau, thoiGianKetThuc: errors.thoiGianKetThuc }}
          onChange={value => {
            setForm(prev => ({ ...prev, ...value }))
            setErrors(prev => ({ ...prev, thoiGianBatDau: undefined, thoiGianKetThuc: undefined, form: undefined }))
          }}
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-black text-slate-700">Hình thức *</span>
          <select
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
            value={form.hinhThuc}
            onChange={event => update('hinhThuc', event.target.value as 'online' | 'offline')}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <FieldError />
        </label>

        {form.hinhThuc === 'online' ? (
          <label className="grid gap-1.5">
            <span className="text-sm font-black text-slate-700">Link phỏng vấn online *</span>
            <input
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
              value={form.linkHop ?? ''}
              onChange={event => update('linkHop', event.target.value)}
            />
            <FieldError message={errors.linkHop} />
          </label>
        ) : (
          <label className="grid gap-1.5">
            <span className="text-sm font-black text-slate-700">Địa điểm phỏng vấn *</span>
            <input
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
              value={form.diaChi ?? ''}
              onChange={event => update('diaChi', event.target.value)}
            />
            <FieldError message={errors.diaChi} />
          </label>
        )}

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="text-sm font-black text-slate-700">Ghi chú</span>
          <textarea
            className="min-h-24 rounded-xl border border-slate-300 p-3 text-sm font-semibold outline-none focus:border-blue-500"
            value={form.ghiChu ?? ''}
            onChange={event => update('ghiChu', event.target.value)}
          />
          <FieldError />
        </label>
      </div>
    </Drawer>
  )
}
