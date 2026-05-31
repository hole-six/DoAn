import { useEffect, useState } from 'react'
import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { clsx } from 'clsx'
import { Bell, Briefcase, Calendar, CheckCircle, Edit3, Eye, ImagePlus, Plus, Save, Trash2, Users, XCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

type Tone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

const toneClass: Record<Tone, string> = {
  blue: 'bg-blue-100 text-[#0e4d7d]',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-slate-100 text-slate-600',
}

const ntdScope = [
  'mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-3 pb-4 lg:gap-4',
  '[&_.primary-button]:inline-flex [&_.primary-button]:min-h-11 [&_.primary-button]:w-full [&_.primary-button]:items-center [&_.primary-button]:justify-center [&_.primary-button]:gap-2 [&_.primary-button]:rounded-xl [&_.primary-button]:bg-[#0e4d7d] [&_.primary-button]:px-4 [&_.primary-button]:text-sm [&_.primary-button]:font-black [&_.primary-button]:text-white [&_.primary-button]:shadow-[0_8px_18px_rgba(14,77,125,0.24)] [&_.primary-button]:transition [&_.primary-button]:hover:bg-[#0a3659] sm:[&_.primary-button]:w-auto',
  '[&_.ntd-actions]:flex [&_.ntd-actions]:flex-wrap [&_.ntd-actions]:items-center [&_.ntd-actions]:gap-2',
  '[&_.ntd-actions_button]:inline-flex [&_.ntd-actions_button]:min-h-9 [&_.ntd-actions_button]:items-center [&_.ntd-actions_button]:justify-center [&_.ntd-actions_button]:gap-1.5 [&_.ntd-actions_button]:rounded-xl [&_.ntd-actions_button]:border [&_.ntd-actions_button]:border-slate-200 [&_.ntd-actions_button]:bg-white [&_.ntd-actions_button]:px-3 [&_.ntd-actions_button]:text-xs [&_.ntd-actions_button]:font-black [&_.ntd-actions_button]:text-slate-900',
  '[&_.ntd-bars]:grid [&_.ntd-bars]:gap-3 [&_.ntd-bars_div]:grid [&_.ntd-bars_div]:grid-cols-[minmax(0,140px)_minmax(0,1fr)_auto] [&_.ntd-bars_div]:items-center [&_.ntd-bars_div]:gap-2 [&_.ntd-bars_span]:truncate [&_.ntd-bars_span]:text-xs [&_.ntd-bars_span]:font-bold [&_.ntd-bars_span]:text-slate-500 [&_.ntd-bars_i]:h-2.5 [&_.ntd-bars_i]:overflow-hidden [&_.ntd-bars_i]:rounded-full [&_.ntd-bars_i]:bg-slate-100 [&_.ntd-bars_b]:block [&_.ntd-bars_b]:h-full [&_.ntd-bars_b]:rounded-full [&_.ntd-bars_b]:bg-[#0e4d7d] [&_.ntd-bars_strong]:text-xs [&_.ntd-bars_strong]:font-black [&_.ntd-bars_strong]:text-slate-900',
  '[&_.ntd-clickable]:cursor-pointer [&_.ntd-clickable]:transition [&_.ntd-clickable]:hover:border-[#0e4d7d]/30 [&_.ntd-clickable]:hover:bg-sky-50',
  '[&_.ntd-company-strip]:grid [&_.ntd-company-strip]:gap-3 [&_.ntd-company-strip]:rounded-2xl [&_.ntd-company-strip]:border [&_.ntd-company-strip]:border-slate-200 [&_.ntd-company-strip]:bg-white [&_.ntd-company-strip]:p-4 [&_.ntd-company-strip]:shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:[&_.ntd-company-strip]:grid-cols-[72px_minmax(0,1fr)_auto] sm:[&_.ntd-company-strip]:items-center [&_.ntd-company-strip_img]:h-16 [&_.ntd-company-strip_img]:w-16 [&_.ntd-company-strip_img]:rounded-2xl [&_.ntd-company-strip_img]:object-cover [&_.ntd-company-strip_p]:text-[11px] [&_.ntd-company-strip_p]:font-black [&_.ntd-company-strip_p]:uppercase [&_.ntd-company-strip_p]:tracking-wide [&_.ntd-company-strip_p]:text-slate-500 [&_.ntd-company-strip_h2]:truncate [&_.ntd-company-strip_h2]:text-xl [&_.ntd-company-strip_h2]:font-black [&_.ntd-company-strip_h2]:text-slate-950 [&_.ntd-company-strip_span]:block [&_.ntd-company-strip_span]:truncate [&_.ntd-company-strip_span]:text-sm [&_.ntd-company-strip_span]:font-semibold [&_.ntd-company-strip_span]:text-slate-500',
  '[&_.ntd-detail-actions]:mt-3',
  '[&_.ntd-detail-grid]:grid [&_.ntd-detail-grid]:grid-cols-[110px_minmax(0,1fr)] [&_.ntd-detail-grid]:gap-2 [&_.ntd-detail-grid]:rounded-2xl [&_.ntd-detail-grid]:border [&_.ntd-detail-grid]:border-slate-200 [&_.ntd-detail-grid]:bg-slate-50 [&_.ntd-detail-grid]:p-3 [&_.ntd-detail-grid_span]:text-xs [&_.ntd-detail-grid_span]:font-black [&_.ntd-detail-grid_span]:uppercase [&_.ntd-detail-grid_span]:tracking-wide [&_.ntd-detail-grid_span]:text-slate-500 [&_.ntd-detail-grid_strong]:min-w-0 [&_.ntd-detail-grid_strong]:break-words [&_.ntd-detail-grid_strong]:text-sm [&_.ntd-detail-grid_strong]:font-black [&_.ntd-detail-grid_strong]:text-slate-950',
  '[&_.ntd-drawer]:fixed [&_.ntd-drawer]:inset-0 [&_.ntd-drawer]:z-[300] [&_.ntd-drawer]:flex [&_.ntd-drawer]:items-stretch [&_.ntd-drawer]:justify-center [&_.ntd-drawer]:bg-slate-900/50 [&_.ntd-drawer]:p-0 [&_.ntd-drawer]:backdrop-blur-md [&_.ntd-drawer-card]:flex [&_.ntd-drawer-card]:h-dvh [&_.ntd-drawer-card]:w-full [&_.ntd-drawer-card]:max-w-none [&_.ntd-drawer-card]:flex-col [&_.ntd-drawer-card]:gap-3 [&_.ntd-drawer-card]:overflow-y-auto [&_.ntd-drawer-card]:rounded-none [&_.ntd-drawer-card]:border-0 [&_.ntd-drawer-card]:bg-white [&_.ntd-drawer-card]:p-4 [&_.ntd-drawer-card]:shadow-none sm:[&_.ntd-drawer-card]:p-6',
  '[&_.ntd-empty]:rounded-2xl [&_.ntd-empty]:border [&_.ntd-empty]:border-dashed [&_.ntd-empty]:border-slate-300 [&_.ntd-empty]:bg-white [&_.ntd-empty]:px-4 [&_.ntd-empty]:py-6 [&_.ntd-empty]:text-center [&_.ntd-empty]:text-sm [&_.ntd-empty]:font-extrabold [&_.ntd-empty]:text-slate-500',
  '[&_.ntd-error]:rounded-xl [&_.ntd-error]:border [&_.ntd-error]:border-rose-200 [&_.ntd-error]:bg-rose-50 [&_.ntd-error]:px-3 [&_.ntd-error]:py-2.5 [&_.ntd-error]:text-sm [&_.ntd-error]:font-extrabold [&_.ntd-error]:text-rose-700',
  '[&_.ntd-field]:grid [&_.ntd-field]:gap-1.5 [&_.ntd-field]:text-[11px] [&_.ntd-field]:font-black [&_.ntd-field]:uppercase [&_.ntd-field]:tracking-wide [&_.ntd-field]:text-slate-600 [&_.ntd-field-wide]:sm:col-span-2',
  '[&_.ntd-filterbar]:flex [&_.ntd-filterbar]:justify-end [&_.ntd-filterbar_select]:min-h-11 [&_.ntd-filterbar_select]:w-full [&_.ntd-filterbar_select]:rounded-xl [&_.ntd-filterbar_select]:border [&_.ntd-filterbar_select]:border-slate-200 [&_.ntd-filterbar_select]:bg-white [&_.ntd-filterbar_select]:px-3 [&_.ntd-filterbar_select]:text-sm [&_.ntd-filterbar_select]:font-semibold [&_.ntd-filterbar_select]:text-slate-900 sm:[&_.ntd-filterbar_select]:w-60',
  '[&_.ntd-form]:grid [&_.ntd-form]:grid-cols-1 [&_.ntd-form]:gap-3 sm:[&_.ntd-form]:grid-cols-2 [&_.ntd-form_input]:min-h-11 [&_.ntd-form_input]:w-full [&_.ntd-form_input]:rounded-xl [&_.ntd-form_input]:border [&_.ntd-form_input]:border-slate-200 [&_.ntd-form_input]:bg-white [&_.ntd-form_input]:px-3 [&_.ntd-form_input]:text-sm [&_.ntd-form_input]:font-semibold [&_.ntd-form_input]:text-slate-900 [&_.ntd-form_input]:outline-none [&_.ntd-form_select]:min-h-11 [&_.ntd-form_select]:w-full [&_.ntd-form_select]:rounded-xl [&_.ntd-form_select]:border [&_.ntd-form_select]:border-slate-200 [&_.ntd-form_select]:bg-white [&_.ntd-form_select]:px-3 [&_.ntd-form_select]:text-sm [&_.ntd-form_select]:font-semibold [&_.ntd-form_select]:text-slate-900 [&_.ntd-form_textarea]:min-h-24 [&_.ntd-form_textarea]:w-full [&_.ntd-form_textarea]:rounded-xl [&_.ntd-form_textarea]:border [&_.ntd-form_textarea]:border-slate-200 [&_.ntd-form_textarea]:bg-white [&_.ntd-form_textarea]:px-3 [&_.ntd-form_textarea]:py-2.5 [&_.ntd-form_textarea]:text-sm [&_.ntd-form_textarea]:font-semibold [&_.ntd-form_textarea]:leading-relaxed [&_.ntd-form-actions]:grid [&_.ntd-form-actions]:gap-2 sm:[&_.ntd-form-actions]:col-span-2 sm:[&_.ntd-form-actions]:flex sm:[&_.ntd-form-actions]:justify-end',
  '[&_.ntd-grid]:grid [&_.ntd-grid]:gap-3 lg:[&_.ntd-grid]:grid-cols-2 [&_.ntd-grid>section:first-child]:lg:col-span-2',
  '[&_.ntd-kpi-grid]:grid [&_.ntd-kpi-grid]:grid-cols-2 [&_.ntd-kpi-grid]:gap-2.5 max-[380px]:[&_.ntd-kpi-grid]:grid-cols-1 lg:[&_.ntd-kpi-grid]:grid-cols-4',
  '[&_.ntd-kpi]:grid [&_.ntd-kpi]:min-w-0 [&_.ntd-kpi]:gap-1 [&_.ntd-kpi]:rounded-2xl [&_.ntd-kpi]:border [&_.ntd-kpi]:border-slate-200 [&_.ntd-kpi]:bg-white [&_.ntd-kpi]:p-3.5 [&_.ntd-kpi]:shadow-[0_8px_24px_rgba(14,77,125,0.07)] [&_.ntd-kpi_svg]:mb-1 [&_.ntd-kpi_svg]:rounded-xl [&_.ntd-kpi_svg]:bg-sky-100 [&_.ntd-kpi_svg]:p-2 [&_.ntd-kpi_svg]:text-[#0e4d7d] [&_.ntd-kpi_p]:text-[10px] [&_.ntd-kpi_p]:font-black [&_.ntd-kpi_p]:uppercase [&_.ntd-kpi_p]:leading-snug [&_.ntd-kpi_p]:tracking-wide [&_.ntd-kpi_p]:text-slate-500 [&_.ntd-kpi_strong]:text-2xl [&_.ntd-kpi_strong]:font-black [&_.ntd-kpi_strong]:leading-none [&_.ntd-kpi_strong]:text-slate-950',
  '[&_.ntd-logo-preview]:flex [&_.ntd-logo-preview]:h-24 [&_.ntd-logo-preview]:w-24 [&_.ntd-logo-preview]:items-center [&_.ntd-logo-preview]:justify-center [&_.ntd-logo-preview]:overflow-hidden [&_.ntd-logo-preview]:rounded-2xl [&_.ntd-logo-preview]:border [&_.ntd-logo-preview]:border-slate-200 [&_.ntd-logo-preview]:bg-slate-50 [&_.ntd-logo-preview]:text-sm [&_.ntd-logo-preview]:font-black [&_.ntd-logo-preview]:text-slate-400 [&_.ntd-logo-preview_img]:h-full [&_.ntd-logo-preview_img]:w-full [&_.ntd-logo-preview_img]:object-cover [&_.ntd-logo-upload]:flex [&_.ntd-logo-upload]:flex-wrap [&_.ntd-logo-upload]:items-center [&_.ntd-logo-upload]:gap-3 [&_.ntd-logo-upload_p]:mt-2 [&_.ntd-logo-upload_p]:text-xs [&_.ntd-logo-upload_p]:font-semibold [&_.ntd-logo-upload_p]:text-slate-500 [&_.ntd-upload-button]:inline-flex [&_.ntd-upload-button]:min-h-10 [&_.ntd-upload-button]:cursor-pointer [&_.ntd-upload-button]:items-center [&_.ntd-upload-button]:gap-2 [&_.ntd-upload-button]:rounded-xl [&_.ntd-upload-button]:border [&_.ntd-upload-button]:border-slate-200 [&_.ntd-upload-button]:bg-white [&_.ntd-upload-button]:px-3 [&_.ntd-upload-button]:text-sm [&_.ntd-upload-button]:font-black [&_.ntd-upload-button_input]:hidden',
  '[&_.ntd-modal]:fixed [&_.ntd-modal]:inset-0 [&_.ntd-modal]:z-[300] [&_.ntd-modal]:flex [&_.ntd-modal]:items-stretch [&_.ntd-modal]:justify-center [&_.ntd-modal]:bg-slate-900/50 [&_.ntd-modal]:p-0 [&_.ntd-modal]:backdrop-blur-md [&_.ntd-modal-card]:h-dvh [&_.ntd-modal-card]:w-full [&_.ntd-modal-card]:max-w-none [&_.ntd-modal-card]:overflow-y-auto [&_.ntd-modal-card]:rounded-none [&_.ntd-modal-card]:border-0 [&_.ntd-modal-card]:bg-white [&_.ntd-modal-card]:p-4 [&_.ntd-modal-card]:shadow-none sm:[&_.ntd-modal-card]:p-6 [&_.ntd-modal-head]:mb-3 [&_.ntd-modal-head]:flex [&_.ntd-modal-head]:items-start [&_.ntd-modal-head]:justify-between [&_.ntd-modal-head]:gap-3 [&_.ntd-modal-head_h2]:text-xl [&_.ntd-modal-head_h2]:font-black [&_.ntd-modal-head_h2]:text-slate-950 [&_.ntd-modal-head_button]:inline-flex [&_.ntd-modal-head_button]:h-9 [&_.ntd-modal-head_button]:w-9 [&_.ntd-modal-head_button]:items-center [&_.ntd-modal-head_button]:justify-center [&_.ntd-modal-head_button]:rounded-xl [&_.ntd-modal-head_button]:border [&_.ntd-modal-head_button]:border-slate-200 [&_.ntd-modal-head_button]:bg-slate-50',
  '[&_.ntd-note]:rounded-2xl [&_.ntd-note]:border [&_.ntd-note]:border-slate-200 [&_.ntd-note]:bg-white [&_.ntd-note]:p-3 [&_.ntd-note_strong]:block [&_.ntd-note_strong]:text-sm [&_.ntd-note_strong]:font-black [&_.ntd-note_strong]:text-slate-950 [&_.ntd-note_p]:mt-1 [&_.ntd-note_p]:text-sm [&_.ntd-note_p]:font-semibold [&_.ntd-note_p]:leading-relaxed [&_.ntd-note_p]:text-slate-600',
  '[&_.ntd-panel]:rounded-2xl [&_.ntd-panel]:border [&_.ntd-panel]:border-slate-200 [&_.ntd-panel]:bg-white [&_.ntd-panel]:p-4 [&_.ntd-panel]:shadow-[0_8px_24px_rgba(14,77,125,0.07)]',
  '[&_.ntd-panel-head]:mb-3 [&_.ntd-panel-head]:flex [&_.ntd-panel-head]:items-start [&_.ntd-panel-head]:justify-between [&_.ntd-panel-head]:gap-3 [&_.ntd-panel-head_h2]:text-xl [&_.ntd-panel-head_h2]:font-black [&_.ntd-panel-head_h2]:text-slate-950 [&_.ntd-panel-head_a]:text-sm [&_.ntd-panel-head_a]:font-black [&_.ntd-panel-head_a]:text-[#0e4d7d]',
  '[&_.ntd-price-grid]:grid [&_.ntd-price-grid]:gap-3 md:[&_.ntd-price-grid]:grid-cols-3 [&_.ntd-price-grid_h2]:text-xl [&_.ntd-price-grid_h2]:font-black [&_.ntd-price-grid_strong]:text-2xl [&_.ntd-price-grid_strong]:font-black [&_.ntd-price-grid_strong]:text-[#0e4d7d] [&_.ntd-price-grid_p]:text-sm [&_.ntd-price-grid_p]:font-semibold [&_.ntd-price-grid_p]:leading-relaxed [&_.ntd-price-grid_p]:text-slate-500',
  '[&_.ntd-row]:grid [&_.ntd-row]:gap-2 [&_.ntd-row]:rounded-2xl [&_.ntd-row]:border [&_.ntd-row]:border-slate-200 [&_.ntd-row]:bg-slate-50 [&_.ntd-row]:p-3 sm:[&_.ntd-row]:grid-cols-[minmax(0,1fr)_auto] sm:[&_.ntd-row]:items-center [&_.ntd-row.active]:border-[#0e4d7d] [&_.ntd-row.active]:bg-sky-50 [&_.ntd-row_strong]:block [&_.ntd-row_strong]:break-words [&_.ntd-row_strong]:text-sm [&_.ntd-row_strong]:font-black [&_.ntd-row_strong]:text-slate-950 [&_.ntd-row_p]:mt-1 [&_.ntd-row_p]:break-words [&_.ntd-row_p]:text-xs [&_.ntd-row_p]:font-semibold [&_.ntd-row_p]:leading-relaxed [&_.ntd-row_p]:text-slate-500',
  '[&_.ntd-secondary]:inline-flex [&_.ntd-secondary]:min-h-11 [&_.ntd-secondary]:items-center [&_.ntd-secondary]:justify-center [&_.ntd-secondary]:gap-2 [&_.ntd-secondary]:rounded-xl [&_.ntd-secondary]:border [&_.ntd-secondary]:border-slate-200 [&_.ntd-secondary]:bg-white [&_.ntd-secondary]:px-4 [&_.ntd-secondary]:text-sm [&_.ntd-secondary]:font-black [&_.ntd-secondary]:text-slate-900',
  '[&_.ntd-skill-grid]:grid [&_.ntd-skill-grid]:grid-cols-1 [&_.ntd-skill-grid]:gap-2 sm:[&_.ntd-skill-grid]:grid-cols-2 lg:[&_.ntd-skill-grid]:grid-cols-3 [&_.ntd-skill-grid_label]:flex [&_.ntd-skill-grid_label]:items-center [&_.ntd-skill-grid_label]:gap-2 [&_.ntd-skill-grid_label]:rounded-xl [&_.ntd-skill-grid_label]:border [&_.ntd-skill-grid_label]:border-slate-200 [&_.ntd-skill-grid_label]:bg-slate-50 [&_.ntd-skill-grid_label]:p-2.5 [&_.ntd-skill-grid_label]:text-xs [&_.ntd-skill-grid_label]:font-bold [&_.ntd-skill-grid_label]:normal-case [&_.ntd-skill-grid_label]:tracking-normal',
  '[&_.ntd-split]:grid [&_.ntd-split]:gap-3 lg:[&_.ntd-split]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
].join(' ')

function currentUser() {
  return JSON.parse(localStorage.getItem('itjob_nguoidung') ?? 'null')
}

function headers() {
  const token = localStorage.getItem('itjob_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.thongBao ?? 'Thao tác thất bại')
  return data.duLieu
}

function imageUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString('vi-VN', { hour12: false }) : '-'
}

function money(value?: number) {
  return value ? `${value.toLocaleString('vi-VN')} VND` : 'Thỏa thuận'
}

function labelJobStatus(value?: string) {
  return ({ nhap: 'Nháp', cho_duyet: 'Chờ duyệt', dang_mo: 'Đang mở', tam_dong: 'Tạm đóng', het_han: 'Hết hạn', tu_choi: 'Từ chối' } as Record<string, string>)[value ?? ''] ?? value ?? '-'
}

function toneJobStatus(value?: string): Tone {
  if (value === 'dang_mo') return 'green'
  if (value === 'tu_choi' || value === 'het_han') return 'red'
  if (value === 'cho_duyet') return 'yellow'
  return 'gray'
}

function labelAppStatus(value?: string) {
  return ({ da_nop: 'Đã nộp', da_xem: 'Đã xem', dang_xet_duyet: 'Đang xét duyệt', moi_phong_van: 'Mời phỏng vấn', dat: 'Đạt', tu_choi: 'Từ chối', da_rut: 'Đã rút' } as Record<string, string>)[value ?? ''] ?? value ?? '-'
}

function toneAppStatus(value?: string): Tone {
  if (value === 'dat') return 'green'
  if (value === 'tu_choi' || value === 'da_rut') return 'red'
  if (value === 'moi_phong_van') return 'yellow'
  return 'blue'
}

function labelInterviewStatus(value?: string) {
  return ({ da_len_lich: 'Đã lên lịch', da_xac_nhan: 'Đã xác nhận', doi_lich: 'Xin đổi lịch', hoan_thanh: 'Hoàn thành', da_huy: 'Đã hủy' } as Record<string, string>)[value ?? ''] ?? value ?? '-'
}

function useEmployerData() {
  const [state, setState] = useState<any>({ loading: true, error: '' })
  const user = currentUser()

  const load = async () => {
    try {
      setState((prev: any) => ({ ...prev, loading: true, error: '' }))
      const [companies, jobs, applications, interviews, notifications, skills] = await Promise.all([
        api('/nhatuyendung'),
        api('/tintuyendung'),
        api('/hosoungtuyen'),
        api('/lichphongvan'),
        api('/thongbao'),
        api('/danhmuckynang'),
      ])
      const company = companies.find((item: any) => {
        const itemUserId = String(item.maNguoiDung?._id ?? item.maNguoiDung ?? '')
        const currentUserId = String(user?.id ?? user?._id ?? '')
        return itemUserId === currentUserId
      })
      const myJobs = jobs.filter((item: any) => {
        const jobCompanyId = String(item.maNhaTuyenDung?._id ?? item.maNhaTuyenDung ?? '')
        return jobCompanyId === String(company?.id ?? '')
      })
      const jobIds = new Set(myJobs.map((item: any) => item.id))
      const myApplications = applications.filter((item: any) => jobIds.has(item.maTinTuyenDung))
      const appIds = new Set(myApplications.map((item: any) => item.id))
      const myInterviews = interviews.filter((item: any) => appIds.has(item.maHoSoUngTuyen))
      const myNotifications = notifications.filter((item: any) => String(item.maNguoiDung?._id ?? item.maNguoiDung) === user?.id)
      setState({ loading: false, error: '', user, company, jobs: myJobs, applications: myApplications, interviews: myInterviews, notifications: myNotifications, skills })
    } catch (err) {
      setState((prev: any) => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Không tải được dữ liệu' }))
    }
  }

  useEffect(() => { load() }, [])
  return { ...state, reload: load }
}

function Page({ title, desc, action, children }: { title: string; desc: string; action?: ReactNode; children: ReactNode }) {
  return <div className={ntdScope}><div className="relative grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:flex sm:items-center sm:justify-between sm:p-5"><span className="pointer-events-none absolute -right-14 -top-20 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" /><div className="relative z-[1] min-w-0"><span className="mb-1 block text-[11px] font-black uppercase tracking-[0.1em] text-[#0e4d7d]">ITJob Employer</span><h1 className="break-words text-2xl font-black leading-tight text-slate-950">{title}</h1><p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{desc}</p></div>{action}</div>{children}</div>
}

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  return <span className={clsx('inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black', toneClass[tone])}>{children}</span>
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="ntd-empty">{children}</div>
}

function ErrorBox({ message }: { message?: string }) {
  return message ? <div className="ntd-error">{message}</div> : null
}

function Kpi({ icon: Icon, label, value }: any) {
  return <div className="ntd-kpi"><Icon size={20} /><p>{label}</p><strong>{value}</strong></div>
}

function PanelHead({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="ntd-panel-head"><h2>{title}</h2>{action}</div>
}

export default function DashboardNhaTuyenDung() {
  const data = useEmployerData()
  if (data.loading) return <Page title="Tổng quan nhà tuyển dụng" desc="Đang tải dữ liệu..."><div className="ntd-panel">Đang tải...</div></Page>
  const openJobs = data.jobs.filter((item: any) => item.trangThai === 'dang_mo')
  const unread = data.notifications.filter((item: any) => !item.daDoc).length
  const upcoming = data.interviews.filter((item: any) => new Date(item.thoiGianBatDau) >= new Date()).length
  const pending = data.applications.filter((item: any) => ['da_nop', 'da_xem', 'dang_xet_duyet'].includes(item.trangThai))

  return <Page title={data.company?.tenCongTy ?? 'Workspace nhà tuyển dụng'} desc="Quản lý tin tuyển dụng, pipeline ứng viên, lịch phỏng vấn và hồ sơ công ty." action={<a className="primary-button" href="/nha-tuyen-dung/tao-tin"><Plus size={16} /> Đăng tin mới</a>}>
    <ErrorBox message={data.error} />
    <section className="ntd-company-strip">
      <img src={imageUrl(data.company?.logo) || 'https://placehold.co/120x120/0b1c30/ffffff?text=IT'} alt="" />
      <div><p>Trạng thái công ty</p><h2>{data.company?.tenCongTy}</h2><span>{data.company?.nganh} - {data.company?.diaChi}</span></div>
      <Badge tone={data.company?.trangThaiDuyet === 'da_duyet' ? 'green' : 'yellow'}>{data.company?.trangThaiDuyet ?? 'chờ duyệt'}</Badge>
    </section>
    <div className="ntd-kpi-grid">
      <Kpi icon={Briefcase} label="Tin đang mở" value={openJobs.length} />
      <Kpi icon={Users} label="Ứng viên" value={data.applications.length} />
      <Kpi icon={Calendar} label="Lịch sắp tới" value={upcoming} />
      <Kpi icon={Bell} label="Thông báo mới" value={unread} />
    </div>
    <div className="ntd-grid">
      <section className="ntd-panel">
        <PanelHead title="Việc cần xử lý" />
        {pending.length ? pending.slice(0, 5).map((item: any) => <ApplicationRow key={item.id} item={item} />) : <Empty>Không có hồ sơ chờ xử lý.</Empty>}
      </section>
      <section className="ntd-panel">
        <PanelHead title="Tin tuyển dụng" action={<a href="/nha-tuyen-dung/quan-ly-tin">Quản lý</a>} />
        {data.jobs.length ? data.jobs.slice(0, 5).map((job: any) => <JobRow key={job.id} job={job} />) : <Empty>Chưa có tin tuyển dụng.</Empty>}
      </section>
      <section className="ntd-panel">
        <PanelHead title="Lịch phỏng vấn" action={<a href="/nha-tuyen-dung/lich-phong-van">Xem lịch</a>} />
        {data.interviews.length ? data.interviews.slice(0, 5).map((item: any) => <InterviewRow key={item.id} item={item} />) : <Empty>Chưa có lịch phỏng vấn.</Empty>}
      </section>
    </div>
  </Page>
}

function JobRow({ job, onEdit, onDelete }: { job: any; onEdit?: () => void; onDelete?: () => void }) {
  return <div className="ntd-row"><div><strong>{job.tieuDe}</strong><p>{job.diaChi} - {money(job.luongMin)} - {money(job.luongMax)} - Hạn {formatDate(job.hanNop)}</p></div><div className="ntd-actions"><Badge tone={toneJobStatus(job.trangThai)}>{labelJobStatus(job.trangThai)}</Badge>{onEdit && <button onClick={onEdit}><Edit3 size={14} /> Sửa</button>}{onDelete && <button onClick={onDelete}><Trash2 size={14} /> Xóa</button>}</div></div>
}

function ApplicationRow({ item, onClick }: { item: any; onClick?: () => void }) {
  return <div className={`ntd-row ${onClick ? 'ntd-clickable' : ''}`} onClick={onClick}><div><strong>{item.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên'}</strong><p>{item.tinTuyenDung?.tieuDe} - {item.ungVien?.kinhNghiem ?? 0} năm KN - Khớp {item.diemKhopKyNang ?? 0}%</p></div><Badge tone={toneAppStatus(item.trangThai)}>{labelAppStatus(item.trangThai)}</Badge></div>
}

function InterviewRow({ item, onClick, active }: { item: any; onClick?: () => void; active?: boolean }) {
  return <div className={`ntd-row ${onClick ? 'ntd-clickable' : ''} ${active ? 'active' : ''}`} onClick={onClick}><div><strong>{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe}</strong><p>{formatDate(item.thoiGianBatDau)} - {item.hinhThuc} - {item.diaChi || item.linkHop}</p></div><Badge tone={item.trangThai === 'hoan_thanh' ? 'green' : item.trangThai === 'da_huy' ? 'red' : 'blue'}>{labelInterviewStatus(item.trangThai)}</Badge></div>
}

export function QuanLyTinNhaTuyenDungPage() {
  const data = useEmployerData()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState<any>(null)
  const [error, setError] = useState('')
  const jobs = (data.jobs ?? []).filter((job: any) => filter === 'all' || job.trangThai === filter)
  const remove = async (id: string) => { if (confirm('Xóa tin tuyển dụng này?')) { await api(`/tintuyendung/${id}`, { method: 'DELETE' }); await data.reload() } }
  const handleTaoTin = () => {
    if (!data.company?.id) { setError('Chưa tải được thông tin công ty. Vui lòng thử lại.'); return }
    setError('')
    setEditing(newJob(data.company.id))
  }

  return <Page title="Quản lý tin tuyển dụng" desc="Tạo, chỉnh sửa, mở/tạm đóng và theo dõi hiệu quả từng tin." action={<button className="primary-button" onClick={handleTaoTin} disabled={data.loading}><Plus size={16} /> Tạo tin</button>}>
    <ErrorBox message={error || data.error} />
    <div className="ntd-filterbar"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="nhap">Nháp</option><option value="cho_duyet">Chờ duyệt</option><option value="dang_mo">Đang mở</option><option value="tam_dong">Tạm đóng</option><option value="het_han">Hết hạn</option></select></div>
    <section className="ntd-panel">{jobs.length ? jobs.map((job: any) => <JobRow key={job.id} job={job} onEdit={() => setEditing(job)} onDelete={() => remove(job.id)} />) : <Empty>Không có tin phù hợp.</Empty>}</section>
    {editing && <JobModal job={editing} skills={data.skills ?? []} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); setError(''); await data.reload() }} onError={setError} />}
  </Page>
}

