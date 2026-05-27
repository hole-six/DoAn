import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Edit3,
  ExternalLink,
  FileText,
  Plus,
  Save,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react'
import CvStudio from './CvStudio'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type BadgeTone = 'blue' | 'green' | 'yellow' | 'red' | 'gray'

function user() {
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

function labelTrangThaiUngTuyen(value?: string) {
  return ({
    da_nop: 'Đã nộp',
    da_xem: 'Đã xem',
    dang_xet_duyet: 'Đang xét duyệt',
    moi_phong_van: 'Mời phỏng vấn',
    dat: 'Đạt',
    tu_choi: 'Từ chối',
    da_rut: 'Đã rút',
  } as Record<string, string>)[value ?? ''] ?? value ?? '-'
}

function toneTrangThaiUngTuyen(value?: string): BadgeTone {
  if (value === 'dat') return 'green'
  if (value === 'tu_choi' || value === 'da_rut') return 'red'
  if (value === 'moi_phong_van') return 'yellow'
  return 'blue'
}

function labelTrangThaiLich(value?: string) {
  return ({
    da_len_lich: 'Cần phản hồi',
    da_xac_nhan: 'Đã xác nhận',
    doi_lich: 'Xin đổi lịch',
    hoan_thanh: 'Hoàn thành',
    da_huy: 'Đã hủy',
  } as Record<string, string>)[value ?? ''] ?? value ?? '-'
}

function toneTrangThaiLich(value?: string): BadgeTone {
  if (value === 'da_xac_nhan' || value === 'hoan_thanh') return 'green'
  if (value === 'doi_lich') return 'yellow'
  if (value === 'da_huy') return 'red'
  return 'blue'
}

function labelKetQua(value?: string) {
  return ({ cho_ket_qua: 'Chờ kết quả', dat: 'Đạt', khong_dat: 'Không đạt' } as Record<string, string>)[value ?? ''] ?? '-'
}

function useUngVienData() {
  const [state, setState] = useState<any>({ loading: true, error: '' })
  const current = user()

  const load = async () => {
    try {
      setState((prev: any) => ({ ...prev, loading: true, error: '' }))
      const [ungVienList, hoSoList, ungTuyenList, lichList, thongBaoList, tinList, kyNangList] = await Promise.all([
        api('/ungvien'),
        api('/hosonangluc'),
        api('/hosoungtuyen'),
        api('/lichphongvan'),
        api('/thongbao'),
        api('/tintuyendung'),
        api('/danhmuckynang'),
      ])
      const ungVien = ungVienList.find((item: any) => item.maNguoiDung === current?.id)
      const hoSo = hoSoList.filter((item: any) => item.maUngVien === ungVien?.id)
      const ungTuyen = ungTuyenList.filter((item: any) => item.maUngVien === ungVien?.id)
      const ungTuyenIds = new Set(ungTuyen.map((item: any) => item.id))
      const lich = lichList.filter((item: any) => ungTuyenIds.has(item.maHoSoUngTuyen))
      const thongBao = thongBaoList.filter((item: any) => String(item.maNguoiDung?._id ?? item.maNguoiDung) === current?.id)
      setState({ loading: false, error: '', current, ungVien, hoSo, ungTuyen, lich, thongBao, tinList, kyNangList })
    } catch (err) {
      setState((prev: any) => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Không tải được dữ liệu' }))
    }
  }

  useEffect(() => { load() }, [])
  return { ...state, reload: load }
}

function Page({ title, desc, action, children }: { title: string; desc: string; action?: ReactNode; children: ReactNode }) {
  return <div className="uv-page"><div className="uv-header"><div><h1>{title}</h1><p>{desc}</p></div>{action}</div>{children}</div>
}

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`uv-badge ${tone}`}>{children}</span>
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="uv-empty">{children}</div>
}

function ErrorBox({ message }: { message?: string }) {
  return message ? <div className="uv-error">{message}</div> : null
}

function PanelHead({ title, to, action }: { title: string; to?: string; action?: ReactNode }) {
  return <div className="uv-panel-head"><h2>{title}</h2>{action ?? (to && <a href={to}>Xem tất cả</a>)}</div>
}

function Kpi({ icon: Icon, label, value }: any) {
  return <div className="uv-kpi"><Icon size={20} /><p>{label}</p><strong>{value}</strong></div>
}

