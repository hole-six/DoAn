import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Brain, Download, Eye, FileUp, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react'
import { apiCoXacThuc, apiUploadCoXacThuc } from '../../lib/auth'
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
const textareaCls = 'min-h-24 w-full resize-y whitespace-pre-wrap rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition [overflow-wrap:anywhere] [word-break:break-all] placeholder:text-slate-400 focus:border-[#0b5c91] focus:ring-4 focus:ring-[#0b5c91]/10'
const panelCls = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
const primaryBtn = 'btn-primary-uv'
const secondaryBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-[#0b5c91]/30 hover:text-[#0b5c91]'
const smallBtn = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-black text-slate-700 transition hover:border-[#0b5c91]/30 hover:text-[#0b5c91] disabled:cursor-not-allowed disabled:opacity-60'
const textareaWrapStyle = {
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  wordBreak: 'break-all',
  overflowX: 'hidden',
} as const
const SOFT_BREAK = '\u200B'

function removeSoftBreaks(value: string) {
  return value.replaceAll(SOFT_BREAK, '')
}

function addSoftBreaks(value: string, chunkSize = 28) {
  let result = ''
  let run = 0
  for (const char of removeSoftBreaks(value)) {
    result += char
    if (/\s/.test(char)) {
      run = 0
      continue
    }
    run += 1
    if (run >= chunkSize) {
      result += SOFT_BREAK
      run = 0
    }
  }
  return result
}

function splitEditableLines(value?: string) {
  return (value ?? '').split('\n')
}

function joinLines(value?: string[]) {
  return (value ?? []).join('\n')
}

function updateList<T>(list: T[], index: number, patch: Partial<T>) {
  return list.map((item, i) => i === index ? { ...item, ...patch } : item)
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? removeSoftBreaks(value).trim() : ''
}

function cleanTextList(value?: string[]) {
  return (value ?? []).map(cleanText).filter(Boolean)
}

function cleanBasicItems(value?: CvItem[]) {
  return (value ?? [])
    .map(item => ({
      tieuDe: cleanText(item.tieuDe),
      donVi: cleanText(item.donVi),
      thoiGian: cleanText(item.thoiGian),
      moTa: cleanText(item.moTa),
    }))
    .filter(item => Object.values(item).some(Boolean))
}

function cleanSkillGroups(value?: SkillGroup[]) {
  return (value ?? [])
    .map(group => ({ nhom: cleanText(group.nhom), muc: cleanTextList(group.muc) }))
    .filter(group => group.nhom || group.muc.length)
}

function cleanProjects(value?: ProjectDetail[]) {
  return (value ?? [])
    .map(project => ({
      ...project,
      tenDuAn: cleanText(project.tenDuAn),
      thoiGian: cleanText(project.thoiGian),
      viTri: cleanText(project.viTri),
      moTa: cleanText(project.moTa),
      trachNhiem: cleanTextList(project.trachNhiem),
      heDieuHanh: cleanText(project.heDieuHanh),
      ngonNgu: cleanText(project.ngonNgu),
      framework: cleanText(project.framework),
      kyThuat: cleanText(project.kyThuat),
      diaDiem: cleanText(project.diaDiem),
      lienKet: (project.lienKet ?? []).map(link => ({ nhan: cleanText(link.nhan), url: cleanText(link.url) })).filter(link => link.nhan || link.url),
    }))
    .filter(project => [
      project.tenDuAn,
      project.thoiGian,
      project.viTri,
      project.moTa,
      project.heDieuHanh,
      project.ngonNgu,
      project.framework,
      project.kyThuat,
      project.diaDiem,
      project.trachNhiem.length,
      project.lienKet.length,
    ].some(Boolean))
}

function cleanLinks(value?: LinkItem[]) {
  return (value ?? []).map(link => ({ nhan: cleanText(link.nhan), url: cleanText(link.url) })).filter(link => link.nhan || link.url)
}

function compactCv(cv: CvData): CvData {
  return {
    ...cv,
    tieuDe: cleanText(cv.tieuDe),
    hoTenHienThi: cleanText(cv.hoTenHienThi),
    chucDanh: cleanText(cv.chucDanh),
    soDienThoai: cleanText(cv.soDienThoai),
    emailLienHe: cleanText(cv.emailLienHe),
    facebook: cleanText(cv.facebook),
    github: cleanText(cv.github),
    portfolioUrl: cleanText(cv.portfolioUrl),
    diaDiem: cleanText(cv.diaDiem),
    tomTatKinhNghiem: cleanTextList(cv.tomTatKinhNghiem),
    kyNangMem: cleanTextList(cv.kyNangMem),
    kyNangLapTrinh: cleanSkillGroups(cv.kyNangLapTrinh),
    hocVan: cleanBasicItems(cv.hocVan),
    kinhNghiemLam: cleanBasicItems(cv.kinhNghiemLam),
    chungChi: cleanBasicItems(cv.chungChi),
    duAn: cleanBasicItems(cv.duAn),
    baiVietKyThuat: cleanLinks(cv.baiVietKyThuat),
    duAnChiTiet: cleanProjects(cv.duAnChiTiet),
  }
}

function laDataUrl(value?: string) {
  return Boolean(value?.startsWith('data:'))
}

function duoiTepTuMime(mime: string) {
  if (mime === 'image/png') return '.png'
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'application/pdf') return '.pdf'
  if (mime === 'application/msword') return '.doc'
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
  if (mime === 'text/markdown') return '.md'
  if (mime === 'text/plain') return '.txt'
  return ''
}

function tenTepDayDu(tenTep: string, mime: string) {
  if (/\.[a-z0-9]+$/i.test(tenTep)) return tenTep
  return `${tenTep}${duoiTepTuMime(mime)}`
}

async function dataUrlThanhFile(dataUrl: string, tenTep: string, mimeFallback = 'application/octet-stream') {
  const mime = dataUrl.match(/^data:([^;,]+)/)?.[1] || mimeFallback
  const phanHoi = await fetch(dataUrl)
  const blob = await phanHoi.blob()
  return new File([blob], tenTepDayDu(tenTep || 'cv-file', blob.type || mime), { type: blob.type || mime })
}

async function taiLenTaiSanCv(path: string, tenTruong: string, file: File) {
  const formData = new FormData()
  formData.append(tenTruong, file)
  const ketQua = await apiUploadCoXacThuc(path, formData)
  const url = ketQua.url || ketQua.duongDan
  if (!url) throw new Error('Upload khong tra ve duong dan file')
  return url
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      {desc && <p className="mt-0.5 text-xs font-semibold text-slate-500">{desc}</p>}
    </div>
  )
}

