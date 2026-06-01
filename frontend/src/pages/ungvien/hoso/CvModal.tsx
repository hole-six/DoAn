import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import type { HoSoNangLuc } from '../../../types/recruitment'
import { Drawer } from '../shared/UngVienAtoms'

export function CvModal({ initial, maUngVien, onClose, onSubmit }: { initial?: Partial<HoSoNangLuc>; maUngVien?: string; onClose: () => void; onSubmit: (value: Partial<HoSoNangLuc>) => Promise<void> }) {
  const [form, setForm] = useState<Partial<HoSoNangLuc>>({
    tieuDe: initial?.tieuDe ?? 'CV Backend Developer',
    cvChinh: initial?.cvChinh ?? false,
    congKhai: initial?.congKhai ?? true,
    maUngVien: maUngVien ?? initial?.maUngVien ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer title={initial?.id ? 'Chỉnh sửa CV' : 'Tạo CV'} onClose={onClose} footer={<ButtonGroup><Button onClick={onClose}>Hủy</Button><Button variant="primary" loading={saving} icon={<Save size={16} />} onClick={save}>Lưu CV</Button></ButtonGroup>}>
      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-black text-slate-700">Tiêu đề CV</span>
          <input className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100" value={form.tieuDe ?? ''} onChange={event => setForm({ ...form, tieuDe: event.target.value })} />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={Boolean(form.cvChinh)} onChange={event => setForm({ ...form, cvChinh: event.target.checked })} />
          Đặt làm CV chính
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={Boolean(form.congKhai)} onChange={event => setForm({ ...form, congKhai: event.target.checked })} />
          Cho phép nhà tuyển dụng xem CV
        </label>
      </div>
    </Drawer>
  )
}
