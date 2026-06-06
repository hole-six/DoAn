import { useEffect, useState } from 'react'
import { CheckCircle, Trash2 } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDate } from '../../../lib/format'
import { toast } from '../../../lib/toast'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminReview } from '../shared/adminTypes'

export default function QuanLyReviewCongTyAdmin() {
  const [items, setItems] = useState<AdminReview[]>([])
  const [error, setError] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const load = async () => {
    try { setItems(await adminApi.list<AdminReview>('/danhgiacongty')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') }
  }
  useEffect(() => { void load() }, [])
  const approve = async (item: AdminReview) => {
    confirm('Duyệt review', 'Duyệt review công ty này?', async () => {
      await adminApi.update(`/danhgiacongty/${item.id}`, { daDuyet: true })
      toast.success('Đã duyệt review.')
      await load()
    }, 'info', 'Duyệt')
  }
  const remove = async (item: AdminReview) => {
    confirm('Xóa review', 'Xóa review này vĩnh viễn?', async () => {
      await adminApi.remove(`/danhgiacongty/${item.id}`)
      toast.success('Đã xóa review.')
      await load()
    }, 'danger', 'Xóa')
  }
  return (
    <AdminPage title="Quản lý review công ty" desc="Duyệt và làm sạch nội dung đánh giá công ty." action={<Button onClick={() => void load()}>Làm mới</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Nội dung', 'Điểm', 'Ngày tạo', 'Trạng thái', 'Thao tác']}>
          {items.length ? items.map(item => <tr key={item.id}><td className="max-w-96 text-sm font-semibold text-slate-700">{item.noiDung ?? '-'}</td><td className="text-sm font-black text-amber-600">{item.diem ?? '-'}</td><td className="text-sm font-semibold text-slate-600">{formatDate(item.ngayTao)}</td><td className="text-sm font-semibold text-slate-600">{item.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'}</td><td><ButtonGroup><Button size="sm" variant="success" icon={<CheckCircle size={14} />} disabled={item.daDuyet} onClick={() => void approve(item)}>Duyệt</Button><Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(item)}>Xóa</Button></ButtonGroup></td></tr>) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>
      <ConfirmDialogComponent />
    </AdminPage>
  )
}
