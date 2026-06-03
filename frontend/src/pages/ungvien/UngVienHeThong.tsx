import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { clsx } from 'clsx'
import {
  Bell, Briefcase, Calendar, CheckCircle, Edit3, ExternalLink,
  FileText, Plus, Save, Star, Trash2, XCircle,
} from 'lucide-react'
import CvStudio from './CvStudio'
import { toast } from '../../lib/toast'
import { layAccessToken } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import { DashboardSkeleton } from '../../components/LoadingStates'
import { useConfirm } from '../../components/ConfirmDialog'
import './ungvien-styles.css'
import './ungvien-responsive.css'

type BadgeTone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

const toneClass: Record<BadgeTone, string> = {
  blue:   'border-sky-200 bg-sky-50 text-sky-700',
  green:  'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  red:    'border-rose-200 bg-rose-50 text-rose-700',
  gray:   'border-slate-200 bg-slate-50 text-slate-600',
}

function user() { return JSON.parse(localStorage.getItem('itjob_nguoidung') ?? 'null') }
function headers() {
  const token = layAccessToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}
async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.thongBao ?? 'Thao tác thất bại')
  return data.duLieu
}
function formatDate(v?: string) {
  return v ? new Date(v).toLocaleString('vi-VN', { hour12: false }) : '-'
}
function money(v?: number) {
  return v ? `${v.toLocaleString('vi-VN')} VND` : 'Thỏa thuận'
}
function labelUT(v?: string) {
  return ({ da_nop:'Đã nộp', da_xem:'Đã xem', dang_xet_duyet:'Đang xét duyệt',
    moi_phong_van:'Mời phỏng vấn', dat:'Đạt', tu_choi:'Từ chối', da_rut:'Đã rút',
  } as Record<string,string>)[v ?? ''] ?? v ?? '-'
}
function toneUT(v?: string): BadgeTone {
  if (v === 'dat') return 'green'
  if (v === 'tu_choi' || v === 'da_rut') return 'red'
  if (v === 'moi_phong_van') return 'yellow'
  return 'blue'
}
function labelLich(v?: string) {
  return ({ da_len_lich:'Cần phản hồi', da_xac_nhan:'Đã xác nhận',
    doi_lich:'Xin đổi lịch', hoan_thanh:'Hoàn thành', da_huy:'Đã hủy',
  } as Record<string,string>)[v ?? ''] ?? v ?? '-'
}
function toneLich(v?: string): BadgeTone {
  if (v === 'da_xac_nhan' || v === 'hoan_thanh') return 'green'
  if (v === 'doi_lich') return 'yellow'
  if (v === 'da_huy') return 'red'
  return 'blue'
}
function labelKQ(v?: string) {
  return ({ cho_ket_qua:'Chờ kết quả', dat:'Đạt', khong_dat:'Không đạt' } as Record<string,string>)[v ?? ''] ?? '-'
}

function useUngVienData() {
  const [state, setState] = useState<any>({ loading: true, error: '' })
  const current = user()
  const load = async () => {
    try {
      setState((p: any) => ({ ...p, loading: true, error: '' }))
      const [uvList, hoSoList, utList, lichList, tbList, tinList, kyNangList] = await Promise.all([
        api('/ungvien'), api('/hosonangluc'), api('/hosoungtuyen'),
        api('/lichphongvan'), api('/thongbao'), api('/tintuyendung'), api('/danhmuckynang'),
      ])
      const ungVien = uvList.find((x: any) => x.maNguoiDung === current?.id)
      const hoSo = hoSoList.filter((x: any) => x.maUngVien === ungVien?.id)
      const ungTuyen = utList.filter((x: any) => x.maUngVien === ungVien?.id)
      const utIds = new Set(ungTuyen.map((x: any) => x.id))
      const lich = lichList.filter((x: any) => utIds.has(x.maHoSoUngTuyen))
      const thongBao = tbList.filter((x: any) => String(x.maNguoiDung?._id ?? x.maNguoiDung) === current?.id)
      setState({ loading: false, error: '', current, ungVien, hoSo, ungTuyen, lich, thongBao, tinList, kyNangList })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tải được dữ liệu'
      setState((p: any) => ({ ...p, loading: false, error: msg }))
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!')
    }
  }
  useEffect(() => { load() }, [])
  return { ...state, reload: load }
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap', toneClass[tone])}>
      {children}
    </span>
  )
}
function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-400">{children}</div>
}
function ErrorBox({ message }: { message?: string }) {
  if (!message) return null
  return <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</div>
}
function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-5', className)}>{children}</div>
}
function PanelHead({ title, to, action }: { title: string; to?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-black text-slate-950">{title}</h2>
      {action ?? (to && <a href={to} className="text-sm font-extrabold text-sky-700 hover:text-sky-800 transition-colors">Xem tất cả</a>)}
    </div>
  )
}
function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[#0b5c91]/25 hover:shadow-[0_16px_34px_rgba(6,42,77,0.12)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-100 opacity-80 transition group-hover:bg-sky-200" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf6ff] text-[#0b5c91] ring-1 ring-[#0b5c91]/10">
          <Icon size={21} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
          <strong className="mt-1 block text-3xl font-black leading-none text-slate-950">{value}</strong>
        </div>
      </div>
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled, type = 'button', href, className }: any) {
  const cls = clsx('btn-primary-uv', className)
  if (href) return <a href={href} className={cls}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>
}
function SecondaryBtn({ children, onClick, disabled, type = 'button', className }: any) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clsx('inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60', className)}>
      {children}
    </button>
  )
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={clsx('grid gap-1.5', wide && 'md:col-span-2')}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  )
}
const inputCls = 'min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition'
const textareaCls = 'min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition resize-y'
const selectCls = 'min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition'

