import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { DetailDrawer } from '../../../components/DetailDrawer'
import { PhanTrang, usePhanTrang } from '../../../components/PhanTrang'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { toast } from '../../../lib/toast'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import { Field, Input, Select, Textarea } from '../shared/AdminFormControls'
import type { AdminSkill } from '../shared/adminTypes'

type SkillFormState = {
  tenKyNang: string
  loaiMode: 'existing' | 'new'
  loaiKyNang: string
  loaiKyNangMoi: string
  moTa: string
}

const defaultSkillTypes = ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'database', 'data', 'design', 'kiem_thu', 'phan_tich', 'khac']

function normalizeType(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

function toFormState(item?: AdminSkill | null): SkillFormState {
  return {
    tenKyNang: item?.tenKyNang ?? '',
    loaiMode: item?.loaiKyNang ? 'existing' : 'new',
    loaiKyNang: item?.loaiKyNang ?? '',
    loaiKyNangMoi: '',
    moTa: item?.moTa ?? '',
  }
}

export default function QuanLyKyNangAdmin() {
  const [items, setItems] = useState<AdminSkill[]>([])
  const [selected, setSelected] = useState<AdminSkill | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminSkill | null>(null)
  const [form, setForm] = useState<SkillFormState>(toFormState())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [tuKhoa, setTuKhoa] = useState('')
  const [locLoai, setLocLoai] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const danhSachHienThi = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase()
    return items.filter(item => {
      const khopKw = !kw || (item.tenKyNang ?? '').toLowerCase().includes(kw)
      const khopLoai = !locLoai || item.loaiKyNang === locLoai
      return khopKw && khopLoai
    })
  }, [items, tuKhoa, locLoai])

  const phanTrang = usePhanTrang(danhSachHienThi)

  const load = async () => {
    try {
      setItems(await adminApi.list<AdminSkill>('/danhmuckynang'))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const skillTypes = useMemo(() => {
    const merged = new Set<string>(defaultSkillTypes)
    for (const item of items) {
      if (item.loaiKyNang) merged.add(item.loaiKyNang)
    }
    return [...merged].sort((left, right) => left.localeCompare(right))
  }, [items])

  const openCreate = () => {
    setEditing(null)
    setForm(toFormState())
    setFormOpen(true)
  }

  const openEdit = (item: AdminSkill) => {
    setSelected(null)
    setEditing(item)
    setForm(toFormState(item))
    setFormOpen(true)
  }

  const submit = async () => {
    const tenKyNang = form.tenKyNang.trim()
    const loaiKyNang = form.loaiMode === 'new' ? normalizeType(form.loaiKyNangMoi) : normalizeType(form.loaiKyNang)
    if (!tenKyNang) {
      setError('Vui lòng nhập tên kỹ năng.')
      return
    }
    if (!loaiKyNang) {
      setError('Vui lòng chọn hoặc tạo loại kỹ năng.')
      return
    }

    setSaving(true)
    try {
      const payload = { tenKyNang, loaiKyNang, moTa: form.moTa.trim() || undefined }
      if (editing) await adminApi.update(`/danhmuckynang/${editing.id}`, payload)
      else await adminApi.create('/danhmuckynang', payload)
      toast.success(editing ? 'Đã cập nhật kỹ năng.' : 'Đã thêm kỹ năng.')
      setFormOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được kỹ năng')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: AdminSkill) => {
    confirm('Xóa kỹ năng', `Xóa kỹ năng "${item.tenKyNang}"? Các tin đang dùng kỹ năng này có thể bị ảnh hưởng.`, async () => {
      await adminApi.remove(`/danhmuckynang/${item.id}`)
      toast.success('Đã xóa kỹ năng.')
      if (selected?.id === item.id) setSelected(null)
      await load()
    }, 'danger', 'Xóa')
  }

  return (
    <AdminPage title="Quản lý kỹ năng" desc="Chuẩn hóa danh mục kỹ năng cho tin tuyển dụng và CV." action={<Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>Thêm kỹ năng</Button>}>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <div className="mb-3 grid gap-2 sm:flex sm:items-center">
          <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} />
            <input className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" placeholder="Tìm tên kỹ năng..." value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} />
            {tuKhoa && <button type="button" onClick={() => setTuKhoa('')}><X size={14} /></button>}
          </label>
          <select className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-44" value={locLoai} onChange={e => setLocLoai(e.target.value)}>
            <option value="">Tất cả loại</option>
            {skillTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <AdminTable heads={['Kỹ năng', 'Loại', 'Thao tác']} minWidth={620}>
          {phanTrang.danhSachTrang.length ? phanTrang.danhSachTrang.map(item => (
            <tr
              key={item.id}
              className="cursor-pointer transition hover:bg-slate-50"
              onClick={() => setSelected(item)}
            >
              <td className="text-sm font-black text-slate-950">{item.tenKyNang}</td>
              <td className="text-sm font-semibold text-slate-600">{item.loaiKyNang ?? '-'}</td>
              <td onClick={event => event.stopPropagation()}>
                <ButtonGroup>
                  <Button size="sm" variant="secondary" icon={<Edit3 size={14} />} onClick={() => openEdit(item)}>Sửa</Button>
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(item)}>Xóa</Button>
                </ButtonGroup>
              </td>
            </tr>
          )) : <EmptyRow cols={3} />}
        </AdminTable>
        <PhanTrang {...phanTrang} donVi="kỹ năng" className="mt-4" />
      </AdminPanel>

      {selected && !formOpen && (
        <DetailDrawer
          title={selected.tenKyNang}
          subtitle={`Loại: ${selected.loaiKyNang ?? '-'}`}
          onClose={() => setSelected(null)}
          footer={(
            <ButtonGroup>
              <Button variant="secondary" icon={<Edit3 size={14} />} onClick={() => openEdit(selected)}>Sửa</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(selected)}>Xóa</Button>
            </ButtonGroup>
          )}
        >
          <div className="grid gap-3">
            <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Tên kỹ năng</span>
              <strong className="text-sm font-black text-slate-950">{selected.tenKyNang}</strong>
            </div>
            <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Loại kỹ năng</span>
              <strong className="text-sm font-black text-slate-950">{selected.loaiKyNang ?? '-'}</strong>
            </div>
            {selected.moTa && (
              <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Mô tả</span>
                <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{selected.moTa}</p>
              </div>
            )}
          </div>
        </DetailDrawer>
      )}

      {formOpen && (
        <DetailDrawer
          title={editing ? 'Sửa kỹ năng' : 'Thêm kỹ năng'}
          subtitle="Điền đủ tên kỹ năng và loại kỹ năng trước khi lưu."
          onClose={() => setFormOpen(false)}
          footer={(
            <ButtonGroup>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button loading={saving} onClick={() => void submit()}>{editing ? 'Lưu thay đổi' : 'Tạo kỹ năng'}</Button>
            </ButtonGroup>
          )}
        >
          <div className="grid gap-4">
            <Field label="Tên kỹ năng">
              <Input value={form.tenKyNang} onChange={event => setForm(current => ({ ...current, tenKyNang: event.target.value }))} placeholder="VD: React, Node.js, SQL..." />
            </Field>

            <Field label="Loại kỹ năng">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
                <Select value={form.loaiMode === 'existing' ? 'existing' : 'new'} onChange={event => setForm(current => ({ ...current, loaiMode: event.target.value as SkillFormState['loaiMode'] }))}>
                  <option value="existing">Chọn loại có sẵn</option>
                  <option value="new">Tạo loại mới</option>
                </Select>
                {form.loaiMode === 'existing' ? (
                  <Select value={form.loaiKyNang} onChange={event => setForm(current => ({ ...current, loaiKyNang: event.target.value }))}>
                    <option value="">Chọn loại</option>
                    {skillTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </Select>
                ) : (
                  <Input value={form.loaiKyNangMoi} onChange={event => setForm(current => ({ ...current, loaiKyNangMoi: event.target.value }))} placeholder="VD: frontend, backend, data..." />
                )}
              </div>
            </Field>

            <Field label="Mô tả">
              <Textarea value={form.moTa} onChange={event => setForm(current => ({ ...current, moTa: event.target.value }))} placeholder="Mô tả ngắn về nhóm kỹ năng này..." />
            </Field>
          </div>
        </DetailDrawer>
      )}

      <ConfirmDialogComponent />
    </AdminPage>
  )
}
