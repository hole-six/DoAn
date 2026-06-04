import { useEffect, useState } from 'react'
import { Edit3, Eye, Plus, Power, Trash2 } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDate, formatMoney } from '../../../lib/format'
import { jobStatusLabel, toneForJobStatus } from '../../../lib/statusLabels'
import type { TinTuyenDung } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { JobModal } from './JobModal'

export default function QuanLyTinNhaTuyenDungPage() {
  const data = useEmployerData()
  const [editing, setEditing] = useState<Partial<TinTuyenDung> | null | undefined>(undefined)
  const congTyDaDuyet = data.company?.trangThaiDuyet === 'da_duyet'

  useEffect(() => {
    if (congTyDaDuyet && new URLSearchParams(window.location.search).get('new') === '1') setEditing(null)
  }, [congTyDaDuyet])

  const save = async (job: Partial<TinTuyenDung>) => {
    const path = job.id ? `/tintuyendung/${job.id}` : '/tintuyendung'
    await apiCoXacThuc(path, { method: job.id ? 'PATCH' : 'POST', body: JSON.stringify(job) })
    setEditing(undefined)
    await data.reload()
  }

  const setStatus = async (job: TinTuyenDung, action: 'tam-dong' | 'mo-lai') => {
    await apiCoXacThuc(`/tintuyendung/${job.id}/${action}`, { method: 'POST' })
    await data.reload()
  }

  const remove = async (job: TinTuyenDung) => {
    if (!window.confirm(`Xóa tin ${job.tieuDe}?`)) return
    await apiCoXacThuc(`/tintuyendung/${job.id}`, { method: 'DELETE' })
    await data.reload()
  }

  return (
    <Page
      title="Quản lý tin tuyển dụng"
      desc="Tạo, gửi duyệt, tạm đóng hoặc mở lại tin tuyển dụng."
      action={<Button variant="primary" icon={<Plus size={16} />} disabled={!congTyDaDuyet} onClick={() => setEditing(null)}>Đăng tin</Button>}
    >
      <ErrorState message={data.error} />
      {!congTyDaDuyet && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
          Công ty của bạn đang chờ duyệt hoặc cần cập nhật. Hãy hoàn thiện trang Thông tin công ty và chờ admin duyệt trước khi tạo tin tuyển dụng.
        </div>
      )}
      <Panel>
        <div className="ntd-list grid gap-3">
          {data.jobs.length ? data.jobs.map(job => (
            <article key={job.id} className="ntd-list-card grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="ntd-list-main min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="min-w-0 truncate text-base font-black text-slate-950">{job.tieuDe}</h2>
                  <Badge tone={toneForJobStatus(job.trangThai)}>{jobStatusLabel[job.trangThai ?? ''] ?? job.trangThai}</Badge>
                </div>
                <p className="ntd-list-meta mt-1 text-sm font-semibold text-slate-500">
                  {job.diaChi || 'Chưa có địa chỉ'} · Hạn {formatDate(job.hanNop)} · {formatMoney(job.luongMin)} - {formatMoney(job.luongMax)}
                </p>
              </div>
              <div className="ntd-list-actions">
              <ButtonGroup>
                <Button icon={<Eye size={15} />} onClick={() => { window.location.href = `/viec-lam/${job.id}` }}>Xem tin</Button>
                <Button icon={<Edit3 size={15} />} disabled={['dang_mo', 'tam_dong', 'het_han'].includes(job.trangThai ?? '')} onClick={() => setEditing(job)}>Sửa</Button>
                <Button icon={<Power size={15} />} disabled={!['dang_mo', 'tam_dong'].includes(job.trangThai ?? '')} onClick={() => void setStatus(job, job.trangThai === 'dang_mo' ? 'tam-dong' : 'mo-lai')}>
                  {job.trangThai === 'dang_mo' ? 'Tạm đóng' : 'Mở lại'}
                </Button>
                <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => void remove(job)}>Xóa</Button>
              </ButtonGroup>
              </div>
            </article>
          )) : <EmptyState>Chưa có tin tuyển dụng.</EmptyState>}
        </div>
      </Panel>
      {editing !== undefined && <JobModal initial={editing ?? undefined} companyId={data.company?.id} skills={data.skills} onClose={() => setEditing(undefined)} onSubmit={save} />}
    </Page>
  )
}