function Page({ title, desc, action, children }: { title: string; desc: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5 pb-24 sm:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{desc}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
function Row({ children, onClick, active, className }: { children: ReactNode; onClick?: () => void; active?: boolean; className?: string }) {
  return (
    <div onClick={onClick} className={clsx('flex flex-col gap-2 rounded-xl border p-3 last:mb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3', onClick && 'cursor-pointer transition hover:border-sky-200 hover:bg-sky-50/60', active ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white', className)}>
      {children}
    </div>
  )
}
function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-1 gap-1 overflow-x-auto">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} className={clsx('flex-1 min-w-max rounded-lg px-3 py-2 text-sm font-black whitespace-nowrap transition', active === t.key ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{children}</div>
}
function Modal({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-[300] flex items-stretch justify-center overflow-hidden bg-slate-950/50 p-0 backdrop-blur-sm">{children}</div>
}
function ModalCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('h-dvh w-full max-w-none overflow-y-auto rounded-none bg-white p-4 shadow-none sm:p-6', className)}>{children}</div>
}
function ModalHead({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700">
        <XCircle size={18} />
      </button>
    </div>
  )
}
function Drawer({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-0 h-dvh w-full overflow-y-auto rounded-none bg-white p-4 shadow-none sm:p-6" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
function DetailGrid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-1 gap-0.5 px-3 py-2.5 sm:grid-cols-[140px_1fr]">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
          <span className="text-sm font-semibold text-slate-900 break-words">{value}</span>
        </div>
      ))}
    </div>
  )
}
function AppRow({ item, onClick }: { item: any; onClick?: () => void }) {
  return (
    <Row onClick={onClick}>
      <div className="min-w-0 flex-1">
        <strong className="block truncate font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</strong>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'} - Nộp {formatDate(item.ngayNop)}</p>
      </div>
      <Badge tone={toneUT(item.trangThai)}>{labelUT(item.trangThai)}</Badge>
    </Row>
  )
}
function ItvRow({ item, onClick, active }: { item: any; onClick?: () => void; active?: boolean }) {
  return (
    <Row onClick={onClick} active={active}>
      <div className="min-w-0 flex-1">
        <strong className="block truncate font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? '-'}</strong>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-500">{item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'} - {formatDate(item.thoiGianBatDau)}</p>
      </div>
      <Badge tone={toneLich(item.trangThai)}>{labelLich(item.trangThai)}</Badge>
    </Row>
  )
}

function CompactTask({ task }: { task: { title: string; desc: string; href: string } }) {
  return (
    <a href={task.href} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-[#0b5c91]/25 hover:bg-[#eef8ff] no-underline">
      <div className="min-w-0">
        <strong className="block truncate text-sm font-black text-slate-950">{task.title}</strong>
        <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{task.desc}</p>
      </div>
      <ExternalLink size={15} className="shrink-0 text-slate-400 transition group-hover:text-[#0b5c91]" />
    </a>
  )
}

// ─── Dashboard default ────────────────────────────────────────────────────────

export default function DashboardUngVienMới() {
  const data = useUngVienData()
  if (data.loading) return <DashboardSkeleton />
  const hoSoChinh = data.hoSo?.find((x: any) => x.cvChinh)
  const unread = data.thongBao?.filter((x: any) => !x.daDoc).length ?? 0
  const upcoming = (data.lich ?? []).filter((x: any) => new Date(x.thoiGianBatDau) >= new Date()).length
  const complete = Math.min(100, 35 + (data.ungVien?.portfolio?.length ? 20 : 0) + (data.hoSo?.length ? 25 : 0) + (data.ungVien?.kyNang?.length ? 20 : 0))
  const tasks = [
    !hoSoChinh && { title: 'Đặt CV chính', desc: 'Cần có CV chính trước khi ứng tuyển nhanh.', href: '/ung-vien/ho-so' },
    unread > 0 && { title: `${unread} thông báo chưa đọc`, desc: 'Kiểm tra cập nhật từ hệ thống và nhà tuyển dụng.', href: '/ung-vien/thong-bao' },
    ...(data.lich ?? []).filter((x: any) => x.trangThai === 'da_len_lich').map((x: any) => ({
      title: 'Xác nhận lịch phỏng vấn',
      desc: `${x.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Lịch phỏng vấn'} - ${formatDate(x.thoiGianBatDau)}`,
      href: '/ung-vien/lich-phong-van',
    })),
  ].filter(Boolean) as { title: string; desc: string; href: string }[]

  return (
    <Page title={`Xin chào, ${data.current?.hoTen ?? 'Ứng viên'}`} desc="Không gian quản lý hồ sơ, ứng tuyển và lịch phỏng vấn." action={<PrimaryBtn href="/viec-lam">Tìm việc mới</PrimaryBtn>}>
      <ErrorBox message={data.error} />
      <div className="relative overflow-hidden rounded-3xl border border-[#07385f] bg-[linear-gradient(135deg,#031a33_0%,#063b63_52%,#0b5c91_100%)] p-5 text-white shadow-[0_22px_50px_rgba(6,42,77,0.22)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(125,211,252,0.18),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(186,230,253,0.16),transparent_30%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-cyan-200/40" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#a5f3fc' }}>Hồ sơ chính</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl" style={{ color: '#ffffff', textShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
              {hoSoChinh?.tieuDe ?? data.ungVien?.viTriMongMuon ?? 'Chưa có CV chính'}
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 sm:text-base" style={{ color: '#e0f2fe' }}>
              {data.ungVien?.tomTat ?? 'Cập nhật hồ sơ để nhà tuyển dụng hiểu rõ năng lực, kinh nghiệm và mục tiêu nghề nghiệp của bạn.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <PrimaryBtn href="/ung-vien/ho-so" className="cyan">Cập nhật hồ sơ</PrimaryBtn>
              <a href="/viec-lam" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-white/20" style={{ color: '#ffffff' }}>
                Khám phá việc làm
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/15 bg-white/15 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur">
            <strong className="text-4xl font-black" style={{ color: '#ffffff' }}>{complete}%</strong>
            <span className="mt-1 block text-sm font-bold" style={{ color: '#dff6ff' }}>Độ hoàn thiện hồ sơ</span>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-700" style={{ width: `${complete}%` }} />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5" style={{ color: '#e0f2fe' }}>Hoàn thiện CV, kỹ năng và portfolio để tăng tỷ lệ được mời phỏng vấn.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={Briefcase} label="Đã ứng tuyển" value={data.ungTuyen?.length ?? 0} />
        <Kpi icon={Calendar} label="Lịch sắp tới" value={upcoming} />
        <Kpi icon={FileText} label="CV năng lực" value={data.hoSo?.length ?? 0} />
        <Kpi icon={Bell} label="Thông báo mới" value={unread} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead title="Việc cần xử lý" />
          {tasks.length ? (
            <div className="space-y-2">
              {tasks.slice(0, 4).map((task, i) => <CompactTask key={i} task={task} />)}
            </div>
          ) : <Empty>Không có việc cần xử lý.</Empty>}
        </Panel>
        <Panel>
          <PanelHead title="Ứng tuyển gần đây" to="/ung-vien/ung-tuyen" />
          {data.ungTuyen?.length ? <div className="space-y-2">{data.ungTuyen.slice(0, 4).map((x: any) => <AppRow key={x.id} item={x} />)}</div> : <Empty>Chưa có hồ sơ ứng tuyển.</Empty>}
        </Panel>
        <Panel>
          <PanelHead title="Lịch sắp tới" to="/ung-vien/lich-phong-van" />
          {data.lich?.length ? <div className="space-y-2">{data.lich.slice(0, 4).map((x: any) => <ItvRow key={x.id} item={x} />)}</div> : <Empty>Chưa có lịch phỏng vấn.</Empty>}
        </Panel>
      </div>
    </Page>
  )
}

// ─── HoSoUngVienPage ──────────────────────────────────────────────────────────

function PortfolioEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const add = () => onChange([...value, { tenDuAn: '', lienKet: '', moTa: '', congNghe: [] }])
  return (
    <div className="space-y-3">
      {value.map((p, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-3">
          <input className={inputCls} placeholder="Tên dự án" value={p.tenDuAn} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, tenDuAn: e.target.value } : x))} />
          <input className={inputCls} placeholder="Link" value={p.lienKet} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, lienKet: e.target.value } : x))} />
          <div className="flex gap-2">
            <input className={inputCls} placeholder="Công nghệ (phân tách bằng dấu phẩy)" value={(p.congNghe ?? []).join(', ')} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, congNghe: e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean) } : x))} />
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50"><Trash2 size={15} /></button>
          </div>
          <textarea className={clsx(textareaCls, 'md:col-span-3')} placeholder="Mô tả" value={p.moTa} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, moTa: e.target.value } : x))} />
        </div>
      ))}
      <SecondaryBtn onClick={add}><Plus size={14} /> Thêm portfolio</SecondaryBtn>
    </div>
  )
}

