const DURATIONS = [30, 45, 60, 90, 120]

export type InterviewTimeRangeValue = {
  thoiGianBatDau: string
  thoiGianKetThuc?: string
}

type Props = {
  value: InterviewTimeRangeValue
  onChange: (value: InterviewTimeRangeValue) => void
  errors?: Partial<Record<keyof InterviewTimeRangeValue, string>>
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addMinutes(value: string, minutes: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setMinutes(date.getMinutes() + minutes)
  return toLocalInputValue(date)
}

function durationFromRange(start?: string, end?: string) {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000)
}

export function InterviewTimeRangePicker({ value, onChange, errors }: Props) {
  const duration = durationFromRange(value.thoiGianBatDau, value.thoiGianKetThuc)

  const setStart = (nextStart: string) => {
    const nextEnd = nextStart
      ? addMinutes(nextStart, DURATIONS.includes(duration) ? duration : 60)
      : ''
    onChange({ thoiGianBatDau: nextStart, thoiGianKetThuc: nextEnd })
  }

  const setDuration = (minutes: number) => {
    if (!value.thoiGianBatDau) {
      onChange(value)
      return
    }
    onChange({ ...value, thoiGianKetThuc: addMinutes(value.thoiGianBatDau, minutes) })
  }

  return (
    <div className="grid gap-3 sm:col-span-2">
      <label className="grid gap-1.5">
        <span className="text-sm font-black text-slate-700">Thời gian phỏng vấn *</span>
        <input
          type="datetime-local"
          className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
          value={value.thoiGianBatDau}
          onChange={event => setStart(event.target.value)}
        />
        <p className="min-h-5 text-xs font-bold text-red-600">{errors?.thoiGianBatDau ?? ''}</p>
      </label>

      <div className="grid gap-2">
        <span className="text-sm font-black text-slate-700">Thời lượng</span>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(minutes => (
            <button
              key={minutes}
              type="button"
              className={`min-h-10 rounded-xl border px-3 text-sm font-black transition ${
                duration === minutes
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
              }`}
              onClick={() => setDuration(minutes)}
            >
              {minutes} phút
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-sm font-black text-slate-700">Kết thúc</span>
        <input
          type="datetime-local"
          className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500"
          value={value.thoiGianKetThuc ?? ''}
          onChange={event => onChange({ ...value, thoiGianKetThuc: event.target.value })}
        />
        <p className="min-h-5 text-xs font-bold text-red-600">{errors?.thoiGianKetThuc ?? ''}</p>
      </label>
    </div>
  )
}
