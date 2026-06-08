import { useEffect, useState } from 'react'
import { CheckCircle, Search, Trash2 } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDate } from '../../../lib/format'
import { toast } from '../../../lib/toast'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminReview } from '../shared/adminTypes'

function reviewTitle(item: AdminReview) {
  return item.maNhaTuyenDung || `Review ${item.id}`
}

export default function QuanLyReviewCongTyAdmin() {
  const [items, setItems] = useState<AdminReview[]>([])
  const [selected, setSelected] = useState<AdminReview | null>(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const load = async () => {
    try {
      setItems(await adminApi.list<AdminReview>('/danhgiacongty'))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    }
  }

  useEffect(() => { void load() }, [])

  const approve = async (item: AdminReview) => {
    confirm('Duyệt review', 'Duyệt review công ty này?', async () => {
      setBusyId(`${item.id}:approve`)
      try {
        await adminApi.update(`/danhgiacongty/${item.id}`, { daDuyet: true })
        toast.success('Đã duyệt review.')
        if (selected?.id === item.id) setSelected({ ...selected, daDuyet: true })
        await load()
      } finally {
        setBusyId('')
      }
    }, 'info', 'Duyệt')
  }

  const remove = async (item: AdminReview) => {
    confirm('Xóa review', 'Xóa review này vĩnh viễn?', async () => {
      setBusyId(`${item.id}:remove`)
      try {
        await adminApi.remove(`/danhgiacongty/${item.id}`)
        toast.success('Đã xóa review.')
        if (selected?.id === item.id) setSelected(null)
        await load()
      } finally {
        setBusyId('')
      }
    }, 'danger', 'Xóa')
  }

  return (
    <AdminPage title="Quản lý review công ty" desc="Duyệt và làm sạch nội dung đánh giá công ty." action={<Button onClick={() => void load()}>Làm mới</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Nội dung', 'Điểm', 'Ngày tạo', 'Trạng thái', 'Thao tác']}>
          {items.length ? items.map(item => (
            <tr
              key={item.id}
              className="cursor-pointer transition hover:bg-slate-50"
              onClick={() => setSelected(item)}
            >
              <td className="max-w-96 text-sm font-semibold text-slate-700">{item.noiDung ?? '-'}</td>
              <td className="text-sm font-black text-amber-600">{item.diem ?? '-'}</td>
              <td className="text-sm font-semibold text-slate-600">{formatDate(item.ngayTao)}</td>
              <td className="text-sm font-semibold text-slate-600">{item.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'}</td>
              <td onClick={event => event.stopPropagation()}>
                <ButtonGroup>
                  <Button size="sm" variant="secondary" icon={<Search size={14} />} onClick={() => setSelected(item)}>Chi tiết</Button>
                  <Button size="sm" variant="success" icon={<CheckCircle size={14} />} loading={busyId === `${item.id}:approve`} disabled={item.daDuyet} onClick={() => void approve(item)}>Duyệt</Button>
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} loading={busyId === `${item.id}:remove`} onClick={() => void remove(item)}>Xóa</Button>
                </ButtonGroup>
              </td>
            </tr>
          )) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>

      {selected && (
        <DetailDrawer
          title={reviewTitle(selected)}
          subtitle={`Điểm: ${selected.diem ?? '-'} · ${selected.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'}`}
          onClose={() => setSelected(null)}
          footer={(
            <ButtonGroup>
              <Button variant="success" loading={busyId === `${selected.id}:approve`} disabled={selected.daDuyet} icon={<CheckCircle size={14} />} onClick={() => void approve(selected)}>
                Duyệt
              </Button>
              <Button variant="danger" loading={busyId === `${selected.id}:remove`} icon={<Trash2 size={14} />} onClick={() => void remove(selected)}>
                Xóa
              </Button>
            </ButtonGroup>
          )}
        >
          <div className="grid gap-4">
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Mã nhà tuyển dụng</span>
                <strong className="text-sm font-black text-slate-950">{selected.maNhaTuyenDung ?? '-'}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Điểm</span>
                <strong className="text-sm font-black text-slate-950">{selected.diem ?? '-'}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Ngày tạo</span>
                <strong className="text-sm font-black text-slate-950">{formatDate(selected.ngayTao)}</strong>
              </div>
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</span>
                <strong className="text-sm font-black text-slate-950">{selected.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'}</strong>
              </div>
            </section>
            <section className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Nội dung</span>
              <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{selected.noiDung ?? '-'}</p>
            </section>
          </div>
        </DetailDrawer>
      )}

      <ConfirmDialogComponent />
    </AdminPage>
  )
}
