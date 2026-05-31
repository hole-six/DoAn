import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Brain, FileUp, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'
import { apiCoXacThuc } from '../../lib/auth'
import { toast } from '../../lib/toast'

type CvItem = { tieuDe?: string; donVi?: string; thoiGian?: string; moTa?: string }
type LinkItem = { nhan?: string; url?: string }
type SkillGroup = { nhom?: string; muc?: string[] }
type ProjectDetail = {
  tenDuAn?: string
  thoiGian?: string
  viTri?: string
  moTa?: string
  trachNhiem?: string[]
  heDieuHanh?: string
  ngonNgu?: string
  framework?: string
  kyThuat?: string
  diaDiem?: string
  lienKet?: LinkItem[]
}
type CvData = {
  id?: string
  maUngVien?: string
  tieuDe: string
  hocVan: CvItem[]
  kinhNghiemLam: CvItem[]
  chungChi: CvItem[]
  duAn: CvItem[]
  hoTenHienThi?: string
  chucDanh?: string
  soDienThoai?: string
  emailLienHe?: string
  facebook?: string
  github?: string
  portfolioUrl?: string
  diaDiem?: string
  tomTatKinhNghiem: string[]
  kyNangMem: string[]
  kyNangLapTrinh: SkillGroup[]
  baiVietKyThuat: LinkItem[]
  duAnChiTiet: ProjectDetail[]
  fileCvTen?: string
  fileCvLoai?: string
  fileCvData?: string
  anhDaiDien?: string
  templateCv?: string
  mauChinh?: string
  mauPhu?: string
  font?: string
  markdownGoc?: string
  ghiChuAi?: string
  cvChinh: boolean
  congKhai: boolean
}

const emptyCv: CvData = {
  tieuDe: 'CV Fullstack Developer',
  hocVan: [],
  kinhNghiemLam: [],
  chungChi: [],
  duAn: [],
  tomTatKinhNghiem: [],
  kyNangMem: [],
  kyNangLapTrinh: [],
  baiVietKyThuat: [],
  duAnChiTiet: [],
  cvChinh: true,
  congKhai: true,
  templateCv: 'it-a4-pro',
  mauChinh: '#0f172a',
  mauPhu: '#000000',
  font: 'Inter',
  markdownGoc: '',
}

