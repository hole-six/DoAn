import { Bell, Briefcase, Calendar, MessageCircle, Plus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/LoadingStates'
import { useChat } from '../../../contexts/ChatContext'
import { formatDateTime } from '../../../lib/format'
import { employerApplicationStatusLabel, interviewStatusLabel, toneForApplicationStatus, toneForInterviewStatus } from '../../../lib/statusLabels'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'

function Kpi({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"><Icon size={20} className="mb-3 text-sky-800" /><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><strong className="mt-1 block text-3xl font-black text-slate-950">{value}</strong></div>
}

export default function DashboardNhaTuyenDungPage() {
  const data = useEmployerData()
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()
  if (data.loading) return <DashboardSkeleton />

  const openJobs = data.jobs.filter(item => item.trangThai === 'dang_mo')
  const pending = data.applications.filter(item => ['da_nop', 'da_xem', 'dang_xet_duyet'].includes(item.trangThai))
  const upcoming = data.interviews.filter(item => new Date(item.thoiGianBatDau).getTime() >= Date.now())
  const unread = data.notifications.filter(item => !item.daDoc).length

  return (
    <Page
      title={data.company?.tenCongTy ?? 'Workspace nhà tuyển dụng'}
      desc="Pipeline tuyển dụng, lịch phỏng vấn và tin đang mở."
      action={(
        <>
          <Button
            variant="secondary"
            icon={<MessageCircle size={16} />}
            onClick={async () => {
              const cuocTroChuyen = await moChatVoiNguoiDung('admin', { loai: 'admin_support' })
              const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
              navigate(id ? `/nha-tuyen-dung/chat?cuocTroChuyen=${id}` : '/nha-tuyen-dung/chat')
            }}
          >
            Nhắn admin
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => { window.location.href = '/nha-tuyen-dung/quan-ly-tin?new=1' }}>Đăng tin</Button>
        </>
      )}
    >
      <ErrorState message={data.error} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Briefcase} label="Tin đang mở" value={openJobs.length} />
        <Kpi icon={Users} label="Ứng viên" value={data.applications.length} />
        <Kpi icon={Calendar} label="Lịch sắp tới" value={upcoming.length} />
        <Kpi icon={Bell} label="Thông báo mới" value={unread} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Hồ sơ cần xử lý">
          <div className="grid gap-2">
            {pending.length ? pending.slice(0, 6).map(item => (
              <button key={item.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto]" onClick={() => { window.location.href = '/nha-tuyen-dung/ung-vien' }}>
                <span className="min-w-0"><strong className="block truncate text-sm font-black text-slate-950">{item.ungVien?.nguoiDung?.hoTen ?? 'Ứng viên'}</strong><span className="mt-1 block truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.tieuDe ?? '-'}</span></span>
                <Badge tone={toneForApplicationStatus(item.trangThai)}>{employerApplicationStatusLabel[item.trangThai]}</Badge>
              </button>
            )) : <EmptyState>Không có hồ sơ chờ xử lý.</EmptyState>}
          </div>
        </Panel>
        <Panel title="Lịch phỏng vấn">
          <div className="grid gap-2">
            {upcoming.length ? upcoming.slice(0, 6).map(item => (
              <button key={item.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto]" onClick={() => { window.location.href = '/nha-tuyen-dung/lich-phong-van' }}>
                <span className="min-w-0"><strong className="block truncate text-sm font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Phỏng vấn'}</strong><span className="mt-1 block truncate text-xs font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)}</span></span>
                <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
              </button>
            )) : <EmptyState>Chưa có lịch sắp tới.</EmptyState>}
          </div>
        </Panel>
      </div>
    </Page>
  )
}