const sectionLabel: Record<string, string> = { hocVan: 'Học vấn', kinhNghiemLam: 'Kinh nghiệm', chungChi: 'Chứng chỉ', duAn: 'Dự án' }

function SectionEditor({ label, value, onChange }: any) {
  return (
    <Field label={label} wide>
      <div className="space-y-2">
        {value.map((item: any, i: number) => (
          <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input className={inputCls} placeholder="Tiêu đề" value={item.tieuDe ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, tieuDe: e.target.value } : x))} />
            <input className={inputCls} placeholder="Don vi" value={item.donVi ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, donVi: e.target.value } : x))} />
            <input className={inputCls} placeholder="Thoi gian" value={item.thoiGian ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, thoiGian: e.target.value } : x))} />
            <button type="button" onClick={() => onChange(value.filter((_: any, idx: number) => idx !== i))} className="grid h-11 w-11 place-items-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50"><Trash2 size={15} /></button>
          </div>
        ))}
        <SecondaryBtn onClick={() => onChange([...value, { tieuDe: '', donVi: '', thoiGian: '', moTa: '' }])}><Plus size={14} /> Thêm mục</SecondaryBtn>
      </div>
    </Field>
  )
}

function CvModal({ cv, setCv, onClose, onSubmit }: any) {
  return (
    <Modal>
      <ModalCard>
        <form onSubmit={onSubmit}>
          <ModalHead title={cv.id ? 'Sửa CV' : 'Thêm CV mới'} onClose={onClose} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tiêu đề CV" wide><input className={inputCls} value={cv.tieuDe} onChange={e => setCv({ ...cv, tieuDe: e.target.value })} /></Field>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded" checked={cv.cvChinh} onChange={e => setCv({ ...cv, cvChinh: e.target.checked })} /> Đặt làm CV chính</label>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded" checked={cv.congKhai} onChange={e => setCv({ ...cv, congKhai: e.target.checked })} /> Công khai với nhà tuyển dụng</label>
            </div>
            {(['hocVan', 'kinhNghiemLam', 'chungChi', 'duAn'] as const).map(key => (
              <SectionEditor key={key} label={sectionLabel[key]} value={cv[key] ?? []} onChange={(v: any[]) => setCv({ ...cv, [key]: v })} />
            ))}
            <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
              <SecondaryBtn type="button" onClick={onClose}>Hủy</SecondaryBtn>
              <PrimaryBtn type="submit">Lưu CV</PrimaryBtn>
            </div>
          </div>
        </form>
      </ModalCard>
    </Modal>
  )
}

