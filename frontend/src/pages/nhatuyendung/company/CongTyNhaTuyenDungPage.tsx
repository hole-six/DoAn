import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Building2, RefreshCw, Save, Upload, X } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiCoXacThuc, apiUploadCoXacThuc } from '../../../lib/auth'
import { capNhatPhienBanTaiNguyen } from '../../../lib/env'
import { phatCapNhatCongTyNhaTuyenDung } from '../../../lib/employerCompanySync'
import { getEmployerGate } from '../../../lib/employerGate'
import { imageUrl } from '../../../lib/format'
import type { NhaTuyenDung } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'

type CompanyForm = Pick<NhaTuyenDung, 'tenCongTy' | 'maSoThue' | 'nganh' | 'quyMo' | 'website' | 'diaChi' | 'moTa' | 'logo'>
type CompanyErrors = Partial<Record<keyof CompanyForm | 'form', string>>

const emptyForm: CompanyForm = {
  tenCongTy: '',
  maSoThue: '',
  nganh: '',
  quyMo: undefined,
  website: '',
  diaChi: '',
  moTa: '',
  logo: '',
}

function companyToForm(company?: NhaTuyenDung): CompanyForm {
  return {
    tenCongTy: company?.tenCongTy ?? '',
    maSoThue: company?.maSoThue ?? '',
    nganh: company?.nganh ?? '',
    quyMo: company?.quyMo,
    website: company?.website ?? '',
    diaChi: company?.diaChi ?? '',
    moTa: company?.moTa ?? '',
    logo: company?.logo ?? '',
  }
}

function validate(form: CompanyForm): CompanyErrors {
  const errors: CompanyErrors = {}
  if (form.tenCongTy.trim().length < 2) errors.tenCongTy = 'Tên công ty phải có ít nhất 2 ký tự.'
  if (form.maSoThue && !/^[0-9A-Za-z-]{6,20}$/.test(form.maSoThue.trim())) errors.maSoThue = 'Mã số thuế không hợp lệ.'
  if (form.website) {
    try {
      const url = new URL(form.website)
      if (!['http:', 'https:'].includes(url.protocol)) errors.website = 'Website phải bắt đầu bằng http hoặc https.'
    } catch {
      errors.website = 'Website không đúng định dạng URL.'
    }
  }
  if (form.quyMo !== undefined && form.quyMo !== null && Number(form.quyMo) < 1) errors.quyMo = 'Quy mô phải lớn hơn 0.'
  if (form.diaChi && form.diaChi.trim().length < 5) errors.diaChi = 'Địa chỉ quá ngắn.'
  if (form.moTa && form.moTa.trim().length < 20) errors.moTa = 'Mô tả nên có ít nhất 20 ký tự.'
  return errors
}

function FieldError({ message }: { message?: string }) {
  return <p className="min-h-5 text-xs font-bold text-red-600">{message ?? ''}</p>
}

