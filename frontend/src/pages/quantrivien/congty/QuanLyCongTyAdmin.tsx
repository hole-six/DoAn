import { useEffect, useState } from 'react'
import { CheckCircle, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { formatDate } from '../../../lib/format'
import { toast } from '../../../lib/toast'
import { Badge } from '../../nhatuyendung/shared/NtdAtoms'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminCompany } from '../shared/adminTypes'

const statusLabels: Record<string, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  bi_khoa: 'Bị khóa',
}

function tone(value?: string) {
  if (value === 'da_duyet') return 'green' as const
  if (value === 'tu_choi' || value === 'bi_khoa') return 'red' as const
  return 'yellow' as const
}

export default function QuanLyCongTyAdmin() {
  const [items, setItems] = useState<AdminCompany[]>([])
  const [error, setError] = useState('')
  const [dangXuLy, setDangXuLy] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const load = async () => {
    try {
      setItems(await adminApi.list<AdminCompany>('/nhatuyendung'))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu công ty')
    }
  }

  useEffect(() => { void load() }, [])

  const update = async (item: AdminCompany, trangThaiDuyet: string) => {
    setDangXuLy(`${item.id}:${trangThaiDuyet}`)
    try {
      await adminApi.update(`/nhatuyendung/${item.id}`, { trangThaiDuyet })
      toast.success('Đã cập nhật trạng thái công ty.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được trạng thái công ty')
    } finally {
      setDangXuLy('')
    }
  }

  const remove = async (item: AdminCompany) => {
    confirm(
      'Xóa công ty',
      `Xóa công ty "${item.tenCongTy}"? Hành động này chỉ nên dùng khi hồ sơ có vấn đề nghiêm trọng.`,
      async () => {
        setDangXuLy(`${item.id}:xoa`)
        try {
          await adminApi.remove(`/nhatuyendung/${item.id}`)
          toast.success('Đã xóa công ty.')
          await load()
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Không xóa được công ty'
          setError(message)
          toast.error(message)
        } finally {
          setDangXuLy('')
        }
      },
      'danger',
      'Xóa',
    )
  }

  const confirmUpdate = (item: AdminCompany, trangThaiDuyet: string) => {
    const approved = trangThaiDuyet === 'da_duyet'
    confirm(
      approved ? 'Duyệt công ty' : 'Từ chối công ty',
      `${approved ? 'Duyệt' : 'Từ chối'} công ty "${item.tenCongTy}"?`,
      () => void update(item, trangThaiDuyet),
      approved ? 'info' : 'warning',
      approved ? 'Duyệt' : 'Từ chối',
    )
  }

  const renderActions = (item: AdminCompany) => {
    const trangThai = item.trangThaiDuyet ?? 'cho_duyet'
    const dangDuyet = dangXuLy === `${item.id}:da_duyet`
    const dangTuChoi = dangXuLy === `${item.id}:tu_choi`
    const dangXoa = dangXuLy === `${item.id}:xoa`

    return (
      <ButtonGroup>
        {(trangThai === 'cho_duyet' || trangThai === 'tu_choi') && (
          <Button size="sm" variant="success" loading={dangDuyet} icon={trangThai === 'tu_choi' ? <RotateCcw size={14} /> : <CheckCircle size={14} />} onClick={() => confirmUpdate(item, 'da_duyet')}>
            {trangThai === 'tu_choi' ? 'Duyệt lại' : 'Duyệt'}
          </Button>
        )}
        {trangThai === 'cho_duyet' && (
          <Button size="sm" variant="danger" loading={dangTuChoi} icon={<XCircle size={14} />} onClick={() => confirmUpdate(item, 'tu_choi')}>
            Từ chối
          </Button>
        )}
        {trangThai === 'da_duyet' && (
          <Button size="sm" variant="success" disabled icon={<CheckCircle size={14} />}>
            Đã duyệt
          </Button>
        )}
        <Button size="sm" variant="danger" loading={dangXoa} icon={<Trash2 size={14} />} onClick={() => void remove(item)}>
          Xóa
        </Button>
      </ButtonGroup>
    )
  }

  return (
    <AdminPage
      title="Quản lý công ty"
      desc="Duyệt, từ chối và theo dõi hồ sơ nhà tuyển dụng."
      action={<Button onClick={() => void load()}>Làm mới</Button>}
    >
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Công ty', 'Ngành', 'Trạng thái', 'Ngày tạo', 'Thao tác']}>
          {items.length ? items.map(item => {
            const trangThai = item.trangThaiDuyet ?? 'cho_duyet'
            return (
              <tr key={item.id}>
                <td>
                  <strong className="block text-sm font-black text-slate-950">{item.tenCongTy}</strong>
                  <span className="text-xs font-semibold text-slate-500">{item.diaChi || '-'}</span>
                </td>
                <td className="text-sm font-semibold text-slate-600">{item.nganh ?? '-'}</td>
                <td><Badge tone={tone(trangThai)}>{statusLabels[trangThai] ?? trangThai}</Badge></td>
                <td className="text-sm font-semibold text-slate-600">{formatDate((item as { ngayTao?: string }).ngayTao)}</td>
                <td>{renderActions(item)}</td>
              </tr>
            )
          }) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>
      <ConfirmDialogComponent />
    </AdminPage>
  )
}
