import { useEffect, useState } from 'react'
import { CheckCircle, Eye, Mail, Send, Trash2, XCircle } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDate, imageUrl } from '../../../lib/format'
import { jobStatusLabel, toneForJobStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import { Badge } from '../../nhatuyendung/shared/NtdAtoms'
import { adminApi } from '../shared/adminApi'
import { AdminPage, AdminPanel, AdminTable, EmptyRow } from '../shared/AdminTable'
import type { AdminJob } from '../shared/adminTypes'

type BulkEmailPreview = {
  tongUngVienCoCvChinh: number
  coEmailVaCvChinh: number
  thieuEmail: number
  tongJobHopLe: number
  coKetQuaPhuHop: number
  seGuiEmail: number
  mauGui?: Array<{ maUngVien: string; tenUngVien?: string; email: string; soJobPhuHop: number; jobs: Array<{ tieuDe?: string; diem: number }> }>
}

export default function DuyetTinTuyenDungAdmin() {
  const [items, setItems] = useState<AdminJob[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<AdminJob | null>(null)
  const [preview, setPreview] = useState<BulkEmailPreview | null>(null)
  const [dangXuLyEmail, setDangXuLyEmail] = useState(false)
  const { confirm, ConfirmDialogComponent } = useConfirm()

  const load = async () => {
    try {
      setItems(await adminApi.list<AdminJob>('/tintuyendung'))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const approve = async (item: AdminJob, path: 'duyet' | 'tu-choi') => {
    const approving = path === 'duyet'
    confirm(
      approving ? 'Duyệt tin tuyển dụng' : 'Từ chối tin tuyển dụng',
      `${approving ? 'Duyệt' : 'Từ chối'} tin "${item.tieuDe}"?`,
      async () => {
        await adminApi.action(`/tintuyendung/${item.id}/${path}`)
        toast.success(approving ? 'Đã duyệt tin tuyển dụng.' : 'Đã từ chối tin tuyển dụng.')
        await load()
        if (selected?.id === item.id) setSelected(null)
      },
      approving ? 'info' : 'warning',
      approving ? 'Duyệt' : 'Từ chối',
    )
  }

  const remove = async (item: AdminJob) => {
    confirm(
      'Xóa tin tuyển dụng',
      `Xóa tin "${item.tieuDe}"? Hành động này không thể khôi phục.`,
      async () => {
        await adminApi.remove(`/tintuyendung/${item.id}`)
        toast.success('Đã xóa tin tuyển dụng.')
        await load()
        if (selected?.id === item.id) setSelected(null)
      },
      'danger',
      'Xóa',
    )
  }

  const previewEmail = async () => {
    try {
      setDangXuLyEmail(true)
      setError('')
      setPreview(await apiCoXacThuc('/ai/goi-y-viec-lam/admin/preview') as BulkEmailPreview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xem trước được danh sách email')
    } finally {
      setDangXuLyEmail(false)
    }
  }

  const sendBulkEmail = async () => {
    if (!preview) return
    confirm(
      'Gửi email hàng loạt',
      `Gửi email gợi ý việc làm cho ${preview.seGuiEmail} ứng viên phù hợp?`,
      async () => {
        try {
          setDangXuLyEmail(true)
          setError('')
          const ketQua = await apiCoXacThuc('/ai/goi-y-viec-lam/admin/gui-email-hang-loat', { method: 'POST', body: JSON.stringify({ diemToiThieu: 55, soJobMoiEmail: 5 }) }) as any
          toast.success(`Đã gửi ${ketQua.daGui ?? 0} email. Thất bại: ${ketQua.thatBai ?? 0}.`)
          setPreview(null)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Không gửi được email hàng loạt'
          setError(message)
          toast.error(message)
        } finally {
          setDangXuLyEmail(false)
        }
      },
      'warning',
      'Gửi email',
    )
  }

  return (
    <AdminPage
      title="Duyệt tin tuyển dụng"
      desc="Quản lý tin trước khi hiển thị công khai; có thể xem, duyệt, từ chối hoặc xóa khi cần."
      action={<ButtonGroup><Button variant="secondary" icon={<Mail size={16} />} disabled={dangXuLyEmail} onClick={() => void previewEmail()}>{dangXuLyEmail ? 'Đang quét...' : 'Gửi gợi ý việc làm'}</Button><Button onClick={() => void load()}>Làm mới</Button></ButtonGroup>}
    >
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <AdminPanel>
        <AdminTable heads={['Tin tuyển dụng', 'Công ty', 'Trạng thái', 'Hạn nộp', 'Thao tác']} minWidth={980}>
          {items.length ? items.map(item => (
            <tr key={item.id}>
              <td>
                <strong className="block max-w-80 truncate text-sm font-black text-slate-950">{item.tieuDe}</strong>
                <span className="text-xs font-semibold text-slate-500">{item.diaChi}</span>
              </td>
              <td className="text-sm font-semibold text-slate-600">{item.nhaTuyenDung?.tenCongTy ?? item.maNhaTuyenDung}</td>
              <td><Badge tone={toneForJobStatus(item.trangThai)}>{jobStatusLabel[item.trangThai ?? ''] ?? item.trangThai}</Badge></td>
              <td className="text-sm font-semibold text-slate-600">{formatDate(item.hanNop)}</td>
              <td>
                <ButtonGroup>
                  <Button size="sm" variant="secondary" icon={<Eye size={14} />} onClick={() => setSelected(item)}>Xem</Button>
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(item)}>Xóa</Button>
                </ButtonGroup>
              </td>
            </tr>
          )) : <EmptyRow cols={5} />}
        </AdminTable>
      </AdminPanel>

      {preview && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/50 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-800">AI email matching</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Xem trước gửi email gợi ý việc làm</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Hệ thống chỉ dùng CV chính và các tin đang mở còn hạn.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Đóng</Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">CV chính</p><strong className="text-xl text-slate-950">{preview.tongUngVienCoCvChinh}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Có email</p><strong className="text-xl text-slate-950">{preview.coEmailVaCvChinh}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Job hợp lệ</p><strong className="text-xl text-slate-950">{preview.tongJobHopLe}</strong></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-700">Sẽ gửi</p><strong className="text-xl text-emerald-800">{preview.seGuiEmail}</strong></div>
            </div>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-slate-200">
              {(preview.mauGui ?? []).length ? (preview.mauGui ?? []).map(item => (
                <div key={item.maUngVien} className="border-b border-slate-100 p-3 last:border-b-0">
                  <strong className="block text-sm text-slate-950">{item.tenUngVien || item.email}</strong>
                  <p className="text-xs font-semibold text-slate-500">{item.email} - {item.soJobPhuHop} job phù hợp</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">{item.jobs.map(job => `${job.tieuDe ?? 'Job'} (${job.diem})`).join(', ')}</p>
                </div>
              )) : <p className="p-4 text-sm font-semibold text-slate-500">Chưa có ứng viên đủ điều kiện gửi email.</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPreview(null)}>Hủy</Button>
              <Button variant="primary" icon={<Send size={16} />} disabled={dangXuLyEmail || preview.seGuiEmail < 1} onClick={() => void sendBulkEmail()}>
                {dangXuLyEmail ? 'Đang gửi...' : 'Gửi email hàng loạt'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <aside className="ml-auto flex h-dvh w-full max-w-[760px] flex-col bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
            <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950">Chi tiết tin tuyển dụng</h2>
                <p className="truncate text-sm font-semibold text-slate-500">{selected.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Đóng</Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-4">
                {selected.anhDaiDien && (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img src={imageUrl(selected.anhDaiDien)} alt={selected.tieuDe} className="h-52 w-full object-cover" />
                  </div>
                )}
                <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">{selected.tieuDe}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{selected.diaChi ?? '-'}</p>
                  </div>
                  <div className="grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                    <p><strong>Công ty:</strong> {selected.nhaTuyenDung?.tenCongTy ?? '-'}</p>
                    <p><strong>Trạng thái:</strong> {jobStatusLabel[selected.trangThai ?? ''] ?? selected.trangThai}</p>
                    <p><strong>Hạn nộp:</strong> {formatDate(selected.hanNop)}</p>
                    <p><strong>Số lượng:</strong> {selected.soLuong ?? 0}</p>
                    <p><strong>Loại hình:</strong> {selected.loaiHinh ?? '-'}</p>
                    <p><strong>Cấp bậc:</strong> {selected.capBac ?? '-'}</p>
                  </div>
                </section>
                <section className="grid gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">Mô tả</h4>
                    <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{selected.moTa}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">Yêu cầu</h4>
                    <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{selected.yeuCau}</p>
                  </div>
                  {selected.quyenLoi && (
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">Quyền lợi</h4>
                      <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{selected.quyenLoi}</p>
                    </div>
                  )}
                </section>
                {Array.isArray(selected.kyNang) && selected.kyNang.length > 0 && (
                  <section className="rounded-xl border border-slate-200 p-4">
                    <h4 className="text-sm font-black uppercase tracking-wide text-slate-500">Kỹ năng</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.kyNang.map((item, index) => (
                        <Badge key={item.maKyNang ?? index} tone={item.batBuoc === false ? 'gray' : 'blue'}>
                          {item.tenKyNang ?? item.maKyNang ?? 'Kỹ năng'}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
            <footer className="border-t border-slate-200 bg-slate-50 p-4">
              <ButtonGroup>
                <Button size="sm" variant="success" icon={<CheckCircle size={14} />} disabled={selected.trangThai !== 'cho_duyet'} onClick={() => void approve(selected, 'duyet')}>Duyệt</Button>
                <Button size="sm" variant="danger" icon={<XCircle size={14} />} disabled={selected.trangThai !== 'cho_duyet'} onClick={() => void approve(selected, 'tu-choi')}>Từ chối</Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => void remove(selected)}>Xóa</Button>
              </ButtonGroup>
            </footer>
          </aside>
        </div>
      )}
      <ConfirmDialogComponent />
    </AdminPage>
  )
}
