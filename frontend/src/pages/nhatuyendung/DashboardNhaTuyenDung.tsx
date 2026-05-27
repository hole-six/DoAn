import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Bell, Briefcase, Calendar, CheckCircle, Edit3, Eye, Plus, Save, Trash2, Users, XCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type Tone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

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
      const company = companies.find((item: any) => item.maNguoiDung === user?.id)
      const myJobs = jobs.filter((item: any) => item.maNhaTuyenDung === company?.id)
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
  return <div className="ntd-page"><div className="ntd-header"><div><h1>{title}</h1><p>{desc}</p></div>{action}</div>{children}</div>
}

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`ntd-badge ${tone}`}>{children}</span>
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
      <img src={data.company?.logo || 'https://placehold.co/120x120/0b1c30/ffffff?text=IT'} alt="" />
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

  return <Page title="Quản lý tin tuyển dụng" desc="Tạo, chỉnh sửa, mở/tạm đóng và theo dõi hiệu quả từng tin." action={<button className="primary-button" onClick={() => setEditing(newJob(data.company?.id))}><Plus size={16} /> Tạo tin</button>}>
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
  const [form, setForm] = useState<any>({ ...job, hanNop: job.hanNop ? String(job.hanNop).slice(0, 10) : '' })
  return <div className="ntd-modal"><div className="ntd-modal-card"><div className="ntd-modal-head"><h2>{job.id ? 'Sửa tin tuyển dụng' : 'Tạo tin tuyển dụng'}</h2><button onClick={onClose}><XCircle size={18} /></button></div><JobForm job={form} setJob={setForm} skills={skills} onSubmit={async (payload: any) => { try { await api(`/tintuyendung${job.id ? `/${job.id}` : ''}`, { method: job.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); await onSaved() } catch (err) { onError(err instanceof Error ? err.message : 'Không lưu được tin') } }} /></div></div>
}

function JobForm({ job, setJob, skills, onSubmit }: any) {
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit({ ...job, hanNop: job.hanNop ? new Date(job.hanNop) : undefined }) }
  const toggleSkill = (id: string) => {
    const exists = job.kyNang?.some((x: any) => (x.maKyNang ?? x) === id)
    setJob({ ...job, kyNang: exists ? job.kyNang.filter((x: any) => (x.maKyNang ?? x) !== id) : [...(job.kyNang ?? []), { maKyNang: id, batBuoc: true }] })
  }
  return <form className="ntd-form" onSubmit={submit}><Field label="Tiêu đề" wide><input required value={job.tieuDe ?? ''} onChange={e => setJob({ ...job, tieuDe: e.target.value })} /></Field><Field label="Địa chỉ"><input value={job.diaChi ?? ''} onChange={e => setJob({ ...job, diaChi: e.target.value })} /></Field><Field label="Hạn nộp"><input type="date" value={job.hanNop ?? ''} onChange={e => setJob({ ...job, hanNop: e.target.value })} /></Field><Field label="Lương min"><input type="number" value={job.luongMin ?? 0} onChange={e => setJob({ ...job, luongMin: Number(e.target.value) })} /></Field><Field label="Lương max"><input type="number" value={job.luongMax ?? 0} onChange={e => setJob({ ...job, luongMax: Number(e.target.value) })} /></Field><Field label="Loại hình"><select value={job.loaiHinh} onChange={e => setJob({ ...job, loaiHinh: e.target.value })}><option value="toan_thoi_gian">Toàn thời gian</option><option value="ban_thoi_gian">Bán thời gian</option><option value="thuc_tap">Thực tập</option><option value="tu_xa">Từ xa</option><option value="hybrid">Hybrid</option></select></Field><Field label="Cấp bậc"><select value={job.capBac} onChange={e => setJob({ ...job, capBac: e.target.value })}><option value="intern">Intern</option><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="middle">Middle</option><option value="senior">Senior</option><option value="lead">Lead</option></select></Field><Field label="Số lượng"><input type="number" value={job.soLuong ?? 1} onChange={e => setJob({ ...job, soLuong: Number(e.target.value) })} /></Field><Field label="Trạng thái"><select value={job.trangThai} onChange={e => setJob({ ...job, trangThai: e.target.value })}><option value="nhap">Nháp</option><option value="cho_duyet">Chờ duyệt</option><option value="dang_mo">Đang mở</option><option value="tam_dong">Tạm đóng</option><option value="het_han">Hết hạn</option></select></Field><Field label="Mô tả" wide><textarea required value={job.moTa ?? ''} onChange={e => setJob({ ...job, moTa: e.target.value })} /></Field><Field label="Yêu cầu" wide><textarea required value={job.yeuCau ?? ''} onChange={e => setJob({ ...job, yeuCau: e.target.value })} /></Field><Field label="Quyền lợi" wide><textarea value={job.quyenLoi ?? ''} onChange={e => setJob({ ...job, quyenLoi: e.target.value })} /></Field><Field label="Kỹ năng" wide><div className="ntd-skill-grid">{skills.map((skill: any) => <label key={skill.id}><input type="checkbox" checked={job.kyNang?.some((x: any) => (x.maKyNang ?? x) === skill.id)} onChange={() => toggleSkill(skill.id)} /> {skill.tenKyNang}</label>)}</div></Field><div className="ntd-form-actions"><button className="primary-button"><Save size={16} /> Lưu tin</button></div></form>
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
  useEffect(() => { if (data.company) setForm({ ...data.company }) }, [data.company?.id])
  const save = async (e: FormEvent) => { e.preventDefault(); await api(`/nhatuyendung/${form.id}`, { method: 'PATCH', body: JSON.stringify(form) }); await data.reload() }
  if (data.loading || !form) return <Page title="Thông tin công ty" desc="Đang tải..."><div className="ntd-panel">Đang tải...</div></Page>
  return <Page title="Thông tin công ty" desc="Cập nhật hồ sơ công ty, logo, mô tả, quy mô và website."><form className="ntd-panel ntd-form" onSubmit={save}><Field label="Tên công ty"><input value={form.tenCongTy ?? ''} onChange={e => setForm({ ...form, tenCongTy: e.target.value })} /></Field><Field label="Mã số thuế"><input value={form.maSoThue ?? ''} onChange={e => setForm({ ...form, maSoThue: e.target.value })} /></Field><Field label="Địa chỉ"><input value={form.diaChi ?? ''} onChange={e => setForm({ ...form, diaChi: e.target.value })} /></Field><Field label="Website"><input value={form.website ?? ''} onChange={e => setForm({ ...form, website: e.target.value })} /></Field><Field label="Logo URL"><input value={form.logo ?? ''} onChange={e => setForm({ ...form, logo: e.target.value })} /></Field><Field label="Quy mô"><input type="number" value={form.quyMo ?? 0} onChange={e => setForm({ ...form, quyMo: Number(e.target.value) })} /></Field><Field label="Ngành"><input value={form.nganh ?? ''} onChange={e => setForm({ ...form, nganh: e.target.value })} /></Field><Field label="Mô tả" wide><textarea value={form.moTa ?? ''} onChange={e => setForm({ ...form, moTa: e.target.value })} /></Field><div className="ntd-form-actions"><button className="primary-button"><Save size={16} /> Lưu công ty</button></div></form></Page>
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
  return <label className="ntd-field" style={{ gridColumn: wide ? '1 / -1' : undefined }}><span>{label}</span>{children}</label>
}