export default function DashboardUngVienMoi() {
  const data = useUngVienData()
  if (data.loading) return <Page title="Tổng quan ứng viên" desc="Đang tải dữ liệu..."><div className="uv-panel">Đang tải...</div></Page>

  const hoSoChinh = data.hoSo?.find((item: any) => item.cvChinh)
  const unread = data.thongBao?.filter((item: any) => !item.daDoc).length ?? 0
  const upcoming = (data.lich ?? []).filter((item: any) => new Date(item.thoiGianBatDau) >= new Date()).length
  const complete = Math.min(100, 35 + (data.ungVien?.portfolio?.length ? 20 : 0) + (data.hoSo?.length ? 25 : 0) + (data.ungVien?.kyNang?.length ? 20 : 0))
  const tasks = [
    !hoSoChinh && { title: 'Đặt CV chính', desc: 'Cần có CV chính trước khi ứng tuyển nhanh.', href: '/ung-vien/ho-so' },
    unread > 0 && { title: `${unread} thông báo chưa đọc`, desc: 'Kiểm tra cập nhật từ hệ thống và nhà tuyển dụng.', href: '/ung-vien/thong-bao' },
    ...(data.lich ?? []).filter((item: any) => item.trangThai === 'da_len_lich').map((item: any) => ({
      title: 'Xác nhận lịch phỏng vấn',
      desc: `${item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Lịch phỏng vấn'} - ${formatDate(item.thoiGianBatDau)}`,
      href: '/ung-vien/lich-phong-van',
    })),
  ].filter(Boolean)

  return <Page title={`Xin chào, ${data.current?.hoTen ?? 'Ứng viên'}`} desc="Không gian quản lý hồ sơ, ứng tuyển và lịch phỏng vấn của bạn." action={<a className="primary-button" href="/viec-lam">Tìm việc mới</a>}>
    <ErrorBox message={data.error} />
    <div className="uv-hero">
      <div>
        <p>Hồ sơ chính</p>
        <h2>{hoSoChinh?.tieuDe ?? data.ungVien?.viTriMongMuon ?? 'Chưa có CV chính'}</h2>
        <span>{data.ungVien?.tomTat ?? 'Cập nhật hồ sơ để nhà tuyển dụng hiểu rõ năng lực của bạn.'}</span>
      </div>
      <div className="uv-progress"><strong>{complete}%</strong><span>Độ hoàn thiện hồ sơ</span><div><i style={{ width: `${complete}%` }} /></div></div>
    </div>
    <div className="uv-kpi-grid">
      <Kpi icon={Briefcase} label="Đã ứng tuyển" value={data.ungTuyen?.length ?? 0} />
      <Kpi icon={Calendar} label="Lịch sắp tới" value={upcoming} />
      <Kpi icon={FileText} label="CV năng lực" value={data.hoSo?.length ?? 0} />
      <Kpi icon={Bell} label="Thông báo mới" value={unread} />
    </div>
    <div className="uv-grid">
      <section className="uv-panel">
        <PanelHead title="Việc cần xử lý" />
        {tasks.length ? tasks.slice(0, 4).map((task: any, index) => <a className="uv-row uv-task" key={index} href={task.href}><div><strong>{task.title}</strong><p>{task.desc}</p></div><ExternalLink size={15} /></a>) : <Empty>Không có việc cần xử lý. Hồ sơ của bạn đang ổn định.</Empty>}
      </section>
      <section className="uv-panel">
        <PanelHead title="Ứng tuyển gần đây" to="/ung-vien/ung-tuyen" />
        {data.ungTuyen?.length ? data.ungTuyen.slice(0, 4).map((item: any) => <ApplicationRow key={item.id} item={item} />) : <Empty>Chưa có hồ sơ ứng tuyển.</Empty>}
      </section>
      <section className="uv-panel">
        <PanelHead title="Lịch sắp tới" to="/ung-vien/lich-phong-van" />
        {data.lich?.length ? data.lich.slice(0, 4).map((item: any) => <InterviewRow key={item.id} item={item} />) : <Empty>Chưa có lịch phỏng vấn.</Empty>}
      </section>
    </div>
  </Page>
}

