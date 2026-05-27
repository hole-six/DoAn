import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { BarChart2, Building2, CheckCircle, Edit3, FileText, Plus, RefreshCw, Search, Settings, Shield, Star, Trash2, X, XCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

function headers() {
  const token = localStorage.getItem('itjob_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.thongBao ?? 'Thao tác thất bại')
  return data.duLieu
}

function getId(item: any) {
  return item.id ?? item._id
}

function getError(err: unknown) {
  return err instanceof Error ? err.message : 'Thao tác thất bại'
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-'
}

function formatMoney(value?: number) {
  return typeof value === 'number' && value > 0 ? value.toLocaleString('vi-VN') : 'Thỏa thuận'
}

function truncate(value = '', max = 120) {
  return value.length > max ? `${value.slice(0, max)}...` : value
}

function PageShell({
  title,
  desc,
  action,
  children,
}: {
  title: string
  desc: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Toolbar({
  keyword,
  onKeyword,
  filter,
  onFilter,
  options,
  onRefresh,
}: {
  keyword: string
  onKeyword: (value: string) => void
  filter: string
  onFilter: (value: string) => void
  options: Array<{ value: string; label: string }>
  onRefresh: () => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,1fr) 220px auto', gap: 10, marginBottom: 16 }}>
      <label style={searchBox}>
        <Search size={17} color="#64748b" />
        <input value={keyword} onChange={(e) => onKeyword(e.target.value)} placeholder="Tìm kiếm..." style={inputBare} />
      </label>
      <select value={filter} onChange={(e) => onFilter(e.target.value)} style={selectStyle}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button className="secondary-button" onClick={onRefresh}><RefreshCw size={16} /> Làm mới</button>
    </div>
  )
}

function StatusBadge({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' }) {
  const colorMap = {
    blue: { bg: '#eff6ff', color: '#0058be' },
    green: { bg: '#dcfce7', color: '#166534' },
    red: { bg: '#ffe4e6', color: '#be123c' },
    yellow: { bg: '#fef3c7', color: '#92400e' },
    gray: { bg: '#f1f5f9', color: '#475569' },
  }
  return <span className="admin-status" style={{ background: colorMap[tone].bg, color: colorMap[tone].color }}>{label}</span>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} style={iconClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function QuanLyCongTyAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const [companies, allUsers] = await Promise.all([api('/nhatuyendung'), api('/nguoidung')])
      setItems(companies)
      setUsers(allUsers.filter((u: any) => u.vaiTro === 'nha_tuyen_dung'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    }
  }

  useEffect(() => { load() }, [])

  const list = useMemo(() => items.filter((item) => {
    const kw = keyword.toLowerCase().trim()
    const matchKw = !kw || item.tenCongTy?.toLowerCase().includes(kw) || item.nguoiDung?.email?.toLowerCase().includes(kw) || item.diaChi?.toLowerCase().includes(kw)
    const matchFilter = filter === 'tat_ca' || item.trangThaiDuyet === filter
    return matchKw && matchFilter
  }), [filter, items, keyword])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    const payload = {
      maNguoiDung: form.maNguoiDung,
      tenCongTy: form.tenCongTy,
      maSoThue: form.maSoThue,
      moTa: form.moTa,
      diaChi: form.diaChi,
      website: form.website,
      logo: form.logo,
      quyMo: Number(form.quyMo || 1),
      nganh: form.nganh,
      trangThaiDuyet: form.trangThaiDuyet,
      lyDoTuChoi: form.lyDoTuChoi,
    }
    try {
      setError('')
      await api(`/nhatuyendung${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setForm(null)
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  const patch = async (id: string, payload: any) => {
    try {
      setError('')
      await api(`/nhatuyendung/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  const remove = async (item: any) => {
    if (!window.confirm(`Xóa công ty ${item.tenCongTy}?`)) return
    try {
      setError('')
      await api(`/nhatuyendung/${getId(item)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <PageShell title="Xác thực công ty" desc="Duyệt, từ chối, khóa, thêm, sửa và xóa hồ sơ nhà tuyển dụng." action={<button className="primary-button" onClick={() => setForm({ trangThaiDuyet: 'cho_duyet', quyMo: 1 })}><Plus size={17} /> Thêm công ty</button>}>
      <div className="panel" style={panelStyle}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load} options={[
          { value: 'tat_ca', label: 'Tất cả trạng thái' },
          { value: 'cho_duyet', label: 'Chờ duyệt' },
          { value: 'da_duyet', label: 'Đã duyệt' },
          { value: 'tu_choi', label: 'Từ chối' },
          { value: 'bi_khoa', label: 'Bị khóa' },
        ]} />
        {error && <ErrorBox message={error} />}
        <Table headers={['Công ty', 'Liên hệ', 'Hồ sơ', 'Trạng thái', 'Cập nhật', 'Thao tác']}>
          {list.map((item) => (
            <tr key={getId(item)} style={rowStyle}>
              <td style={tdStyle}>
                <strong>{item.tenCongTy}</strong>
                <p style={muted}>{item.diaChi || 'Chưa có địa chỉ'}</p>
                <p style={muted}>{item.nganh || 'Chưa phân ngành'} · MST: {item.maSoThue || '-'}</p>
              </td>
              <td style={tdStyle}>
                <strong>{item.nguoiDung?.hoTen ?? '-'}</strong>
                <p style={muted}>{item.nguoiDung?.email ?? '-'}</p>
                <p style={muted}>{item.nguoiDung?.soDienThoai ?? 'Chưa có SĐT'}</p>
              </td>
              <td style={tdStyle}>
                <strong>{item.quyMo ?? '-'} nhân sự</strong>
                <p style={muted}>{item.website || 'Chưa có website'}</p>
                <p style={muted}>{truncate(item.moTa, 76) || 'Chưa có mô tả'}</p>
              </td>
              <td style={tdStyle}><StatusBadge label={labelCompanyStatus(item.trangThaiDuyet)} tone={toneCompanyStatus(item.trangThaiDuyet)} /></td>
              <td style={tdStyle}>{formatDate(item.ngayCapNhat ?? item.ngayTao)}<p style={muted}>{item.lyDoTuChoi || ''}</p></td>
              <td style={tdStyle}><ActionBar>
                <button style={btnSmall} onClick={() => patch(getId(item), { trangThaiDuyet: 'da_duyet' })}><CheckCircle size={14} /> Duyệt</button>
                <button style={btnSmallDanger} onClick={() => patch(getId(item), { trangThaiDuyet: 'tu_choi', lyDoTuChoi: 'Không đạt tiêu chí xác thực' })}><XCircle size={14} /> Từ chối</button>
                <button style={btnSmall} onClick={() => setForm({ ...item, maNguoiDung: item.maNguoiDung })}><Edit3 size={14} /> Sửa</button>
                <button style={btnSmallDanger} onClick={() => remove(item)}><Trash2 size={14} /> Xóa</button>
              </ActionBar></td>
            </tr>
          ))}
          {list.length === 0 && <EmptyRow colSpan={6} />}
        </Table>
      </div>
      {form && <Modal title={form.id ? 'Sửa công ty' : 'Thêm công ty'} onClose={() => setForm(null)}>
        <form onSubmit={save} style={formGrid}>
          <Field label="Tài khoản nhà tuyển dụng"><select required value={form.maNguoiDung ?? ''} onChange={(e) => setForm({ ...form, maNguoiDung: e.target.value })} style={inputStyle}><option value="">Chọn tài khoản</option>{users.map((u) => <option key={u.id} value={u.id}>{u.hoTen} - {u.email}</option>)}</select></Field>
          <Field label="Tên công ty"><input required value={form.tenCongTy ?? ''} onChange={(e) => setForm({ ...form, tenCongTy: e.target.value })} style={inputStyle} /></Field>
          <Field label="Mã số thuế"><input value={form.maSoThue ?? ''} onChange={(e) => setForm({ ...form, maSoThue: e.target.value })} style={inputStyle} /></Field>
          <Field label="Quy mô"><input type="number" min={1} value={form.quyMo ?? 1} onChange={(e) => setForm({ ...form, quyMo: e.target.value })} style={inputStyle} /></Field>
          <Field label="Địa chỉ"><input value={form.diaChi ?? ''} onChange={(e) => setForm({ ...form, diaChi: e.target.value })} style={inputStyle} /></Field>
          <Field label="Website"><input value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} style={inputStyle} /></Field>
          <Field label="Logo"><input value={form.logo ?? ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} style={inputStyle} /></Field>
          <Field label="Ngành"><input value={form.nganh ?? ''} onChange={(e) => setForm({ ...form, nganh: e.target.value })} style={inputStyle} /></Field>
          <Field label="Trạng thái"><select value={form.trangThaiDuyet ?? 'cho_duyet'} onChange={(e) => setForm({ ...form, trangThaiDuyet: e.target.value })} style={inputStyle}><option value="cho_duyet">Chờ duyệt</option><option value="da_duyet">Đã duyệt</option><option value="tu_choi">Từ chối</option><option value="bi_khoa">Bị khóa</option></select></Field>
          <Field label="Lý do từ chối"><input value={form.lyDoTuChoi ?? ''} onChange={(e) => setForm({ ...form, lyDoTuChoi: e.target.value })} style={inputStyle} /></Field>
          <Field label="Mô tả" wide><textarea value={form.moTa ?? ''} onChange={(e) => setForm({ ...form, moTa: e.target.value })} style={{ ...inputStyle, minHeight: 90, paddingTop: 10 }} /></Field>
          <FormActions onCancel={() => setForm(null)} />
        </form>
      </Modal>}
    </PageShell>
  )
}

export function DuyetTinTuyenDungAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const [jobs, comps] = await Promise.all([api('/tintuyendung'), api('/nhatuyendung')])
      setItems(jobs)
      setCompanies(comps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    }
  }
  useEffect(() => { load() }, [])

  const list = useMemo(() => items.filter((item) => {
    const kw = keyword.toLowerCase().trim()
    const matchKw = !kw || item.tieuDe?.toLowerCase().includes(kw) || item.nhaTuyenDung?.tenCongTy?.toLowerCase().includes(kw)
    const matchFilter = filter === 'tat_ca' || item.trangThai === filter
    return matchKw && matchFilter
  }), [filter, items, keyword])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const payload = {
      maNhaTuyenDung: form.maNhaTuyenDung,
      tieuDe: form.tieuDe,
      yeuCauKinhNghiem: form.yeuCauKinhNghiem,
      diaChi: form.diaChi,
      luongMin: Number(form.luongMin || 0),
      luongMax: Number(form.luongMax || 0),
      loaiHinh: form.loaiHinh,
      capBac: form.capBac,
      hanNop: form.hanNop,
      soLuong: Number(form.soLuong || 1),
      moTa: form.moTa,
      yeuCau: form.yeuCau,
      quyenLoi: form.quyenLoi,
      trangThai: form.trangThai,
    }
    try {
      setError('')
      await api(`/tintuyendung${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setForm(null)
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  const patch = async (id: string, payload: any) => {
    try {
      setError('')
      await api(`/tintuyendung/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }
  const remove = async (item: any) => {
    if (!window.confirm(`Xóa tin ${item.tieuDe}?`)) return
    try {
      setError('')
      await api(`/tintuyendung/${getId(item)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <PageShell title="Duyệt tin tuyển dụng" desc="Kiểm duyệt, mở, từ chối, tạm đóng, thêm, sửa và xóa tin tuyển dụng." action={<button className="primary-button" onClick={() => setForm({ trangThai: 'cho_duyet', loaiHinh: 'toan_thoi_gian', capBac: 'junior', soLuong: 1 })}><Plus size={17} /> Thêm tin</button>}>
      <div className="panel" style={panelStyle}>
        <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load} options={[
          { value: 'tat_ca', label: 'Tất cả trạng thái' }, { value: 'cho_duyet', label: 'Chờ duyệt' }, { value: 'dang_mo', label: 'Đang mở' }, { value: 'tam_dong', label: 'Tạm đóng' }, { value: 'tu_choi', label: 'Từ chối' }, { value: 'het_han', label: 'Hết hạn' },
        ]} />
        {error && <ErrorBox message={error} />}
        <Table headers={['Tin tuyển dụng', 'Công ty', 'Tuyển dụng', 'Nội dung', 'Trạng thái', 'Thao tác']}>
          {list.map((item) => (
            <tr key={getId(item)} style={rowStyle}>
              <td style={tdStyle}>
                <strong>{item.tieuDe}</strong>
                <p style={muted}>{item.diaChi || '-'} · {labelCapBac(item.capBac)} · {labelLoaiHinh(item.loaiHinh)}</p>
                <p style={muted}>Hạn nộp: {formatDate(item.hanNop)} · Lượt xem: {item.luotXem ?? 0}</p>
              </td>
              <td style={tdStyle}>
                <strong>{item.nhaTuyenDung?.tenCongTy ?? '-'}</strong>
                <p style={muted}>Trạng thái công ty: {labelCompanyStatus(item.nhaTuyenDung?.trangThaiDuyet)}</p>
              </td>
              <td style={tdStyle}>
                <strong>{formatMoney(item.luongMin)} - {formatMoney(item.luongMax)}</strong>
                <p style={muted}>Số lượng: {item.soLuong ?? 1}</p>
              </td>
              <td style={{ ...tdStyle, maxWidth: 280 }}>
                <p>{truncate(item.moTa, 96)}</p>
                <p style={muted}>{truncate(item.yeuCau, 82)}</p>
              </td>
              <td style={tdStyle}><StatusBadge label={labelJobStatus(item.trangThai)} tone={toneJobStatus(item.trangThai)} /></td>
              <td style={tdStyle}><ActionBar>
                <button style={btnSmall} onClick={() => patch(getId(item), { trangThai: 'dang_mo' })}><CheckCircle size={14} /> Duyệt</button>
                <button style={btnSmallDanger} onClick={() => patch(getId(item), { trangThai: 'tu_choi' })}><XCircle size={14} /> Từ chối</button>
                <button style={btnSmall} onClick={() => setForm({ ...item, maNhaTuyenDung: item.maNhaTuyenDung, hanNop: item.hanNop?.slice(0, 10) })}><Edit3 size={14} /> Sửa</button>
                <button style={btnSmallDanger} onClick={() => remove(item)}><Trash2 size={14} /> Xóa</button>
              </ActionBar></td>
            </tr>
          ))}
          {list.length === 0 && <EmptyRow colSpan={6} />}
        </Table>
      </div>
      {form && <Modal title={form.id ? 'Sửa tin tuyển dụng' : 'Thêm tin tuyển dụng'} onClose={() => setForm(null)}>
        <form onSubmit={save} style={formGrid}>
          <Field label="Công ty"><select required value={form.maNhaTuyenDung ?? ''} onChange={(e) => setForm({ ...form, maNhaTuyenDung: e.target.value })} style={inputStyle}><option value="">Chọn công ty</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.tenCongTy}</option>)}</select></Field>
          <Field label="Tiêu đề"><input required value={form.tieuDe ?? ''} onChange={(e) => setForm({ ...form, tieuDe: e.target.value })} style={inputStyle} /></Field>
          <Field label="Địa chỉ"><input value={form.diaChi ?? ''} onChange={(e) => setForm({ ...form, diaChi: e.target.value })} style={inputStyle} /></Field>
          <Field label="Hạn nộp"><input type="date" value={form.hanNop ?? ''} onChange={(e) => setForm({ ...form, hanNop: e.target.value })} style={inputStyle} /></Field>
          <Field label="Lương min"><input type="number" value={form.luongMin ?? 0} onChange={(e) => setForm({ ...form, luongMin: e.target.value })} style={inputStyle} /></Field>
          <Field label="Lương max"><input type="number" value={form.luongMax ?? 0} onChange={(e) => setForm({ ...form, luongMax: e.target.value })} style={inputStyle} /></Field>
          <Field label="Loại hình"><select value={form.loaiHinh ?? 'toan_thoi_gian'} onChange={(e) => setForm({ ...form, loaiHinh: e.target.value })} style={inputStyle}><option value="toan_thoi_gian">Toàn thời gian</option><option value="ban_thoi_gian">Bán thời gian</option><option value="thuc_tap">Thực tập</option><option value="tu_xa">Từ xa</option><option value="hybrid">Hybrid</option></select></Field>
          <Field label="Cấp bậc"><select value={form.capBac ?? 'junior'} onChange={(e) => setForm({ ...form, capBac: e.target.value })} style={inputStyle}><option value="intern">Intern</option><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="middle">Middle</option><option value="senior">Senior</option><option value="lead">Lead</option></select></Field>
          <Field label="Số lượng"><input type="number" min={1} value={form.soLuong ?? 1} onChange={(e) => setForm({ ...form, soLuong: e.target.value })} style={inputStyle} /></Field>
          <Field label="Trạng thái"><select value={form.trangThai ?? 'cho_duyet'} onChange={(e) => setForm({ ...form, trangThai: e.target.value })} style={inputStyle}><option value="nhap">Nháp</option><option value="cho_duyet">Chờ duyệt</option><option value="dang_mo">Đang mở</option><option value="tam_dong">Tạm đóng</option><option value="het_han">Hết hạn</option><option value="tu_choi">Từ chối</option></select></Field>
          <Field label="Mô tả" wide><textarea required value={form.moTa ?? ''} onChange={(e) => setForm({ ...form, moTa: e.target.value })} style={{ ...inputStyle, minHeight: 80, paddingTop: 10 }} /></Field>
          <Field label="Yêu cầu" wide><textarea required value={form.yeuCau ?? ''} onChange={(e) => setForm({ ...form, yeuCau: e.target.value })} style={{ ...inputStyle, minHeight: 80, paddingTop: 10 }} /></Field>
          <Field label="Quyền lợi" wide><textarea value={form.quyenLoi ?? ''} onChange={(e) => setForm({ ...form, quyenLoi: e.target.value })} style={{ ...inputStyle, minHeight: 70, paddingTop: 10 }} /></Field>
          <FormActions onCancel={() => setForm(null)} />
        </form>
      </Modal>}
    </PageShell>
  )
}

export function QuanLyKyNangAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [form, setForm] = useState<any | null>(null)
  const [error, setError] = useState('')
  const load = async () => { try { setItems(await api('/danhmuckynang')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') } }
  useEffect(() => { load() }, [])
  const list = items.filter((item) => (!keyword || item.tenKyNang?.toLowerCase().includes(keyword.toLowerCase())) && (filter === 'tat_ca' || item.loaiKyNang === filter))
  const save = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      await api(`/danhmuckynang${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(form) })
      setForm(null)
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }
  const remove = async (item: any) => {
    if (!window.confirm(`Xóa kỹ năng ${item.tenKyNang}?`)) return
    try {
      setError('')
      await api(`/danhmuckynang/${getId(item)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }

  return <PageShell title="Danh mục kỹ năng" desc="Quản trị taxonomy kỹ năng dùng chung cho ứng viên và tin tuyển dụng." action={<button className="primary-button" onClick={() => setForm({ loaiKyNang: 'frontend' })}><Plus size={17} /> Thêm kỹ năng</button>}>
    <div className="panel" style={panelStyle}>
      <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load} options={skillOptions} />
      {error && <ErrorBox message={error} />}
      <Table headers={['Kỹ năng', 'Loại', 'Ngày tạo', 'Thao tác']}>
        {list.map((item) => <tr key={getId(item)} style={rowStyle}><td style={tdStyle}><strong>{item.tenKyNang}</strong></td><td style={tdStyle}><StatusBadge label={item.loaiKyNang} tone="blue" /></td><td style={tdStyle}>{item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '-'}</td><td style={tdStyle}><ActionBar><button style={btnSmall} onClick={() => setForm({ id: getId(item), tenKyNang: item.tenKyNang, loaiKyNang: item.loaiKyNang })}><Edit3 size={14} /> Sửa</button><button style={btnSmallDanger} onClick={() => remove(item)}><Trash2 size={14} /> Xóa</button></ActionBar></td></tr>)}
        {list.length === 0 && <EmptyRow colSpan={4} />}
      </Table>
    </div>
    {form && <Modal title={form.id ? 'Sửa kỹ năng' : 'Thêm kỹ năng'} onClose={() => setForm(null)}><form onSubmit={save} style={formGrid}><Field label="Tên kỹ năng"><input required value={form.tenKyNang ?? ''} onChange={(e) => setForm({ ...form, tenKyNang: e.target.value })} style={inputStyle} /></Field><Field label="Loại kỹ năng"><select value={form.loaiKyNang} onChange={(e) => setForm({ ...form, loaiKyNang: e.target.value })} style={inputStyle}>{skillOptions.filter(o => o.value !== 'tat_ca').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field><FormActions onCancel={() => setForm(null)} /></form></Modal>}
  </PageShell>
}

export function QuanLyReviewCongTyAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('tat_ca')
  const [error, setError] = useState('')
  const load = async () => { try { setItems(await api('/danhgiacongty')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') } }
  useEffect(() => { load() }, [])
  const list = items.filter((item) => (!keyword || item.nhaTuyenDung?.tenCongTy?.toLowerCase().includes(keyword.toLowerCase()) || item.noiDung?.toLowerCase().includes(keyword.toLowerCase())) && (filter === 'tat_ca' || String(item.daDuyet) === filter))
  const patch = async (id: string, payload: any) => {
    try {
      setError('')
      await api(`/danhgiacongty/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }
  const remove = async (item: any) => {
    if (!window.confirm('Xóa review này?')) return
    try {
      setError('')
      await api(`/danhgiacongty/${getId(item)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(getError(err))
    }
  }
  return <PageShell title="Review công ty" desc="Kiểm duyệt đánh giá công ty trước khi hiển thị công khai.">
    <div className="panel" style={panelStyle}>
      <Toolbar keyword={keyword} onKeyword={setKeyword} filter={filter} onFilter={setFilter} onRefresh={load} options={[{ value: 'tat_ca', label: 'Tất cả review' }, { value: 'false', label: 'Chờ duyệt' }, { value: 'true', label: 'Đã duyệt' }]} />
      {error && <ErrorBox message={error} />}
      <Table headers={['Công ty', 'Ứng viên', 'Điểm', 'Nội dung', 'Trạng thái', 'Thao tác']}>
        {list.map((item) => <tr key={getId(item)} style={rowStyle}><td style={tdStyle}><strong>{item.nhaTuyenDung?.tenCongTy ?? '-'}</strong><p style={muted}>{formatDate(item.ngayTao)}</p></td><td style={tdStyle}><strong>{item.anDanh ? 'Ẩn danh' : item.ungVien?.hoTen ?? 'Ứng viên'}</strong><p style={muted}>{item.ungVien?.email ?? item.ungVien?.viTriMongMuon ?? '-'}</p></td><td style={tdStyle}><span style={{ color: '#f59e0b', fontWeight: 900 }}>{'★'.repeat(item.diem)}</span><p style={muted}>{item.diem}/5</p></td><td style={{ ...tdStyle, maxWidth: 420 }}>{item.noiDung}</td><td style={tdStyle}><StatusBadge label={item.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'} tone={item.daDuyet ? 'green' : 'yellow'} /></td><td style={tdStyle}><ActionBar><button style={btnSmall} onClick={() => patch(getId(item), { daDuyet: true })}><CheckCircle size={14} /> Duyệt</button><button style={btnSmallDanger} onClick={() => patch(getId(item), { daDuyet: false })}><XCircle size={14} /> Ẩn</button><button style={btnSmallDanger} onClick={() => remove(item)}><Trash2 size={14} /> Xóa</button></ActionBar></td></tr>)}
        {list.length === 0 && <EmptyRow colSpan={6} />}
      </Table>
    </div>
  </PageShell>
}

export function BaoCaoAdmin() {
  const [data, setData] = useState<any>({})
  useEffect(() => { Promise.all([api('/nguoidung'), api('/nhatuyendung'), api('/tintuyendung'), api('/danhmuckynang'), api('/danhgiacongty')]).then(([u, c, j, s, r]) => setData({ u, c, j, s, r })).catch(() => undefined) }, [])
  const cards = [
    ['Người dùng', data.u?.length ?? 0, UsersIcon],
    ['Công ty', data.c?.length ?? 0, Building2],
    ['Tin tuyển dụng', data.j?.length ?? 0, FileText],
    ['Kỹ năng', data.s?.length ?? 0, Star],
    ['Review', data.r?.length ?? 0, BarChart2],
  ]
  return <PageShell title="Báo cáo hệ thống" desc="Tổng hợp nhanh các chỉ số vận hành từ database."><div className="stats-grid dashboard-stats">{cards.map(([label, value, Icon]: any) => <div className="stat-card" style={{ borderRadius: 8 }} key={label}><Icon size={22} color="#0058be" /><p style={{ ...muted, marginTop: 12 }}>{label}</p><strong style={{ fontSize: 34 }}>{value}</strong></div>)}</div></PageShell>
}

export function CaiDatAdmin() {
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('itjob_admin_settings') ?? '{"kiemDuyetTin":true,"kiemDuyetReview":true,"baoTri":false}'))
  const save = () => localStorage.setItem('itjob_admin_settings', JSON.stringify(settings))
  return <PageShell title="Cài đặt hệ thống" desc="Cấu hình vận hành phía quản trị."><div className="panel" style={panelStyle}>{[['kiemDuyetTin', 'Bật kiểm duyệt tin tuyển dụng'], ['kiemDuyetReview', 'Bật kiểm duyệt review công ty'], ['baoTri', 'Chế độ bảo trì']].map(([key, label]) => <label key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e5e7eb', fontWeight: 800 }}>{label}<input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} /></label>)}<button className="primary-button" onClick={save} style={{ marginTop: 18 }}><Settings size={17} /> Lưu cài đặt</button></div></PageShell>
}

export function LogsAdmin() {
  const logs = [
    ['Seed dữ liệu', 'Đã tạo tài khoản mẫu cho 3 vai trò', 'Thành công'],
    ['Auth', 'Admin đăng nhập hệ thống', 'Thành công'],
    ['CRUD', 'Quản lý người dùng đã bật', 'Hoạt động'],
    ['Policy', 'Chặn xóa admin cuối cùng', 'Bảo vệ'],
  ]
  return <PageShell title="System Logs" desc="Nhật ký vận hành hệ thống và các sự kiện quản trị quan trọng."><div className="panel" style={panelStyle}><Table headers={['Nhóm', 'Sự kiện', 'Trạng thái']}>{logs.map((l) => <tr key={l[1]} style={rowStyle}><td style={tdStyle}><Shield size={16} /> {l[0]}</td><td style={tdStyle}>{l[1]}</td><td style={tdStyle}><StatusBadge label={l[2]} tone="green" /></td></tr>)}</Table></div></PageShell>
}

function UsersIcon(props: any) {
  return <Building2 {...props} />
}

function ErrorBox({ message }: { message: string }) {
  return <div style={{ border: '1px solid rgba(225,29,72,0.22)', background: 'rgba(225,29,72,0.08)', color: '#be123c', borderRadius: 6, padding: 12, marginBottom: 14, fontWeight: 700 }}>{message}</div>
}

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="admin-table-wrap"><table className="admin-table" style={{ minWidth: 1040 }}><thead><tr>{headers.map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return <tr><td colSpan={colSpan} style={{ padding: 28, textAlign: 'center', color: '#64748b', background: '#ffffff' }}>Không có dữ liệu phù hợp với bộ lọc hiện tại.</td></tr>
}

function ActionBar({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label style={{ ...fieldStyle, gridColumn: wide ? '1 / -1' : undefined }}>{label}{children}</label>
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}><button type="button" className="secondary-button" onClick={onCancel}>Hủy</button><button type="submit" className="primary-button">Lưu</button></div>
}

function labelCompanyStatus(status: string) {
  return ({ cho_duyet: 'Chờ duyệt', da_duyet: 'Đã duyệt', tu_choi: 'Từ chối', bi_khoa: 'Bị khóa' } as any)[status] ?? status
}
function toneCompanyStatus(status: string): 'green' | 'red' | 'yellow' | 'gray' {
  return status === 'da_duyet' ? 'green' : status === 'tu_choi' || status === 'bi_khoa' ? 'red' : 'yellow'
}
function labelJobStatus(status: string) {
  return ({ nhap: 'Nháp', cho_duyet: 'Chờ duyệt', dang_mo: 'Đang mở', tam_dong: 'Tạm đóng', het_han: 'Hết hạn', tu_choi: 'Từ chối' } as any)[status] ?? status
}
function toneJobStatus(status: string): 'green' | 'red' | 'yellow' | 'gray' {
  return status === 'dang_mo' ? 'green' : status === 'tu_choi' || status === 'het_han' ? 'red' : status === 'tam_dong' ? 'gray' : 'yellow'
}
function labelLoaiHinh(value: string) {
  return ({ toan_thoi_gian: 'Toàn thời gian', ban_thoi_gian: 'Bán thời gian', thuc_tap: 'Thực tập', tu_xa: 'Từ xa', hybrid: 'Hybrid' } as any)[value] ?? value
}
function labelCapBac(value: string) {
  return ({ intern: 'Intern', fresher: 'Fresher', junior: 'Junior', middle: 'Middle', senior: 'Senior', lead: 'Lead' } as any)[value] ?? value
}

const skillOptions = [
  { value: 'tat_ca', label: 'Tất cả loại kỹ năng' },
  { value: 'ngon_ngu', label: 'Ngôn ngữ' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'testing', label: 'Testing' },
  { value: 'thiet_ke', label: 'Thiết kế' },
  { value: 'ky_nang_mem', label: 'Kỹ năng mềm' },
]

const panelStyle: CSSProperties = { borderRadius: 6, background: '#ffffff', border: '1px solid #dde3ea', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }
const searchBox: CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #cfd7e3', borderRadius: 6, padding: '0 12px', minHeight: 42, background: '#ffffff' }
const inputBare: CSSProperties = { border: 0, outline: 0, width: '100%', background: 'transparent' }
const selectStyle: CSSProperties = { border: '1px solid #cfd7e3', borderRadius: 6, padding: '0 12px', minHeight: 42, background: '#fff', fontWeight: 700 }
const thStyle: CSSProperties = { textAlign: 'left', padding: '12px 16px', fontSize: 11.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const tdStyle: CSSProperties = { padding: '14px 16px', verticalAlign: 'middle' }
const rowStyle: CSSProperties = { borderTop: '1px solid #e5e7eb' }
const muted: CSSProperties = { color: '#64748b', fontSize: 13, marginTop: 3 }
const btnSmall: CSSProperties = { minHeight: 34, padding: '7px 10px', borderRadius: 5, border: '1px solid #cfd7e3', background: '#fff', display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 800 }
const btnSmallDanger: CSSProperties = { ...btnSmall, color: '#be123c', borderColor: 'rgba(225,29,72,0.35)' }
const modalOverlay: CSSProperties = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
const modalCard: CSSProperties = { width: 'min(900px,100%)', maxHeight: '88vh', overflow: 'auto', background: '#fff', borderRadius: 6, border: '1px solid #d8dde6', padding: 24, boxShadow: '0 24px 70px rgba(15,23,42,.22)' }
const iconClose: CSSProperties = { background: '#f1f5f9', border: '1px solid #d8dde6', width: 38, height: 38, borderRadius: 5 }
const formGrid: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
const fieldStyle: CSSProperties = { display: 'grid', gap: 7, color: '#475569', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }
const inputStyle: CSSProperties = { border: '1px solid #cfd7e3', borderRadius: 6, minHeight: 42, padding: '0 12px', outline: 'none', fontSize: 14, color: '#0b1c30', textTransform: 'none', letterSpacing: 0, fontWeight: 600, background: '#fff' }