export function HoSoUngVienPage() {
  const data = useUngVienData()
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [cv, setCv] = useState<any>(null)
  const { confirm, ConfirmDialogComponent } = useConfirm()
  useEffect(() => { if (data.ungVien) setProfile({ ...data.ungVien }) }, [data.ungVien?.id])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    confirm(
      'Lưu hồ sơ ứng viên',
      'Bạn có chắc chắn muốn cập nhật thông tin hồ sơ cá nhân?',
      async () => {
        try {
          await api(`/ungvien/${profile.id}`, { method: 'PATCH', body: JSON.stringify({ ...profile, maNguoiDung: profile.maNguoiDung }) })
          await data.reload(); setError('')
        } catch (err) { setError(err instanceof Error ? err.message : 'Không lưu được hồ sơ') }
      },
      'info',
      'Lưu',
    )
  }
  const saveCv = async (e: FormEvent) => {
    e.preventDefault()
    confirm(
      cv.id ? 'Cập nhật CV' : 'Tạo CV mới',
      cv.id ? 'Xác nhận cập nhật nội dung CV này?' : 'Xác nhận tạo CV mới cho hồ sơ của bạn?',
      async () => {
        await api(`/hosonangluc${cv.id ? `/${cv.id}` : ''}`, { method: cv.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...cv, maUngVien: data.ungVien.id }) })
        setCv(null); await data.reload()
      },
      'info',
      cv.id ? 'Cập nhật' : 'Tạo CV',
    )
  }
  const removeCv = async (id: string) => {
    confirm(
      'Xóa CV',
      'Bạn có chắc chắn muốn xóa CV này? Hành động này không thể hoàn tác.',
      async () => {
        await api(`/hosonangluc/${id}`, { method: 'DELETE' })
        await data.reload()
      },
      'danger',
      'Xóa',
    )
  }

  if (data.loading || !profile) return <Page title="Hồ sơ năng lực" desc="Đang tải..."><Panel>Đang tải...</Panel></Page>

  return (
    <Page title="Hồ sơ năng lực" desc="Quản lý hồ sơ cá nhân, kỹ năng, portfolio và CV năng lực." action={<PrimaryBtn onClick={() => setCv({ tieuDe: 'CV mới', cvChinh: false, congKhai: true, hocVan: [], kinhNghiemLam: [], chungChi: [], duAn: [] })}><Plus size={16} /> Thêm CV</PrimaryBtn>}>
      <ErrorBox message={error || data.error} />
      <CvStudio data={data} onReload={data.reload} />
      <Panel>
        <PanelHead title="Thong tin ca nhan" />
        <form onSubmit={saveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Vi tri mong muon"><input className={inputCls} value={profile.viTriMongMuon ?? ''} onChange={e => setProfile({ ...profile, viTriMongMuon: e.target.value })} /></Field>
          <Field label="Địa chỉ"><input className={inputCls} value={profile.diaChi ?? ''} onChange={e => setProfile({ ...profile, diaChi: e.target.value })} /></Field>
          <Field label="Kinh nghiệm (năm)"><input className={inputCls} type="number" value={profile.kinhNghiem ?? 0} onChange={e => setProfile({ ...profile, kinhNghiem: Number(e.target.value) })} /></Field>
          <Field label="Luong mong muon (VND)"><input className={inputCls} type="number" value={profile.mucLuongMongMuon ?? 0} onChange={e => setProfile({ ...profile, mucLuongMongMuon: Number(e.target.value) })} /></Field>
          <Field label="Tom tat ban than" wide><textarea className={textareaCls} value={profile.tomTat ?? ''} onChange={e => setProfile({ ...profile, tomTat: e.target.value })} /></Field>
          <Field label="Portfolio" wide><PortfolioEditor value={profile.portfolio ?? []} onChange={(portfolio: any[]) => setProfile({ ...profile, portfolio })} /></Field>
          <div className="flex justify-end md:col-span-2"><PrimaryBtn type="submit"><Save size={16} /> Lưu hồ sơ</PrimaryBtn></div>
        </form>
      </Panel>
      <Panel>
        <PanelHead title="CV nang luc" />
        {data.hoSo?.length ? (
          <div className="space-y-2">
            {data.hoSo.map((item: any) => (
              <Row key={item.id}>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate font-black text-slate-950">{item.tieuDe}</strong>
                  <p className="mt-0.5 text-sm font-medium text-slate-500">{item.cvChinh ? 'CV chính' : 'CV phụ'} - {item.congKhai ? 'Công khai' : 'Riêng tư'} - Cập nhật {formatDate(item.ngayCapNhat)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <SecondaryBtn onClick={() => setCv(item)}><Edit3 size={14} /> Sửa</SecondaryBtn>
                  <SecondaryBtn onClick={() => removeCv(item.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"><Trash2 size={14} /> Xóa</SecondaryBtn>
                </div>
              </Row>
            ))}
          </div>
        ) : <Empty>Chưa có CV năng lực.</Empty>}
      </Panel>
      {cv && <CvModal cv={cv} setCv={setCv} onClose={() => setCv(null)} onSubmit={saveCv} />}
      <ConfirmDialogComponent />
    </Page>
  )
}

// ─── UngTuyenPage ─────────────────────────────────────────────────────────────

function AppDrawer({ item, onClose }: { item: any; onClose: () => void }) {
  const timeline = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'].includes(item.trangThai)
    ? ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']
    : ['da_nop', 'da_xem', 'dang_xet_duyet', item.trangThai]
  const activeIdx = timeline.indexOf(item.trangThai)
  return (
    <Drawer onClose={onClose}>
      <ModalHead title="Chi tiết ứng tuyển" onClose={onClose} />
      <DetailGrid rows={[
        ['Vi tri', item.tinTuyenDung?.tieuDe],
        ['Công ty', item.tinTuyenDung?.nhaTuyenDung?.tenCongTy],
        ['CV da dung', item.hoSoNangLuc?.tieuDe ?? '-'],
        ['Diem khop', `${item.diemKhopKyNang ?? 0}%`],
        ['Trạng thái', <Badge tone={toneUT(item.trangThai)}>{labelUT(item.trangThai)}</Badge>],
      ]} />
      {item.thuXinViec && <div className="mt-4 rounded-xl bg-slate-50 p-3"><strong className="text-sm font-black text-slate-700">Thư xin việc</strong><p className="mt-1 text-sm text-slate-600">{item.thuXinViec}</p></div>}
      <div className="mt-4 space-y-2">
        {timeline.map((step: string, i: number) => (
          <div key={step} className="flex items-center gap-3">
            <div className={clsx('h-3 w-3 rounded-full border-2 transition-colors', i <= activeIdx ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white')} />
            <span className={clsx('text-sm font-bold', i <= activeIdx ? 'text-sky-700' : 'text-slate-400')}>{labelUT(step)}</span>
          </div>
        ))}
      </div>
    </Drawer>
  )
}

export function UngTuyenPage() {
  const data = useUngVienData()
  const [tab, setTab] = useState<'applied' | 'jobs'>('applied')
  const [selected, setSelected] = useState<any>(null)
  const [error, setError] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const mainCv = data.hoSo?.find((x: any) => x.cvChinh)
  const appliedIds = new Set(data.ungTuyen?.map((x: any) => x.maTinTuyenDung))
  const jobs = data.tinList?.filter((x: any) => x.trangThai === 'dang_mo') ?? []

  const apply = async (job: any) => {
    if (!mainCv) { location.href = '/ung-vien/ho-so'; return }
    confirm(
      'Xác nhận ứng tuyển',
      `Gửi hồ sơ ứng tuyển vào vị trí "${job.tieuDe}"?`,
      async () => {
        try {
          await api('/hosoungtuyen', { method: 'POST', body: JSON.stringify({ maUngVien: data.ungVien.id, maTinTuyenDung: job.id, maHoSoNangLuc: mainCv.id, diemKhopKyNang: 72, thuXinViec: 'Tôi quan tâm tới vị trí này.' }) })
          await data.reload(); setError('')
        } catch (err) { setError(err instanceof Error ? err.message : 'Không ứng tuyển được') }
      },
      'info',
      'Ứng tuyển',
    )
  }
  const withdraw = async (id: string) => {
    confirm(
      'Rút hồ sơ ứng tuyển',
      'Bạn có chắc chắn muốn rút hồ sơ này?',
      async () => {
        await api(`/hosoungtuyen/${id}/rut`, { method: 'POST' })
        await data.reload()
      },
      'warning',
      'Rút hồ sơ',
    )
  }

  return (
    <Page title="Hồ sơ ứng tuyển" desc="Theo dõi pipeline ứng tuyển và nộp hồ sơ nhanh bằng CV chính.">
      <ErrorBox message={error || data.error} />
      <Tabs tabs={[{ key: 'applied', label: 'Đã ứng tuyển' }, { key: 'jobs', label: 'Việc phù hợp' }]} active={tab} onChange={k => setTab(k as any)} />
      {tab === 'applied' ? (
        <Panel>
          <PanelHead title="Pipeline ứng tuyển" />
          {data.ungTuyen?.length ? (
            <div className="space-y-2">
              {data.ungTuyen.map((item: any) => (
                <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0"><AppRow item={item} onClick={() => setSelected(item)} /></div>
                  <SecondaryBtn disabled={item.trangThai === 'da_rut'} onClick={() => withdraw(item.id)} className="shrink-0 text-rose-600 border-rose-200 hover:bg-rose-50">Rút hồ sơ</SecondaryBtn>
                </div>
              ))}
            </div>
          ) : <Empty>Chưa có hồ sơ ứng tuyển.</Empty>}
        </Panel>
      ) : (
        <Panel>
          <PanelHead title="Việc đang mở phù hợp" action={!mainCv && <a href="/ung-vien/ho-so" className="text-sm font-extrabold text-sky-700">Tạo CV chính</a>} />
          {jobs.length ? (
            <div className="space-y-2">
              {jobs.slice(0, 12).map((job: any) => (
                <Row key={job.id}>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate font-black text-slate-950">{job.tieuDe}</strong>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-500">{job.nhaTuyenDung?.tenCongTy} - {job.diaChi} - {money(job.luongMin)} - {money(job.luongMax)}</p>
                  </div>
                  <PrimaryBtn disabled={appliedIds.has(job.id)} onClick={() => apply(job)} className="shrink-0">{appliedIds.has(job.id) ? 'Đã nộp' : mainCv ? 'Ứng tuyển' : 'Cần CV chính'}</PrimaryBtn>
                </Row>
              ))}
            </div>
          ) : <Empty>Không có việc phù hợp.</Empty>}
        </Panel>
      )}
      {selected && <AppDrawer item={selected} onClose={() => setSelected(null)} />}
      <ConfirmDialogComponent />
    </Page>
  )
}

// ─── LichPhongVanPage ─────────────────────────────────────────────────────────

function ItvDetail({ item, onConfirm, onReschedule }: { item: any; onConfirm: () => void; onReschedule: () => void }) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    JSON.parse(localStorage.getItem(`itjob_interview_checklist_${item.id}`) ?? '{}'),
  )
  useEffect(() => { setChecklist(JSON.parse(localStorage.getItem(`itjob_interview_checklist_${item.id}`) ?? '{}')) }, [item.id])
  const toggle = (key: string) => {
    const next = { ...checklist, [key]: !checklist[key] }
    setChecklist(next)
    localStorage.setItem(`itjob_interview_checklist_${item.id}`, JSON.stringify(next))
  }
  const items: Record<string, string> = { portfolio: 'Portfolio đã chọn', cv: 'CV chính đã kiểm tra', questions: 'Câu hỏi cho nhà tuyển dụng', device: 'Thiết bị / link họp sẵn sàng' }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe}</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy}</p>
        </div>
        <Badge tone={toneLich(item.trangThai)}>{labelLich(item.trangThai)}</Badge>
      </div>
      <DetailGrid rows={[
        ['Bắt đầu', formatDate(item.thoiGianBatDau)],
        ['Kết thúc', formatDate(item.thoiGianKetThuc)],
        ['Hình thức', item.hinhThuc === 'online' ? 'Online' : 'Offline'],
        ['Địa chỉ / link', item.hinhThuc === 'online' ? item.linkHop : item.diaChi],
        ['Kết quả', labelKQ(item.ketQua)],
        ['Ghi chú', item.ghiChu || '-'],
      ]} />
      <div className="flex flex-wrap gap-2">
        {item.hinhThuc === 'online' && item.linkHop && <PrimaryBtn href={item.linkHop} className="bg-emerald-600 hover:bg-emerald-700"><ExternalLink size={15} /> Mở link họp</PrimaryBtn>}
        <SecondaryBtn disabled={item.trangThai === 'da_xac_nhan'} onClick={onConfirm}><CheckCircle size={14} /> Xác nhận</SecondaryBtn>
        <SecondaryBtn onClick={onReschedule}><Calendar size={14} /> Xin đổi lịch</SecondaryBtn>
      </div>
      <div>
        <strong className="block text-sm font-black text-slate-700 mb-2">Checklist chuẩn bị</strong>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(items).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 transition hover:border-sky-200 hover:bg-sky-50/50">
              <input type="checkbox" className="h-4 w-4 rounded accent-sky-600" checked={!!checklist[key]} onChange={() => toggle(key)} />
              <span className="text-sm font-bold text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LichPhongVanPage() {
  const data = useUngVienData()
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [reschedule, setReschedule] = useState<any>(null)
  const [reason, setReason] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const filtered = (data.lich ?? []).filter((x: any) =>
    (status === 'all' || x.trangThai === status) && (type === 'all' || x.hinhThuc === type),
  )
  const selected = filtered.find((x: any) => x.id === (selectedId || filtered[0]?.id)) ?? filtered[0]
  const upcoming = (data.lich ?? []).filter((x: any) => new Date(x.thoiGianBatDau) >= new Date()).length

  const xacNhanLich = (id: string) => {
    confirm(
      'Xác nhận lịch phỏng vấn',
      'Bạn xác nhận tham gia lịch phỏng vấn này?',
      async () => {
        await api(`/lichphongvan/${id}/xac-nhan`, { method: 'POST' })
        await data.reload()
      },
      'info',
      'Xác nhận',
    )
  }
  const submitReschedule = async (e: FormEvent) => {
    e.preventDefault()
    confirm(
      'Gửi yêu cầu đổi lịch',
      'Bạn có chắc chắn muốn gửi yêu cầu đổi lịch phỏng vấn?',
      async () => {
        await api(`/lichphongvan/${reschedule.id}/doi-lich`, { method: 'POST', body: JSON.stringify({ ghiChu: reason }) })
        await data.reload()
        setReschedule(null); setReason('')
      },
      'warning',
      'Gửi yêu cầu',
    )
  }

  return (
    <Page title="Lịch phỏng vấn" desc="Quản lý lịch hẹn, link meeting, trạng thái phản hồi và checklist chuẩn bị.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={Calendar} label="Sap toi" value={upcoming} />
        <Kpi icon={CheckCircle} label="Đã xác nhận" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'da_xac_nhan').length} />
        <Kpi icon={Bell} label="Cần phản hồi" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'da_len_lich').length} />
        <Kpi icon={FileText} label="Hoàn thành" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'hoan_thanh').length} />
      </div>
      <FilterBar>
        <select className={clsx(selectCls, 'sm:w-auto')} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="da_len_lich">Cần phản hồi</option>
          <option value="da_xac_nhan">Đã xác nhận</option>
          <option value="doi_lich">Xin đổi lịch</option>
          <option value="hoan_thanh">Hoàn thành</option>
        </select>
        <select className={clsx(selectCls, 'sm:w-auto')} value={type} onChange={e => setType(e.target.value)}>
          <option value="all">Tất cả hình thức</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </FilterBar>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,380px)_1fr]">
        <Panel className="xl:max-h-[calc(100vh-280px)] xl:overflow-y-auto">
          {filtered.length ? <div className="space-y-2">{filtered.map((x: any) => <ItvRow key={x.id} item={x} active={selected?.id === x.id} onClick={() => setSelectedId(x.id)} />)}</div> : <Empty>Không có lịch phù hợp bộ lọc.</Empty>}
        </Panel>
        <Panel>
          {selected ? <ItvDetail item={selected} onConfirm={() => xacNhanLich(selected.id)} onReschedule={() => { setReschedule(selected); setReason(selected.ghiChu ?? '') }} /> : <Empty>Chọn một lịch để xem chi tiết.</Empty>}
        </Panel>
      </div>
      {reschedule && (
        <Modal>
          <ModalCard>
            <form onSubmit={submitReschedule}>
              <ModalHead title="Xin đổi lịch" onClose={() => setReschedule(null)} />
              <Field label="Ly do / ghi chu" wide><textarea className={textareaCls} value={reason} onChange={e => setReason(e.target.value)} required /></Field>
              <div className="mt-4 flex justify-end gap-2">
                <SecondaryBtn type="button" onClick={() => setReschedule(null)}>Hủy</SecondaryBtn>
                <PrimaryBtn type="submit">Gửi yêu cầu</PrimaryBtn>
              </div>
            </form>
          </ModalCard>
        </Modal>
      )}
      <ConfirmDialogComponent />
    </Page>
  )
}

