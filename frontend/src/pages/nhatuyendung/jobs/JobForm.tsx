import type { FormEvent } from 'react'
import { SkillPicker } from './SkillPicker'
import type { KyNang, TinTuyenDung } from '../../../types/recruitment'

type JobErrors = Partial<Record<'tieuDe' | 'moTa' | 'yeuCau' | 'hanNop' | 'form', string>>

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs font-bold text-rose-600">{message}</span> : null
}

export function JobForm({ job, skills, errors = {}, onChange, onSubmit }: { job: Partial<TinTuyenDung>; skills: KyNang[]; errors?: JobErrors; onChange: (job: Partial<TinTuyenDung>) => void; onSubmit: (event: FormEvent) => void }) {
  const selected = (job.kyNang ?? []).map(item => String(item.maKyNang ?? '')).filter(Boolean)
  return (
    <form id="job-form" className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
      {errors.form && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700 sm:col-span-2">{errors.form}</div>}
      <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-black text-slate-700">Tiêu đề</span><input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.tieuDe ?? ''} onChange={event => onChange({ ...job, tieuDe: event.target.value })} required /><FieldError message={errors.tieuDe} /></label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Địa chỉ</span><input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.diaChi ?? 'Da Nang'} onChange={event => onChange({ ...job, diaChi: event.target.value })} /></label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Hạn nộp</span><input type="date" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={String(job.hanNop ?? '').slice(0, 10)} onChange={event => onChange({ ...job, hanNop: event.target.value })} /><FieldError message={errors.hanNop} /></label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Lương min</span><input type="number" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.luongMin ?? 0} onChange={event => onChange({ ...job, luongMin: Number(event.target.value) })} /></label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Lương max</span><input type="number" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.luongMax ?? 0} onChange={event => onChange({ ...job, luongMax: Number(event.target.value) })} /></label>
      <label className="grid gap-1.5">
        <span className="text-sm font-black text-slate-700">Loại hình</span>
        <select className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.loaiHinh ?? 'hybrid'} onChange={event => onChange({ ...job, loaiHinh: event.target.value })}>
          <option value="toan_thoi_gian">Toàn thời gian</option>
          <option value="ban_thoi_gian">Bán thời gian</option>
          <option value="thuc_tap">Thực tập</option>
          <option value="tu_xa">Từ xa</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-black text-slate-700">Cấp bậc</span>
        <select className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.capBac ?? 'middle'} onChange={event => onChange({ ...job, capBac: event.target.value })}>
          <option value="intern">Intern</option>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Số lượng</span><input type="number" min={1} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.soLuong ?? 1} onChange={event => onChange({ ...job, soLuong: Number(event.target.value) })} /></label>
      <label className="grid gap-1.5"><span className="text-sm font-black text-slate-700">Kinh nghiệm</span><input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold" value={job.yeuCauKinhNghiem ?? ''} onChange={event => onChange({ ...job, yeuCauKinhNghiem: event.target.value })} placeholder="VD: 2+ năm Node.js" /></label>
      <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-black text-slate-700">Mô tả</span><textarea className="min-h-28 rounded-xl border border-slate-300 p-3 text-sm font-semibold" value={job.moTa ?? ''} onChange={event => onChange({ ...job, moTa: event.target.value })} required /><FieldError message={errors.moTa} /></label>
      <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-black text-slate-700">Yêu cầu</span><textarea className="min-h-28 rounded-xl border border-slate-300 p-3 text-sm font-semibold" value={job.yeuCau ?? ''} onChange={event => onChange({ ...job, yeuCau: event.target.value })} required /><FieldError message={errors.yeuCau} /></label>
      <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-black text-slate-700">Quyền lợi</span><textarea className="min-h-24 rounded-xl border border-slate-300 p-3 text-sm font-semibold" value={job.quyenLoi ?? ''} onChange={event => onChange({ ...job, quyenLoi: event.target.value })} /></label>
      <div className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-black text-slate-700">Kỹ năng</span><SkillPicker skills={skills} selected={selected} onChange={next => onChange({ ...job, kyNang: next.map(maKyNang => ({ maKyNang, batBuoc: true })) })} /></div>
    </form>
  )
}
