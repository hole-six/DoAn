import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDate } from '../../../lib/format'
import { Badge } from '../../nhatuyendung/shared/NtdAtoms'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminCompany } from '../shared/adminTypes'

function tone(value?: string) {
  if (value === 'da_duyet') return 'green' as const
  if (value === 'tu_choi' || value === 'bi_khoa') return 'red' as const
  return 'yellow' as const
}

export default function QuanLyCongTyAdmin() {
  const [items, setItems] = useState<AdminCompany[]>([])
  const [error, setError] = useState('')
  const load = async () => {
    try { setItems(await adminApi.list<AdminCompany>('/nhatuyendung')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') }
  }
  useEffect(() => { void load() }, [])
  const update = async (item: AdminCompany, trangThaiDuyet: string) => {
    await adminApi.update(`/nhatuyendung/${item.id}`, { trangThaiDuyet, ngayDuyet: new Date() })
    await load()
  }
  return (
    <AdminPage title="Quản lý công ty" desc="Duyệt, từ chối và theo dõi hồ sơ nhà tuyển dụng." action={<Button onClick={() => void load()}>Làm mới</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Công ty', 'Ngành', 'Trạng thái', 'Ngày tạo', 'Thao tác']}>
          {items.length ? items.map(item => (
            <tr key={item.id}>
              <td><strong className="block text-sm font-black text-slate-950">{item.tenCongTy}</strong><span className="text-xs font-semibold text-slate-500">{item.diaChi}</span></td>
              <td className="text-sm font-semibold text-slate-600">{item.nganh ?? '-'}</td>
              <td><Badge tone={tone(item.trangThaiDuyet)}>{item.trangThaiDuyet ?? 'cho_duyet'}</Badge></td>
              <td className="text-sm font-semibold text-slate-600">{formatDate((item as { ngayTao?: string }).ngayTao)}</td>
              <td><ButtonGroup><Button size="sm" variant="success" icon={<CheckCircle size={14} />} onClick={() => void update(item, 'da_duyet')}>Duyệt</Button><Button size="sm" variant="danger" icon={<XCircle size={14} />} onClick={() => void update(item, 'tu_choi')}>Từ chối</Button></ButtonGroup></td>
            </tr>
          )) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>
    </AdminPage>
  )
}
