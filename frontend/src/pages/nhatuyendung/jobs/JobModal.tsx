import { useState } from 'react'
import { Save, UploadCloud, X } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiUploadCoXacThuc } from '../../../lib/auth'
import { imageUrl } from '../../../lib/format'
import type { KyNang, TinTuyenDung } from '../../../types/recruitment'
import { Drawer } from '../shared/NtdAtoms'
import { JobForm } from './JobForm'

type JobErrors = Partial<Record<'tieuDe' | 'moTa' | 'yeuCau' | 'hanNop' | 'form', string>>

function nextDefaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

function normalizeJob(job: Partial<TinTuyenDung>) {
  return {
    ...job,
    tieuDe: String(job.tieuDe ?? '').trim(),
    diaChi: String(job.diaChi ?? 'Đà Nẵng').trim(),
    moTa: String(job.moTa ?? '').trim(),
    yeuCau: String(job.yeuCau ?? '').trim(),
    quyenLoi: String(job.quyenLoi ?? '').trim() || undefined,
    yeuCauKinhNghiem: String(job.yeuCauKinhNghiem ?? '').trim() || undefined,
    loaiHinh: job.loaiHinh ?? 'hybrid',
    capBac: job.capBac ?? 'middle',
    soLuong: Number(job.soLuong ?? 1),
    luongMin: Number(job.luongMin ?? 0),
    luongMax: Number(job.luongMax ?? 0),
    hanNop: job.hanNop || undefined,
    anhDaiDien: String(job.anhDaiDien ?? '').trim() || undefined,
    kyNang: (job.kyNang ?? []).filter(item => item.maKyNang).map(item => ({ maKyNang: String(item.maKyNang), batBuoc: Boolean(item.batBuoc ?? true) })),
  }
}

function validateJob(job: Partial<TinTuyenDung>): JobErrors {
  const errors: JobErrors = {}
  if (String(job.tieuDe ?? '').trim().length < 3) errors.tieuDe = 'Tiêu đề tối thiểu 3 ký tự'
  if (String(job.moTa ?? '').trim().length < 10) errors.moTa = 'Mô tả tối thiểu 10 ký tự'
  if (String(job.yeuCau ?? '').trim().length < 10) errors.yeuCau = 'Yêu cầu tối thiểu 10 ký tự'
  if (job.hanNop && new Date(job.hanNop).getTime() < Date.now()) errors.hanNop = 'Hạn nộp phải là ngày trong tương lai'
  return errors
}

export function JobModal({ initial, companyId, skills, onClose, onSubmit }: { initial?: Partial<TinTuyenDung>; companyId?: string; skills: KyNang[]; onClose: () => void; onSubmit: (value: Partial<TinTuyenDung>) => Promise<void> }) {
  const [job, setJob] = useState<Partial<TinTuyenDung>>({
    maNhaTuyenDung: companyId ?? '',
    tieuDe: '',
    diaChi: 'Đà Nẵng',
    luongMin: 15000000,
    luongMax: 30000000,
    loaiHinh: 'hybrid',
    capBac: 'middle',
    soLuong: 1,
    hanNop: nextDefaultDeadline(),
    moTa: '',
    yeuCau: '',
    quyenLoi: '',
    trangThai: 'cho_duyet',
    kyNang: [],
    ...initial,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<JobErrors>({})

  const uploadImage = async (file?: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append('anh', file)
    setUploading(true)
    try {
      const data = await apiUploadCoXacThuc('/tintuyendung/upload-anh', formData)
      setJob(current => ({ ...current, anhDaiDien: data.duongDan ?? data.url }))
      setErrors({})
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Không upload được ảnh tin' })
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    const payload = normalizeJob(job)
    const nextErrors = validateJob(payload)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setSaving(true)
    try {
      setErrors({})
      await onSubmit(payload)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Không lưu được tin tuyển dụng' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer title={job.id ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'} onClose={onClose} footer={<ButtonGroup><Button onClick={onClose}>Hủy</Button><Button form="job-form" type="submit" variant="primary" loading={saving} icon={<Save size={16} />}>Lưu tin</Button></ButtonGroup>}>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-800">Ảnh/banner tin tuyển dụng</p>
            <p className="text-xs font-semibold text-slate-500">Hiển thị ở trang chi tiết việc làm, tối đa 5MB.</p>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50">
            <UploadCloud size={16} />
            {uploading ? 'Đang tải...' : 'Tải ảnh'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={event => void uploadImage(event.target.files?.[0])} />
          </label>
        </div>
        {job.anhDaiDien && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            <img src={imageUrl(job.anhDaiDien)} alt="Banner tin tuyển dụng" className="h-36 w-full object-cover" />
            <button type="button" className="flex min-h-10 w-full items-center justify-center gap-2 border-t border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50" onClick={() => setJob(current => ({ ...current, anhDaiDien: '' }))}>
              <X size={16} /> Xóa ảnh
            </button>
          </div>
        )}
      </div>
      <JobForm job={job} skills={skills} errors={errors} onChange={next => { setJob(next); if (Object.keys(errors).length) setErrors({}) }} onSubmit={event => { event.preventDefault(); void submit() }} />
    </Drawer>
  )
}