function ApplicationRow({ item, onClick }: { item: any; onClick?: () => void }) {
  return <div className={`uv-row ${onClick ? 'uv-clickable' : ''}`} onClick={onClick}>
    <div><strong>{item.tinTuyenDung?.tieuDe ?? '-'}</strong><p>{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'} - Nộp {formatDate(item.ngayNop)}</p></div>
    <Badge tone={toneTrangThaiUngTuyen(item.trangThai)}>{labelTrangThaiUngTuyen(item.trangThai)}</Badge>
  </div>
}

function InterviewRow({ item, onClick, active }: { item: any; onClick?: () => void; active?: boolean }) {
  return <div className={`uv-row uv-clickable ${active ? 'active' : ''}`} onClick={onClick}>
    <div><strong>{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? '-'}</strong><p>{item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'} - {formatDate(item.thoiGianBatDau)}</p></div>
    <Badge tone={toneTrangThaiLich(item.trangThai)}>{labelTrangThaiLich(item.trangThai)}</Badge>
  </div>
}

export function HoSoUngVienPage() {
  const data = useUngVienData()
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [cv, setCv] = useState<any>(null)
  useEffect(() => { if (data.ungVien) setProfile({ ...data.ungVien }) }, [data.ungVien?.id])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await api(`/ungvien/${profile.id}`, { method: 'PATCH', body: JSON.stringify({ ...profile, maNguoiDung: profile.maNguoiDung }) })
      await data.reload()
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không lưu được hồ sơ') }
  }
  const saveCv = async (e: FormEvent) => {
    e.preventDefault()
    const payload = { ...cv, maUngVien: data.ungVien.id }
    await api(`/hosonangluc${cv.id ? `/${cv.id}` : ''}`, { method: cv.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
    setCv(null); await data.reload()
  }
  const removeCv = async (id: string) => { if (confirm('Xóa CV này?')) { await api(`/hosonangluc/${id}`, { method: 'DELETE' }); await data.reload() } }

  if (data.loading || !profile) return <Page title="Hồ sơ năng lực" desc="Đang tải..."><div className="uv-panel">Đang tải...</div></Page>
  return <Page title="Hồ sơ năng lực" desc="Quản lý hồ sơ cá nhân, kỹ năng, portfolio và CV năng lực." action={<button className="primary-button" onClick={() => setCv({ tieuDe: 'CV mới', cvChinh: false, congKhai: true, hocVan: [], kinhNghiemLam: [], chungChi: [], duAn: [] })}><Plus size={16} /> Thêm CV</button>}>
    <ErrorBox message={error || data.error} />
    <CvStudio data={data} onReload={data.reload} />
    <form className="uv-panel uv-form" onSubmit={saveProfile}>
      <PanelHead title="Thông tin cá nhân" />
      <Field label="Vị trí mong muốn"><input value={profile.viTriMongMuon ?? ''} onChange={e => setProfile({ ...profile, viTriMongMuon: e.target.value })} /></Field>
      <Field label="Địa chỉ"><input value={profile.diaChi ?? ''} onChange={e => setProfile({ ...profile, diaChi: e.target.value })} /></Field>
      <Field label="Kinh nghiệm (năm)"><input type="number" value={profile.kinhNghiem ?? 0} onChange={e => setProfile({ ...profile, kinhNghiem: Number(e.target.value) })} /></Field>
      <Field label="Lương mong muốn"><input type="number" value={profile.mucLuongMongMuon ?? 0} onChange={e => setProfile({ ...profile, mucLuongMongMuon: Number(e.target.value) })} /></Field>
      <Field label="Tóm tắt" wide><textarea value={profile.tomTat ?? ''} onChange={e => setProfile({ ...profile, tomTat: e.target.value })} /></Field>
      <Field label="Portfolio" wide><PortfolioEditor value={profile.portfolio ?? []} onChange={(portfolio: any[]) => setProfile({ ...profile, portfolio })} /></Field>
      <div className="uv-form-actions"><button className="primary-button"><Save size={16} /> Lưu hồ sơ</button></div>
    </form>
    <section className="uv-panel uv-section-gap">
      <PanelHead title="CV năng lực" />
      {data.hoSo?.length ? data.hoSo.map((item: any) => <div key={item.id} className="uv-row"><div><strong>{item.tieuDe}</strong><p>{item.cvChinh ? 'CV chính' : 'CV phụ'} - {item.congKhai ? 'Công khai' : 'Riêng tư'} - Cập nhật {formatDate(item.ngayCapNhat)}</p></div><div className="uv-actions"><button onClick={() => setCv(item)}><Edit3 size={14} /> Sửa</button><button onClick={() => removeCv(item.id)}><Trash2 size={14} /> Xóa</button></div></div>) : <Empty>Chưa có CV năng lực.</Empty>}
    </section>
    {cv && <CvModal cv={cv} setCv={setCv} onClose={() => setCv(null)} onSubmit={saveCv} />}
  </Page>
}

function PortfolioEditor({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const add = () => onChange([...value, { tenDuAn: '', lienKet: '', moTa: '', congNghe: [] }])
  return <div className="uv-nested">{value.map((p, i) => <div key={i} className="uv-portfolio-row"><input placeholder="Tên dự án" value={p.tenDuAn} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, tenDuAn: e.target.value } : x))} /><input placeholder="Link" value={p.lienKet} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, lienKet: e.target.value } : x))} /><input placeholder="Công nghệ, phân tách bằng dấu phẩy" value={(p.congNghe ?? []).join(', ')} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, congNghe: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } : x))} /><textarea placeholder="Mô tả" value={p.moTa} onChange={e => onChange(value.map((x, idx) => idx === i ? { ...x, moTa: e.target.value } : x))} /><button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button></div>)}<button type="button" className="uv-secondary" onClick={add}><Plus size={14} /> Thêm portfolio</button></div>
}