export function TaoTinNhaTuyenDungPage() {
  const data = useEmployerData()
  const [form, setForm] = useState<any>(null)
  useEffect(() => { if (data.company?.id && !form) setForm(newJob(data.company.id)) }, [data.company?.id])
  if (data.loading || !form) return <Page title="Tạo tin tuyển dụng" desc="Đang tải..."><div className="ntd-panel">Đang tải...</div></Page>
  return <Page title="Tạo tin tuyển dụng" desc="Soạn tin tuyển dụng đầy đủ mô tả, yêu cầu, quyền lợi và kỹ năng."><section className="ntd-panel"><JobForm job={form} setJob={setForm} skills={data.skills ?? []} onSubmit={async (payload: any) => { await api('/tintuyendung', { method: 'POST', body: JSON.stringify(payload) }); location.href = '/nha-tuyen-dung/quan-ly-tin' }} /></section></Page>
}

function newJob(companyId?: string) {
  return { maNhaTuyenDung: companyId, tieuDe: '', diaChi: 'Da Nang', luongMin: 15000000, luongMax: 30000000, loaiHinh: 'hybrid', capBac: 'middle', hanNop: '2026-12-31', soLuong: 1, moTa: '', yeuCau: '', quyenLoi: '', trangThai: 'cho_duyet', kyNang: [] }
}

