import { RotateCcw } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, Drawer } from '../shared/UngVienAtoms'

export function AppDrawer({ item, onClose, onWithdraw }: { item: HoSoUngTuyen; onClose: () => void; onWithdraw: () => void }) {
  return (
    <Drawer title="Chi tiết ứng tuyển" onClose={onClose} footer={<ButtonGroup><Button onClick={onClose}>Đóng</Button><Button variant="danger" icon={<RotateCcw size={16} />} disabled={['dat', 'tu_choi', 'da_rut'].includes(item.trangThai)} onClick={onWithdraw}>Rút hồ sơ</Button></ButtonGroup>}>
      <div className="grid gap-4">
        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Vị trí</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái hiện tại</p>
          <div className="mt-2"><Badge tone={toneForApplicationStatus(item.trangThai)}>{applicationStatusLabel[item.trangThai]}</Badge></div>
          <p className="mt-3 text-sm font-semibold text-slate-600">Nộp lúc {formatDateTime(item.ngayNop)}</p>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Timeline</p>
          <ol className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
            {['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat'].map(step => (
              <li key={step} className={step === item.trangThai ? 'text-sky-800' : ''}>• {applicationStatusLabel[step]}</li>
            ))}
          </ol>
        </section>
      </div>
    </Drawer>
  )
}