function CvModal({ cv, setCv, onClose, onSubmit }: any) {
  return <div className="uv-modal"><form className="uv-modal-card uv-form" onSubmit={onSubmit}><div className="uv-modal-head"><h2>{cv.id ? 'Sửa CV' : 'Thêm CV'}</h2><button type="button" onClick={onClose}><XCircle size={18} /></button></div><Field label="Tiêu đề CV" wide><input value={cv.tieuDe} onChange={e => setCv({ ...cv, tieuDe: e.target.value })} /></Field><label className="uv-check"><input type="checkbox" checked={cv.cvChinh} onChange={e => setCv({ ...cv, cvChinh: e.target.checked })} /> Đặt làm CV chính</label><label className="uv-check"><input type="checkbox" checked={cv.congKhai} onChange={e => setCv({ ...cv, congKhai: e.target.checked })} /> Công khai với nhà tuyển dụng</label>{(['hocVan', 'kinhNghiemLam', 'chungChi', 'duAn'] as const).map(key => <SectionEditor key={key} label={sectionLabel[key]} value={cv[key] ?? []} onChange={(v: any[]) => setCv({ ...cv, [key]: v })} />)}<div className="uv-form-actions"><button type="button" className="uv-secondary" onClick={onClose}>Hủy</button><button className="primary-button">Lưu CV</button></div></form></div>
}

const sectionLabel: Record<string, string> = { hocVan: 'Học vấn', kinhNghiemLam: 'Kinh nghiệm', chungChi: 'Chứng chỉ', duAn: 'Dự án' }
function SectionEditor({ label, value, onChange }: any) {
  return <Field label={label} wide><div className="uv-nested">{value.map((item: any, i: number) => <div key={i} className="uv-nested-row"><input placeholder="Tiêu đề" value={item.tieuDe ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, tieuDe: e.target.value } : x))} /><input placeholder="Đơn vị" value={item.donVi ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, donVi: e.target.value } : x))} /><input placeholder="Thời gian" value={item.thoiGian ?? ''} onChange={e => onChange(value.map((x: any, idx: number) => idx === i ? { ...x, thoiGian: e.target.value } : x))} /><button type="button" onClick={() => onChange(value.filter((_: any, idx: number) => idx !== i))}><Trash2 size={14} /></button></div>)}<button type="button" className="uv-secondary" onClick={() => onChange([...value, { tieuDe: '', donVi: '', thoiGian: '', moTa: '' }])}><Plus size={14} /> Thêm mục</button></div></Field>
}