function UncontrolledTextItem({ value, placeholder, onCommit, onEnter }: { value: string; placeholder: string; onCommit: (value: string) => void; onEnter: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const draftRef = useRef(value)

  const commit = (next = draftRef.current) => {
    onCommit(removeSoftBreaks(next))
  }

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(72, el.scrollHeight)}px`
  }

  useEffect(() => {
    const el = ref.current
    if (!el || document.activeElement === el) return
    const formatted = addSoftBreaks(value)
    if (el.value !== formatted) {
      el.value = formatted
      draftRef.current = value
      resize()
    }
  }, [value])

  useEffect(() => () => {
    onCommit(draftRef.current)
  }, [])

  return (
    <textarea
        ref={ref}
        defaultValue={addSoftBreaks(value)}
        rows={2}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={placeholder}
        className={textareaCls}
        style={textareaWrapStyle}
        wrap="soft"
        onFocus={resize}
        onInput={event => {
          const el = event.currentTarget
          const caret = el.selectionStart ?? el.value.length
          const cleanBeforeCaret = removeSoftBreaks(el.value.slice(0, caret))
          const cleanValue = removeSoftBreaks(el.value)
          const formatted = addSoftBreaks(cleanValue)
          draftRef.current = cleanValue
          if (formatted !== el.value) {
            const nextCaret = addSoftBreaks(cleanBeforeCaret).length
            el.value = formatted
            el.setSelectionRange(nextCaret, nextCaret)
          }
          resize()
        }}
        onBlur={() => {
          commit()
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            const next = removeSoftBreaks(event.currentTarget.value)
            draftRef.current = next
            commit(next)
            onEnter(next)
          }
        }}
      />
  )
}

function CvTextList({ title, value, onChange, placeholder }: { title: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const rows = value.length ? value : ['']
  const changeRow = (index: number, next: string) => onChange(rows.map((item, i) => i === index ? next : item))
  const addRow = (afterIndex?: number) => {
    const insertAt = typeof afterIndex === 'number' ? afterIndex + 1 : rows.length
    onChange([...rows.slice(0, insertAt), '', ...rows.slice(insertAt)])
  }
  const commitAndAddRow = (index: number, next: string) => {
    const nextRows = rows.map((item, i) => i === index ? next : item)
    onChange([...nextRows.slice(0, index + 1), '', ...nextRows.slice(index + 1)])
  }
  const removeRow = (index: number) => onChange(rows.length === 1 ? [''] : rows.filter((_, i) => i !== index))
  return (
    <div className={panelCls}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <SectionTitle title={title} desc="Mỗi ô là một ý riêng trong CV. Enter để thêm ý mới." />
        <button type="button" className={secondaryBtn} onClick={() => addRow()}><Plus size={15} /> Thêm ý</button>
      </div>
      <div className="grid gap-2">
        {rows.map((item, index) => (
          <div key={index} className="grid grid-cols-[28px_minmax(0,1fr)_44px] items-start gap-2">
            <span className="mt-3 text-right text-xs font-black text-slate-400">{index + 1}</span>
            <UncontrolledTextItem
              key={`${title}-${index}`}
              value={item}
              placeholder={index === 0 ? placeholder : 'Nhập ý tiếp theo...'}
              onCommit={next => changeRow(index, next)}
              onEnter={next => commitAndAddRow(index, next)}
            />
            <button type="button" className="mt-1 grid h-11 w-11 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600 disabled:opacity-40" disabled={rows.length === 1 && !item} onMouseDown={event => event.preventDefault()} onClick={() => removeRow(index)}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
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
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600" onMouseDown={event => event.preventDefault()} onClick={() => onChange(value.filter((_, i) => i !== index))}>
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
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600" onMouseDown={event => event.preventDefault()} onClick={() => onChange(value.filter((_, i) => i !== index))}>
                <Trash2 size={15} />
              </button>
            </div>
            <textarea className={textareaCls} style={textareaWrapStyle} wrap="soft" placeholder="Mỗi dòng là một kỹ năng: ReactJS, NextJS, TypeScript..." value={joinLines(item.muc)} onChange={e => onChange(updateList(value, index, { muc: splitEditableLines(e.target.value) }))} />
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
            <textarea className={textareaCls} style={textareaWrapStyle} wrap="soft" placeholder="Mô tả dự án" value={item.moTa ?? ''} onChange={e => onChange(updateList(value, index, { moTa: e.target.value }))} />
            <textarea className={textareaCls} style={textareaWrapStyle} wrap="soft" placeholder="Trách nhiệm, mỗi dòng một ý" value={joinLines(item.trachNhiem)} onChange={e => onChange(updateList(value, index, { trachNhiem: splitEditableLines(e.target.value) }))} />
            <div className="grid gap-2 md:grid-cols-3">
              <input className={inputCls} placeholder="OS" value={item.heDieuHanh ?? ''} onChange={e => onChange(updateList(value, index, { heDieuHanh: e.target.value }))} />
              <input className={inputCls} placeholder="Ngôn ngữ" value={item.ngonNgu ?? ''} onChange={e => onChange(updateList(value, index, { ngonNgu: e.target.value }))} />
              <input className={inputCls} placeholder="Framework" value={item.framework ?? ''} onChange={e => onChange(updateList(value, index, { framework: e.target.value }))} />
              <input className={inputCls} placeholder="Kỹ thuật" value={item.kyThuat ?? ''} onChange={e => onChange(updateList(value, index, { kyThuat: e.target.value }))} />
              <input className={inputCls} placeholder="Địa điểm" value={item.diaDiem ?? ''} onChange={e => onChange(updateList(value, index, { diaDiem: e.target.value }))} />
              <button type="button" className="min-h-11 rounded-xl border border-rose-200 bg-white px-3 text-sm font-black text-rose-600" onMouseDown={event => event.preventDefault()} onClick={() => onChange(value.filter((_, i) => i !== index))}>Xóa dự án</button>
            </div>
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle title="Minh chứng dự án" desc="URL website, demo, GitHub, case study hoặc tài liệu public." />
                <button type="button" className={secondaryBtn} onClick={() => onChange(updateList(value, index, { lienKet: [...(item.lienKet ?? []), { nhan: '', url: '' }] }))}><Plus size={15} /> Thêm link</button>
              </div>
              {(item.lienKet?.length ? item.lienKet : [{ nhan: 'Website/Demo', url: '' }]).map((link, linkIndex) => (
                <div key={linkIndex} className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_44px]">
                  <input className={inputCls} placeholder="Nhãn, VD: Demo" value={link.nhan ?? ''} onChange={e => {
                    const links = item.lienKet?.length ? item.lienKet : [{ nhan: 'Website/Demo', url: '' }]
                    onChange(updateList(value, index, { lienKet: updateList(links, linkIndex, { nhan: e.target.value }) }))
                  }} />
                  <input className={inputCls} placeholder="https://..." value={link.url ?? ''} onChange={e => {
                    const links = item.lienKet?.length ? item.lienKet : [{ nhan: 'Website/Demo', url: '' }]
                    onChange(updateList(value, index, { lienKet: updateList(links, linkIndex, { url: e.target.value }) }))
                  }} />
                  <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-rose-200 bg-white text-rose-600 disabled:opacity-40" disabled={!item.lienKet?.length} onMouseDown={event => event.preventDefault()} onClick={() => onChange(updateList(value, index, { lienKet: (item.lienKet ?? []).filter((_, i) => i !== linkIndex) }))}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Preview({ cv }: { cv: CvData; data: any }) {
  const cleanCv = compactCv(cv)
  const hoTen = cleanCv.hoTenHienThi
  const title = cleanCv.chucDanh
  const experiences = cleanCv.kinhNghiemLam
  const projects: ProjectDetail[] = cleanCv.duAnChiTiet.length
    ? cleanCv.duAnChiTiet
    : cleanCv.duAn.map(item => ({ tenDuAn: item.tieuDe, moTa: item.moTa, viTri: item.donVi, thoiGian: item.thoiGian }))
  const personalRows = [
    ['Full Name', hoTen],
    ['Phone', cleanCv.soDienThoai],
    ['Email', cleanCv.emailLienHe],
    ['Facebook', cleanCv.facebook],
    ['GitHub', cleanCv.github],
    ['Portfolio', cleanCv.portfolioUrl],
    ['Location', cleanCv.diaDiem],
  ].filter(([, value]) => Boolean(value))
  const hasSkills = cleanCv.kyNangMem.length > 0 || cleanCv.kyNangLapTrinh.length > 0

  return (
    <div className="cv-a4-preview mx-auto w-full max-w-[210mm] bg-white text-[#111827] shadow-[0_28px_80px_rgba(15,23,42,.16)]" style={{ minHeight: '297mm', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <header className="cv-header">
        <div className="min-w-0">
          {hoTen && <h1>{hoTen}</h1>}
          {title && <p className="cv-role">{title}</p>}
        </div>
      </header>

      {(cleanCv.anhDaiDien || personalRows.length > 0) && (
        <section className="cv-profile-row">
          {cleanCv.anhDaiDien && (
            <div className="cv-photo" style={{ backgroundImage: `url(${cleanCv.anhDaiDien})` }} aria-label={hoTen || 'Candidate'} role="img">
            </div>
          )}
          {personalRows.length > 0 && (
            <div className="cv-contact-grid">
              {personalRows.map(([label, value]) => <p key={label}><strong>{label}:</strong> {value}</p>)}
            </div>
          )}
        </section>
      )}

      {cleanCv.tomTatKinhNghiem.length > 0 && (
        <CvSection title="Experience Summary">
          <ul className="cv-list">{cleanCv.tomTatKinhNghiem.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </CvSection>
      )}

      {hasSkills && (
        <CvSection title="Skills">
          {cleanCv.kyNangMem.length > 0 && (
            <>
              <p className="cv-subtitle">Soft Skills</p>
              <ul className="cv-list">{cleanCv.kyNangMem.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </>
          )}
          {cleanCv.kyNangLapTrinh.map((group, i) => (
            <div key={i} className="mt-2">
              {group.nhom && <p className="cv-subtitle">{group.nhom}</p>}
              {(group.muc ?? []).length > 0 && <ul className="cv-list">{(group.muc ?? []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>}
            </div>
          ))}
        </CvSection>
      )}

      {experiences.length > 0 && (
        <CvSection title="Experience">
          {experiences.map((item, i) => <p key={i} className="cv-paragraph">{item.tieuDe && <strong>{item.tieuDe}</strong>} {[item.donVi, item.thoiGian].filter(Boolean).join(' - ')}{item.moTa && <><br />{item.moTa}</>}</p>)}
        </CvSection>
      )}

      {cleanCv.hocVan.length > 0 && (
        <CvSection title="Education">
          {cleanCv.hocVan.map((item, i) => <p key={i} className="cv-paragraph">{item.tieuDe && <strong>{item.tieuDe}</strong>} {[item.donVi, item.thoiGian, item.moTa].filter(Boolean).join(' - ')}</p>)}
        </CvSection>
      )}

      {cleanCv.baiVietKyThuat.length > 0 && (
        <CvSection title="Blog / Technical Writing">
          <ul className="cv-list">{cleanCv.baiVietKyThuat.map((item, i) => <li key={i}>{[item.nhan, item.url].filter(Boolean).join(' - ')}</li>)}</ul>
        </CvSection>
      )}

      {projects.length > 0 && (
        <CvSection title="Experience by Projects">
          {projects.map((item, i) => (
            <div key={i} className="cv-project">
              {item.tenDuAn && <h3>Project Name: {item.tenDuAn}</h3>}
              <InfoGrid rows={[
                ['Duration', item.thoiGian],
                ['Position', item.viTri],
                ['Description', item.moTa],
              ]} />
              {!!item.trachNhiem?.length && <InfoGrid rows={[['Responsibilities', <ul className="cv-list">{item.trachNhiem.map((r, idx) => <li key={idx}>{r}</li>)}</ul>]]} />}
              <InfoGrid rows={[
                ['OS', item.heDieuHanh],
                ['Languages', item.ngonNgu],
                ['Framework', item.framework],
                ['Techniques', item.kyThuat],
                ['Work Location', item.diaDiem],
                ['Links', item.lienKet?.length ? <span>{item.lienKet.map(link => [link.nhan, link.url].filter(Boolean).join(': ')).join(' | ')}</span> : undefined],
              ]} />
            </div>
          ))}
        </CvSection>
      )}
    </div>
  )
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="cv-section break-inside-avoid"><h2>{title}</h2>{children}</section>
}

function InfoGrid({ rows }: { rows: [string, ReactNode][] }) {
  const visibleRows = rows.filter(([, value]) => Boolean(value))
  if (!visibleRows.length) return null
  return <div className="cv-info-grid">{visibleRows.flatMap(([label, value]) => [<span key={`${label}-l`} className="cv-info-label">{label}</span>, <span key={`${label}-v`} className="min-w-0">: {value}</span>])}</div>
}

export default function CvStudio({ data, onReload }: { data: any; onReload: () => Promise<void> }) {
  const [cv, setCv] = useState<CvData>(emptyCv)
  const [dangLuu, setDangLuu] = useState(false)
  const [cvDangIn, setCvDangIn] = useState<CvData | null>(null)
  const [cvDangXoa, setCvDangXoa] = useState('')
  const [cvDaXoa, setCvDaXoa] = useState<string[]>([])
  const [coThayDoiChuaLuu, setCoThayDoiChuaLuu] = useState(false)
  const [dangTaiAnhCv, setDangTaiAnhCv] = useState(false)
  const [dangTaiFileCv, setDangTaiFileCv] = useState(false)
  const current = data.current ?? {}
  const ungVien = data.ungVien ?? {}
  const danhSachCvDaLuu = useMemo(
    () => (data.hoSo ?? []).filter((item: CvData) => !item.id || !cvDaXoa.includes(item.id)),
    [data.hoSo, cvDaXoa],
  )
  const progress = useMemo(() => {
    const fields = [cv.tieuDe, cv.hoTenHienThi || current.hoTen, cv.chucDanh || ungVien.viTriMongMuon, cv.emailLienHe || current.email, cv.soDienThoai || current.soDienThoai, cv.tomTatKinhNghiem.length, cv.kyNangLapTrinh.length, cv.duAnChiTiet.length || cv.duAn.length]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [cv, current, ungVien])
  const cvDaDuocLuu = Boolean(cv.id)
  const coNoiDungDeIn = Boolean(compactCv(cv).tieuDe || compactCv(cv).hoTenHienThi || compactCv(cv).chucDanh || compactCv(cv).tomTatKinhNghiem.length || compactCv(cv).duAnChiTiet.length)

  function capNhatCv(next: CvData | ((currentCv: CvData) => CvData)) {
    setCoThayDoiChuaLuu(true)
    setCv(currentCv => typeof next === 'function' ? next(currentCv) : next)
  }

  function xacNhanBoQuaNhap() {
    if (!coThayDoiChuaLuu) return true
    return window.confirm('CV hiện tại có thay đổi chưa lưu. Bạn muốn bỏ qua thay đổi này?')
  }

  useEffect(() => {
    if (coThayDoiChuaLuu) return
    const base = {
      ...emptyCv,
      hoTenHienThi: current.hoTen,
      chucDanh: ungVien.viTriMongMuon,
      soDienThoai: current.soDienThoai,
      emailLienHe: current.email,
      diaDiem: ungVien.diaChi,
      tomTatKinhNghiem: ungVien.tomTat ? [ungVien.tomTat] : emptyCv.tomTatKinhNghiem,
    }
    setCv(previous => {
      const selected = previous.id ? danhSachCvDaLuu.find((item: any) => item.id === previous.id) : undefined
      const main = selected ?? danhSachCvDaLuu.find((item: any) => item.cvChinh) ?? danhSachCvDaLuu[0]
      return main ? { ...base, ...main } : base
    })
  }, [coThayDoiChuaLuu, danhSachCvDaLuu, current.hoTen, current.email, current.soDienThoai, ungVien?.id, ungVien?.viTriMongMuon, ungVien?.diaChi, ungVien?.tomTat])

  async function docAnh(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Vui lòng chọn file ảnh hợp lệ.')
    if (file.size > 3 * 1024 * 1024) return toast.warning('Ảnh CV nên nhỏ hơn 3MB.')
    try {
      setDangTaiAnhCv(true)
      const url = await taiLenTaiSanCv('/hosonangluc/upload-anh', 'anh', file)
      capNhatCv(value => ({ ...value, anhDaiDien: url }))
      toast.success('Đã upload ảnh CV.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không upload được ảnh CV.')
    } finally {
      setDangTaiAnhCv(false)
    }
  }

  async function docFileCv(file?: File) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.warning('File CV gốc nên nhỏ hơn 10MB.')
    try {
      setDangTaiFileCv(true)
      const url = await taiLenTaiSanCv('/hosonangluc/upload-file', 'tep', file)
      capNhatCv(value => ({ ...value, fileCvTen: file.name, fileCvLoai: file.type || 'application/octet-stream', fileCvData: url }))
      toast.success('Đã upload file CV gốc.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không upload được file CV gốc.')
    } finally {
      setDangTaiFileCv(false)
    }
  }

  function xoaAnhCv() {
    capNhatCv(value => ({ ...value, anhDaiDien: undefined }))
  }

  function xoaFileCvGoc() {
    capNhatCv(value => ({ ...value, fileCvTen: undefined, fileCvLoai: undefined, fileCvData: undefined }))
  }

  function taiFileCvGoc() {
    if (!cv.fileCvData) return toast.warning('CV này chưa có file gốc để tải.')
    const link = document.createElement('a')
    link.href = cv.fileCvData
    link.download = cv.fileCvTen || 'cv-goc'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async function chuanHoaTaiSanCvTruocKhiLuu(source: CvData) {
    let next = { ...source }

    if (laDataUrl(next.anhDaiDien)) {
      const fileAnh = await dataUrlThanhFile(next.anhDaiDien as string, 'anh-cv', 'image/png')
      const urlAnh = await taiLenTaiSanCv('/hosonangluc/upload-anh', 'anh', fileAnh)
      next = { ...next, anhDaiDien: urlAnh }
    }

    if (laDataUrl(next.fileCvData)) {
      const fileCv = await dataUrlThanhFile(next.fileCvData as string, next.fileCvTen || 'cv-goc.pdf', next.fileCvLoai || 'application/pdf')
      const urlCv = await taiLenTaiSanCv('/hosonangluc/upload-file', 'tep', fileCv)
      next = {
        ...next,
        fileCvTen: next.fileCvTen || fileCv.name,
        fileCvLoai: next.fileCvLoai || fileCv.type || 'application/octet-stream',
        fileCvData: urlCv,
      }
    }

    return next
  }

  function goiYAi() {
    const chucDanh = cv.chucDanh || 'Fullstack Developer'
    capNhatCv(value => ({
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
      const cvDaChuanHoa = await chuanHoaTaiSanCvTruocKhiLuu(cv)
      const payload = { ...compactCv(cvDaChuanHoa), maUngVien: data.ungVien.id }
      const saved = await apiCoXacThuc(`/hosonangluc${cv.id ? `/${cv.id}` : ''}`, { method: cv.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setCv({ ...emptyCv, ...compactCv(saved), id: saved.id, maUngVien: saved.maUngVien, cvChinh: Boolean(saved.cvChinh), congKhai: Boolean(saved.congKhai) })
      setCoThayDoiChuaLuu(false)
      toast.success('Đã lưu CV Studio.')
      await onReload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu CV.')
    } finally {
      setDangLuu(false)
    }
  }

  function taoCvTuDaLuu(item: CvData) {
    return { ...emptyCv, ...compactCv(item), id: item.id, maUngVien: item.maUngVien, cvChinh: Boolean(item.cvChinh), congKhai: Boolean(item.congKhai) }
  }

  function xemCvDaLuu(item: CvData) {
    if (!xacNhanBoQuaNhap()) return
    setCv(taoCvTuDaLuu(item))
    setCoThayDoiChuaLuu(false)
  }

  function taiPdfCvDaLuu(item: CvData) {
    flushSync(() => setCv(taoCvTuDaLuu(item)))
    window.requestAnimationFrame(() => taiPdf(item))
  }

  function taoBanNhapMoi(): CvData {
    return {
      ...emptyCv,
      tieuDe: `CV ${data.hoSo?.length ? data.hoSo.length + 1 : 1}`,
      hoTenHienThi: current.hoTen,
      chucDanh: ungVien.viTriMongMuon,
      soDienThoai: current.soDienThoai,
      emailLienHe: current.email,
      diaDiem: ungVien.diaChi,
      cvChinh: !data.hoSo?.length,
      congKhai: true,
    }
  }

  function taoCvMoi() {
    if (!xacNhanBoQuaNhap()) return
    setCv(taoBanNhapMoi())
    setCoThayDoiChuaLuu(false)
  }

  async function xoaCv(item: CvData) {
    if (!item.id || !window.confirm(`Xóa ${item.tieuDe || 'CV này'}?`)) return
    try {
      setCvDangXoa(item.id)
      await apiCoXacThuc(`/hosonangluc/${item.id}`, { method: 'DELETE' })
      setCvDaXoa(value => [...value, item.id as string])
      const conLai = danhSachCvDaLuu.filter((cvItem: CvData) => cvItem.id !== item.id)
      if (cv.id === item.id) {
        const next = conLai.find((cvItem: CvData) => cvItem.cvChinh) ?? conLai[0]
        if (next) setCv(taoCvTuDaLuu(next))
        else setCv(taoBanNhapMoi())
        setCoThayDoiChuaLuu(false)
      }
      toast.success('Đã xóa CV.')
      await onReload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa CV.')
    } finally {
      setCvDangXoa('')
    }
  }

  function taiPdf(source = cv) {
    const printCv = taoCvTuDaLuu(source)
    flushSync(() => setCvDangIn(printCv))
    const cleanup = () => setCvDangIn(null)
    window.addEventListener('afterprint', cleanup, { once: true })
    window.requestAnimationFrame(() => {
      window.print()
      window.setTimeout(cleanup, 5000)
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_46px_rgba(15,23,42,0.08)] sm:p-5">
      <style>{`
        #cv-print-root { display: none; }
        .cv-a4-preview {
          min-height: 297mm;
          padding: 15mm 20mm;
          font-size: 11pt;
          line-height: 1.52;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .cv-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12mm;
        }
        .cv-header h1 {
          margin: 0;
          color: #000;
          font-size: 36pt;
          line-height: 1.08;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .cv-role {
          margin: 1.5mm 0 0;
          color: #111827;
          font-size: 13pt;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .cv-profile-row {
          display: table;
          width: 100%;
          table-layout: fixed;
          margin-top: 5mm;
        }
        .cv-photo {
          display: table-cell;
          width: 38mm;
          height: 48mm;
          vertical-align: top;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          padding-right: 8mm;
        }
        .cv-contact-grid {
          display: table-cell;
          vertical-align: top;
          width: auto;
          gap: 1mm;
          font-size: 11pt;
          line-height: 1.7;
          min-width: 0;
        }
        .cv-contact-grid p {
          display: grid;
          grid-template-columns: 32mm minmax(0, 1fr);
          gap: 2.5mm;
          margin: 0;
        }
        .cv-section {
          margin-top: 6.5mm;
        }
        .cv-section h2 {
          margin: 0 0 2.5mm;
          color: #0f172a;
          font-size: 14pt;
          line-height: 1.15;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0;
        }
        .cv-subtitle {
          margin: 1.5mm 0 1mm;
          font-size: 11pt;
          font-weight: 900;
          color: #111827;
        }
        .cv-list {
          margin: 0;
          padding-left: 5.5mm;
          font-size: 11pt;
          line-height: 1.5;
        }
        .cv-list li {
          margin: 0.6mm 0;
        }
        .cv-paragraph {
          margin: 0 0 2.5mm;
          font-size: 11pt;
          line-height: 1.5;
        }
        .cv-project {
          margin-bottom: 6.5mm;
          break-inside: avoid;
        }
        .cv-project h3 {
          margin: 0 0 2mm;
          padding-bottom: 1mm;
          border-bottom: 1.5px solid #111827;
          font-size: 11.5pt;
          line-height: 1.35;
          font-weight: 900;
          font-style: italic;
          color: #111827;
        }
        .cv-info-grid {
          display: grid;
          grid-template-columns: 35mm minmax(0, 1fr);
          gap: 1.2mm 4mm;
          margin-top: 2mm;
          font-size: 10.5pt;
          line-height: 1.5;
        }
        .cv-info-label {
          font-weight: 900;
          color: #111827;
        }
        @media (max-width: 900px) {
          .cv-a4-preview {
            padding: 15mm 20mm;
          }
          .cv-header h1 {
            font-size: 28pt;
          }
          .cv-profile-row {
            display: block;
          }
          .cv-photo,
          .cv-contact-grid {
            width: 100%;
            display: block;
          }
          .cv-photo { margin-bottom: 5mm; }
        }
        @media print {
          @page { size: A4; margin: 0; }
          html, body { width: 210mm; min-height: 297mm; background: #fff !important; }
          body * { visibility: hidden !important; }
          #cv-print-root, #cv-print-root * { visibility: visible !important; }
          #cv-print-root {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            background: #fff !important;
            z-index: 2147483647 !important;
          }
          #cv-print-root .cv-a4-preview {
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 18mm 18mm 20mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0b5c91]">CV Studio</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-slate-950">Tạo CV IT theo chuẩn A4</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${cvDaDuocLuu ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {cvDaDuocLuu ? 'Đã có bản lưu' : 'Bản nháp mới'}
            </span>
            {coThayDoiChuaLuu && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">Có thay đổi chưa lưu</span>}
          </div>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">Nhập đủ thông tin như mẫu CV trong `index.html`: thông tin cá nhân, summary, kỹ năng, học vấn, bài viết kỹ thuật và kinh nghiệm theo dự án.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" className={secondaryBtn} onClick={taoCvMoi}><Plus size={16} /> Tạo CV mới</button>
          <button type="button" className={secondaryBtn} onClick={goiYAi}><Brain size={16} /> Gợi ý nội dung</button>
          <button type="button" className={secondaryBtn} onClick={() => taiPdf()} disabled={!coNoiDungDeIn}><Download size={16} /> Tải PDF</button>
          <button type="button" className={primaryBtn} disabled={dangLuu || dangTaiAnhCv || dangTaiFileCv} onClick={luuStudio}><Save size={16} /> {dangLuu ? 'Đang lưu...' : 'Lưu CV'}</button>
          <input id="cv-photo-upload" hidden type="file" accept="image/*" onChange={e => { void docAnh(e.target.files?.[0]); e.currentTarget.value = '' }} />
          <input id="cv-file-upload" hidden type="file" accept=".pdf,.doc,.docx,.txt,.md,application/pdf" onChange={e => { void docFileCv(e.target.files?.[0]); e.currentTarget.value = '' }} />
        </div>
      </div>

      {danhSachCvDaLuu.length > 0 && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <strong className="text-sm text-slate-900">CV đã lưu</strong>
            <span className="text-xs font-bold text-slate-500">Bấm Xem để nạp đúng dữ liệu đã lưu vào form và preview.</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {danhSachCvDaLuu.map((item: CvData) => (
              <article key={item.id} className={`rounded-xl border bg-white p-3 ${cv.id === item.id ? 'border-[#0b5c91]' : 'border-slate-200'}`}>
                <p className="truncate text-sm font-black text-slate-900">{item.tieuDe || 'CV chưa đặt tên'}{item.cvChinh ? ' - chính' : ''}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={smallBtn} onClick={() => xemCvDaLuu(item)}><Eye size={14} /> Xem</button>
                  <button type="button" className={smallBtn} onClick={() => taiPdfCvDaLuu(item)}><Download size={14} /> PDF</button>
                  <button type="button" className={`${smallBtn} border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700`} disabled={cvDangXoa === item.id} onClick={() => void xoaCv(item)}><Trash2 size={14} /> {cvDangXoa === item.id ? 'Đang xóa' : 'Xóa'}</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(430px,560px)_minmax(620px,1fr)]">
        <div className="grid gap-4">
          <div className={panelCls}>
            <SectionTitle title="Thông tin cá nhân" desc={`Độ hoàn thiện CV: ${progress}%${cv.fileCvTen ? ` - đã upload ${cv.fileCvTen}` : ''}`} />
            <div className="mb-4 grid gap-3 md:grid-cols-[132px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="grid aspect-[5/6] place-items-center bg-white text-xs font-black text-slate-400">
                  {cv.anhDaiDien ? <img src={cv.anhDaiDien} alt="Ảnh CV" className="h-full w-full object-cover" /> : 'Ảnh CV'}
                </div>
                <button type="button" disabled={dangTaiAnhCv} className="flex min-h-10 w-full items-center justify-center gap-2 border-t border-slate-200 text-xs font-black text-[#0b5c91] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => document.getElementById('cv-photo-upload')?.click()}>
                  <ImagePlus size={14} /> {dangTaiAnhCv ? 'Đang upload...' : cv.anhDaiDien ? 'Đổi ảnh' : 'Upload ảnh'}
                </button>
                {cv.anhDaiDien && (
                  <button type="button" className="flex min-h-10 w-full items-center justify-center gap-2 border-t border-rose-100 text-xs font-black text-rose-600 hover:bg-rose-50" onClick={xoaAnhCv}>
                    <X size={14} /> Xóa ảnh
                  </button>
                )}
              </div>
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-black text-slate-900">File CV gốc</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Dùng khi nhà tuyển dụng muốn tải bản PDF/DOC gốc của ứng viên.</p>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm font-bold text-slate-700">
                  {cv.fileCvTen ? cv.fileCvTen : 'Chưa upload file CV gốc'}
                </div>
                <button type="button" className={secondaryBtn} disabled={dangTaiFileCv} onClick={() => document.getElementById('cv-file-upload')?.click()}>
                  <FileUp size={16} /> {dangTaiFileCv ? 'Đang upload...' : cv.fileCvTen ? 'Đổi file CV' : 'Upload CV gốc'}
                </button>
                {cv.fileCvData && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={smallBtn} onClick={taiFileCvGoc}><Download size={14} /> Tải file gốc</button>
                    <button type="button" className={`${smallBtn} border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700`} onClick={xoaFileCvGoc}><X size={14} /> Xóa file</button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className={inputCls} placeholder="Họ tên hiển thị" value={cv.hoTenHienThi ?? ''} onChange={e => capNhatCv({ ...cv, hoTenHienThi: e.target.value })} />
              <input className={inputCls} placeholder="Chức danh" value={cv.chucDanh ?? ''} onChange={e => capNhatCv({ ...cv, chucDanh: e.target.value })} />
              <input className={inputCls} placeholder="Tiêu đề CV" value={cv.tieuDe} onChange={e => capNhatCv({ ...cv, tieuDe: e.target.value })} />
              <input className={inputCls} placeholder="Số điện thoại" value={cv.soDienThoai ?? ''} onChange={e => capNhatCv({ ...cv, soDienThoai: e.target.value })} />
              <input className={inputCls} placeholder="Email" value={cv.emailLienHe ?? ''} onChange={e => capNhatCv({ ...cv, emailLienHe: e.target.value })} />
              <input className={inputCls} placeholder="Facebook" value={cv.facebook ?? ''} onChange={e => capNhatCv({ ...cv, facebook: e.target.value })} />
              <input className={inputCls} placeholder="GitHub" value={cv.github ?? ''} onChange={e => capNhatCv({ ...cv, github: e.target.value })} />
              <input className={inputCls} placeholder="Portfolio" value={cv.portfolioUrl ?? ''} onChange={e => capNhatCv({ ...cv, portfolioUrl: e.target.value })} />
              <input className={inputCls} placeholder="Địa điểm" value={cv.diaDiem ?? ''} onChange={e => capNhatCv({ ...cv, diaDiem: e.target.value })} />
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={cv.cvChinh} onChange={e => capNhatCv({ ...cv, cvChinh: e.target.checked })} /> CV chính</label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={cv.congKhai} onChange={e => capNhatCv({ ...cv, congKhai: e.target.checked })} /> Công khai</label>
              </div>
            </div>
          </div>

          <CvTextList title="Experience Summary" value={cv.tomTatKinhNghiem} onChange={v => capNhatCv({ ...cv, tomTatKinhNghiem: v })} placeholder="Full-stack Web Developer focusing on building scalable web products..." />
          <CvTextList title="Soft Skills" value={cv.kyNangMem} onChange={v => capNhatCv({ ...cv, kyNangMem: v })} placeholder="Excellent communication, teamwork, fast learning..." />
          <SkillEditor value={cv.kyNangLapTrinh} onChange={v => capNhatCv({ ...cv, kyNangLapTrinh: v })} />
          <BasicItemsEditor title="Kinh nghiệm làm việc" value={cv.kinhNghiemLam} onChange={v => capNhatCv({ ...cv, kinhNghiemLam: v })} />
          <BasicItemsEditor title="Học vấn" value={cv.hocVan} onChange={v => capNhatCv({ ...cv, hocVan: v })} />
          <BasicItemsEditor title="Chứng chỉ" value={cv.chungChi} onChange={v => capNhatCv({ ...cv, chungChi: v })} />
          <ProjectEditor value={cv.duAnChiTiet} onChange={v => capNhatCv({ ...cv, duAnChiTiet: v })} />
        </div>

        <div className="min-w-0 xl:sticky xl:top-4">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-black text-slate-700">Preview A4 - linh hoạt theo nội dung</span>
            <button type="button" className={smallBtn} onClick={() => taiPdf()} disabled={!coNoiDungDeIn}><Download size={14} /> Tải PDF</button>
          </div>
          <div>
            <Preview cv={cv} data={data} />
          </div>
        </div>
      </div>
      <div id="cv-print-root">
        {cvDangIn && <Preview cv={cvDangIn} data={data} />}
      </div>
    </section>
  )
}
