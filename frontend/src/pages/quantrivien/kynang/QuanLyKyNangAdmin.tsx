import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminSkill } from '../shared/adminTypes'

export default function QuanLyKyNangAdmin() {
  const [items, setItems] = useState<AdminSkill[]>([])
  const [error, setError] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const load = async () => {
    try { setItems(await adminApi.list<AdminSkill>('/danhmuckynang')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu') }
  }
  useEffect(() => { void load() }, [])
  const create = async () => {
    const tenKyNang = window.prompt('Tên kỹ năng?')
    if (!tenKyNang) return
    await adminApi.create('/danhmuckynang', { tenKyNang, loaiKyNang: 'khac' })
    toast.success('Đã thêm kỹ năng.')
    await load()
  }
  const remove = async (item: AdminSkill) => {
    confirm('Xóa kỹ năng', `Xóa kỹ năng "${item.tenKyNang}"? Các tin đang dùng kỹ năng này có thể bị ảnh hưởng.`, async () => {
      await adminApi.remove(`/danhmuckynang/${item.id}`)
      toast.success('Đã xóa kỹ năng.')
      await load()
    }, 'danger', 'Xóa')
  }
  return (
    <AdminPage title="Quản lý kỹ năng" desc="Chuẩn hóa danh mục kỹ năng cho tin tuyển dụng và CV." action={<Button variant="primary" icon={<Plus size={16} />} onClick={() => void create()}>Thêm kỹ năng</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Kỹ năng', 'Loại', 'Thao tác']} minWidth={620}>
          {items.length ? items.map(item => <tr key={item.id}><td className="text-sm font-black text-slate-950">{item.tenKyNang}</td><td className="text-sm font-semibold text-slate-600">{item.loaiKyNang ?? '-'}</td><td><ButtonGroup><Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(item)}>Xóa</Button></ButtonGroup></td></tr>) : <EmptyRow cols={3} />}
        </AdminTable>
      </AdminPanel>
      <ConfirmDialogComponent />
    </AdminPage>
  )
}