const inputCls = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0b5c91] focus:ring-4 focus:ring-[#0b5c91]/10'
const textareaCls = 'min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0b5c91] focus:ring-4 focus:ring-[#0b5c91]/10'
const panelCls = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
const primaryBtn = 'btn-primary-uv'
const secondaryBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-[#0b5c91]/30 hover:text-[#0b5c91]'

function splitLines(value?: string) {
  return (value ?? '').split('\n').map(item => item.trim()).filter(Boolean)
}

function joinLines(value?: string[]) {
  return (value ?? []).join('\n')
}

function updateList<T>(list: T[], index: number, patch: Partial<T>) {
  return list.map((item, i) => i === index ? { ...item, ...patch } : item)
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      {desc && <p className="mt-0.5 text-xs font-semibold text-slate-500">{desc}</p>}
    </div>
  )
}

function CvTextList({ title, value, onChange, placeholder }: { title: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className={panelCls}>
      <SectionTitle title={title} desc="Mỗi dòng là một ý trong CV." />
      <textarea className={textareaCls} value={joinLines(value)} onChange={e => onChange(splitLines(e.target.value))} placeholder={placeholder} />
    </div>
  )
}

function BasicItemsEditor({ title, value, onChange }: { title: string; value: CvItem[]; onChange: (v: CvItem[]) => void }) {
  return (
    <div className={panelCls}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle title={title} />
        <button type="button" className={secondaryBtn} onClick={() => onChange([...value, { tieuDe: '', donVi: '', thoiGian: '', moTa: '' }])}>
          <Plus size={15} /> Thêm
        </button>
      </div>
      <div className="grid gap-3">
        {value.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
            <input className={inputCls} placeholder="Tiêu đề" value={item.tieuDe ?? ''} onChange={e => onChange(updateList(value, index, { tieuDe: e.target.value }))} />
            <input className={inputCls} placeholder="Đơn vị / công ty" value={item.donVi ?? ''} onChange={e => onChange(updateList(value, index, { donVi: e.target.value }))} />
            <input className={inputCls} placeholder="Thời gian" value={item.thoiGian ?? ''} onChange={e => onChange(updateList(value, index, { thoiGian: e.target.value }))} />
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Mô tả ngắn" value={item.moTa ?? ''} onChange={e => onChange(updateList(value, index, { moTa: e.target.value }))} />
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillEditor({ value, onChange }: { value: SkillGroup[]; onChange: (v: SkillGroup[]) => void }) {
  return (
    <div className={panelCls}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle title="Kỹ năng lập trình" desc="Chia theo Frontend, Backend, Database, DevOps..." />
        <button type="button" className={secondaryBtn} onClick={() => onChange([...value, { nhom: '', muc: [] }])}><Plus size={15} /> Thêm nhóm</button>
      </div>
      <div className="grid gap-3">
        {value.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Nhóm kỹ năng, ví dụ Frontend" value={item.nhom ?? ''} onChange={e => onChange(updateList(value, index, { nhom: e.target.value }))} />
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                <Trash2 size={15} />
              </button>
            </div>
            <textarea className={textareaCls} placeholder="Mỗi dòng là một kỹ năng: ReactJS, NextJS, TypeScript..." value={joinLines(item.muc)} onChange={e => onChange(updateList(value, index, { muc: splitLines(e.target.value) }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectEditor({ value, onChange }: { value: ProjectDetail[]; onChange: (v: ProjectDetail[]) => void }) {
  return (
    <div className={panelCls}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle title="Kinh nghiệm theo dự án" desc="Đây là phần quan trọng nhất với CV dân IT." />
        <button type="button" className={secondaryBtn} onClick={() => onChange([...value, { tenDuAn: '', thoiGian: '', viTri: '', trachNhiem: [], lienKet: [] }])}><Plus size={15} /> Thêm dự án</button>
      </div>
      <div className="grid gap-3">
        {value.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-2 md:grid-cols-3">
              <input className={inputCls} placeholder="Tên dự án" value={item.tenDuAn ?? ''} onChange={e => onChange(updateList(value, index, { tenDuAn: e.target.value }))} />
              <input className={inputCls} placeholder="Thời gian" value={item.thoiGian ?? ''} onChange={e => onChange(updateList(value, index, { thoiGian: e.target.value }))} />
              <input className={inputCls} placeholder="Vị trí" value={item.viTri ?? ''} onChange={e => onChange(updateList(value, index, { viTri: e.target.value }))} />
            </div>
            <textarea className={textareaCls} placeholder="Mô tả dự án" value={item.moTa ?? ''} onChange={e => onChange(updateList(value, index, { moTa: e.target.value }))} />
            <textarea className={textareaCls} placeholder="Trách nhiệm, mỗi dòng một ý" value={joinLines(item.trachNhiem)} onChange={e => onChange(updateList(value, index, { trachNhiem: splitLines(e.target.value) }))} />
            <div className="grid gap-2 md:grid-cols-3">
              <input className={inputCls} placeholder="OS" value={item.heDieuHanh ?? ''} onChange={e => onChange(updateList(value, index, { heDieuHanh: e.target.value }))} />
              <input className={inputCls} placeholder="Ngôn ngữ" value={item.ngonNgu ?? ''} onChange={e => onChange(updateList(value, index, { ngonNgu: e.target.value }))} />
              <input className={inputCls} placeholder="Framework" value={item.framework ?? ''} onChange={e => onChange(updateList(value, index, { framework: e.target.value }))} />
              <input className={inputCls} placeholder="Kỹ thuật" value={item.kyThuat ?? ''} onChange={e => onChange(updateList(value, index, { kyThuat: e.target.value }))} />
              <input className={inputCls} placeholder="Địa điểm" value={item.diaDiem ?? ''} onChange={e => onChange(updateList(value, index, { diaDiem: e.target.value }))} />
              <button type="button" className="min-h-11 rounded-xl border border-rose-200 bg-white px-3 text-sm font-black text-rose-600" onClick={() => onChange(value.filter((_, i) => i !== index))}>Xóa dự án</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Preview({ cv, data }: { cv: CvData; data: any }) {
  const hoTen = cv.hoTenHienThi || data.current?.hoTen || 'Ứng viên IT'
  const title = cv.chucDanh || data.ungVien?.viTriMongMuon || 'Software Developer'
  const experiences = cv.kinhNghiemLam.length ? cv.kinhNghiemLam : [{ tieuDe: title, donVi: '', thoiGian: '', moTa: '' }]
  const projects: ProjectDetail[] = cv.duAnChiTiet.length
    ? cv.duAnChiTiet
    : cv.duAn.map(item => ({ tenDuAn: item.tieuDe, moTa: item.moTa, viTri: item.donVi, thoiGian: item.thoiGian }))

  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white px-8 py-8 text-[#1a1a1a] shadow-[0_28px_80px_rgba(15,23,42,.16)] lg:px-12 lg:py-10" style={{ minHeight: '297mm', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <h1 className="text-4xl font-black uppercase tracking-wide text-black">{hoTen}</h1>
      <p className="mt-1 text-base font-black uppercase tracking-wide text-black">{title}</p>

      <section className="mt-5 flex flex-col gap-5 sm:flex-row">
        <div className="grid h-[120px] w-[100px] shrink-0 place-items-center overflow-hidden border border-slate-300 bg-slate-100 text-xs font-black text-slate-400">
          {cv.anhDaiDien ? <img src={cv.anhDaiDien} alt={hoTen} className="h-full w-full object-cover" /> : 'PHOTO'}
        </div>
        <div className="text-sm leading-7">
          <p><strong>Full Name:</strong> {hoTen}</p>
          <p><strong>Phone:</strong> {cv.soDienThoai || data.current?.soDienThoai || '-'}</p>
          <p><strong>Email:</strong> {cv.emailLienHe || data.current?.email || '-'}</p>
          <p><strong>Facebook:</strong> {cv.facebook || '-'}</p>
          <p><strong>GitHub:</strong> {cv.github || '-'}</p>
          <p><strong>Portfolio:</strong> {cv.portfolioUrl || '-'}</p>
          <p><strong>Location:</strong> {cv.diaDiem || data.ungVien?.diaChi || '-'}</p>
        </div>
      </section>

      <CvSection title="Experience Summary">
        <ul className="list-disc pl-5 text-sm leading-6">{(cv.tomTatKinhNghiem.length ? cv.tomTatKinhNghiem : [data.ungVien?.tomTat || 'Cập nhật tóm tắt kinh nghiệm để nhà tuyển dụng nắm nhanh năng lực.']).map((item, i) => <li key={i}>{item}</li>)}</ul>
      </CvSection>

      <CvSection title="Skills">
        <p className="font-bold">● Soft Skills</p>
        <ul className="list-disc pl-5 text-sm leading-6">{(cv.kyNangMem.length ? cv.kyNangMem : ['Giao tiếp tốt, chủ động phối hợp đội nhóm.']).map((item, i) => <li key={i}>{item}</li>)}</ul>
        {(cv.kyNangLapTrinh.length ? cv.kyNangLapTrinh : [{ nhom: 'Programming Skills', muc: ['JavaScript, TypeScript, ReactJS, Node.js'] }]).map((group, i) => (
          <div key={i} className="mt-2">
            <p className="font-bold">● {group.nhom}</p>
            <ul className="list-disc pl-5 text-sm leading-6">{(group.muc ?? []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          </div>
        ))}
      </CvSection>

      <CvSection title="Experience">
        {experiences.map((item, i) => <p key={i} className="mb-2 text-sm leading-6"><strong>{item.tieuDe}</strong> {item.donVi} {item.thoiGian} <br />{item.moTa}</p>)}
      </CvSection>

      <CvSection title="Education">
        {cv.hocVan.map((item, i) => <p key={i} className="text-sm leading-6"><strong>{item.tieuDe}</strong> {item.donVi} {item.thoiGian} {item.moTa}</p>)}
      </CvSection>

      {cv.baiVietKyThuat.length > 0 && (
        <CvSection title="Blog / Technical Writing">
          <ul className="list-disc pl-5 text-sm leading-6">{cv.baiVietKyThuat.map((item, i) => <li key={i}>{item.nhan} {item.url}</li>)}</ul>
        </CvSection>
      )}

      <CvSection title="Experience by Projects">
        {projects.map((item, i) => (
          <div key={i} className="mb-6 break-inside-avoid">
            <h3 className="border-b-2 border-black pb-1 text-sm font-bold italic">Project Name: {item.tenDuAn}</h3>
            <InfoGrid rows={[
              ['Duration', item.thoiGian],
              ['Position', item.viTri],
              ['Description', item.moTa],
            ]} />
            {!!item.trachNhiem?.length && <InfoGrid rows={[['Responsibilities', <ul className="list-disc pl-5">{item.trachNhiem.map((r, idx) => <li key={idx}>{r}</li>)}</ul>]]} />}
            <InfoGrid rows={[
              ['OS', item.heDieuHanh],
              ['Languages', item.ngonNgu],
              ['Framework', item.framework],
              ['Techniques', item.kyThuat],
              ['Work Location', item.diaDiem],
            ]} />
          </div>
        ))}
      </CvSection>
    </div>
  )
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-6 break-inside-avoid"><h2 className="mb-2 text-lg font-black uppercase tracking-wide text-black">{title}</h2>{children}</section>
}

function InfoGrid({ rows }: { rows: [string, ReactNode][] }) {
  return <div className="mt-3 grid grid-cols-[120px_1fr] gap-x-4 gap-y-1 text-sm leading-6">{rows.filter(([, value]) => Boolean(value)).map(([label, value]) => <><span key={`${label}-l`} className="font-bold">{label}</span><span key={`${label}-v`}>: {value}</span></>)}</div>
}

export default function CvStudio({ data, onReload }: { data: any; onReload: () => Promise<void> }) {
  const [cv, setCv] = useState<CvData>(emptyCv)
  const [dangLuu, setDangLuu] = useState(false)
  const current = data.current ?? {}
  const ungVien = data.ungVien ?? {}
  const progress = useMemo(() => {
    const fields = [cv.tieuDe, cv.hoTenHienThi || current.hoTen, cv.chucDanh || ungVien.viTriMongMuon, cv.emailLienHe || current.email, cv.soDienThoai || current.soDienThoai, cv.tomTatKinhNghiem.length, cv.kyNangLapTrinh.length, cv.duAnChiTiet.length || cv.duAn.length]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [cv, current, ungVien])

  useEffect(() => {
    const main = data.hoSo?.find((item: any) => item.cvChinh) ?? data.hoSo?.[0]
    const base = {
      ...emptyCv,
      hoTenHienThi: current.hoTen,
      chucDanh: ungVien.viTriMongMuon,
      soDienThoai: current.soDienThoai,
      emailLienHe: current.email,
      diaDiem: ungVien.diaChi,
      tomTatKinhNghiem: ungVien.tomTat ? [ungVien.tomTat] : emptyCv.tomTatKinhNghiem,
    }
    setCv(main ? { ...base, ...main } : base)
  }, [data.hoSo?.length, ungVien?.id])

  function docAnh(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Vui lòng chọn file ảnh hợp lệ.')
    const reader = new FileReader()
    reader.onload = () => setCv(value => ({ ...value, anhDaiDien: String(reader.result ?? '') }))
    reader.readAsDataURL(file)
  }

  function docFileCv(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCv(value => ({ ...value, fileCvTen: file.name, fileCvLoai: file.type || 'application/octet-stream', fileCvData: String(reader.result ?? '') }))
    reader.readAsDataURL(file)
  }

  function goiYAi() {
    const chucDanh = cv.chucDanh || 'Fullstack Developer'
    setCv(value => ({
      ...value,
      tomTatKinhNghiem: value.tomTatKinhNghiem.length ? value.tomTatKinhNghiem : [
        `${chucDanh} tập trung xây dựng sản phẩm web có kiến trúc rõ ràng, responsive tốt và trải nghiệm người dùng mượt.`,
        'Có kinh nghiệm làm việc với frontend hiện đại, backend API, xác thực người dùng và tối ưu dữ liệu.',
        'Ưu tiên code dễ bảo trì, quy trình Git rõ ràng và phối hợp tốt với team sản phẩm.',
      ],
      kyNangMem: value.kyNangMem.length ? value.kyNangMem : ['Giao tiếp rõ ràng, chủ động phối hợp đội nhóm.', 'Tư duy logic, học nhanh công nghệ mới.', 'Làm việc có kế hoạch và chịu áp lực tốt.'],
      kyNangLapTrinh: value.kyNangLapTrinh.length ? value.kyNangLapTrinh : [
        { nhom: 'Frontend', muc: ['JavaScript, TypeScript, HTML, CSS.', 'ReactJS, NextJS, responsive UI, component architecture.'] },
        { nhom: 'Backend', muc: ['Node.js, RESTful API, authentication & authorization.', 'Database design, role-based access control.'] },
        { nhom: 'Tools', muc: ['Git, GitHub, deployment, VPS/hosting/domain.'] },
      ],
      duAnChiTiet: value.duAnChiTiet.length ? value.duAnChiTiet : [
        {
          tenDuAn: 'ITJob Recruitment Platform',
          thoiGian: '2025 - nay',
          viTri: chucDanh,
          moTa: 'Hệ thống tuyển dụng CNTT cho ứng viên, nhà tuyển dụng và quản trị viên.',
          trachNhiem: ['Xây dựng dashboard theo vai trò.', 'Thiết kế luồng ứng tuyển, CV, portfolio và lịch phỏng vấn.', 'Tối ưu responsive và trải nghiệm người dùng.'],
          heDieuHanh: 'Windows, Linux',
          ngonNgu: 'TypeScript, JavaScript',
          framework: 'ReactJS, Node.js, Express, MongoDB',
          kyThuat: 'RESTful API, JWT, RBAC, Tailwind CSS',
          diaDiem: 'Đà Nẵng, Việt Nam',
        },
      ],
    }))
    toast.success('Đã gợi ý nội dung CV IT.')
  }

  async function luuStudio() {
    if (!data.ungVien?.id) return toast.error('Không tìm thấy thông tin ứng viên.')
    if (!cv.tieuDe.trim()) return toast.warning('Vui lòng nhập tiêu đề CV.')
    try {
      setDangLuu(true)
      const payload = { ...cv, maUngVien: data.ungVien.id }
      await apiCoXacThuc(`/hosonangluc${cv.id ? `/${cv.id}` : ''}`, { method: cv.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      toast.success('Đã lưu CV Studio.')
      await onReload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu CV.')
    } finally {
      setDangLuu(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_46px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5c91]">CV Studio</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Tạo CV IT theo chuẩn A4</h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">Nhập đủ thông tin như mẫu CV trong `index.html`: thông tin cá nhân, summary, kỹ năng, học vấn, bài viết kỹ thuật và kinh nghiệm theo dự án.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryBtn} onClick={() => document.getElementById('cv-photo-upload')?.click()}><ImagePlus size={16} /> Upload ảnh</button>
          <button type="button" className={secondaryBtn} onClick={() => document.getElementById('cv-file-upload')?.click()}><FileUp size={16} /> Upload CV gốc</button>
          <button type="button" className={secondaryBtn} onClick={goiYAi}><Brain size={16} /> Gợi ý nội dung</button>
          <button type="button" className={primaryBtn} disabled={dangLuu} onClick={luuStudio}><Save size={16} /> {dangLuu ? 'Đang lưu...' : 'Lưu CV'}</button>
          <input id="cv-photo-upload" hidden type="file" accept="image/*" onChange={e => docAnh(e.target.files?.[0])} />
          <input id="cv-file-upload" hidden type="file" accept=".pdf,.doc,.docx,.txt,.md,application/pdf" onChange={e => docFileCv(e.target.files?.[0])} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
        <div className="grid max-h-none gap-4 xl:max-h-[calc(100dvh-180px)] xl:overflow-y-auto xl:pr-2">
          <div className={panelCls}>
            <SectionTitle title="Thông tin cá nhân" desc={`Độ hoàn thiện CV: ${progress}%${cv.fileCvTen ? ` - đã upload ${cv.fileCvTen}` : ''}`} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className={inputCls} placeholder="Họ tên hiển thị" value={cv.hoTenHienThi ?? ''} onChange={e => setCv({ ...cv, hoTenHienThi: e.target.value })} />
              <input className={inputCls} placeholder="Chức danh" value={cv.chucDanh ?? ''} onChange={e => setCv({ ...cv, chucDanh: e.target.value })} />
              <input className={inputCls} placeholder="Tiêu đề CV" value={cv.tieuDe} onChange={e => setCv({ ...cv, tieuDe: e.target.value })} />
              <input className={inputCls} placeholder="Số điện thoại" value={cv.soDienThoai ?? ''} onChange={e => setCv({ ...cv, soDienThoai: e.target.value })} />
              <input className={inputCls} placeholder="Email" value={cv.emailLienHe ?? ''} onChange={e => setCv({ ...cv, emailLienHe: e.target.value })} />
              <input className={inputCls} placeholder="Facebook" value={cv.facebook ?? ''} onChange={e => setCv({ ...cv, facebook: e.target.value })} />
              <input className={inputCls} placeholder="GitHub" value={cv.github ?? ''} onChange={e => setCv({ ...cv, github: e.target.value })} />
              <input className={inputCls} placeholder="Portfolio" value={cv.portfolioUrl ?? ''} onChange={e => setCv({ ...cv, portfolioUrl: e.target.value })} />
              <input className={inputCls} placeholder="Địa điểm" value={cv.diaDiem ?? ''} onChange={e => setCv({ ...cv, diaDiem: e.target.value })} />
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={cv.cvChinh} onChange={e => setCv({ ...cv, cvChinh: e.target.checked })} /> CV chính</label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={cv.congKhai} onChange={e => setCv({ ...cv, congKhai: e.target.checked })} /> Công khai</label>
              </div>
            </div>
          </div>

          <CvTextList title="Experience Summary" value={cv.tomTatKinhNghiem} onChange={v => setCv({ ...cv, tomTatKinhNghiem: v })} placeholder="Full-stack Web Developer focusing on building scalable web products..." />
          <CvTextList title="Soft Skills" value={cv.kyNangMem} onChange={v => setCv({ ...cv, kyNangMem: v })} placeholder="Excellent communication, teamwork, fast learning..." />
          <SkillEditor value={cv.kyNangLapTrinh} onChange={v => setCv({ ...cv, kyNangLapTrinh: v })} />
          <BasicItemsEditor title="Kinh nghiệm làm việc" value={cv.kinhNghiemLam} onChange={v => setCv({ ...cv, kinhNghiemLam: v })} />
          <BasicItemsEditor title="Học vấn" value={cv.hocVan} onChange={v => setCv({ ...cv, hocVan: v })} />
          <BasicItemsEditor title="Chứng chỉ" value={cv.chungChi} onChange={v => setCv({ ...cv, chungChi: v })} />
          <ProjectEditor value={cv.duAnChiTiet} onChange={v => setCv({ ...cv, duAnChiTiet: v })} />
        </div>

        <div className="min-w-0 xl:sticky xl:top-4 xl:max-h-[calc(100dvh-150px)] xl:overflow-auto">
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">Preview A4 - linh hoạt theo nội dung</div>
          <Preview cv={cv} data={data} />
        </div>
      </div>
    </section>
  )
}
