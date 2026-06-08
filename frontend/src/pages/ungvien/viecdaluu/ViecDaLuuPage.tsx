import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Search, Trash2 } from 'lucide-react'
import { useConfirm } from '../../../components/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatMoney } from '../../../lib/format'
import { toast } from '../../../lib/toast'
import { EmptyState, ErrorState, Page, Panel } from '../shared/UngVienAtoms'

type SavedJob = {
  id: string
  maTinTuyenDung: string
  ngayLuu?: string
  tinTuyenDung?: {
    id: string
    tieuDe: string
    trangThai?: string
    diaChi?: string
    luongMin?: number
    luongMax?: number
    hanNop?: string
    nhaTuyenDung?: {
      tenCongTy?: string
      logo?: string
    }
  }
}

export default function ViecDaLuuPage() {
  const [items, setItems] = useState<SavedJob[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [error, setError] = useState('')
  const { confirm, ConfirmDialogComponent } = useConfirm()
  const ctaClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0a3659] bg-gradient-to-r from-[#0b5c91] via-[#0e629d] to-[#0a4c78] px-4 text-sm font-black !text-white shadow-[0_14px_30px_rgba(11,92,145,0.28)] transition hover:-translate-y-0.5 hover:from-[#0a4c78] hover:via-[#0b5c91] hover:to-[#08395f] hover:!text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200'

  const load = useCallback(async () => {
    setDangTai(true)
    try {
      const localSaved: string[] = JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]')
      if (localSaved.length) {
        await Promise.all(localSaved.map(id => apiCoXacThuc(`/viec-lam-da-luu/${id}`, { method: 'POST' }).catch(() => null)))
        localStorage.removeItem('itjob_saved_jobs')
      }
      const danhSach = await apiCoXacThuc('/viec-lam-da-luu') as SavedJob[]
      setItems(danhSach || [])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách việc làm đã lưu')
    } finally {
      setDangTai(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const boLuu = async (item: SavedJob) => {
    confirm(
      'Bỏ lưu việc làm',
      `Bỏ lưu tin "${item.tinTuyenDung?.tieuDe ?? 'này'}"?`,
      async () => {
        try {
          await apiCoXacThuc(`/viec-lam-da-luu/${item.maTinTuyenDung}`, { method: 'DELETE' })
          setItems(prev => prev.filter(saved => saved.maTinTuyenDung !== item.maTinTuyenDung))
          toast.success('Đã bỏ lưu việc làm.')
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Không bỏ lưu được việc làm'
          setError(message)
          toast.error(message)
        }
      },
      'warning',
      'Bỏ lưu',
    )
  }

  return (
    <Page
      title="Việc làm đã lưu"
      desc="Những tin tuyển dụng bạn đã đánh dấu để xem lại và ứng tuyển sau."
      action={
        <Link
          to="/viec-lam"
          className={ctaClass}
        >
          <Search size={16} />
          Tìm thêm việc làm
        </Link>
      }
    >
      <ErrorState message={error} />
      <Panel>
        {dangTai ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">Đang tải việc làm đã lưu...</div>
        ) : items.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map(item => {
              const job = item.tinTuyenDung
              const dangMo = job?.trangThai === 'dang_mo'
              return (
                <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <h2 className="line-clamp-2 text-base font-black text-slate-950">{job?.tieuDe ?? 'Tin tuyển dụng không còn tồn tại'}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{job?.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng'}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{job?.diaChi ?? 'Đang cập nhật'}</p>
                  </div>
                  <p className="text-sm font-black text-emerald-700">{formatMoney(job?.luongMin)} - {formatMoney(job?.luongMax)}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${dangMo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {dangMo ? 'Đang mở' : 'Đã đóng'}
                    </span>
                    {item.ngayLuu && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Lưu ngày {new Date(item.ngayLuu).toLocaleDateString('vi-VN')}</span>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="primary" icon={<Briefcase size={16} />} disabled={!job} onClick={() => { if (job) window.location.href = `/viec-lam/${job.id}` }}>
                      Xem việc
                    </Button>
                    <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => void boLuu(item)}>
                      Bỏ lưu
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState>
            <div className="mx-auto grid max-w-md justify-items-center gap-3">
              <p>Bạn chưa lưu việc làm nào. Khi thấy tin phù hợp, nhấn biểu tượng lưu để quay lại sau.</p>
              <Link
                to="/viec-lam"
                className={ctaClass}
              >
                <Search size={16} />
                Tìm thêm việc làm
              </Link>
            </div>
          </EmptyState>
        )}
      </Panel>
      <ConfirmDialogComponent />
    </Page>
  )
}
