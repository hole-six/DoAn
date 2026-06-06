import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Download, ExternalLink, FileText, MessageCircle, ThumbsDown } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDateTime, imageUrl } from '../../../lib/format'
import { employerApplicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import type { HoSoNangLuc, HoSoUngTuyen } from '../../../types/recruitment'
import { useChat } from '../../../contexts/ChatContext'
import { Badge, Drawer } from '../shared/NtdAtoms'

type Tab = 'overview' | 'cv' | 'history'
type ActionKey = 'view' | 'advance_review' | 'reject_screening' | 'schedule' | 'pass' | 'reject_interview'

const TRANG_THAI_CHAT = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'] as const

const actionLabels: Record<ActionKey, string> = {
  view: 'Đã xem',
  advance_review: 'Chuyển sang xét duyệt',
  reject_screening: 'Từ chối sàng lọc',
  schedule: 'Mời phỏng vấn',
  pass: 'Đạt',
  reject_interview: 'Từ chối sau phỏng vấn',
}

const labelMap: Record<string, string> = {
  tenDuAn: 'Dự án',
  ten: 'Tên',
  thoiGian: 'Thời gian',
  duration: 'Thời gian',
  viTri: 'Vị trí',
  position: 'Vị trí',
  moTa: 'Mô tả',
  description: 'Mô tả',
  trachNhiem: 'Trách nhiệm',
  responsibilities: 'Trách nhiệm',
  congNghe: 'Công nghệ',
  technologies: 'Công nghệ',
  ngonNgu: 'Ngôn ngữ',
  framework: 'Framework',
  link: 'Link',
  url: 'Link',
  github: 'GitHub',
  demo: 'Demo',
}

function getActions(status: string): ActionKey[] {
  switch (status) {
    case 'da_nop':
      return ['view']
    case 'da_xem':
      return ['advance_review', 'reject_screening']
    case 'dang_xet_duyet':
      return ['schedule', 'reject_screening']
    case 'moi_phong_van':
      return ['pass', 'reject_interview']
    default:
      return []
  }
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(', ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(asText).filter(Boolean).join(' - ')
  return String(value).trim()
}

function valuesAsLines(value: unknown) {
  if (!value) return []
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [value]
  return source.map(asText).map(item => item.trim()).filter(Boolean)
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function hasBuilderContent(cv?: HoSoNangLuc) {
  if (!cv) return false
  return [
    cv.tomTatKinhNghiem,
    cv.kyNangMem,
    cv.kyNangLapTrinh,
    cv.hocVan,
    cv.kinhNghiemLam,
    cv.duAnChiTiet,
  ].some(value => valuesAsLines(value).length > 0)
}

function isPdfUpload(cv?: HoSoNangLuc) {
  if (!cv?.fileCvData) return false
  const type = String(cv.fileCvLoai ?? '').toLowerCase()
  const name = String(cv.fileCvTen ?? '').toLowerCase()
  const data = String(cv.fileCvData)
  return cv.loaiHoSo === 'file_upload' || type.includes('pdf') || name.endsWith('.pdf') || data.startsWith('data:application/pdf')
}

function CvSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">
      <h4 className="text-sm font-black uppercase text-slate-800">{title}</h4>
      <ul className="mt-2 grid gap-1.5 pl-4 text-sm font-semibold leading-6 text-slate-700">
        {items.map((item, index) => <li key={`${title}-${index}`} className="list-disc break-words">{item}</li>)}
      </ul>
    </section>
  )
}

function PdfCvViewer({ cv }: { cv: HoSoNangLuc }) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-sky-950">CV PDF ứng viên đã nộp</p>
          <p className="mt-1 break-words text-sm font-semibold text-sky-700">{cv.fileCvTen || 'File CV đính kèm'}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="sm" icon={<ExternalLink size={15} />} onClick={() => window.open(cv.fileCvData, '_blank', 'noopener,noreferrer')}>
            Mở tab mới
          </Button>
          <a
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700"
            href={cv.fileCvData}
            download={cv.fileCvTen || 'cv.pdf'}
          >
            <Download size={15} /> Tải PDF
          </a>
        </div>
      </div>
      <iframe
        title={cv.fileCvTen || 'CV PDF'}
        src={cv.fileCvData}
        className="h-[72vh] min-h-[520px] w-full rounded-xl border border-slate-200 bg-slate-100"
      />
    </div>
  )
}

