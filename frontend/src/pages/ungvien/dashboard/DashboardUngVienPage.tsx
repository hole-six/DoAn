import { useEffect, useState } from 'react'
import { Bell, Briefcase, Calendar, FileText, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/LoadingStates'
import { apiCoXacThuc } from '../../../lib/auth'
import { toast } from '../../../lib/toast'
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
  const [dangQuet, setDangQuet] = useState(false)
  const [moXacNhanQuet, setMoXacNhanQuet] = useState(false)
  const [guiEmailSauQuet, setGuiEmailSauQuet] = useState(false)
  const [goiY, setGoiY] = useState<any>(null)
  const [goiYError, setGoiYError] = useState('')

  const loadGoiY = async () => {
    try {
      const duLieu = await apiCoXacThuc('/ai/goi-y-viec-lam')
      setGoiY(duLieu)
      setGoiYError('')
    } catch (err) {
      setGoiY(null)
      setGoiYError(err instanceof Error ? err.message : 'Khong tai duoc goi y viec lam')
    }
  }

  useEffect(() => {
    if (data.current && !data.loading) void loadGoiY()
  }, [data.current?.id, data.loading])

  if (data.loading) return <DashboardSkeleton />

  const pendingInterviews = data.lich.filter(item => item.trangThai === 'da_len_lich')
  const activeApplications = data.ungTuyen.filter(item => !['dat', 'tu_choi', 'da_rut'].includes(item.trangThai))
  const unread = data.thongBao.filter(item => !item.daDoc).length

  const quickScan = async (guiEmail = false) => {
    try {
      setDangQuet(true)
      setGoiYError('')
      await apiCoXacThuc('/ai/goi-y-viec-lam/chay-ngay', { method: 'POST' })
      if (guiEmail) {
        await apiCoXacThuc('/ai/goi-y-viec-lam/gui-email', { method: 'POST' })
      }
      await loadGoiY()
      toast.success(guiEmail ? 'Đã quét và gửi email gợi ý.' : 'Đã quét gợi ý việc làm.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể quét gợi ý việc làm.'
      setGoiYError(message)
      toast.error(message)
    } finally {
      setDangQuet(false)
      setMoXacNhanQuet(false)
    }
  }

  return (
    <Page
      title="Tong quan ung vien"
      desc="Theo doi ho so, lich phong van va cac viec can xu ly trong mot man hinh."
      action={(
        <>
          <Button variant="secondary" icon={<Sparkles size={16} />} onClick={() => setMoXacNhanQuet(true)} disabled={dangQuet}>
            {dangQuet ? 'Đang quét...' : 'Quét nhanh'}
          </Button>
          <Button variant="primary" icon={<Briefcase size={16} />} onClick={() => { window.location.href = '/viec-lam' }}>Tim viec</Button>
        </>
      )}
    >
      <ErrorState message={data.error} />
      {goiYError && <ErrorState message={goiYError} />}
      {moXacNhanQuet && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">Quét gợi ý việc làm</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Bạn muốn quét CV để tìm việc phù hợp trong hệ thống, hoặc quét xong rồi gửi email gợi ý cho chính mình?
            </p>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={guiEmailSauQuet}
                onChange={e => setGuiEmailSauQuet(e.target.checked)}
              />
              Quét xong gửi email gợi ý
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setMoXacNhanQuet(false)} disabled={dangQuet}>Hủy</Button>
              <Button variant="primary" icon={<Sparkles size={16} />} onClick={() => void quickScan(guiEmailSauQuet)} disabled={dangQuet}>
                {dangQuet ? 'Đang quét...' : guiEmailSauQuet ? 'Quét và gửi email' : 'Bắt đầu quét'}
              </Button>
            </div>
          </div>
        </div>
      )}
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

      <Panel
        title="Việc làm gợi ý"
        action={<Button size="sm" variant="secondary" icon={<Sparkles size={14} />} onClick={() => void loadGoiY()}>Tải lại</Button>}
      >
        {goiY?.ketQua?.length ? (
          <div className="grid gap-2">
            {goiY.ketQua.slice(0, 5).map((item: any) => (
              <Row key={item.maTinTuyenDung} onClick={() => { window.location.href = `/viec-lam/${item.maTinTuyenDung}?apply=1` }}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? 'Việc làm phù hợp'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
                </div>
                <Badge tone="green">{item.diem}/100</Badge>
              </Row>
            ))}
          </div>
        ) : (
          <EmptyState>{goiYError || 'Chưa có kết quả gợi ý. Hãy quét nhanh để tạo danh sách phù hợp.'}</EmptyState>
        )}
      </Panel>
    </Page>
  )
}