export function UngTuyenPage() {
  const data = useUngVienData()
  const [tab, setTab] = useState<'applied' | 'jobs'>('applied')
  const [selected, setSelected] = useState<any>(null)
  const [error, setError] = useState('')
  const mainCv = data.hoSo?.find((x: any) => x.cvChinh)
  const appliedIds = new Set(data.ungTuyen?.map((x: any) => x.maTinTuyenDung))
  const jobs = data.tinList?.filter((x: any) => x.trangThai === 'dang_mo') ?? []
  const apply = async (job: any) => {
    if (!mainCv) { location.href = '/ung-vien/ho-so'; return }
    try {
      await api('/hosoungtuyen', { method: 'POST', body: JSON.stringify({ maUngVien: data.ungVien.id, maTinTuyenDung: job.id, maHoSoNangLuc: mainCv.id, diemKhopKyNang: 72, thuXinViec: 'Tôi quan tâm tới vị trí này và mong muốn được trao đổi thêm.' }) })
      await data.reload()
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không ứng tuyển được') }
  }
  const withdraw = async (id: string) => { await api(`/hosoungtuyen/${id}`, { method: 'PATCH', body: JSON.stringify({ trangThai: 'da_rut' }) }); await data.reload() }

  return <Page title="Hồ sơ ứng tuyển" desc="Theo dõi pipeline ứng tuyển và nộp hồ sơ nhanh bằng CV chính.">
    <ErrorBox message={error || data.error} />
    <div className="uv-tabs"><button className={tab === 'applied' ? 'active' : ''} onClick={() => setTab('applied')}>Đã ứng tuyển</button><button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>Việc phù hợp</button></div>
    {tab === 'applied' ? <section className="uv-panel">
      <PanelHead title="Pipeline ứng tuyển" />
      {data.ungTuyen?.length ? data.ungTuyen.map((item: any) => <div className="uv-row" key={item.id}><ApplicationRow item={item} onClick={() => setSelected(item)} /><button className="uv-secondary" disabled={item.trangThai === 'da_rut'} onClick={() => withdraw(item.id)}>Rút hồ sơ</button></div>) : <Empty>Chưa có hồ sơ ứng tuyển.</Empty>}
    </section> : <section className="uv-panel">
      <PanelHead title="Việc đang mở phù hợp" action={!mainCv && <a href="/ung-vien/ho-so">Tạo CV chính</a>} />
      {jobs.slice(0, 12).map((job: any) => <div className="uv-row" key={job.id}><div><strong>{job.tieuDe}</strong><p>{job.nhaTuyenDung?.tenCongTy} - {job.diaChi} - {money(job.luongMin)} - {money(job.luongMax)}</p></div><button className="primary-button" disabled={appliedIds.has(job.id)} onClick={() => apply(job)}>{appliedIds.has(job.id) ? 'Đã nộp' : mainCv ? 'Ứng tuyển' : 'Cần CV chính'}</button></div>)}
    </section>}
    {selected && <ApplicationDrawer item={selected} onClose={() => setSelected(null)} />}
  </Page>
}

function ApplicationDrawer({ item, onClose }: any) {
  const timeline = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'].includes(item.trangThai)
    ? ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']
    : ['da_nop', 'da_xem', 'dang_xet_duyet', item.trangThai]
  return <aside className="uv-drawer"><div className="uv-drawer-card"><div className="uv-modal-head"><h2>Chi tiết ứng tuyển</h2><button onClick={onClose}><XCircle size={18} /></button></div><div className="uv-detail-grid"><span>Vị trí</span><strong>{item.tinTuyenDung?.tieuDe}</strong><span>Công ty</span><strong>{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy}</strong><span>CV đã dùng</span><strong>{item.hoSoNangLuc?.tieuDe ?? '-'}</strong><span>Điểm khớp</span><strong>{item.diemKhopKyNang ?? 0}%</strong><span>Trạng thái</span><Badge tone={toneTrangThaiUngTuyen(item.trangThai)}>{labelTrangThaiUngTuyen(item.trangThai)}</Badge></div><div className="uv-note"><strong>Thư xin việc</strong><p>{item.thuXinViec || 'Chưa có thư xin việc.'}</p></div><div className="uv-timeline">{timeline.map((step: string) => <div key={step} className={step === item.trangThai ? 'active' : ''}><i /><span>{labelTrangThaiUngTuyen(step)}</span></div>)}</div></div></aside>
}

export function LichPhongVanPage() {
  const data = useUngVienData()
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [reschedule, setReschedule] = useState<any>(null)
  const [reason, setReason] = useState('')
  const filtered = (data.lich ?? []).filter((item: any) => (status === 'all' || item.trangThai === status) && (type === 'all' || item.hinhThuc === type))
  const selected = filtered.find((item: any) => item.id === (selectedId || filtered[0]?.id)) ?? filtered[0]
  const upcoming = (data.lich ?? []).filter((item: any) => new Date(item.thoiGianBatDau) >= new Date()).length
  const patch = async (id: string, payload: any) => { await api(`/lichphongvan/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await data.reload() }
  const submitReschedule = async (e: FormEvent) => { e.preventDefault(); await patch(reschedule.id, { trangThai: 'doi_lich', ghiChu: reason }); setReschedule(null); setReason('') }

  return <Page title="Lịch phỏng vấn" desc="Quản lý lịch hẹn, link meeting, trạng thái phản hồi và checklist chuẩn bị.">
    <div className="uv-kpi-grid">
      <Kpi icon={Calendar} label="Sắp tới" value={upcoming} />
      <Kpi icon={CheckCircle} label="Đã xác nhận" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'da_xac_nhan').length} />
      <Kpi icon={Bell} label="Cần phản hồi" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'da_len_lich').length} />
      <Kpi icon={FileText} label="Hoàn thành" value={(data.lich ?? []).filter((x: any) => x.trangThai === 'hoan_thanh').length} />
    </div>
    <div className="uv-filterbar"><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="da_len_lich">Cần phản hồi</option><option value="da_xac_nhan">Đã xác nhận</option><option value="doi_lich">Xin đổi lịch</option><option value="hoan_thanh">Hoàn thành</option></select><select value={type} onChange={e => setType(e.target.value)}><option value="all">Tất cả hình thức</option><option value="online">Online</option><option value="offline">Offline</option></select></div>
    <div className="uv-interview-layout">
      <section className="uv-panel uv-interview-list">{filtered.length ? filtered.map((item: any) => <InterviewRow key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelectedId(item.id)} />) : <Empty>Không có lịch phù hợp bộ lọc.</Empty>}</section>
      <section className="uv-panel uv-interview-detail">{selected ? <InterviewDetail item={selected} onConfirm={() => patch(selected.id, { trangThai: 'da_xac_nhan' })} onReschedule={() => { setReschedule(selected); setReason(selected.ghiChu ?? '') }} /> : <Empty>Chọn một lịch để xem chi tiết.</Empty>}</section>
    </div>
    {reschedule && <div className="uv-modal"><form className="uv-modal-card uv-form" onSubmit={submitReschedule}><div className="uv-modal-head"><h2>Xin đổi lịch</h2><button type="button" onClick={() => setReschedule(null)}><XCircle size={18} /></button></div><Field label="Lý do / ghi chú" wide><textarea value={reason} onChange={e => setReason(e.target.value)} required /></Field><div className="uv-form-actions"><button type="button" className="uv-secondary" onClick={() => setReschedule(null)}>Hủy</button><button className="primary-button">Gửi yêu cầu</button></div></form></div>}
  </Page>
}

function InterviewDetail({ item, onConfirm, onReschedule }: any) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem(`itjob_interview_checklist_${item.id}`) ?? '{}'))
  useEffect(() => { setChecklist(JSON.parse(localStorage.getItem(`itjob_interview_checklist_${item.id}`) ?? '{}')) }, [item.id])
  const toggle = (key: string) => {
    const next = { ...checklist, [key]: !checklist[key] }
    setChecklist(next)
    localStorage.setItem(`itjob_interview_checklist_${item.id}`, JSON.stringify(next))
  }
  const checklistItems = { portfolio: 'Portfolio đã chọn', cv: 'CV chính đã kiểm tra', questions: 'Câu hỏi cho nhà tuyển dụng', device: 'Thiết bị/link họp sẵn sàng' }
  return <>
    <div className="uv-modal-head"><div><h2>{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe}</h2><p>{item.hoSoUngTuyen?.tinTuyenDung?.nhaTuyenDung?.tenCongTy}</p></div><Badge tone={toneTrangThaiLich(item.trangThai)}>{labelTrangThaiLich(item.trangThai)}</Badge></div>
    <div className="uv-detail-grid"><span>Bắt đầu</span><strong>{formatDate(item.thoiGianBatDau)}</strong><span>Kết thúc</span><strong>{formatDate(item.thoiGianKetThuc)}</strong><span>Hình thức</span><strong>{item.hinhThuc === 'online' ? 'Online' : 'Offline'}</strong><span>Địa chỉ / link</span><strong>{item.hinhThuc === 'online' ? item.linkHop : item.diaChi}</strong><span>Kết quả</span><strong>{labelKetQua(item.ketQua)}</strong><span>Ghi chú</span><strong>{item.ghiChu || '-'}</strong></div>
    <div className="uv-actions uv-detail-actions">{item.hinhThuc === 'online' && item.linkHop && <a className="primary-button" href={item.linkHop} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Mở link họp</a>}<button disabled={item.trangThai === 'da_xac_nhan'} onClick={onConfirm}><CheckCircle size={14} /> Xác nhận</button><button onClick={onReschedule}><Calendar size={14} /> Xin đổi lịch</button></div>
    <div className="uv-checklist"><strong>Checklist chuẩn bị</strong>{Object.entries(checklistItems).map(([key, label]) => <label key={key}><input type="checkbox" checked={!!checklist[key]} onChange={() => toggle(key)} /> {label}</label>)}</div>
  </>
}

export function ThongBaoUngVienPage() {
  const data = useUngVienData()
  const [filter, setFilter] = useState('all')
  const patch = async (id: string, payload: any) => { await api(`/thongbao/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }); await data.reload() }
  const remove = async (id: string) => { await api(`/thongbao/${id}`, { method: 'DELETE' }); await data.reload() }
  const items = (data.thongBao ?? []).filter((item: any) => filter === 'all' || (filter === 'unread' && !item.daDoc) || (filter === 'read' && item.daDoc) || item.loai === filter)
  const markAll = async () => { await Promise.all((data.thongBao ?? []).filter((item: any) => !item.daDoc).map((item: any) => api(`/thongbao/${item.id ?? item._id}`, { method: 'PATCH', body: JSON.stringify({ daDoc: true }) }))); await data.reload() }
  return <Page title="Thông báo" desc="Theo dõi cập nhật từ hệ thống, nhà tuyển dụng và lịch phỏng vấn." action={<button className="uv-secondary" onClick={markAll}>Đánh dấu tất cả đã đọc</button>}>
    <div className="uv-filterbar"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả</option><option value="unread">Chưa đọc</option><option value="read">Đã đọc</option><option value="lich_phong_van">Lịch phỏng vấn</option><option value="ho_so_ung_tuyen">Ứng tuyển</option><option value="tin_tuyen_dung">Tin tuyển dụng</option><option value="he_thong">Hệ thống</option></select></div>
    <section className="uv-panel">{items.length ? items.map((item: any) => <div className="uv-row" key={item.id ?? item._id}><a href={item.lienKet || '#'} onClick={() => patch(item.id ?? item._id, { daDoc: true })}><strong>{item.tieuDe}</strong><p>{item.noiDung}</p><p>{formatDate(item.ngayTao)}</p></a><div className="uv-actions"><Badge tone={item.daDoc ? 'gray' : 'blue'}>{item.daDoc ? 'Đã đọc' : 'Mới'}</Badge><button onClick={() => patch(item.id ?? item._id, { daDoc: true })}>Đánh dấu đọc</button><button onClick={() => remove(item.id ?? item._id)}><Trash2 size={14} /></button></div></div>) : <Empty>Không có thông báo phù hợp.</Empty>}</section>
  </Page>
}

