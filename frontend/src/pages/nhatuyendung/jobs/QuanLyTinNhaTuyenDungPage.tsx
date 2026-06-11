import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, Eye, Plus, Power, Search, Trash2, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDate, formatMoney } from '../../../lib/format'
import { jobStatusLabel, toneForJobStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { TinTuyenDung } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { JobModal } from './JobModal'

const inputCls = 'min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

export default function QuanLyTinNhaTuyenDungPage() {
  const data = useEmployerData()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<Partial<TinTuyenDung> | null | undefined>(undefined)
  const congTyDaDuyet = data.company?.trangThaiDuyet === 'da_duyet'
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const [tuKhoa, setTuKhoa] = useState('')
  const [locTrangThai, setLocTrangThai] = useState('')

  const danhSachHienThi = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase()
    return data.jobs.filter(job => {
      const khopKw = !kw || (job.tieuDe ?? '').toLowerCase().includes(kw) || (job.diaChi ?? '').toLowerCase().includes(kw)
      const khopTrangThai = !locTrangThai || job.trangThai === locTrangThai
      return khopKw && khopTrangThai
    })
  }, [data.jobs, tuKhoa, locTrangThai])

  const phanTrang = usePhanTrang(danhSachHienThi)

  useEffect(() => {
    if (congTyDaDuyet && new URLSearchParams(window.location.search).get('new') === '1') setEditing(null)
  }, [congTyDaDuyet])

  const save = async (job: Partial<TinTuyenDung>) => {
    const path = job.id ? `/tintuyendung/${job.id}` : '/tintuyendung'
    await apiCoXacThuc(path, { method: job.id ? 'PATCH' : 'POST', body: JSON.stringify(job) })
    toast.success(job.id ? 'Đã cập nhật tin tuyển dụng.' : 'Đã tạo tin tuyển dụng.')
    setEditing(undefined)
    await data.reload()
  }

  const setStatus = async (job: TinTuyenDung, action: 'tam-dong' | 'mo-lai') => {
    const closing = action === 'tam-dong'
    confirm(
      closing ? 'Tạm đóng tin tuyển dụng' : 'Mở lại tin tuyển dụng',
      `${closing ? 'Tạm đóng' : 'Mở lại'} tin "${job.tieuDe}"?`,
      async () => {
        try {
          await apiCoXacThuc(`/tintuyendung/${job.id}/${action}`, { method: 'POST' })
          toast.success(closing ? 'Đã tạm đóng tin tuyển dụng.' : 'Đã mở lại tin tuyển dụng.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể đổi trạng thái tin.')
        }
      },
      closing ? 'warning' : 'info',
      closing ? 'Tạm đóng' : 'Mở lại',
    )
  }

  const remove = async (job: TinTuyenDung) => {
    confirm(
      'Xóa tin tuyển dụng',
      `Xóa tin "${job.tieuDe}"? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          await apiCoXacThuc(`/tintuyendung/${job.id}`, { method: 'DELETE' })
          toast.success('Đã xóa tin tuyển dụng.')
          await data.reload()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Không thể xóa tin tuyển dụng.')
        }
      },
      'danger',
      'Xóa',
    )
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
        <div className="mb-3 grid gap-2 sm:flex sm:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tìm tiêu đề, địa chỉ..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && <button type="button" onClick={() => setTuKhoa('')}><X size={14} /></button>}
          </label>
          <select className={`${inputCls} sm:w-44`} value={locTrangThai} onChange={e => setLocTrangThai(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(jobStatusLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="ntd-list grid gap-3">
          {danhSachHienThi.length ? phanTrang.danhSachTrang.map(job => (
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
                  <Button icon={<Eye size={15} />} onClick={() => navigate(`/viec-lam/${job.id}`)}>Xem tin</Button>
                  <Button icon={<Edit3 size={15} />} disabled={['dang_mo', 'tam_dong', 'het_han'].includes(job.trangThai ?? '')} onClick={() => setEditing(job)}>Sửa</Button>
                  <Button icon={<Power size={15} />} disabled={!['dang_mo', 'tam_dong'].includes(job.trangThai ?? '')} onClick={() => void setStatus(job, job.trangThai === 'dang_mo' ? 'tam-dong' : 'mo-lai')}>
                    {job.trangThai === 'dang_mo' ? 'Tạm đóng' : 'Mở lại'}
                  </Button>
                  <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => void remove(job)}>Xóa</Button>
                </ButtonGroup>
              </div>
            </article>
          )) : <EmptyState>{tuKhoa || locTrangThai ? 'Không có tin phù hợp bộ lọc.' : 'Chưa có tin tuyển dụng.'}</EmptyState>}
        </div>
        <PhanTrang {...phanTrang} donVi="tin" className="mt-4" />
      </Panel>
      {editing !== undefined && <JobModal initial={editing ?? undefined} companyId={data.company?.id} skills={data.skills} onClose={() => setEditing(undefined)} onSubmit={save} />}
      <ConfirmDialogComponent />
    </Page>
  )
}