// ─── ThongBaoUngVienPage ──────────────────────────────────────────────────────

export function ThongBaoUngVienPage() {
  const data = useUngVienData()
  const [filter, setFilter] = useState('all')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const patch = async (id: string, payload: any) => {
    await api(`/thongbao/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    await data.reload()
  }
  const remove = async (id: string) => {
    confirm(
      'Xóa thông báo',
      'Bạn có chắc chắn muốn xóa thông báo này?',
      async () => {
        await api(`/thongbao/${id}`, { method: 'DELETE' })
        await data.reload()
      },
      'danger',
      'Xóa',
    )
  }
  const markAll = async () => {
    confirm(
      'Đánh dấu tất cả đã đọc',
      'Xác nhận đánh dấu toàn bộ thông báo là đã đọc?',
      async () => {
        await Promise.all((data.thongBao ?? []).filter((x: any) => !x.daDoc).map((x: any) => api(`/thongbao/${x.id ?? x._id}`, { method: 'PATCH', body: JSON.stringify({ daDoc: true }) })))
        await data.reload()
      },
      'info',
      'Đánh dấu',
    )
  }
  const items = (data.thongBao ?? []).filter((x: any) =>
    filter === 'all' || (filter === 'unread' && !x.daDoc) || (filter === 'read' && x.daDoc) || x.loai === filter,
  )

  return (
    <Page title="Thông báo" desc="Theo dõi cập nhật từ hệ thống, nhà tuyển dụng và lịch phỏng vấn." action={<SecondaryBtn onClick={markAll}>Đánh dấu tất cả đã đọc</SecondaryBtn>}>
      <FilterBar>
        <select className={clsx(selectCls, 'sm:w-auto')} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="unread">Chưa đọc</option>
          <option value="read">Đã đọc</option>
          <option value="lich_phong_van">Lịch phỏng vấn</option>
          <option value="ho_so_ung_tuyen">Ứng tuyển</option>
          <option value="tin_tuyen_dung">Tin tuyển dụng</option>
          <option value="he_thong">Hệ thống</option>
        </select>
      </FilterBar>
      <Panel>
        {items.length ? (
          <div className="divide-y divide-slate-100">
            {items.map((item: any) => {
              const id = item.id ?? item._id
              return (
                <div key={id} className={clsx('flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4', !item.daDoc && 'bg-sky-50/40 -mx-4 px-4 sm:-mx-5 sm:px-5')}>
                  <div className="mt-1.5 hidden h-2 w-2 shrink-0 rounded-full sm:block" style={{ background: item.daDoc ? 'transparent' : '#0ea5e9' }} />
                  <div className="min-w-0 flex-1">
                    <a href={item.lienKet || '#'} onClick={() => patch(id, { daDoc: true })} className="no-underline">
                      <strong className={clsx('block text-sm text-slate-950', !item.daDoc && 'font-black')}>{item.tieuDe}</strong>
                      <p className="mt-0.5 text-sm font-medium text-slate-500 line-clamp-2">{item.noiDung}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(item.ngayTao)}</p>
                    </a>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge tone={item.daDoc ? 'gray' : 'blue'}>{item.daDoc ? 'Đã đọc' : 'Mới'}</Badge>
                    {!item.daDoc && <SecondaryBtn onClick={() => patch(id, { daDoc: true })} className="text-xs px-2 min-h-[36px]">Đánh dấu đọc</SecondaryBtn>}
                    <button onClick={() => remove(id)} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : <Empty>Không có thông báo phù hợp.</Empty>}
      </Panel>
      <ConfirmDialogComponent />
    </Page>
  )
}

// ─── ViecDaLuuPage ────────────────────────────────────────────────────────────

export function ViecDaLuuPage() {
  const data = useUngVienData()
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]'))
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const mainCv = data.hoSo?.find((x: any) => x.cvChinh)
  const appliedIds = new Set(data.ungTuyen?.map((x: any) => x.maTinTuyenDung))

  const toggle = (id: string) => {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]
    setSaved(next); localStorage.setItem('itjob_saved_jobs', JSON.stringify(next))
  }
  const jobs = (data.tinList ?? []).filter((job: any) => saved.includes(job.id)).filter((job: any) => `${job.tieuDe} ${job.nhaTuyenDung?.tenCongTy} ${job.diaChi}`.toLowerCase().includes(query.toLowerCase()))

  const apply = async (job: any) => {
    if (!mainCv) { location.href = '/ung-vien/ho-so'; return }
    try {
      await api('/hosoungtuyen', { method: 'POST', body: JSON.stringify({ maUngVien: data.ungVien.id, maTinTuyenDung: job.id, maHoSoNangLuc: mainCv.id, diemKhopKyNang: 70, thuXinViec: 'Tôi muốn ứng tuyển nhanh từ danh sách việc đã lưu.' }) })
      await data.reload(); setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không ứng tuyển được') }
  }

  return (
    <Page title="Việc đã lưu" desc="Lưu lại các tin tuyển dụng cần theo dõi hoặc ứng tuyển sau.">
      <ErrorBox message={error} />
      <FilterBar><input className={inputCls} value={query} onChange={e => setQuery(e.target.value)} placeholder="Lọc theo công ty, địa điểm, lương..." /></FilterBar>
      <Panel>
        {jobs.length ? (
          <div className="space-y-2">
            {jobs.map((job: any) => (
              <Row key={job.id}>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate font-black text-slate-950">{job.tieuDe}</strong>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-500">{job.nhaTuyenDung?.tenCongTy} - {job.diaChi} - {money(job.luongMin)} - {money(job.luongMax)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <SecondaryBtn onClick={() => toggle(job.id)}><Star size={14} /> Bỏ lưu</SecondaryBtn>
                  <PrimaryBtn disabled={appliedIds.has(job.id)} onClick={() => apply(job)}>{appliedIds.has(job.id) ? 'Đã nộp' : 'Ứng tuyển nhanh'}</PrimaryBtn>
                </div>
              </Row>
            ))}
          </div>
        ) : <Empty>Chưa có việc đã lưu hoặc không khớp bộ lọc.</Empty>}
      </Panel>
    </Page>
  )
}

// ─── CaiDatUngVienPage ────────────────────────────────────────────────────────

export function CaiDatUngVienPage() {
  const data = useUngVienData()
  const [form, setForm] = useState<any>({})
  const [prefs, setPrefs] = useState<any>(() => JSON.parse(localStorage.getItem('itjob_candidate_notification_prefs') ?? '{"email":true,"interview":true,"job":true}'))
  useEffect(() => {
    if (data.current) setForm({ hoTen: data.current.hoTen, soDienThoai: data.current.soDienThoai ?? '', matKhau: '' })
  }, [data.current?.id])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const payload: any = { hoTen: form.hoTen, soDienThoai: form.soDienThoai }
    if (form.matKhau) payload.matKhau = form.matKhau
    await api(`/nguoidung/${data.current.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    localStorage.setItem('itjob_nguoidung', JSON.stringify({ ...data.current, ...payload, matKhau: undefined }))
    localStorage.setItem('itjob_candidate_notification_prefs', JSON.stringify(prefs))
    await data.reload()
  }

  return (
    <Page title="Cài đặt tài khoản" desc="Cập nhật thông tin đăng nhập, liên hệ và tùy chọn thông báo.">
      <Panel>
        <form onSubmit={save} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Họ tên"><input className={inputCls} value={form.hoTen ?? ''} onChange={e => setForm({ ...form, hoTen: e.target.value })} /></Field>
          <Field label="Số điện thoại"><input className={inputCls} value={form.soDienThoai ?? ''} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} /></Field>
          <Field label="Mật khẩu mới"><input className={inputCls} type="password" value={form.matKhau ?? ''} onChange={e => setForm({ ...form, matKhau: e.target.value })} placeholder="Để trống nếu không đổi" /></Field>
          <Field label="Tùy chọn thông báo" wide>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[{ key: 'email', label: 'Email' }, { key: 'interview', label: 'Phỏng vấn' }, { key: 'job', label: 'Tin tuyển dụng' }].map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 transition hover:border-sky-200 hover:bg-sky-50/50">
                  <input type="checkbox" className="h-4 w-4 rounded accent-sky-600" checked={prefs[key]} onChange={e => setPrefs({ ...prefs, [key]: e.target.checked })} />
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="flex justify-end md:col-span-2"><PrimaryBtn type="submit"><Save size={16} /> Lưu cài đặt</PrimaryBtn></div>
        </form>
      </Panel>
    </Page>
  )
}
