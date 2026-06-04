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
    if (!window.confirm(`XÃ³a tin ${job.tieuDe}?`)) return
    await apiCoXacThuc(`/tintuyendung/${job.id}`, { method: 'DELETE' })
    await data.reload()
  }

  return (
    <Page
      title="Quáº£n lÃ½ tin tuyá»ƒn dá»¥ng"
      desc="Táº¡o, gá»­i duyá»‡t, táº¡m Ä‘Ã³ng hoáº·c má»Ÿ láº¡i tin tuyá»ƒn dá»¥ng."
      action={<Button variant="primary" icon={<Plus size={16} />} disabled={!congTyDaDuyet} onClick={() => setEditing(null)}>ÄÄƒng tin</Button>}
    >
      <ErrorState message={data.error} />
      {!congTyDaDuyet && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
          Công ty của bạn đang chờ duyệt hoặc cần cập nhật. Hãy hoàn thiện trang Thông tin công ty và chờ admin duyệt trước khi tạo tin tuyển dụng.
        </div>
      )}
      <Panel>
        <div className="grid gap-3">
          {data.jobs.length ? data.jobs.map(job => (
            <article key={job.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="min-w-0 truncate text-base font-black text-slate-950">{job.tieuDe}</h2>
                  <Badge tone={toneForJobStatus(job.trangThai)}>{jobStatusLabel[job.trangThai ?? ''] ?? job.trangThai}</Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {job.diaChi || 'ChÆ°a cÃ³ Ä‘á»‹a chá»‰'} Â· Háº¡n {formatDate(job.hanNop)} Â· {formatMoney(job.luongMin)} - {formatMoney(job.luongMax)}
                </p>
              </div>
              <ButtonGroup>
                <Button icon={<Eye size={15} />} onClick={() => { window.location.href = `/viec-lam/${job.id}` }}>Xem tin</Button>
                <Button icon={<Edit3 size={15} />} disabled={['dang_mo', 'tam_dong', 'het_han'].includes(job.trangThai ?? '')} onClick={() => setEditing(job)}>Sá»­a</Button>
                <Button icon={<Power size={15} />} disabled={!['dang_mo', 'tam_dong'].includes(job.trangThai ?? '')} onClick={() => void setStatus(job, job.trangThai === 'dang_mo' ? 'tam-dong' : 'mo-lai')}>
                  {job.trangThai === 'dang_mo' ? 'Táº¡m Ä‘Ã³ng' : 'Má»Ÿ láº¡i'}
                </Button>
                <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => void remove(job)}>XÃ³a</Button>
              </ButtonGroup>
            </article>
          )) : <EmptyState>ChÆ°a cÃ³ tin tuyá»ƒn dá»¥ng.</EmptyState>}
        </div>
      </Panel>
      {editing !== undefined && <JobModal initial={editing ?? undefined} companyId={data.company?.id} skills={data.skills} onClose={() => setEditing(undefined)} onSubmit={save} />}
    </Page>
  )
}

