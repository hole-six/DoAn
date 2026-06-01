import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { clsx } from 'clsx'
import {
  BarChart2, Building2, CheckCircle, Edit3, FileText,
  Plus, RefreshCw, Search, Settings, Shield, Star, Trash2, X, XCircle,
} from 'lucide-react'
import AppIcon from '../../components/AppIcon'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import './admin-styles.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const PAGE_SIZE = 6

type ConfirmState = {
  title: string; message: string; type: 'danger' | 'warning' | 'info'; onConfirm: () => void
} | null

// ─── helpers ────────────────────────────────────────────────────────────────
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
const getId = (item: any) => item.id ?? item._id
const getError = (err: unknown) => err instanceof Error ? err.message : 'Thao tác thất bại'
const formatDate = (v?: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '-'
const formatMoney = (v?: number) => typeof v === 'number' && v > 0 ? v.toLocaleString('vi-VN') : 'Thỏa thuận'
const truncate = (v = '', max = 120) => v.length > max ? `${v.slice(0, max)}...` : v
const getPage = <T,>(items: T[], page: number) => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

// ─── label/tone maps ────────────────────────────────────────────────────────
const labelCongTy = (v: string) => ({ cho_duyet:'Chờ duyệt', da_duyet:'Đã duyệt', tu_choi:'Từ chối', bi_khoa:'Bị khóa' } as Record<string,string>)[v] ?? v
const toneCongTy  = (v: string) => v === 'da_duyet' ? 'green' : v === 'tu_choi' || v === 'bi_khoa' ? 'red' : 'yellow'
const labelTin    = (v: string) => ({ nhap:'Nháp', cho_duyet:'Chờ duyệt', dang_mo:'Đang mở', tam_dong:'Tạm đóng', het_han:'Hết hạn', tu_choi:'Từ chối' } as Record<string,string>)[v] ?? v
const toneTin     = (v: string) => v === 'dang_mo' ? 'green' : v === 'tu_choi' || v === 'het_han' ? 'red' : v === 'tam_dong' ? 'gray' : 'yellow'
const labelLoai   = (v: string) => ({ toan_thoi_gian:'Toàn thời gian', ban_thoi_gian:'Bán thời gian', thuc_tap:'Thực tập', tu_xa:'Từ xa', hybrid:'Hybrid' } as Record<string,string>)[v] ?? v
const labelCap    = (v: string) => ({ intern:'Intern', fresher:'Fresher', junior:'Junior', middle:'Middle', senior:'Senior', lead:'Lead' } as Record<string,string>)[v] ?? v

const SKILL_TYPE_BASE = [
  { value:'tat_ca', label:'Tất cả loại' },
  { value:'ngon_ngu', label:'Ngôn ngữ' },
  { value:'frontend', label:'Frontend' },
  { value:'backend', label:'Backend' },
  { value:'database', label:'Database' },
  { value:'du_lieu', label:'Data & AI' },
  { value:'mobile', label:'Mobile' },
  { value:'devops', label:'DevOps & Cloud' },
  { value:'testing', label:'Testing / QA' },
  { value:'kiem_thu', label:'Testing / QA' },
  { value:'thiet_ke', label:'Design' },
  { value:'phan_tich', label:'Business Analyst' },
  { value:'quan_ly', label:'Product / Management' },
  { value:'ky_nang_mem', label:'Kỹ năng mềm' },
  { value:'khac', label:'Khác' },
]

// ─── validation helpers ──────────────────────────────────────────────────────
type Errors = Record<string, string>

function normalizeSkillType(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function formatSkillTypeLabel(value?: string) {
  const key = String(value ?? '').trim()
  if (!key) return '-'
  const found = SKILL_TYPE_BASE.find((item) => item.value === key)
  if (found) return found.label
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

function required(v: any, label: string): string | null {
  if (v === undefined || v === null || String(v).trim() === '') return `${label} là bắt buộc`
  return null
}
function minLen(v: string, min: number, label: string): string | null {
  if (v.trim().length < min) return `${label} tối thiểu ${min} ký tự`
  return null
}
function isEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email không hợp lệ'
}
function isPhone(v: string): string | null {
  if (!v) return null
  return /^(0|\+84)[0-9]{8,10}$/.test(v.replace(/\s/g, '')) ? null : 'Số điện thoại không hợp lệ (VD: 0901234567)'
}
function isUrl(v: string): string | null {
  if (!v) return null
  try { new URL(v.startsWith('http') ? v : `https://${v}`); return null } catch { return 'URL không hợp lệ' }
}
function isPositiveNum(v: any, label: string): string | null {
  const n = Number(v)
  if (isNaN(n) || n < 0) return `${label} phải là số không âm`
  return null
}
function collect(...errs: (string | null)[]): string | undefined {
  return errs.find(Boolean) ?? undefined
}

// ─── Tailwind tokens ─────────────────────────────────────────────────────────
const tw = {
  page: 'mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-3 pb-32 lg:gap-4 lg:pb-0',
  header: 'relative flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:flex-row sm:items-center sm:justify-between sm:p-5',
  headerGlow: 'pointer-events-none absolute -right-14 -top-20 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl',
  eyebrow: 'relative z-[1] mb-1 block text-[11px] font-black uppercase tracking-[0.1em] text-[#0e4d7d]',
  title: 'relative z-[1] break-words text-2xl font-black leading-tight text-slate-950 sm:text-[26px]',
  headerDesc: 'relative z-[1] mt-1 break-words text-[13px] font-semibold leading-relaxed text-slate-500',
  panel: 'flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_24px_rgba(14,77,125,0.07)] lg:p-4',
  toolbar: 'grid gap-2.5 sm:flex sm:items-center',
  toolbarRight: 'grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:flex sm:flex-none',
  search: 'flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-[#062a4d] focus-within:ring-4 focus-within:ring-[#062a4d]/10 sm:flex-1',
  inputBare: 'min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400',
  select: 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10 sm:w-44',
  primaryBtn: 'btn-primary',
  subtleBtn: 'btn-subtle',
  dangerBtn: 'btn-danger',
  tableWrap: 'max-w-full overflow-x-auto rounded-xl border border-slate-200',
  table: 'w-full border-collapse text-left [&_.ap-actions]:flex [&_.ap-actions]:flex-wrap [&_.ap-actions]:gap-1.5 [&_.ap-btn-icon]:inline-flex [&_.ap-btn-icon]:h-9 [&_.ap-btn-icon]:min-h-9 [&_.ap-btn-icon]:min-w-9 [&_.ap-btn-icon]:items-center [&_.ap-btn-icon]:justify-center [&_.ap-btn-icon]:rounded-lg [&_.ap-btn-icon]:border [&_.ap-btn-icon]:!border-[#062a4d] [&_.ap-btn-icon]:!bg-[#062a4d] [&_.ap-btn-icon]:px-2 [&_.ap-btn-icon]:!text-white [&_.ap-btn-icon]:shadow-sm [&_.ap-btn-icon]:transition [&_.ap-btn-icon]:hover:!bg-[#041b33] [&_.ap-btn-icon.danger]:!border-red-700 [&_.ap-btn-icon.danger]:!bg-red-700 [&_.ap-btn-icon.danger]:hover:!bg-red-800 [&_.ap-btn-icon.approve]:!border-[#062a4d] [&_.ap-btn-icon.approve]:!bg-[#062a4d] [&_.ap-inline-icon]:inline-flex [&_.ap-inline-icon]:items-center [&_.ap-inline-icon]:gap-1 [&_.ap-log-badge]:inline-flex [&_.ap-log-badge]:whitespace-nowrap [&_.ap-log-badge]:rounded-full [&_.ap-log-badge]:bg-emerald-100 [&_.ap-log-badge]:px-2.5 [&_.ap-log-badge]:py-1 [&_.ap-log-badge]:text-[11px] [&_.ap-log-badge]:font-black [&_.ap-log-badge]:text-emerald-700 [&_.ap-rating]:text-sm [&_.ap-rating]:font-black [&_.ap-rating]:tracking-wide [&_.ap-rating]:text-amber-500 [&_.ap-table-copy]:line-clamp-2 [&_.ap-table-copy]:max-w-56 [&_.ap-table-copy]:text-xs [&_.ap-table-copy]:font-semibold [&_.ap-table-copy]:leading-relaxed [&_.ap-table-copy]:text-slate-600 [&_.ap-table-meta]:mt-1 [&_.ap-table-meta]:block [&_.ap-table-meta]:max-w-56 [&_.ap-table-meta]:truncate [&_.ap-table-meta]:text-xs [&_.ap-table-meta]:font-semibold [&_.ap-table-meta]:text-slate-500 [&_.ap-table-strong]:block [&_.ap-table-strong]:max-w-56 [&_.ap-table-strong]:truncate [&_.ap-table-strong]:text-[13px] [&_.ap-table-strong]:font-black [&_.ap-table-strong]:text-slate-950 [&_td]:border-t [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle',
  th: 'whitespace-nowrap border-t-0 bg-slate-50 px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-slate-500',
  empty: 'px-4 py-8 text-center text-sm font-bold text-slate-400',
  error: 'rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-extrabold text-rose-700',
  fieldErr: 'mt-1 text-[11px] font-bold text-rose-600',
  pagination: 'grid w-full min-w-0 gap-2 text-sm font-extrabold text-slate-500 min-[421px]:flex min-[421px]:items-center min-[421px]:justify-between',
  paginationBtns: 'flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 min-[421px]:justify-end',
  pageBtn: 'page-btn',
  pageBtnActive: 'page-btn active',
  modalBackdrop: 'fixed inset-0 z-[300] flex items-stretch justify-center bg-slate-900/50 p-0 backdrop-blur-md',
  modal: 'flex h-dvh w-full max-w-none flex-col gap-3.5 overflow-y-auto rounded-none border-0 bg-white p-4 shadow-none sm:p-6',
  modalHead: 'relative flex items-start gap-3',
  modalTitle: 'break-words pr-12 text-2xl font-black leading-tight text-slate-950',
  modalDesc: 'mt-2 max-w-2xl break-words pr-12 text-sm font-semibold leading-relaxed text-slate-500',
  modalClose: 'absolute right-0 top-0 z-20 !inline-flex !h-10 !w-10 !min-h-10 !min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 !p-0 text-slate-500 hover:bg-slate-100',
  formGrid: 'grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2',
  field: 'flex flex-col gap-1',
  fieldLabel: 'text-[11px] font-black uppercase tracking-wide text-slate-600',
  fieldRequired: 'ml-0.5 text-rose-500',
  input: 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-100',
  inputErr: 'border-rose-400 ring-4 ring-rose-100',
  selectEl: 'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10',
  textarea: 'min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-relaxed text-slate-900 outline-none transition focus:border-[#062a4d] focus:ring-4 focus:ring-[#062a4d]/10 resize-y',
  formActions: 'flex flex-col-reverse gap-2 pt-1 sm:col-span-2 sm:flex-row sm:justify-end',
  kpiGrid: 'grid grid-cols-2 gap-2.5 max-[380px]:grid-cols-1 lg:grid-cols-5 lg:gap-3.5',
  kpiCard: 'grid min-w-0 gap-1 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-[0_8px_24px_rgba(14,77,125,0.07)]',
  kpiIcon: 'mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-[#0e4d7d]',
  kpiLabel: 'text-[10px] font-black uppercase leading-snug tracking-wide text-slate-500',
  kpiValue: 'text-2xl font-black leading-none text-slate-950',
}

const badgeTone: Record<string, string> = {
  blue: 'bg-blue-100 text-[#0e4d7d]',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-slate-100 text-slate-600',
}

// ─── Shared UI components ────────────────────────────────────────────────────
function PageHeader({ eyebrow = 'ITJob Admin', title, desc, action }: { eyebrow?: string; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className={tw.header}>
      <span className={tw.headerGlow} />
      <div className="relative z-[1] min-w-0">
        <span className={tw.eyebrow}>{eyebrow}</span>
        <div className={tw.title}>{title}</div>
        <div className={tw.headerDesc}>{desc}</div>
      </div>
      {action && <div className="relative z-[1] w-full sm:w-auto sm:flex-none">{action}</div>}
    </div>
  )
}

function Toolbar({ keyword, onKeyword, filter, onFilter, options, onRefresh, placeholder = 'Tìm kiếm...' }: {
  keyword: string; onKeyword: (v: string) => void; filter: string; onFilter: (v: string) => void
  options: { value: string; label: string }[]; onRefresh: () => void; placeholder?: string
}) {
  return (
    <div className={tw.toolbar}>
      <label className={tw.search}>
        <AppIcon icon={Search} size={16} />
        <input className={tw.inputBare} value={keyword} onChange={e => onKeyword(e.target.value)} placeholder={placeholder} />
      </label>
      <div className={tw.toolbarRight}>
        <select className={tw.select} value={filter} onChange={e => onFilter(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={tw.subtleBtn} onClick={onRefresh} type="button"><AppIcon icon={RefreshCw} size={15} /> Làm mới</button>
      </div>
    </div>
  )
}

function Badge({ label, tone = 'blue' }: { label: string; tone?: string }) {
  return <span className={clsx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black', badgeTone[tone] ?? badgeTone.blue)}>{label}</span>
}

function TableWrap({ heads, children, minWidth = 760 }: { heads: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className={tw.tableWrap}>
      <table className={tw.table} style={{ minWidth }}>
        <thead><tr>{heads.map(h => <th className={tw.th} key={h}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className={tw.empty}>Không có dữ liệu phù hợp.</td></tr>
}

function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const start = total ? (page - 1) * PAGE_SIZE + 1 : 0
  const end = Math.min(page * PAGE_SIZE, total)
  return (
    <div className={tw.pagination}>
      <span className="whitespace-nowrap">{start}–{end} / {total}</span>
      <div className={tw.paginationBtns}>
        <button className={tw.pageBtn} disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(i => (
          <button key={i} className={clsx(tw.pageBtn, i === page && tw.pageBtnActive)} onClick={() => onPage(i)}>{i}</button>
        ))}
        <button className={tw.pageBtn} disabled={page >= pages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  )
}

function Modal({ title, desc, onClose, children }: { title: string; desc?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className={tw.modalBackdrop} role="dialog" aria-modal="true">
      <section className={tw.modal}>
        <div className={tw.modalHead}>
          <div className="min-w-0 flex-1">
            <h2 className={tw.modalTitle}>{title}</h2>
            {desc && <p className={tw.modalDesc}>{desc}</p>}
          </div>
          <button className={tw.modalClose} onClick={onClose} type="button" aria-label="Đóng"><AppIcon icon={X} size={16} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

/** Field wrapper với label, required marker, và error message */
function Field({ label, required: req, wide, error, children }: {
  label: string; required?: boolean; wide?: boolean; error?: string; children: ReactNode
}) {
  return (
    <div className={clsx(tw.field, wide && 'sm:col-span-2')}>
      <label className={tw.fieldLabel}>
        {label}{req && <span className={tw.fieldRequired}>*</span>}
      </label>
      {children}
      {error && <span className={tw.fieldErr} role="alert">{error}</span>}
    </div>
  )
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...props} className={clsx(tw.input, error && tw.inputErr)} aria-invalid={!!error} />
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return <select {...props} className={clsx(tw.selectEl, error && tw.inputErr)} aria-invalid={!!error}>{children}</select>
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...props} className={clsx(tw.textarea, error && tw.inputErr)} aria-invalid={!!error} />
}

function FormActions({ onCancel, saving, saveLabel = 'Lưu thay đổi' }: { onCancel: () => void; saving?: boolean; saveLabel?: string }) {
  return (
    <div className={tw.formActions}>
      <button className={tw.subtleBtn} type="button" onClick={onCancel}>Hủy</button>
      <button className={tw.primaryBtn} type="submit" disabled={saving}>
        {saving ? 'Đang lưu...' : saveLabel}
      </button>
    </div>
  )
}

// ─── Mobile card for companies ───────────────────────────────────────────────
function CongTyCard({ item, onEdit, onRemove, onApprove, onReject }: any) {
  return (
    <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_6px_18px_rgba(14,77,125,0.06)]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-[#0e4d7d]">Hồ sơ công ty</span>
          <h3 className="truncate text-base font-black text-slate-950">{item.tenCongTy}</h3>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{item.diaChi ?? 'Chưa có địa chỉ'}</p>
        </div>
        <Badge label={labelCongTy(item.trangThaiDuyet)} tone={toneCongTy(item.trangThaiDuyet)} />
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs min-[380px]:grid-cols-2 [&>div]:rounded-xl [&>div]:border [&>div]:border-slate-200 [&>div]:bg-slate-50 [&>div]:p-2.5">
        <div><span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Liên hệ</span><strong className="block truncate text-[13px] font-black text-slate-950">{item.nguoiDung?.hoTen ?? '-'}</strong><p className="truncate font-semibold text-slate-500">{item.email ?? item.nguoiDung?.email ?? '-'}</p></div>
        <div><span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Quy mô</span><strong className="block truncate text-[13px] font-black text-slate-950">{item.quyMo ?? 0} nhân sự</strong><p className="truncate font-semibold text-slate-500">{item.nganh ?? '-'}</p></div>
        <div><span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Mã số thuế</span><strong className="block truncate text-[13px] font-black text-slate-950">{item.maSoThue ?? '-'}</strong><p className="truncate font-semibold text-slate-500">{item.soDienThoai ?? '-'}</p></div>
        <div><span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Cập nhật</span><strong className="block truncate text-[13px] font-black text-slate-950">{formatDate(item.ngayCapNhat ?? item.ngayTao)}</strong><p className="truncate font-semibold text-slate-500">{item.website ?? '-'}</p></div>
      </div>
      {item.moTa && <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">{truncate(item.moTa, 150)}</p>}
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        {item.trangThaiDuyet === 'cho_duyet' && <>
          <button className={clsx(tw.primaryBtn, 'min-h-10 text-xs')} onClick={onApprove}><AppIcon icon={CheckCircle} size={14} /> Duyệt</button>
          <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={onReject}><AppIcon icon={XCircle} size={14} /> Từ chối</button>
        </>}
        <button className={clsx(tw.subtleBtn, 'min-h-10 text-xs')} onClick={onEdit}><AppIcon icon={Edit3} size={14} /> Sửa</button>
        <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={onRemove}><AppIcon icon={Trash2} size={14} /> Xóa</button>
      </div>
    </article>
  )
}

// ─── validate company form ───────────────────────────────────────────────────
function validateCongTy(f: any): Errors {
  const e: Errors = {}
  const tenErr = collect(required(f.tenCongTy, 'Tên công ty'), minLen(f.tenCongTy ?? '', 3, 'Tên công ty'))
  if (tenErr) e.tenCongTy = tenErr
  if (f.email) { const ee = isEmail(f.email); if (ee) e.email = ee }
  if (f.soDienThoai) { const pe = isPhone(f.soDienThoai); if (pe) e.soDienThoai = pe }
  if (f.website) { const we = isUrl(f.website); if (we) e.website = we }
  const qErr = isPositiveNum(f.quyMo, 'Quy mô')
  if (qErr) e.quyMo = qErr
  if (f.maSoThue && f.maSoThue.trim().length > 0 && !/^\d{10}(\-\d{3})?$/.test(f.maSoThue.trim())) {
    e.maSoThue = 'Mã số thuế không hợp lệ (10 chữ số, VD: 0123456789)'
  }
  return e
}

// ─── QuanLyCongTyAdmin ───────────────────────────────────────────────────────
export function QuanLyCongTyAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const load = async () => {
    try {
      const [companies, allUsers] = await Promise.all([api('/nhatuyendung'), api('/nguoidung')])
      setItems(companies); setUsers(allUsers.filter((u: any) => u.vaiTro === 'nha_tuyen_dung')); setApiError('')
    } catch (err) { setApiError(getError(err)) }
  }
  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return items.filter(item => {
      const mk = !k || item.tenCongTy?.toLowerCase().includes(k) || item.email?.toLowerCase().includes(k) || item.diaChi?.toLowerCase().includes(k)
      return mk && (filter === 'tat_ca' || item.trangThaiDuyet === filter)
    })
  }, [filter, items, keyword])
  const pageItems = getPage(list, page)
  useEffect(() => { setPage(1) }, [keyword, filter])

  const patch = async (id: string, payload: any) => {
    try { setApiError(''); await api(`/nhatuyendung/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await load() }
    catch (err) { setApiError(getError(err)) }
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateCongTy(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      setApiError(''); setErrors({})
      const payload = { ...form, quyMo: Number(form.quyMo ?? 0) }
      await api(`/nhatuyendung${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setForm(null); await load()
    } catch (err) { setApiError(getError(err)) } finally { setSaving(false) }
  }

  const remove = (item: any) => setConfirm({
    title: 'Xóa công ty', message: `Xóa công ty "${item.tenCongTy}"? Hành động này không thể hoàn tác.`, type: 'danger',
    onConfirm: async () => {
      try { setApiError(''); await api(`/nhatuyendung/${getId(item)}`, { method: 'DELETE' }); await load() }
      catch (err) { setApiError(getError(err)) } finally { setConfirm(null) }
    },
  })

  const openForm = (item?: any) => {
    setErrors({})
    setForm(item ? { ...item, id: getId(item) } : { trangThaiDuyet: 'cho_duyet', quyMo: 1 })
  }

  return (
    <div className={tw.page}>
      {confirm && <ConfirmDialog isOpen title={confirm.title} message={confirm.message} type={confirm.type} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <PageHeader title="Xác thực công ty" desc="Kiểm duyệt hồ sơ nhà tuyển dụng, quản lý trạng thái xác thực."
        action={<button className={tw.primaryBtn} onClick={() => openForm()}><AppIcon icon={Plus} size={16} /> Thêm công ty</button>} />
      <div className={tw.panel}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load}
          placeholder="Tìm công ty, email, địa chỉ..."
          options={[{ value:'tat_ca', label:'Tất cả' }, { value:'cho_duyet', label:'Chờ duyệt' }, { value:'da_duyet', label:'Đã duyệt' }, { value:'tu_choi', label:'Từ chối' }, { value:'bi_khoa', label:'Bị khóa' }]} />
        {apiError && <div className={tw.error}>{apiError}</div>}

        {/* Desktop table */}
        <div className="hidden sm:block">
          <TableWrap heads={['Công ty', 'Liên hệ', 'Hồ sơ', 'Trạng thái', 'Cập nhật', 'Thao tác']} minWidth={920}>
            {pageItems.map(item => (
              <tr key={getId(item)}>
                <td><span className="ap-table-strong">{item.tenCongTy}</span><span className="ap-table-meta">{item.diaChi ?? '-'}</span><span className="ap-table-meta">MST: {item.maSoThue ?? '-'}</span></td>
                <td><span className="ap-table-strong">{item.nguoiDung?.hoTen ?? '-'}</span><span className="ap-table-meta">{item.email ?? item.nguoiDung?.email ?? '-'}</span><span className="ap-table-meta">{item.soDienThoai ?? '-'}</span></td>
                <td><span className="ap-table-strong">{item.quyMo ?? 0} nhân sự</span><span className="ap-table-meta">{item.website ?? '-'}</span><span className="ap-table-copy">{truncate(item.moTa, 80)}</span></td>
                <td><Badge label={labelCongTy(item.trangThaiDuyet)} tone={toneCongTy(item.trangThaiDuyet)} /></td>
                <td>{formatDate(item.ngayCapNhat ?? item.ngayTao)}</td>
                <td><div className="ap-actions">
                  {item.trangThaiDuyet === 'cho_duyet' && <>
                    <button className="ap-btn-icon approve" title="Duyệt" onClick={() => setConfirm({ title:'Duyệt công ty', message:`Duyệt hồ sơ "${item.tenCongTy}"?`, type:'info', onConfirm: () => { patch(getId(item), { trangThaiDuyet:'da_duyet' }); setConfirm(null) } })}><AppIcon icon={CheckCircle} size={14} /></button>
                    <button className="ap-btn-icon danger" title="Từ chối" onClick={() => setConfirm({ title:'Từ chối công ty', message:`Từ chối hồ sơ "${item.tenCongTy}"?`, type:'danger', onConfirm: () => { patch(getId(item), { trangThaiDuyet:'tu_choi' }); setConfirm(null) } })}><AppIcon icon={XCircle} size={14} /></button>
                  </>}
                  <button className="ap-btn-icon" title="Sửa" onClick={() => openForm(item)}><AppIcon icon={Edit3} size={14} /></button>
                  <button className="ap-btn-icon danger" title="Xóa" onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /></button>
                </div></td>
              </tr>
            ))}
            {list.length === 0 && <EmptyRow cols={6} />}
          </TableWrap>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 sm:hidden">
          {pageItems.map(item => (
            <CongTyCard key={getId(item)} item={item}
              onEdit={() => openForm(item)}
              onRemove={() => remove(item)}
              onApprove={() => setConfirm({ title:'Duyệt công ty', message:`Duyệt hồ sơ "${item.tenCongTy}"?`, type:'info', onConfirm: () => { patch(getId(item), { trangThaiDuyet:'da_duyet' }); setConfirm(null) } })}
              onReject={() => setConfirm({ title:'Từ chối công ty', message:`Từ chối hồ sơ "${item.tenCongTy}"?`, type:'danger', onConfirm: () => { patch(getId(item), { trangThaiDuyet:'tu_choi' }); setConfirm(null) } })}
            />
          ))}
          {list.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-extrabold text-slate-500">Không có công ty phù hợp.</div>}
        </div>
        <Pager page={page} total={list.length} onPage={setPage} />
      </div>

      {form && (
        <Modal title={form.id ? 'Sửa công ty' : 'Thêm công ty'} desc="Điền đầy đủ thông tin để xác thực nhanh hơn." onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <div className={tw.formGrid}>
              <Field label="Tài khoản phụ trách" wide>
                <Select value={form.maNguoiDung ?? ''} onChange={e => setForm({ ...form, maNguoiDung: e.target.value })}>
                  <option value="">— Chọn tài khoản nhà tuyển dụng —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.hoTen} ({u.email})</option>)}
                </Select>
              </Field>
              <Field label="Tên công ty" required error={errors.tenCongTy}>
                <Input required value={form.tenCongTy ?? ''} error={errors.tenCongTy} placeholder="VD: Công ty TNHH ABC" onChange={e => setForm({ ...form, tenCongTy: e.target.value })} />
              </Field>
              <Field label="Email liên hệ" error={errors.email}>
                <Input type="email" value={form.email ?? ''} error={errors.email} placeholder="contact@company.com" onChange={e => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Số điện thoại" error={errors.soDienThoai}>
                <Input type="tel" value={form.soDienThoai ?? ''} error={errors.soDienThoai} placeholder="0901234567" onChange={e => setForm({ ...form, soDienThoai: e.target.value })} />
              </Field>
              <Field label="Mã số thuế" error={errors.maSoThue}>
                <Input value={form.maSoThue ?? ''} error={errors.maSoThue} placeholder="0123456789" maxLength={14} onChange={e => setForm({ ...form, maSoThue: e.target.value })} />
              </Field>
              <Field label="Quy mô (nhân sự)" error={errors.quyMo}>
                <Input type="number" min={0} value={form.quyMo ?? ''} error={errors.quyMo} placeholder="VD: 100" onChange={e => setForm({ ...form, quyMo: e.target.value })} />
              </Field>
              <Field label="Website" error={errors.website}>
                <Input value={form.website ?? ''} error={errors.website} placeholder="https://company.com" onChange={e => setForm({ ...form, website: e.target.value })} />
              </Field>
              <Field label="Ngành nghề">
                <Input value={form.nganh ?? ''} placeholder="VD: Công nghệ thông tin" onChange={e => setForm({ ...form, nganh: e.target.value })} />
              </Field>
              <Field label="Địa chỉ" wide>
                <Input value={form.diaChi ?? ''} placeholder="VD: 123 Nguyễn Văn Linh, Đà Nẵng" onChange={e => setForm({ ...form, diaChi: e.target.value })} />
              </Field>
              <Field label="Trạng thái xác thực">
                <Select value={form.trangThaiDuyet ?? 'cho_duyet'} onChange={e => setForm({ ...form, trangThaiDuyet: e.target.value })}>
                  <option value="cho_duyet">Chờ duyệt</option>
                  <option value="da_duyet">Đã duyệt</option>
                  <option value="tu_choi">Từ chối</option>
                  <option value="bi_khoa">Bị khóa</option>
                </Select>
              </Field>
              <Field label="Mô tả công ty" wide>
                <Textarea value={form.moTa ?? ''} placeholder="Giới thiệu ngắn về công ty, văn hóa, sản phẩm..." onChange={e => setForm({ ...form, moTa: e.target.value })} />
              </Field>
              {apiError && <div className={clsx(tw.error, 'sm:col-span-2')}>{apiError}</div>}
              <div className={tw.formActions}>
                <FormActions saving={saving} onCancel={() => setForm(null)} saveLabel={form.id ? 'Lưu thay đổi' : 'Thêm công ty'} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── validate job form ───────────────────────────────────────────────────────
function validateTin(f: any): Errors {
  const e: Errors = {}
  const ctyErr = required(f.maNhaTuyenDung, 'Công ty')
  if (ctyErr) e.maNhaTuyenDung = ctyErr
  const tErr = collect(required(f.tieuDe, 'Tiêu đề'), minLen(f.tieuDe ?? '', 5, 'Tiêu đề'))
  if (tErr) e.tieuDe = tErr
  const moTaErr = collect(required(f.moTa, 'Mô tả'), minLen(f.moTa ?? '', 20, 'Mô tả'))
  if (moTaErr) e.moTa = moTaErr
  const ycErr = collect(required(f.yeuCau, 'Yêu cầu'), minLen(f.yeuCau ?? '', 20, 'Yêu cầu'))
  if (ycErr) e.yeuCau = ycErr
  const min = Number(f.luongMin ?? 0), max = Number(f.luongMax ?? 0)
  if (min < 0) e.luongMin = 'Lương min không được âm'
  if (max < 0) e.luongMax = 'Lương max không được âm'
  if (min > 0 && max > 0 && min > max) e.luongMax = 'Lương max phải lớn hơn lương min'
  const sl = Number(f.soLuong ?? 1)
  if (!Number.isInteger(sl) || sl < 1) e.soLuong = 'Số lượng tối thiểu là 1'
  if (f.hanNop) {
    const d = new Date(f.hanNop)
    if (isNaN(d.getTime())) e.hanNop = 'Ngày không hợp lệ'
    else if (d < new Date(new Date().toDateString())) e.hanNop = 'Hạn nộp không được là ngày trong quá khứ'
  }
  return e
}

// ─── DuyetTinTuyenDungAdmin ──────────────────────────────────────────────────
export function DuyetTinTuyenDungAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const load = async () => {
    try {
      const [jobs, employers] = await Promise.all([api('/tintuyendung'), api('/nhatuyendung')])
      setItems(jobs); setCompanies(employers); setApiError('')
    } catch (err) { setApiError(getError(err)) }
  }
  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return items.filter(item => {
      const mk = !k || item.tieuDe?.toLowerCase().includes(k) || item.nhaTuyenDung?.tenCongTy?.toLowerCase().includes(k)
      return mk && (filter === 'tat_ca' || item.trangThai === filter)
    })
  }, [filter, items, keyword])
  const pageItems = getPage(list, page)
  useEffect(() => { setPage(1) }, [keyword, filter])

  const patch = async (id: string, payload: any) => {
    try { setApiError(''); await api(`/tintuyendung/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await load() }
    catch (err) { setApiError(getError(err)) }
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateTin(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      setApiError(''); setErrors({})
      const payload = { ...form, luongMin: Number(form.luongMin ?? 0), luongMax: Number(form.luongMax ?? 0), soLuong: Number(form.soLuong ?? 1) }
      await api(`/tintuyendung${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setForm(null); await load()
    } catch (err) { setApiError(getError(err)) } finally { setSaving(false) }
  }

  const remove = (item: any) => setConfirm({
    title: 'Xóa tin tuyển dụng', message: `Xóa tin "${item.tieuDe}"? Hành động này không thể hoàn tác.`, type: 'danger',
    onConfirm: async () => {
      try { setApiError(''); await api(`/tintuyendung/${getId(item)}`, { method: 'DELETE' }); await load() }
      catch (err) { setApiError(getError(err)) } finally { setConfirm(null) }
    },
  })

  const openForm = (item?: any) => {
    setErrors({})
    setForm(item
      ? { ...item, id: getId(item), maNhaTuyenDung: item.maNhaTuyenDung ?? item.nhaTuyenDung?.id, hanNop: item.hanNop?.slice(0, 10) ?? '' }
      : { trangThai: 'cho_duyet', loaiHinh: 'toan_thoi_gian', capBac: 'junior', soLuong: 1, luongMin: 0, luongMax: 0 })
  }

  return (
    <div className={tw.page}>
      {confirm && <ConfirmDialog isOpen title={confirm.title} message={confirm.message} type={confirm.type} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <PageHeader title="Duyệt tin tuyển dụng" desc="Kiểm duyệt nội dung tin, trạng thái hiển thị và chất lượng dữ liệu."
        action={<button className={tw.primaryBtn} onClick={() => openForm()}><AppIcon icon={Plus} size={16} /> Thêm tin</button>} />
      <div className={tw.panel}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load}
          placeholder="Tìm tiêu đề, công ty..."
          options={[{ value:'tat_ca', label:'Tất cả' }, { value:'cho_duyet', label:'Chờ duyệt' }, { value:'dang_mo', label:'Đang mở' }, { value:'tam_dong', label:'Tạm đóng' }, { value:'tu_choi', label:'Từ chối' }, { value:'het_han', label:'Hết hạn' }]} />
        {apiError && <div className={tw.error}>{apiError}</div>}
        <div className="hidden sm:block">
        <TableWrap heads={['Tin tuyển dụng', 'Công ty', 'Lương / SL', 'Trạng thái', 'Thao tác']} minWidth={860}>
          {pageItems.map(item => (
            <tr key={getId(item)}>
              <td><span className="ap-table-strong">{item.tieuDe}</span><span className="ap-table-meta">{item.diaChi ?? '-'} · {labelCap(item.capBac)} · {labelLoai(item.loaiHinh)}</span><span className="ap-table-meta">Hạn: {formatDate(item.hanNop)}</span></td>
              <td><span className="ap-table-strong">{item.nhaTuyenDung?.tenCongTy ?? '-'}</span><span className="ap-table-meta"><Badge label={labelCongTy(item.nhaTuyenDung?.trangThaiDuyet ?? '')} tone={toneCongTy(item.nhaTuyenDung?.trangThaiDuyet ?? '')} /></span></td>
              <td><span className="ap-table-strong">{formatMoney(item.luongMin)} – {formatMoney(item.luongMax)}</span><span className="ap-table-meta">SL: {item.soLuong ?? 1}</span></td>
              <td><Badge label={labelTin(item.trangThai)} tone={toneTin(item.trangThai)} /></td>
              <td><div className="ap-actions">
                {item.trangThai === 'cho_duyet' && <>
                  <button className="ap-btn-icon approve" title="Duyệt" onClick={() => setConfirm({ title:'Duyệt tin', message:`Duyệt tin "${item.tieuDe}"?`, type:'info', onConfirm: () => { patch(getId(item), { trangThai:'dang_mo' }); setConfirm(null) } })}><AppIcon icon={CheckCircle} size={14} /></button>
                  <button className="ap-btn-icon danger" title="Từ chối" onClick={() => setConfirm({ title:'Từ chối tin', message:`Từ chối tin "${item.tieuDe}"?`, type:'danger', onConfirm: () => { patch(getId(item), { trangThai:'tu_choi' }); setConfirm(null) } })}><AppIcon icon={XCircle} size={14} /></button>
                </>}
                <button className="ap-btn-icon" title="Sửa" onClick={() => openForm(item)}><AppIcon icon={Edit3} size={14} /></button>
                <button className="ap-btn-icon danger" title="Xóa" onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /></button>
              </div></td>
            </tr>
          ))}
          {list.length === 0 && <EmptyRow cols={5} />}
        </TableWrap>
        </div>
        <div className="grid gap-3 sm:hidden">
          {pageItems.map(item => (
            <article key={getId(item)} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_6px_18px_rgba(14,77,125,0.06)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950">{item.tieuDe}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.diaChi ?? '-'} · {labelCap(item.capBac)} · {labelLoai(item.loaiHinh)}</p>
                </div>
                <Badge label={labelTin(item.trangThai)} tone={toneTin(item.trangThai)} />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 [&>div]:rounded-xl [&>div]:border [&>div]:border-slate-200 [&>div]:bg-slate-50 [&>div]:p-2.5">
                <div>
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Công ty</span>
                  <strong className="block truncate text-[13px] font-black text-slate-950">{item.nhaTuyenDung?.tenCongTy ?? '-'}</strong>
                  <div className="mt-1"><Badge label={labelCongTy(item.nhaTuyenDung?.trangThaiDuyet ?? '')} tone={toneCongTy(item.nhaTuyenDung?.trangThaiDuyet ?? '')} /></div>
                </div>
                <div>
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-500">Lương / Số lượng</span>
                  <strong className="block truncate text-[13px] font-black text-slate-950">{formatMoney(item.luongMin)} – {formatMoney(item.luongMax)}</strong>
                  <p className="truncate font-semibold text-slate-500">SL: {item.soLuong ?? 1}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500">Hạn nộp: {formatDate(item.hanNop)}</p>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                {item.trangThai === 'cho_duyet' && <>
                  <button className={clsx(tw.primaryBtn, 'min-h-10 text-xs')} onClick={() => setConfirm({ title:'Duyệt tin', message:`Duyệt tin "${item.tieuDe}"?`, type:'info', onConfirm: () => { patch(getId(item), { trangThai:'dang_mo' }); setConfirm(null) } })}><AppIcon icon={CheckCircle} size={14} /> Duyệt</button>
                  <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={() => setConfirm({ title:'Từ chối tin', message:`Từ chối tin "${item.tieuDe}"?`, type:'danger', onConfirm: () => { patch(getId(item), { trangThai:'tu_choi' }); setConfirm(null) } })}><AppIcon icon={XCircle} size={14} /> Từ chối</button>
                </>}
                <button className={clsx(tw.subtleBtn, 'min-h-10 text-xs')} onClick={() => openForm(item)}><AppIcon icon={Edit3} size={14} /> Sửa</button>
                <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /> Xóa</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-extrabold text-slate-500">Không có tin tuyển dụng phù hợp.</div>}
        </div>
        <Pager page={page} total={list.length} onPage={setPage} />
      </div>

      {form && (
        <Modal title={form.id ? 'Sửa tin tuyển dụng' : 'Thêm tin tuyển dụng'} desc="Nội dung rõ ràng giúp tin phân phối tốt hơn." onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <div className={tw.formGrid}>
              <Field label="Công ty" required error={errors.maNhaTuyenDung}>
                <Select value={form.maNhaTuyenDung ?? ''} error={errors.maNhaTuyenDung} onChange={e => setForm({ ...form, maNhaTuyenDung: e.target.value })}>
                  <option value="">— Chọn công ty —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.tenCongTy}</option>)}
                </Select>
              </Field>
              <Field label="Tiêu đề" required error={errors.tieuDe}>
                <Input value={form.tieuDe ?? ''} error={errors.tieuDe} placeholder="VD: Senior ReactJS Developer" onChange={e => setForm({ ...form, tieuDe: e.target.value })} />
              </Field>
              <Field label="Địa chỉ làm việc">
                <Input value={form.diaChi ?? ''} placeholder="VD: Đà Nẵng / Remote" onChange={e => setForm({ ...form, diaChi: e.target.value })} />
              </Field>
              <Field label="Hạn nộp hồ sơ" error={errors.hanNop}>
                <Input type="date" value={form.hanNop ?? ''} error={errors.hanNop} onChange={e => setForm({ ...form, hanNop: e.target.value })} />
              </Field>
              <Field label="Lương tối thiểu (VND)" error={errors.luongMin}>
                <Input type="number" min={0} step={500000} value={form.luongMin ?? 0} error={errors.luongMin} placeholder="0 = Thỏa thuận" onChange={e => setForm({ ...form, luongMin: e.target.value })} />
              </Field>
              <Field label="Lương tối đa (VND)" error={errors.luongMax}>
                <Input type="number" min={0} step={500000} value={form.luongMax ?? 0} error={errors.luongMax} placeholder="0 = Thỏa thuận" onChange={e => setForm({ ...form, luongMax: e.target.value })} />
              </Field>
              <Field label="Loại hình làm việc">
                <Select value={form.loaiHinh ?? 'toan_thoi_gian'} onChange={e => setForm({ ...form, loaiHinh: e.target.value })}>
                  <option value="toan_thoi_gian">Toàn thời gian</option>
                  <option value="ban_thoi_gian">Bán thời gian</option>
                  <option value="thuc_tap">Thực tập</option>
                  <option value="tu_xa">Từ xa</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label="Cấp bậc">
                <Select value={form.capBac ?? 'junior'} onChange={e => setForm({ ...form, capBac: e.target.value })}>
                  <option value="intern">Intern</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="middle">Middle</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </Select>
              </Field>
              <Field label="Số lượng tuyển" required error={errors.soLuong}>
                <Input type="number" min={1} value={form.soLuong ?? 1} error={errors.soLuong} onChange={e => setForm({ ...form, soLuong: e.target.value })} />
              </Field>
              <Field label="Trạng thái">
                <Select value={form.trangThai ?? 'cho_duyet'} onChange={e => setForm({ ...form, trangThai: e.target.value })}>
                  <option value="nhap">Nháp</option>
                  <option value="cho_duyet">Chờ duyệt</option>
                  <option value="dang_mo">Đang mở</option>
                  <option value="tam_dong">Tạm đóng</option>
                  <option value="het_han">Hết hạn</option>
                  <option value="tu_choi">Từ chối</option>
                </Select>
              </Field>
              <Field label="Mô tả công việc" required wide error={errors.moTa}>
                <Textarea value={form.moTa ?? ''} error={errors.moTa} placeholder="Mô tả chi tiết công việc, trách nhiệm, môi trường làm việc... (tối thiểu 20 ký tự)" onChange={e => setForm({ ...form, moTa: e.target.value })} />
              </Field>
              <Field label="Yêu cầu ứng viên" required wide error={errors.yeuCau}>
                <Textarea value={form.yeuCau ?? ''} error={errors.yeuCau} placeholder="Kinh nghiệm, kỹ năng, bằng cấp yêu cầu... (tối thiểu 20 ký tự)" onChange={e => setForm({ ...form, yeuCau: e.target.value })} />
              </Field>
              <Field label="Quyền lợi & phúc lợi" wide>
                <Textarea value={form.quyenLoi ?? ''} placeholder="Lương thưởng, bảo hiểm, du lịch, đào tạo..." onChange={e => setForm({ ...form, quyenLoi: e.target.value })} />
              </Field>
              {apiError && <div className={clsx(tw.error, 'sm:col-span-2')}>{apiError}</div>}
              <div className={tw.formActions}>
                <FormActions saving={saving} onCancel={() => setForm(null)} saveLabel={form.id ? 'Lưu thay đổi' : 'Thêm tin'} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── validate skill form ─────────────────────────────────────────────────────
function validateKyNang(f: any): Errors {
  const e: Errors = {}
  const tErr = collect(required(f.tenKyNang, 'Tên kỹ năng'), minLen(f.tenKyNang ?? '', 2, 'Tên kỹ năng'))
  if (tErr) e.tenKyNang = tErr
  const loaiKyNang = normalizeSkillType(String(f.loaiKyNang ?? ''))
  if (!loaiKyNang || loaiKyNang === 'tat_ca') e.loaiKyNang = 'Vui lòng chọn loại kỹ năng'
  return e
}

// ─── QuanLyKyNangAdmin ───────────────────────────────────────────────────────
export function QuanLyKyNangAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const load = async () => {
    try { setItems(await api('/danhmuckynang')); setApiError('') }
    catch (err) { setApiError(getError(err)) }
  }
  useEffect(() => { load() }, [])

  const skillTypeOptions = useMemo(() => {
    const optionMap = new Map<string, string>()
    for (const option of SKILL_TYPE_BASE) optionMap.set(option.value, option.label)
    for (const item of items) {
      const value = normalizeSkillType(String(item.loaiKyNang ?? ''))
      if (!value) continue
      if (!optionMap.has(value)) optionMap.set(value, formatSkillTypeLabel(value))
    }
    if (form?.loaiKyNang) {
      const value = normalizeSkillType(String(form.loaiKyNang))
      if (value && !optionMap.has(value)) optionMap.set(value, formatSkillTypeLabel(value))
    }
    return Array.from(optionMap.entries()).map(([value, label]) => ({ value, label }))
  }, [items, form?.loaiKyNang])

  const list = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return items.filter((item) => {
      const loai = normalizeSkillType(String(item.loaiKyNang ?? ''))
      return (!k || item.tenKyNang?.toLowerCase().includes(k)) && (filter === 'tat_ca' || loai === filter)
    })
  }, [filter, items, keyword])
  const pageItems = getPage(list, page)
  useEffect(() => { setPage(1) }, [keyword, filter])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateKyNang(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      setApiError(''); setErrors({})
      const loaiKyNang = normalizeSkillType(String(form.loaiKyNang ?? ''))
      await api(`/danhmuckynang${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify({ tenKyNang: form.tenKyNang.trim(), loaiKyNang }) })
      setForm(null); await load()
    } catch (err) { setApiError(getError(err)) } finally { setSaving(false) }
  }

  const remove = (item: any) => setConfirm({
    title: 'Xóa kỹ năng', message: `Xóa kỹ năng "${item.tenKyNang}"? Các tin tuyển dụng đang dùng kỹ năng này sẽ bị ảnh hưởng.`, type: 'danger',
    onConfirm: async () => {
      try { setApiError(''); await api(`/danhmuckynang/${getId(item)}`, { method: 'DELETE' }); await load() }
      catch (err) { setApiError(getError(err)) } finally { setConfirm(null) }
    },
  })

  const openForm = (item?: any) => {
    setErrors({})
    setForm(item ? { id: getId(item), tenKyNang: item.tenKyNang, loaiKyNang: normalizeSkillType(String(item.loaiKyNang ?? '')) } : { loaiKyNang: 'frontend' })
  }

  return (
    <div className={tw.page}>
      {confirm && <ConfirmDialog isOpen title={confirm.title} message={confirm.message} type={confirm.type} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <PageHeader title="Danh mục kỹ năng" desc="Quản trị taxonomy kỹ năng dùng chung cho ứng viên và tin tuyển dụng."
        action={<button className={tw.primaryBtn} onClick={() => openForm()}><AppIcon icon={Plus} size={16} /> Thêm kỹ năng</button>} />

      <div className={tw.panel}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load}
          placeholder="Tìm tên kỹ năng..." options={skillTypeOptions} />
        {apiError && <div className={tw.error}>{apiError}</div>}
        <div className="hidden sm:block">
        <TableWrap heads={['Tên kỹ năng', 'Loại', 'Ngày tạo', 'Thao tác']} minWidth={480}>
          {pageItems.map(item => (
            <tr key={getId(item)}>
              <td><span className="ap-table-strong">{item.tenKyNang}</span></td>
              <td><Badge label={formatSkillTypeLabel(item.loaiKyNang)} tone="blue" /></td>
              <td>{formatDate(item.ngayTao)}</td>
              <td><div className="ap-actions">
                <button className="ap-btn-icon" title="Sửa" onClick={() => openForm(item)}><AppIcon icon={Edit3} size={14} /></button>
                <button className="ap-btn-icon danger" title="Xóa" onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /></button>
              </div></td>
            </tr>
          ))}
          {list.length === 0 && <EmptyRow cols={4} />}
        </TableWrap>
        </div>
        <div className="grid gap-3 sm:hidden">
          {pageItems.map(item => (
            <article key={getId(item)} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_6px_18px_rgba(14,77,125,0.06)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950">{item.tenKyNang}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Ngày tạo: {formatDate(item.ngayTao)}</p>
                </div>
                <Badge label={formatSkillTypeLabel(item.loaiKyNang)} tone="blue" />
              </div>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                <button className={clsx(tw.subtleBtn, 'min-h-10 text-xs')} onClick={() => openForm(item)}><AppIcon icon={Edit3} size={14} /> Sửa</button>
                <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /> Xóa</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-extrabold text-slate-500">Không có kỹ năng phù hợp.</div>}
        </div>
        <Pager page={page} total={list.length} onPage={setPage} />
      </div>

      {form && (
        <Modal title={form.id ? 'Sửa kỹ năng' : 'Thêm kỹ năng mới'} desc="Kỹ năng sẽ xuất hiện trong danh sách chọn của tin tuyển dụng và hồ sơ ứng viên." onClose={() => setForm(null)}>
          <form onSubmit={save} noValidate>
            <div className={tw.formGrid}>
              <Field label="Tên kỹ năng" required error={errors.tenKyNang}>
                <Input value={form.tenKyNang ?? ''} error={errors.tenKyNang} placeholder="VD: ReactJS, Python, UI/UX..." autoFocus
                  onChange={e => setForm({ ...form, tenKyNang: e.target.value })} />
              </Field>
              <Field label="Loại kỹ năng" required error={errors.loaiKyNang}>
                <Input
                  list="admin-skill-type-options"
                  value={form.loaiKyNang ?? ''}
                  error={errors.loaiKyNang}
                  placeholder="Ví dụ: frontend, backend, cloud_native..."
                  onChange={e => setForm({ ...form, loaiKyNang: e.target.value })}
                />
                <datalist id="admin-skill-type-options">
                  {skillTypeOptions.filter((type) => type.value !== 'tat_ca').map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </datalist>
                <span className="text-[11px] font-semibold text-slate-500">Có thể chọn loại có sẵn hoặc nhập loại mới.</span>
              </Field>
              {apiError && <div className={clsx(tw.error, 'sm:col-span-2')}>{apiError}</div>}
              <div className={tw.formActions}>
                <FormActions saving={saving} onCancel={() => setForm(null)} saveLabel={form.id ? 'Lưu thay đổi' : 'Thêm kỹ năng'} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── QuanLyReviewCongTyAdmin ─────────────────────────────────────────────────
export function QuanLyReviewCongTyAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [apiError, setApiError] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const load = async () => {
    try { setItems(await api('/danhgiacongty')); setApiError('') }
    catch (err) { setApiError(getError(err)) }
  }
  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return items.filter(item =>
      (!k || item.nhaTuyenDung?.tenCongTy?.toLowerCase().includes(k) || item.noiDung?.toLowerCase().includes(k)) &&
      (filter === 'tat_ca' || String(item.daDuyet) === filter))
  }, [filter, items, keyword])
  const pageItems = getPage(list, page)
  useEffect(() => { setPage(1) }, [keyword, filter])

  const patch = async (id: string, payload: any) => {
    try { setApiError(''); await api(`/danhgiacongty/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await load() }
    catch (err) { setApiError(getError(err)) }
  }

  const remove = (item: any) => setConfirm({
    title: 'Xóa review', message: 'Xóa review này vĩnh viễn?', type: 'danger',
    onConfirm: async () => {
      try { setApiError(''); await api(`/danhgiacongty/${getId(item)}`, { method: 'DELETE' }); await load() }
      catch (err) { setApiError(getError(err)) } finally { setConfirm(null) }
    },
  })

  const Stars = ({ n }: { n: number }) => (
    <span className="text-sm font-black tracking-wide text-amber-500">
      {'★'.repeat(Math.max(0, Math.min(5, n)))}{'☆'.repeat(Math.max(0, 5 - n))}
    </span>
  )

  return (
    <div className={tw.page}>
      {confirm && <ConfirmDialog isOpen title={confirm.title} message={confirm.message} type={confirm.type} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <PageHeader title="Review công ty" desc="Kiểm duyệt đánh giá công ty trước khi hiển thị công khai." />
      <div className={tw.panel}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load}
          placeholder="Tìm công ty, nội dung review..."
          options={[{ value:'tat_ca', label:'Tất cả' }, { value:'false', label:'Chờ duyệt' }, { value:'true', label:'Đã duyệt' }]} />
        {apiError && <div className={tw.error}>{apiError}</div>}

        {/* Desktop */}
        <div className="hidden sm:block">
          <TableWrap heads={['Công ty', 'Người đánh giá', 'Điểm', 'Nội dung', 'Trạng thái', 'Thao tác']} minWidth={860}>
            {pageItems.map(item => (
              <tr key={getId(item)}>
                <td><span className="ap-table-strong">{item.nhaTuyenDung?.tenCongTy ?? '-'}</span><span className="ap-table-meta">{formatDate(item.ngayTao)}</span></td>
                <td><span className="ap-table-strong">{item.anDanh ? 'Ẩn danh' : item.ungVien?.hoTen ?? 'Ứng viên'}</span><span className="ap-table-meta">{item.anDanh ? '' : item.ungVien?.email ?? '-'}</span></td>
                <td><Stars n={item.diem} /><span className="ap-table-meta">{item.diem}/5</span></td>
                <td><div className="ap-table-copy">{truncate(item.noiDung, 100)}</div></td>
                <td><Badge label={item.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'} tone={item.daDuyet ? 'green' : 'yellow'} /></td>
                <td><div className="ap-actions">
                  {!item.daDuyet && <button className="ap-btn-icon approve" title="Duyệt" onClick={() => setConfirm({ title:'Duyệt review', message:`Duyệt review của "${item.nhaTuyenDung?.tenCongTy ?? ''}"?`, type:'info', onConfirm: () => { patch(getId(item), { daDuyet: true }); setConfirm(null) } })}><AppIcon icon={CheckCircle} size={14} /></button>}
                  {item.daDuyet && <button className="ap-btn-icon" title="Ẩn" onClick={() => setConfirm({ title:'Ẩn review', message:'Ẩn review này?', type:'warning', onConfirm: () => { patch(getId(item), { daDuyet: false }); setConfirm(null) } })}><AppIcon icon={XCircle} size={14} /></button>}
                  <button className="ap-btn-icon danger" title="Xóa" onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /></button>
                </div></td>
              </tr>
            ))}
            {list.length === 0 && <EmptyRow cols={6} />}
          </TableWrap>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 sm:hidden">
          {pageItems.map(item => (
            <article key={getId(item)} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950">{item.nhaTuyenDung?.tenCongTy ?? '-'}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.anDanh ? 'Ẩn danh' : item.ungVien?.hoTen ?? 'Ứng viên'} · {formatDate(item.ngayTao)}</p>
                </div>
                <Badge label={item.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'} tone={item.daDuyet ? 'green' : 'yellow'} />
              </div>
              <div className="flex items-center gap-2"><Stars n={item.diem} /><span className="text-xs font-bold text-slate-500">{item.diem}/5</span></div>
              <p className="line-clamp-3 text-xs font-semibold leading-relaxed text-slate-600">{item.noiDung}</p>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                {!item.daDuyet && <button className={clsx(tw.primaryBtn, 'min-h-10 text-xs')} onClick={() => setConfirm({ title:'Duyệt review', message:`Duyệt review này?`, type:'info', onConfirm: () => { patch(getId(item), { daDuyet: true }); setConfirm(null) } })}><AppIcon icon={CheckCircle} size={14} /> Duyệt</button>}
                {item.daDuyet && <button className={clsx(tw.subtleBtn, 'min-h-10 text-xs')} onClick={() => setConfirm({ title:'Ẩn review', message:'Ẩn review này?', type:'warning', onConfirm: () => { patch(getId(item), { daDuyet: false }); setConfirm(null) } })}><AppIcon icon={XCircle} size={14} /> Ẩn</button>}
                <button className={clsx(tw.dangerBtn, 'min-h-10 text-xs')} onClick={() => remove(item)}><AppIcon icon={Trash2} size={14} /> Xóa</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-extrabold text-slate-500">Không có review phù hợp.</div>}
        </div>
        <Pager page={page} total={list.length} onPage={setPage} />
      </div>
    </div>
  )
}

// ─── BaoCaoAdmin ─────────────────────────────────────────────────────────────
export function BaoCaoAdmin() {
  const [data, setData] = useState<any>({})
  useEffect(() => {
    Promise.all([api('/nguoidung'), api('/nhatuyendung'), api('/tintuyendung'), api('/danhmuckynang'), api('/danhgiacongty')])
      .then(([users, companies, jobs, skills, reviews]) => setData({ users, companies, jobs, skills, reviews }))
      .catch(() => undefined)
  }, [])

  const cards = [
    ['Người dùng', data.users?.length ?? 0, Building2],
    ['Công ty', data.companies?.length ?? 0, Building2],
    ['Tin tuyển dụng', data.jobs?.length ?? 0, FileText],
    ['Kỹ năng', data.skills?.length ?? 0, Star],
    ['Review', data.reviews?.length ?? 0, BarChart2],
  ]

  const jobsByStatus = useMemo(() => {
    const m: Record<string, number> = {}
    ;(data.jobs ?? []).forEach((j: any) => { m[j.trangThai] = (m[j.trangThai] ?? 0) + 1 })
    return m
  }, [data.jobs])

  return (
    <div className={tw.page}>
      <PageHeader title="Báo cáo hệ thống" desc="Tổng hợp nhanh các chỉ số vận hành từ database." />
      <div className={tw.kpiGrid}>
        {cards.map(([label, value, Icon]: any) => (
          <div key={label} className={tw.kpiCard}>
            <span className={tw.kpiIcon}><AppIcon icon={Icon} size={18} /></span>
            <span className={tw.kpiLabel}>{label}</span>
            <strong className={tw.kpiValue}>{value}</strong>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={tw.panel}>
          <h2 className="mb-3 text-base font-black text-slate-950">Tin tuyển dụng theo trạng thái</h2>
          <div className="grid gap-2">
            {['dang_mo','cho_duyet','tam_dong','het_han','tu_choi','nhap'].map(s => {
              const count = jobsByStatus[s] ?? 0
              const max = Math.max(1, ...Object.values(jobsByStatus) as number[])
              return (
                <div key={s} className="grid grid-cols-[120px_1fr_32px] items-center gap-2">
                  <span className="truncate text-xs font-bold text-slate-500">{labelTin(s)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#0e4d7d] transition-all" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-right text-xs font-black text-slate-900">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className={tw.panel}>
          <h2 className="mb-3 text-base font-black text-slate-950">Công ty theo trạng thái</h2>
          <div className="grid gap-2">
            {['da_duyet','cho_duyet','tu_choi','bi_khoa'].map(s => {
              const count = (data.companies ?? []).filter((c: any) => c.trangThaiDuyet === s).length
              const max = Math.max(1, data.companies?.length ?? 1)
              return (
                <div key={s} className="grid grid-cols-[120px_1fr_32px] items-center gap-2">
                  <span className="truncate text-xs font-bold text-slate-500">{labelCongTy(s)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-right text-xs font-black text-slate-900">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CaiDatAdmin ─────────────────────────────────────────────────────────────
export function CaiDatAdmin() {
  const [settings, setSettings] = useState(() =>
    JSON.parse(localStorage.getItem('itjob_admin_settings') ?? '{"kiemDuyetTin":true,"kiemDuyetReview":true,"baoTri":false}'))
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('itjob_admin_settings', JSON.stringify(settings))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const rows: [string, string, string][] = [
    ['kiemDuyetTin', 'Bật kiểm duyệt tin tuyển dụng', 'Tin mới cần admin duyệt trước khi công khai.'],
    ['kiemDuyetReview', 'Bật kiểm duyệt review công ty', 'Review chỉ hiển thị sau khi đạt chuẩn nội dung.'],
    ['baoTri', 'Chế độ bảo trì', 'Tạm giới hạn thao tác khi hệ thống cần xử lý kỹ thuật.'],
  ]

  return (
    <div className={tw.page}>
      <PageHeader title="Cài đặt hệ thống" desc="Cấu hình vận hành phía quản trị." />
      <div className={tw.panel}>
        <div className="flex flex-col divide-y divide-slate-100">
          {rows.map(([key, label, desc]) => (
            <label key={key} className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <span>
                <span className="block text-sm font-black text-slate-950">{label}</span>
                <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{desc}</span>
              </span>
              <div className="relative mt-0.5 flex-none">
                <input type="checkbox" className="sr-only" checked={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.checked })} />
                <div className={clsx('h-6 w-11 rounded-full transition-colors', settings[key] ? 'bg-[#0e4d7d]' : 'bg-slate-200')}>
                  <div className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', settings[key] ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          {saved && <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><AppIcon icon={CheckCircle} size={15} /> Đã lưu</span>}
          <button className={tw.primaryBtn} onClick={save}><AppIcon icon={Settings} size={16} /> Lưu cài đặt</button>
        </div>
      </div>
    </div>
  )
}

// ─── LogsAdmin ───────────────────────────────────────────────────────────────
export function LogsAdmin() {
  const logs = [
    ['Seed dữ liệu', 'Đã tạo tài khoản mẫu cho 3 vai trò', 'Thành công'],
    ['Auth', 'Admin đăng nhập hệ thống', 'Thành công'],
    ['CRUD', 'Quản lý người dùng đã bật', 'Hoạt động'],
    ['Policy', 'Chặn xóa admin cuối cùng', 'Bảo vệ'],
  ]
  return (
    <div className={tw.page}>
      <PageHeader title="System Logs" desc="Nhật ký vận hành hệ thống và các sự kiện quản trị quan trọng." />
      <div className={tw.panel}>
        <TableWrap heads={['Nhóm', 'Sự kiện', 'Trạng thái']} minWidth={480}>
          {logs.map(item => (
            <tr key={item[1]}>
              <td><span className="ap-inline-icon"><AppIcon icon={Shield} size={15} /> {item[0]}</span></td>
              <td>{item[1]}</td>
              <td><span className="ap-log-badge">{item[2]}</span></td>
            </tr>
          ))}
        </TableWrap>
      </div>
    </div>
  )
}

// end of file
