import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDate } from '../../../lib/format'
import { jobStatusLabel, toneForJobStatus } from '../../../lib/statusLabels'
import { Badge } from '../../nhatuyendung/shared/NtdAtoms'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminJob } from '../shared/adminTypes'

export default function DuyetTinTuyenDungAdmin() {
  const [items, setItems] = useState<AdminJob[]>([])
  const [error, setError] = useState('')
  const load = async () => {
    try { setItems(await adminApi.list<AdminJob>('/tintuyendung')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') }
  }
  useEffect(() => { void load() }, [])
  const action = async (item: AdminJob, path: 'duyet' | 'tu-choi') => {
    await adminApi.action(`/tintuyendung/${item.id}/${path}`)
    await load()
  }
  return (
    <AdminPage title="Duyệt tin tuyển dụng" desc="Kiểm soát tin trước khi mở cho ứng viên ứng tuyển." action={<Button onClick={() => void load()}>Làm mới</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Tin tuyển dụng', 'Công ty', 'Trạng thái', 'Hạn nộp', 'Thao tác']}>
          {items.length ? items.map(item => (
            <tr key={item.id}>
              <td><strong className="block max-w-80 truncate text-sm font-black text-slate-950">{item.tieuDe}</strong><span className="text-xs font-semibold text-slate-500">{item.diaChi}</span></td>
              <td className="text-sm font-semibold text-slate-600">{item.nhaTuyenDung?.tenCongTy ?? item.maNhaTuyenDung}</td>
              <td><Badge tone={toneForJobStatus(item.trangThai)}>{jobStatusLabel[item.trangThai ?? ''] ?? item.trangThai}</Badge></td>
              <td className="text-sm font-semibold text-slate-600">{formatDate(item.hanNop)}</td>
              <td><ButtonGroup><Button size="sm" variant="success" icon={<CheckCircle size={14} />} disabled={item.trangThai !== 'cho_duyet'} onClick={() => void action(item, 'duyet')}>Duyệt</Button><Button size="sm" variant="danger" icon={<XCircle size={14} />} disabled={item.trangThai !== 'cho_duyet'} onClick={() => void action(item, 'tu-choi')}>Từ chối</Button></ButtonGroup></td>
            </tr>
          )) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>
    </AdminPage>
  )
}