export function ViecDaLuuPage() {
  const data = useUngVienData()
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]'))
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const mainCv = data.hoSo?.find((x: any) => x.cvChinh)
  const appliedIds = new Set(data.ungTuyen?.map((x: any) => x.maTinTuyenDung))
  const toggle = (id: string) => { const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; setSaved(next); localStorage.setItem('itjob_saved_jobs', JSON.stringify(next)) }
  const jobs = (data.tinList ?? []).filter((job: any) => saved.includes(job.id)).filter((job: any) => `${job.tieuDe} ${job.nhaTuyenDung?.tenCongTy} ${job.diaChi} ${job.luongMin} ${job.luongMax}`.toLowerCase().includes(query.toLowerCase()))
  const apply = async (job: any) => {
    if (!mainCv) { location.href = '/ung-vien/ho-so'; return }
    try {
      await api('/hosoungtuyen', { method: 'POST', body: JSON.stringify({ maUngVien: data.ungVien.id, maTinTuyenDung: job.id, maHoSoNangLuc: mainCv.id, diemKhopKyNang: 70, thuXinViec: 'Tôi muốn ứng tuyển nhanh từ danh sách việc đã lưu.' }) })
      await data.reload()
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không ứng tuyển được') }
  }
  return <Page title="Việc đã lưu" desc="Lưu lại các tin tuyển dụng cần theo dõi hoặc ứng tuyển sau.">
    <ErrorBox message={error} />
    <div className="uv-filterbar"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Lọc theo công ty, địa điểm, lương..." /></div>
    <section className="uv-panel">{jobs.length ? jobs.map((job: any) => <div className="uv-row" key={job.id}><div><strong>{job.tieuDe}</strong><p>{job.nhaTuyenDung?.tenCongTy} - {job.diaChi} - {money(job.luongMin)} - {money(job.luongMax)}</p></div><div className="uv-actions"><button className="uv-secondary" onClick={() => toggle(job.id)}><Star size={15} /> Bỏ lưu</button><button className="primary-button" disabled={appliedIds.has(job.id)} onClick={() => apply(job)}>{appliedIds.has(job.id) ? 'Đã nộp' : 'Ứng tuyển nhanh'}</button></div></div>) : <Empty>Chưa có việc đã lưu hoặc không khớp bộ lọc.</Empty>}</section>
  </Page>
}