function ProjectCard({ project, index }: { project: unknown; index: number }) {
  if (!project || typeof project !== 'object') {
    const text = asText(project)
    return text ? <li className="list-disc break-words">{text}</li> : null
  }
  const entries = Object.entries(project as Record<string, unknown>).filter(([, value]) => asText(value))
  if (!entries.length) return null
  const title = asText((project as any).tenDuAn ?? (project as any).ten ?? (project as any).projectName) || `Dự án ${index + 1}`
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h5 className="text-sm font-black text-slate-950">{title}</h5>
      <dl className="mt-3 grid gap-2 text-sm">
        {entries.map(([key, value]) => {
          const text = asText(value)
          const label = labelMap[key] ?? key
          return (
            <div key={key} className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)]">
              <dt className="font-black text-slate-700">{label}</dt>
              <dd className="min-w-0 break-words font-semibold leading-6 text-slate-600">
                {isUrl(text) ? <a className="font-black text-blue-700 hover:underline" href={text} target="_blank" rel="noreferrer">{text}</a> : text}
              </dd>
            </div>
          )
        })}
      </dl>
    </article>
  )
}

export function CandidateDrawer({
  item,
  onClose,
  onView,
  onAdvance,
  onReject,
  onSchedule,
}: {
  item: HoSoUngTuyen
  onClose: () => void
  onView: () => void
  onAdvance: (status: 'dang_xet_duyet' | 'moi_phong_van' | 'dat') => void
  onReject: (phase: 'sang_loc' | 'phong_van') => void
  onSchedule: () => void
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [action, setAction] = useState<ActionKey | ''>('')
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()
  const cv = item.hoSoNangLuc
  const candidateUserId = item.ungVien?.nguoiDung?.id ?? item.ungVien?.nguoiDung?._id
  const candidateName = cv?.hoTenHienThi || item.ungVien?.nguoiDung?.hoTen || 'Ứng viên'
  const contact = [cv?.emailLienHe || item.ungVien?.nguoiDung?.email, cv?.soDienThoai || item.ungVien?.nguoiDung?.soDienThoai, cv?.github, cv?.portfolioUrl].filter(Boolean)
  const availableActions = useMemo(() => getActions(item.trangThai), [item.trangThai])
  const canChat = Boolean(candidateUserId) && TRANG_THAI_CHAT.includes(item.trangThai as any)
  const builderContent = hasBuilderContent(cv)
  const pdfUpload = isPdfUpload(cv)

  useEffect(() => {
    setAction(availableActions[0] ?? '')
  }, [availableActions, item.id])

  const executeAction = async () => {
    if (!action) return
    if (action === 'view') return onView()
    if (action === 'advance_review') return onAdvance('dang_xet_duyet')
    if (action === 'schedule') return onSchedule()
    if (action === 'pass') return onAdvance('dat')
    if (action === 'reject_screening') return onReject('sang_loc')
    return onReject('phong_van')
  }

  const openChat = async () => {
    if (!candidateUserId) return
    const cuocTroChuyen = await moChatVoiNguoiDung(candidateUserId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.id,
      maTinTuyenDung: item.maTinTuyenDung,
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/nha-tuyen-dung/chat?cuocTroChuyen=${id}` : '/nha-tuyen-dung/chat')
  }

  return (
    <Drawer
      title="Chi tiết ứng viên"
      onClose={onClose}
      footer={(
        <div className="grid gap-3">
          <ButtonGroup>
            <Button size="sm" variant="secondary" icon={<MessageCircle size={16} />} disabled={!canChat} onClick={() => void openChat()}>Chat</Button>
          </ButtonGroup>
          {availableActions.length > 0 && (
            <div className="grid gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wide text-slate-500">Hành động</label>
              <div className="flex flex-wrap gap-2">
                <select
                  className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none"
                  value={action}
                  onChange={event => setAction(event.target.value as ActionKey)}
                >
                  {availableActions.map(option => (
                    <option key={option} value={option}>
                      {actionLabels[option]}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant={action === 'reject_screening' || action === 'reject_interview' ? 'danger' : 'primary'}
                  icon={action === 'reject_screening' || action === 'reject_interview' ? <ThumbsDown size={16} /> : <ChevronRight size={16} />}
                  disabled={!action}
                  onClick={() => void executeAction()}
                >
                  {action ? actionLabels[action] : 'Áp dụng'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    >
      <div className="grid gap-4">
        <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-[84px_minmax(0,1fr)]">
          <img
            className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
            src={imageUrl(cv?.anhDaiDien) || 'https://placehold.co/160x160/eaf2ff/075985?text=CV'}
            alt={candidateName}
          />
          <div className="min-w-0">
            <h3 className="break-words text-xl font-black text-slate-950">{candidateName}</h3>
            {cv?.chucDanh && <p className="mt-1 text-sm font-bold text-blue-700">{cv.chucDanh}</p>}
            <p className="mt-1 break-words text-sm font-semibold text-slate-500">{contact.join(' · ') || '-'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={toneForApplicationStatus(item.trangThai)}>{employerApplicationStatusLabel[item.trangThai] ?? item.trangThai}</Badge>
              {cv && <Badge tone="blue">CV đã nộp</Badge>}
              {cv?.cvChinh && <Badge tone="green">CV chính</Badge>}
              {cv?.fileCvData && <Badge tone="gray">Có file gốc</Badge>}
            </div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
          {[
            ['overview', 'Tổng quan'],
            ['cv', 'CV ứng viên'],
            ['history', 'Lịch sử'],
          ].map(([key, label]) => (
            <button key={key} className={`min-h-10 min-w-28 flex-1 rounded-lg px-3 text-sm font-black ${tab === key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`} onClick={() => setTab(key as Tab)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <section className="grid gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
            <p><strong>Vị trí:</strong> {item.tinTuyenDung?.tieuDe ?? '-'}</p>
            <p><strong>CV ứng tuyển:</strong> {cv?.tieuDe ?? 'Chưa gắn CV'}</p>
            <p><strong>Ngày nộp:</strong> {formatDateTime(item.ngayNop)}</p>
            <p><strong>Thư xin việc:</strong> {item.thuXinViec || '-'}</p>
            {cv?.fileCvData && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" icon={<ExternalLink size={15} />} onClick={() => window.open(cv.fileCvData, '_blank', 'noopener,noreferrer')}>Mở file CV</Button>
                <a className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-black text-slate-700" href={cv.fileCvData} download={cv.fileCvTen || 'cv'}>
                  <Download size={15} /> Tải file gốc
                </a>
              </div>
            )}
          </section>
        )}

        {tab === 'cv' && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            {cv ? (
              pdfUpload && (!builderContent || cv.loaiHoSo === 'file_upload') ? (
                <PdfCvViewer cv={cv} />
              ) : (
                <>
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-2xl font-black text-slate-950">{candidateName}</h3>
                        {cv.chucDanh && <p className="mt-1 text-sm font-bold text-blue-700">{cv.chucDanh}</p>}
                        <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-600">{contact.join(' | ') || 'Chưa có thông tin liên hệ'}</p>
                      </div>
                      {cv.fileCvData && (
                        <a className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-black text-slate-700" href={cv.fileCvData} download={cv.fileCvTen || 'cv'}>
                          <Download size={16} /> Tải file CV gốc
                        </a>
                      )}
                    </div>
                  </div>
                  <CvSection title="Tóm tắt kinh nghiệm" items={valuesAsLines(cv.tomTatKinhNghiem)} />
                  <CvSection title="Kỹ năng mềm" items={valuesAsLines(cv.kyNangMem)} />
                  <CvSection title="Kỹ năng lập trình" items={valuesAsLines(cv.kyNangLapTrinh)} />
                  <CvSection title="Học vấn" items={valuesAsLines(cv.hocVan)} />
                  <CvSection title="Kinh nghiệm làm việc" items={valuesAsLines(cv.kinhNghiemLam)} />
                  {Array.isArray(cv.duAnChiTiet) && cv.duAnChiTiet.length ? (
                    <section className="border-b border-slate-100 py-4 last:border-b-0">
                      <h4 className="text-sm font-black uppercase text-slate-800">Dự án có minh chứng</h4>
                      <div className="mt-3 grid gap-3">
                        {cv.duAnChiTiet.map((project, index) => <ProjectCard key={index} project={project} index={index} />)}
                      </div>
                    </section>
                  ) : null}
                  {!builderContent && (
                    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
                      CV này chưa có dữ liệu builder. Nếu ứng viên có file PDF, hãy mở file gốc ở phía trên.
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
                <FileText size={28} />
                Hồ sơ ứng tuyển này chưa gắn CV.
              </div>
            )}
          </section>
        )}

        {tab === 'history' && (
          <section className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
            <p>Trạng thái hiện tại: <strong>{employerApplicationStatusLabel[item.trangThai] ?? item.trangThai}</strong></p>
            <p className="mt-2">Nộp lúc: {formatDateTime(item.ngayNop)}</p>
          </section>
        )}
      </div>
    </Drawer>
  )
}
