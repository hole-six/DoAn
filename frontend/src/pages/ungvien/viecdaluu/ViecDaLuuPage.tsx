import { Briefcase } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { formatMoney } from '../../../lib/format'
import { EmptyState, ErrorState, Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function ViecDaLuuPage() {
  const data = useUngVienData()
  const openJobs = data.tinList.filter(item => item.trangThai === 'dang_mo').slice(0, 12)
  return (
    <Page title="Việc gợi ý" desc="Danh sách việc đang mở để bạn ứng tuyển nhanh bằng CV chính.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {openJobs.length ? openJobs.map(job => (
            <article key={job.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h2 className="line-clamp-2 text-base font-black text-slate-950">{job.tieuDe}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng'}</p>
              </div>
              <p className="text-sm font-black text-emerald-700">{formatMoney(job.luongMin)} - {formatMoney(job.luongMax)}</p>
              <Button variant="primary" icon={<Briefcase size={16} />} onClick={() => { window.location.href = `/viec-lam/${job.id}` }}>Xem việc</Button>
            </article>
          )) : <EmptyState>Chưa có việc đang mở phù hợp.</EmptyState>}
        </div>
      </Panel>
    </Page>
  )
}
