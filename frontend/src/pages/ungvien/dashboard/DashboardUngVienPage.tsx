import { Bell, Briefcase, Calendar, FileText } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/LoadingStates'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, interviewStatusLabel, toneForApplicationStatus, toneForInterviewStatus } from '../../../lib/statusLabels'
import { Badge, EmptyState, ErrorState, Page, Panel, Row } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

function Kpi({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
      <Icon size={20} className="mb-3 text-sky-800" />
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <strong className="mt-1 block text-3xl font-black text-slate-950">{value}</strong>
    </div>
  )
}

export default function DashboardUngVienPage() {
  const data = useUngVienData()
  if (data.loading) return <DashboardSkeleton />

  const pendingInterviews = data.lich.filter(item => item.trangThai === 'da_len_lich')
  const activeApplications = data.ungTuyen.filter(item => !['dat', 'tu_choi', 'da_rut'].includes(item.trangThai))
  const unread = data.thongBao.filter(item => !item.daDoc).length

  return (
    <Page title="Tổng quan ứng viên" desc="Theo dõi hồ sơ, lịch phỏng vấn và các việc cần xử lý trong một màn hình." action={<Button variant="primary" icon={<Briefcase size={16} />} onClick={() => { window.location.href = '/viec-lam' }}>Tìm việc</Button>}>
      <ErrorState message={data.error} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={FileText} label="CV đã tạo" value={data.hoSo.length} />
        <Kpi icon={Briefcase} label="Đã ứng tuyển" value={data.ungTuyen.length} />
        <Kpi icon={Calendar} label="Lịch cần phản hồi" value={pendingInterviews.length} />
        <Kpi icon={Bell} label="Thông báo mới" value={unread} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Việc cần làm">
          <div className="grid gap-2">
            {pendingInterviews.length ? pendingInterviews.slice(0, 5).map(item => (
              <Row key={item.id} onClick={() => { window.location.href = '/ung-vien/lich-phong-van' }}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Lịch phỏng vấn'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)}</p>
                </div>
                <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
              </Row>
            )) : <EmptyState>Không có lịch cần phản hồi.</EmptyState>}
          </div>
        </Panel>
        <Panel title="Hồ sơ đang xử lý">
          <div className="grid gap-2">
            {activeApplications.length ? activeApplications.slice(0, 5).map(item => (
              <Row key={item.id} onClick={() => { window.location.href = '/ung-vien/ung-tuyen' }}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
                </div>
                <Badge tone={toneForApplicationStatus(item.trangThai)}>{applicationStatusLabel[item.trangThai]}</Badge>
              </Row>
            )) : <EmptyState>Chưa có hồ sơ đang xử lý.</EmptyState>}
          </div>
        </Panel>
      </div>
    </Page>
  )
}