function JobModal({ job, skills, onClose, onSaved, onError }: any) {
  // Normalize kyNang từ API (có thể là { maKyNang: { _id, tenKyNang }, batBuoc }) về dạng { maKyNang: string, batBuoc: boolean }
  const kyNangNormalized = (job.kyNang ?? []).map((x: any) => ({
    maKyNang: getKyNangId(x),
    batBuoc: x?.batBuoc ?? true,
  })).filter((x: any) => x.maKyNang)
  const [form, setForm] = useState<any>({ ...job, hanNop: job.hanNop ? String(job.hanNop).slice(0, 10) : '', kyNang: kyNangNormalized })
  return <div className="ntd-modal"><div className="ntd-modal-card"><div className="ntd-modal-head"><h2>{job.id ? 'Sửa tin tuyển dụng' : 'Tạo tin tuyển dụng'}</h2><button onClick={onClose}><XCircle size={18} /></button></div><JobForm job={form} setJob={setForm} skills={skills} onSubmit={async (payload: any) => { try { await api(`/tintuyendung${job.id ? `/${job.id}` : ''}`, { method: job.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); await onSaved() } catch (err) { onError(err instanceof Error ? err.message : 'Không lưu được tin') } }} /></div></div>
}

function getKyNangId(x: any): string {
  if (typeof x === 'string') return x
  const mk = x?.maKyNang
  if (!mk) return ''
  if (typeof mk === 'string') return mk
  return String(mk?._id ?? mk)
}

// Nhóm kỹ năng theo loại để dễ chọn
function groupSkills(skills: any[]) {
  const groups: Record<string, any[]> = {}
  for (const s of skills) {
    const key = s.loaiKyNang || 'Khác'
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return groups
}

function SkillPicker({ skills, kyNang, onChange }: { skills: any[]; kyNang: any[]; onChange: (next: any[]) => void }) {
  const [search, setSearch] = useState('')
  const groups = groupSkills(skills.filter(s => !search || s.tenKyNang.toLowerCase().includes(search.toLowerCase())))

  const getId = getKyNangId
  const getEntry = (id: string) => kyNang.find(x => getId(x) === id)
  const isSelected = (id: string) => !!getEntry(id)
  const isBatBuoc = (id: string) => getEntry(id)?.batBuoc !== false

  const toggle = (id: string) => {
    if (isSelected(id)) {
      onChange(kyNang.filter(x => getId(x) !== id))
    } else {
      onChange([...kyNang, { maKyNang: id, batBuoc: true }])
    }
  }

  const toggleBatBuoc = (id: string, e: MouseEvent) => {
    e.stopPropagation()
    onChange(kyNang.map(x => getId(x) === id ? { ...x, batBuoc: !x.batBuoc } : x))
  }

  const selectedCount = kyNang.length

  return (
    <div className="flex flex-col gap-3">
      {/* Kỹ năng đã chọn */}
      {selectedCount > 0 && (
        <div className="rounded-xl border border-[#0e4d7d]/20 bg-sky-50 p-3">
          <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-[#0e4d7d]">
            Đã chọn ({selectedCount})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {kyNang.map(x => {
              const id = getId(x)
              const skill = skills.find(s => s.id === id)
              const bb = x.batBuoc !== false
              return (
                <span
                  key={id}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition ${bb ? 'border-[#0e4d7d] bg-[#0e4d7d] text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  {skill?.tenKyNang ?? id}
                  {/* Toggle bắt buộc */}
                  <button
                    type="button"
                    title={bb ? 'Đang bắt buộc — click để chuyển sang không bắt buộc' : 'Không bắt buộc — click để chuyển sang bắt buộc'}
                    onClick={e => toggleBatBuoc(id, e)}
                    className={`ml-0.5 rounded-full px-1 text-[10px] font-black transition ${bb ? 'bg-white/20 hover:bg-white/40' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                  >
                    {bb ? 'BB' : 'KBB'}
                  </button>
                  {/* Xóa */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggle(id) }}
                    className={`rounded-full text-[11px] leading-none transition ${bb ? 'hover:bg-white/30' : 'hover:bg-slate-200'}`}
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-slate-500">
            <span className="inline-block rounded bg-[#0e4d7d] px-1 text-white">BB</span> = Bắt buộc &nbsp;
            <span className="inline-block rounded border border-slate-300 bg-white px-1 text-slate-600">KBB</span> = Không bắt buộc — click để đổi
          </p>
        </div>
      )}

      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kỹ năng..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="min-h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0e4d7d]"
      />

      {/* Danh sách theo nhóm */}
      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500 border-b border-slate-100">
              {group}
            </p>
            <div className="flex flex-wrap gap-1.5 p-2.5">
              {items.map((skill: any) => {
                const selected = isSelected(skill.id)
                const bb = selected && isBatBuoc(skill.id)
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggle(skill.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                      selected
                        ? bb
                          ? 'border-[#0e4d7d] bg-[#0e4d7d] text-white'
                          : 'border-sky-300 bg-sky-50 text-[#0e4d7d]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0e4d7d]/40 hover:bg-sky-50'
                    }`}
                  >
                    {selected ? '✓' : '+'} {skill.tenKyNang}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {Object.keys(groups).length === 0 && (
          <p className="p-4 text-center text-sm font-semibold text-slate-400">Không tìm thấy kỹ năng</p>
        )}
      </div>
    </div>
  )
}

function JobForm({ job, setJob, skills, onSubmit }: any) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const kyNangNormalized = (job.kyNang ?? []).map((x: any) => ({
      maKyNang: getKyNangId(x),
      batBuoc: x?.batBuoc !== false,
    })).filter((x: any) => x.maKyNang)
    onSubmit({ ...job, hanNop: job.hanNop ? new Date(job.hanNop) : undefined, kyNang: kyNangNormalized })
  }

  return (
    <form className="ntd-form" onSubmit={submit}>
      <Field label="Tiêu đề" wide><input required value={job.tieuDe ?? ''} onChange={e => setJob({ ...job, tieuDe: e.target.value })} /></Field>
      <Field label="Địa chỉ"><input value={job.diaChi ?? ''} onChange={e => setJob({ ...job, diaChi: e.target.value })} /></Field>
      <Field label="Hạn nộp"><input type="date" value={job.hanNop ?? ''} onChange={e => setJob({ ...job, hanNop: e.target.value })} /></Field>
      <Field label="Lương min"><input type="number" value={job.luongMin ?? 0} onChange={e => setJob({ ...job, luongMin: Number(e.target.value) })} /></Field>
      <Field label="Lương max"><input type="number" value={job.luongMax ?? 0} onChange={e => setJob({ ...job, luongMax: Number(e.target.value) })} /></Field>
      <Field label="Loại hình">
        <select value={job.loaiHinh} onChange={e => setJob({ ...job, loaiHinh: e.target.value })}>
          <option value="toan_thoi_gian">Toàn thời gian</option>
          <option value="ban_thoi_gian">Bán thời gian</option>
          <option value="thuc_tap">Thực tập</option>
          <option value="tu_xa">Từ xa</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </Field>
      <Field label="Cấp bậc">
        <select value={job.capBac} onChange={e => setJob({ ...job, capBac: e.target.value })}>
          <option value="intern">Intern</option>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </Field>
      <Field label="Số lượng"><input type="number" value={job.soLuong ?? 1} onChange={e => setJob({ ...job, soLuong: Number(e.target.value) })} /></Field>
      <Field label="Trạng thái">
        <select value={job.trangThai} onChange={e => setJob({ ...job, trangThai: e.target.value })}>
          <option value="nhap">Nháp</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="dang_mo">Đang mở</option>
          <option value="tam_dong">Tạm đóng</option>
          <option value="het_han">Hết hạn</option>
        </select>
      </Field>
      <Field label="Mô tả" wide><textarea required value={job.moTa ?? ''} onChange={e => setJob({ ...job, moTa: e.target.value })} /></Field>
      <Field label="Yêu cầu" wide><textarea required value={job.yeuCau ?? ''} onChange={e => setJob({ ...job, yeuCau: e.target.value })} /></Field>
      <Field label="Quyền lợi" wide><textarea value={job.quyenLoi ?? ''} onChange={e => setJob({ ...job, quyenLoi: e.target.value })} /></Field>
      <Field label="Kỹ năng" wide>
        <SkillPicker
          skills={skills}
          kyNang={job.kyNang ?? []}
          onChange={next => setJob({ ...job, kyNang: next })}
        />
      </Field>
      <div className="ntd-form-actions">
        <button className="primary-button"><Save size={16} /> Lưu tin</button>
      </div>
    </form>
  )
}

export function UngVienNhaTuyenDungPage() {
  const data = useEmployerData()
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const apps = (data.applications ?? []).filter((item: any) => status === 'all' || item.trangThai === status)
  const patchApp = async (id: string, trangThai: string) => { await api(`/hosoungtuyen/${id}`, { method: 'PATCH', body: JSON.stringify({ trangThai }) }); await data.reload(); if (selected?.id === id) setSelected({ ...selected, trangThai }) }
  return <Page title="Pipeline ứng viên" desc="Xem hồ sơ, cập nhật trạng thái và lên lịch phỏng vấn cho từng ứng viên.">
    <div className="ntd-filterbar"><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tất cả pipeline</option><option value="da_nop">Đã nộp</option><option value="da_xem">Đã xem</option><option value="dang_xet_duyet">Đang xét duyệt</option><option value="moi_phong_van">Mời phỏng vấn</option><option value="dat">Đạt</option><option value="tu_choi">Từ chối</option></select></div>
    <section className="ntd-panel">{apps.length ? apps.map((item: any) => <ApplicationRow key={item.id} item={item} onClick={() => setSelected(item)} />) : <Empty>Không có ứng viên phù hợp.</Empty>}</section>
    {selected && <CandidateDrawer item={selected} onClose={() => setSelected(null)} onPatch={patchApp} onSchedule={() => setSchedule(selected)} />}
    {schedule && <ScheduleModal app={schedule} onClose={() => setSchedule(null)} onSaved={async () => { await patchApp(schedule.id, 'moi_phong_van'); setSchedule(null) }} />}
  </Page>
}

function CandidateDrawer({ item, onClose, onPatch, onSchedule }: any) {
  return <aside className="ntd-drawer"><div className="ntd-drawer-card"><div className="ntd-modal-head"><h2>{item.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên'}</h2><button onClick={onClose}><XCircle size={18} /></button></div><div className="ntd-detail-grid"><span>Email</span><strong>{item.ungVien?.nguoiDung?.email ?? '-'}</strong><span>Điện thoại</span><strong>{item.ungVien?.nguoiDung?.soDienThoai ?? '-'}</strong><span>Vị trí mong muốn</span><strong>{item.ungVien?.viTriMongMuon ?? '-'}</strong><span>Kinh nghiệm</span><strong>{item.ungVien?.kinhNghiem ?? 0} năm</strong><span>CV</span><strong>{item.hoSoNangLuc?.tieuDe ?? '-'}</strong><span>Điểm khớp</span><strong>{item.diemKhopKyNang ?? 0}%</strong></div><div className="ntd-note"><strong>Thư xin việc</strong><p>{item.thuXinViec || 'Không có thư xin việc.'}</p></div><div className="ntd-note"><strong>Tóm tắt ứng viên</strong><p>{item.ungVien?.tomTat || '-'}</p></div><div className="ntd-actions ntd-detail-actions"><button onClick={() => onPatch(item.id, 'da_xem')}><Eye size={14} /> Đã xem</button><button onClick={() => onPatch(item.id, 'dang_xet_duyet')}>Đưa vào xét duyệt</button><button className="primary-button" onClick={onSchedule}><Calendar size={14} /> Lên lịch</button><button onClick={() => onPatch(item.id, 'dat')}><CheckCircle size={14} /> Đạt</button><button onClick={() => onPatch(item.id, 'tu_choi')}><XCircle size={14} /> Từ chối</button></div></div></aside>
}

function ScheduleModal({ app, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({ maHoSoUngTuyen: app.id, thoiGianBatDau: '', thoiGianKetThuc: '', hinhThuc: 'online', diaChi: 'Google Meet', linkHop: '', ghiChu: '', trangThai: 'da_len_lich', ketQua: 'cho_ket_qua' })
  const submit = async (e: FormEvent) => { e.preventDefault(); await api('/lichphongvan', { method: 'POST', body: JSON.stringify(form) }); await onSaved() }
  return <div className="ntd-modal"><form className="ntd-modal-card ntd-form" onSubmit={submit}><div className="ntd-modal-head"><h2>Lên lịch phỏng vấn</h2><button type="button" onClick={onClose}><XCircle size={18} /></button></div><Field label="Bắt đầu"><input type="datetime-local" required value={form.thoiGianBatDau} onChange={e => setForm({ ...form, thoiGianBatDau: e.target.value })} /></Field><Field label="Kết thúc"><input type="datetime-local" value={form.thoiGianKetThuc} onChange={e => setForm({ ...form, thoiGianKetThuc: e.target.value })} /></Field><Field label="Hình thức"><select value={form.hinhThuc} onChange={e => setForm({ ...form, hinhThuc: e.target.value })}><option value="online">Online</option><option value="offline">Offline</option></select></Field><Field label="Địa chỉ"><input value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} /></Field><Field label="Link họp" wide><input value={form.linkHop} onChange={e => setForm({ ...form, linkHop: e.target.value })} /></Field><Field label="Ghi chú" wide><textarea value={form.ghiChu} onChange={e => setForm({ ...form, ghiChu: e.target.value })} /></Field><div className="ntd-form-actions"><button type="button" className="ntd-secondary" onClick={onClose}>Hủy</button><button className="primary-button">Tạo lịch</button></div></form></div>
}

export function LichPhongVanNhaTuyenDungPage() {
  const data = useEmployerData()
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('all')
  const items = (data.interviews ?? []).filter((item: any) => status === 'all' || item.trangThai === status)
  const selected = items.find((item: any) => item.id === (selectedId || items[0]?.id)) ?? items[0]
  const patch = async (id: string, payload: any) => { await api(`/lichphongvan/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await data.reload() }
  return <Page title="Lịch phỏng vấn" desc="Điều phối lịch, cập nhật kết quả và trạng thái phỏng vấn.">
    <div className="ntd-filterbar"><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="da_len_lich">Đã lên lịch</option><option value="da_xac_nhan">Đã xác nhận</option><option value="doi_lich">Xin đổi lịch</option><option value="hoan_thanh">Hoàn thành</option></select></div>
    <div className="ntd-split"><section className="ntd-panel">{items.length ? items.map((item: any) => <InterviewRow key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelectedId(item.id)} />) : <Empty>Chưa có lịch phỏng vấn.</Empty>}</section><section className="ntd-panel">{selected ? <><PanelHead title={selected.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Chi tiết lịch'} /><div className="ntd-detail-grid"><span>Bắt đầu</span><strong>{formatDate(selected.thoiGianBatDau)}</strong><span>Kết thúc</span><strong>{formatDate(selected.thoiGianKetThuc)}</strong><span>Hình thức</span><strong>{selected.hinhThuc}</strong><span>Địa chỉ/link</span><strong>{selected.linkHop || selected.diaChi}</strong><span>Ghi chú</span><strong>{selected.ghiChu || '-'}</strong><span>Trạng thái</span><Badge tone="blue">{labelInterviewStatus(selected.trangThai)}</Badge></div><div className="ntd-actions ntd-detail-actions"><button onClick={() => patch(selected.id, { trangThai: 'da_xac_nhan' })}>Xác nhận</button><button onClick={() => patch(selected.id, { trangThai: 'hoan_thanh', ketQua: 'dat' })}>Hoàn thành - đạt</button><button onClick={() => patch(selected.id, { trangThai: 'hoan_thanh', ketQua: 'khong_dat' })}>Không đạt</button><button onClick={() => patch(selected.id, { trangThai: 'da_huy' })}>Hủy lịch</button></div></> : <Empty>Chọn lịch để xem chi tiết.</Empty>}</section></div>
  </Page>
}

export function CongTyNhaTuyenDungPage() {
  const data = useEmployerData()
  const [form, setForm] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (data.company) setForm({ ...data.company }) }, [data.company?.id])
  const save = async (e: FormEvent) => { e.preventDefault(); setError(''); await api(`/nhatuyendung/${form.id}`, { method: 'PATCH', body: JSON.stringify(form) }); await data.reload() }
  const uploadLogo = async (file?: File) => {
    if (!file) return
    try {
      setUploading(true)
      setError('')
      const body = new FormData()
      body.append('logo', file)
      const token = localStorage.getItem('itjob_token')
      const res = await fetch(`${API_URL}/nhatuyendung/upload-logo`, {
        method: 'POST',
        body,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.thongBao ?? 'Upload logo thất bại')
      setForm((prev: any) => ({ ...prev, logo: data.duLieu?.duongDan ?? data.duLieu?.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload logo thất bại')
    } finally {
      setUploading(false)
    }
  }
  if (data.loading || !form) return <Page title="Thông tin công ty" desc="Đang tải..."><div className="ntd-panel">Đang tải...</div></Page>
  return <Page title="Thông tin công ty" desc="Cập nhật hồ sơ công ty, logo, mô tả, quy mô và website."><ErrorBox message={error || data.error} /><form className="ntd-panel ntd-form" onSubmit={save}><Field label="Logo công ty" wide><div className="ntd-logo-upload"><div className="ntd-logo-preview">{form.logo ? <img src={imageUrl(form.logo)} alt="" /> : <span>Logo</span>}</div><div><label className="ntd-upload-button"><ImagePlus size={16} /> {uploading ? 'Đang upload...' : 'Upload ảnh'}<input type="file" accept="image/*" disabled={uploading} onChange={e => uploadLogo(e.target.files?.[0])} /></label><p>Hỗ trợ JPG, PNG, WebP, SVG. Tối đa 3MB.</p></div></div></Field><Field label="Tên công ty"><input value={form.tenCongTy ?? ''} onChange={e => setForm({ ...form, tenCongTy: e.target.value })} /></Field><Field label="Mã số thuế"><input value={form.maSoThue ?? ''} onChange={e => setForm({ ...form, maSoThue: e.target.value })} /></Field><Field label="Địa chỉ"><input value={form.diaChi ?? ''} onChange={e => setForm({ ...form, diaChi: e.target.value })} /></Field><Field label="Website"><input value={form.website ?? ''} onChange={e => setForm({ ...form, website: e.target.value })} /></Field><Field label="Logo URL"><input value={form.logo ?? ''} onChange={e => setForm({ ...form, logo: e.target.value })} /></Field><Field label="Quy mô"><input type="number" value={form.quyMo ?? 0} onChange={e => setForm({ ...form, quyMo: Number(e.target.value) })} /></Field><Field label="Ngành"><input value={form.nganh ?? ''} onChange={e => setForm({ ...form, nganh: e.target.value })} /></Field><Field label="Mô tả" wide><textarea value={form.moTa ?? ''} onChange={e => setForm({ ...form, moTa: e.target.value })} /></Field><div className="ntd-form-actions"><button className="primary-button"><Save size={16} /> Lưu công ty</button></div></form></Page>
}

export function AnalyticsNhaTuyenDungPage() {
  const data = useEmployerData()
  const byStatus = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat', 'tu_choi'].map(status => ({ status, count: data.applications?.filter((x: any) => x.trangThai === status).length ?? 0 }))
  const max = Math.max(1, ...byStatus.map(x => x.count))
  return <Page title="Analytics tuyển dụng" desc="Theo dõi hiệu quả tin tuyển dụng, pipeline và lịch phỏng vấn."><div className="ntd-kpi-grid"><Kpi icon={Briefcase} label="Tổng tin" value={data.jobs?.length ?? 0} /><Kpi icon={Users} label="Tổng hồ sơ" value={data.applications?.length ?? 0} /><Kpi icon={Calendar} label="Phỏng vấn" value={data.interviews?.length ?? 0} /><Kpi icon={CheckCircle} label="Đạt" value={data.applications?.filter((x: any) => x.trangThai === 'dat').length ?? 0} /></div><section className="ntd-panel"><PanelHead title="Pipeline theo trạng thái" /> <div className="ntd-bars">{byStatus.map(item => <div key={item.status}><span>{labelAppStatus(item.status)}</span><i><b style={{ width: `${(item.count / max) * 100}%` }} /></i><strong>{item.count}</strong></div>)}</div></section></Page>
}

export function ThongBaoNhaTuyenDungPage() {
  const data = useEmployerData()
  const patch = async (id: string, payload: any) => { await api(`/thongbao/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await data.reload() }
  const remove = async (id: string) => { await api(`/thongbao/${id}`, { method: 'DELETE' }); await data.reload() }
  return <Page title="Thông báo" desc="Cập nhật về tin tuyển dụng, hồ sơ ứng viên và lịch phỏng vấn."><section className="ntd-panel">{data.notifications?.length ? data.notifications.map((item: any) => <div className="ntd-row" key={item.id ?? item._id}><a href={item.lienKet || '#'}><strong>{item.tieuDe}</strong><p>{item.noiDung}</p><p>{formatDate(item.ngayTao)}</p></a><div className="ntd-actions"><Badge tone={item.daDoc ? 'gray' : 'blue'}>{item.daDoc ? 'Đã đọc' : 'Mới'}</Badge><button onClick={() => patch(item.id ?? item._id, { daDoc: true })}>Đọc</button><button onClick={() => remove(item.id ?? item._id)}><Trash2 size={14} /></button></div></div>) : <Empty>Chưa có thông báo.</Empty>}</section></Page>
}

export function CaiDatNhaTuyenDungPage() {
  const data = useEmployerData()
  const [form, setForm] = useState<any>({})
  useEffect(() => { if (data.user) setForm({ hoTen: data.user.hoTen, soDienThoai: data.user.soDienThoai ?? '', matKhau: '' }) }, [data.user?.id])
  const save = async (e: FormEvent) => { e.preventDefault(); const payload: any = { hoTen: form.hoTen, soDienThoai: form.soDienThoai }; if (form.matKhau) payload.matKhau = form.matKhau; await api(`/nguoidung/${data.user.id}`, { method: 'PATCH', body: JSON.stringify(payload) }); localStorage.setItem('itjob_nguoidung', JSON.stringify({ ...data.user, ...payload, matKhau: undefined })); await data.reload() }
  return <Page title="Cài đặt" desc="Cập nhật tài khoản người phụ trách tuyển dụng."><form className="ntd-panel ntd-form" onSubmit={save}><Field label="Họ tên"><input value={form.hoTen ?? ''} onChange={e => setForm({ ...form, hoTen: e.target.value })} /></Field><Field label="Số điện thoại"><input value={form.soDienThoai ?? ''} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} /></Field><Field label="Mật khẩu mới"><input type="password" value={form.matKhau ?? ''} onChange={e => setForm({ ...form, matKhau: e.target.value })} /></Field><div className="ntd-form-actions"><button className="primary-button"><Save size={16} /> Lưu cài đặt</button></div></form></Page>
}

export function BangGiaNhaTuyenDungPage() {
  return <Page title="Bảng giá" desc="Gói sử dụng nội bộ cho nhà tuyển dụng trong phiên bản hiện tại."><div className="ntd-price-grid">{['Starter', 'Growth', 'Enterprise'].map((name, index) => <section className="ntd-panel" key={name}><h2>{name}</h2><strong>{index === 0 ? '0 VND' : index === 1 ? '2.000.000 VND' : 'Liên hệ'}</strong><p>{index === 0 ? 'Đăng tin cơ bản và quản lý pipeline.' : index === 1 ? 'Ưu tiên hiển thị, lọc ứng viên, analytics.' : 'Quy trình tuyển dụng tùy chỉnh cho đội lớn.'}</p><button className={index === 1 ? 'primary-button' : 'ntd-secondary'}>{index === 2 ? 'Liên hệ tư vấn' : 'Chọn gói'}</button></section>)}</div></Page>
}

function Field({ label, wide, children }: any) {
  return <label className={wide ? 'ntd-field ntd-field-wide' : 'ntd-field'}><span>{label}</span>{children}</label>
}