export function CaiDatUngVienPage() {
  const data = useUngVienData()
  const [form, setForm] = useState<any>({})
  const [prefs, setPrefs] = useState<any>(() => JSON.parse(localStorage.getItem('itjob_candidate_notification_prefs') ?? '{"email":true,"interview":true,"job":true}'))
  useEffect(() => { if (data.current) setForm({ hoTen: data.current.hoTen, soDienThoai: data.current.soDienThoai ?? '', matKhau: '' }) }, [data.current?.id])
  const save = async (e: FormEvent) => {
    e.preventDefault()
    const payload: any = { hoTen: form.hoTen, soDienThoai: form.soDienThoai }
    if (form.matKhau) payload.matKhau = form.matKhau
    await api(`/nguoidung/${data.current.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    localStorage.setItem('itjob_nguoidung', JSON.stringify({ ...data.current, ...payload, matKhau: undefined }))
    localStorage.setItem('itjob_candidate_notification_prefs', JSON.stringify(prefs))
    await data.reload()
  }
  return <Page title="Cài đặt tài khoản" desc="Cập nhật thông tin đăng nhập, liên hệ và tùy chọn thông báo."><form className="uv-panel uv-form" onSubmit={save}><Field label="Họ tên"><input value={form.hoTen ?? ''} onChange={e => setForm({ ...form, hoTen: e.target.value })} /></Field><Field label="Số điện thoại"><input value={form.soDienThoai ?? ''} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} /></Field><Field label="Mật khẩu mới"><input type="password" value={form.matKhau ?? ''} onChange={e => setForm({ ...form, matKhau: e.target.value })} placeholder="Để trống nếu không đổi" /></Field><Field label="Tùy chọn thông báo" wide><div className="uv-checklist inline"><label><input type="checkbox" checked={prefs.email} onChange={e => setPrefs({ ...prefs, email: e.target.checked })} /> Email</label><label><input type="checkbox" checked={prefs.interview} onChange={e => setPrefs({ ...prefs, interview: e.target.checked })} /> Phỏng vấn</label><label><input type="checkbox" checked={prefs.job} onChange={e => setPrefs({ ...prefs, job: e.target.checked })} /> Tin tuyển dụng</label></div></Field><div className="uv-form-actions"><button className="primary-button"><Save size={16} /> Lưu cài đặt</button></div></form></Page>
}

function Field({ label, wide, children }: any) {
  return <label className="uv-field" style={{ gridColumn: wide ? '1 / -1' : undefined }}><span>{label}</span>{children}</label>
}