export default function CongTyNhaTuyenDungPage() {
  const data = useEmployerData()
  const [form, setForm] = useState<CompanyForm>(emptyForm)
  const [savedForm, setSavedForm] = useState<CompanyForm>(emptyForm)
  const [errors, setErrors] = useState<CompanyErrors>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const logoObjectUrlRef = useRef('')
  const gateParam = new URLSearchParams(window.location.search).get('gate')
  const gate = getEmployerGate(data.company)

  useEffect(() => {
    if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current)
    const next = companyToForm(data.company)
    setForm(next)
    setSavedForm(next)
    setErrors({})
    setLogoPreview('')
  }, [data.company])

  useEffect(() => () => {
    if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current)
  }, [])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm])

  const update = <K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined, form: undefined }))
  }

  const uploadLogo = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Chỉ nhận file ảnh.' }))
      return
    }
    const previousLogo = form.logo
    if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current)
    const previewUrl = URL.createObjectURL(file)
    logoObjectUrlRef.current = previewUrl
    setLogoPreview(previewUrl)
    setUploading(true)
    try {
      const body = new FormData()
      body.append('logo', file)
      const res = await apiUploadCoXacThuc('/nhatuyendung/upload-logo', body)
      const nextLogo = res.duongDan ?? res.url ?? ''
      if (!nextLogo) throw new Error('Upload logo không trả về đường dẫn.')
      capNhatPhienBanTaiNguyen(nextLogo)
      update('logo', nextLogo)
      setErrors(prev => ({ ...prev, logo: undefined }))
    } catch (err) {
      update('logo', previousLogo)
      setErrors(prev => ({ ...prev, logo: err instanceof Error ? err.message : 'Upload logo thất bại.' }))
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current)
      logoObjectUrlRef.current = ''
    }
    setForm(savedForm)
    setErrors({})
    setLogoPreview('')
  }

  const save = async () => {
    if (!data.company?.id) return
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        tenCongTy: form.tenCongTy.trim(),
        maSoThue: form.maSoThue?.trim() || undefined,
        nganh: form.nganh?.trim() || undefined,
        quyMo: form.quyMo ? Number(form.quyMo) : undefined,
        website: form.website?.trim() || undefined,
        diaChi: form.diaChi?.trim() || undefined,
        moTa: form.moTa?.trim() || undefined,
        logo: form.logo || undefined,
      }
      const savedCompany = await apiCoXacThuc(`/nhatuyendung/${data.company.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      const normalized = companyToForm(savedCompany)
      setForm(normalized)
      setSavedForm(normalized)
      data.updateCompany(savedCompany)
      setSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
      phatCapNhatCongTyNhaTuyenDung()
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current)
        logoObjectUrlRef.current = ''
      }
      setLogoPreview('')
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Không lưu được hồ sơ công ty.' })
    } finally {
      setSaving(false)
    }
  }

  const previewLogo = logoPreview || (form.logo ? `${imageUrl(form.logo)}` : 'https://placehold.co/256x256/eaf2ff/075985?text=IT')

  return (
    <Page
      title="Hồ sơ công ty"
      desc="Cập nhật đầy đủ thông tin doanh nghiệp để ứng viên nhìn thấy một hồ sơ tuyển dụng rõ ràng và đáng tin cậy."
      action={<Button icon={<RefreshCw size={16} />} onClick={() => void data.reload()}>Làm mới</Button>}
    >
      <ErrorState message={data.error} />
      {gateParam && !gate.allowed && (
        <Panel>
          <div className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <AlertTriangle size={24} />
            <div>
              <h2 className="text-base font-black">Cần hoàn thiện và được duyệt công ty trước khi tuyển dụng</h2>
              <p className="mt-1 text-sm font-bold leading-6">{gate.message}</p>
            </div>
          </div>
        </Panel>
      )}
      {!data.company ? (
        <EmptyState>Chưa tìm thấy hồ sơ công ty của tài khoản này.</EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Panel className="h-fit">
            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <img className="h-32 w-32 rounded-2xl border border-slate-200 bg-white object-cover" src={previewLogo} alt={form.tenCongTy || 'Logo công ty'} />
                <div className="mt-4">
                  <h2 className="text-2xl font-black text-slate-950">{form.tenCongTy || 'Tên công ty'}</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">{form.nganh || 'Ngành nghề'} · {form.diaChi || 'Địa chỉ'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone={data.company.trangThaiDuyet === 'da_duyet' ? 'green' : data.company.trangThaiDuyet === 'tu_choi' ? 'red' : 'yellow'}>
                  {data.company.trangThaiDuyet === 'da_duyet' ? 'Đã duyệt' : data.company.trangThaiDuyet === 'tu_choi' ? 'Bị từ chối' : 'Đang chờ duyệt'}
                </Badge>
                {dirty && <Badge tone="yellow">Có thay đổi chưa lưu</Badge>}
                {savedAt && !dirty && <Badge tone="green">Đã lưu {savedAt}</Badge>}
              </div>

              {data.company.lyDoTuChoi && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
                  Lý do từ chối: {data.company.lyDoTuChoi}
                </div>
              )}

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-800">Logo công ty</span>
                <input className="sr-only" id="company-logo-upload" type="file" accept="image/*" onChange={event => void uploadLogo(event.target.files?.[0])} />
                <Button type="button" loading={uploading} icon={<Upload size={16} />} onClick={() => document.getElementById('company-logo-upload')?.click()}>
                  Upload logo
                </Button>
                {form.logo && (
                  <Button type="button" variant="ghost" icon={<X size={16} />} onClick={() => {
                    update('logo', '')
                    setLogoPreview('')
                  }}>
                    Xóa logo
                  </Button>
                )}
                <FieldError message={errors.logo} />
              </label>
            </div>
          </Panel>

          <Panel>
            <div className="grid gap-4">
              {errors.form && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{errors.form}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Tên công ty *</span>
                  <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.tenCongTy} onChange={event => update('tenCongTy', event.target.value)} />
                  <FieldError message={errors.tenCongTy} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Mã số thuế</span>
                  <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.maSoThue ?? ''} onChange={event => update('maSoThue', event.target.value)} />
                  <FieldError message={errors.maSoThue} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Ngành nghề</span>
                  <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.nganh ?? ''} onChange={event => update('nganh', event.target.value)} />
                  <FieldError message={errors.nganh} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Quy mô nhân sự</span>
                  <input type="number" min={1} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.quyMo ?? ''} onChange={event => update('quyMo', event.target.value ? Number(event.target.value) : undefined)} />
                  <FieldError message={errors.quyMo} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Website</span>
                  <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="https://congty.vn" value={form.website ?? ''} onChange={event => update('website', event.target.value)} />
                  <FieldError message={errors.website} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-black text-slate-800">Địa chỉ</span>
                  <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-500" value={form.diaChi ?? ''} onChange={event => update('diaChi', event.target.value)} />
                  <FieldError message={errors.diaChi} />
                </label>
              </div>
              <label className="grid gap-1.5">
                <span className="text-sm font-black text-slate-800">Mô tả công ty</span>
                <textarea className="min-h-40 rounded-xl border border-slate-300 p-3 text-sm font-semibold leading-6 outline-none focus:border-blue-500" value={form.moTa ?? ''} onChange={event => update('moTa', event.target.value)} />
                <FieldError message={errors.moTa} />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="text-sm font-bold text-slate-500"><Building2 size={15} className="mr-1 inline" /> Thông tin này được dùng trên trang công ty và tin tuyển dụng.</p>
                <ButtonGroup>
                  <Button type="button" onClick={resetForm} disabled={!dirty || saving}>Hoàn tác</Button>
                  <Button type="button" variant="primary" loading={saving} icon={<Save size={16} />} onClick={() => void save()} disabled={!dirty}>
                    Lưu hồ sơ
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </Page>
  )
}
