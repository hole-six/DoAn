import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ConfirmDialog,
  AlertItem,
  QuickActionCard,
  StatCard,
  PendingJobRow,
  type ConfirmState,
  type AlertModel,
  type PendingJobModel,
  type QuickActionModel,
  type StatCardModel,
} from '../../components'
import AppIcon from '../../components/AppIcon'
import { layAccessToken } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import { CheckCircle, Clock, Users, Briefcase, Building2, AlertTriangle, RefreshCw, FileText, Server } from 'lucide-react'
import './admin-styles.css'

const panelClass = 'rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'

function headers() {
  const token = layAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers ?? {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.thongBao ?? 'Thao tác thất bại')
  return data.duLieu ?? data
}

const formatNumber = (value: number) => value.toLocaleString('vi-VN')
const getDate = (value?: string) => value ? new Date(value) : undefined

function relativeTime(value?: string) {
  const date = getDate(value)
  if (!date || Number.isNaN(date.getTime())) return 'Chưa rõ'
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

function pendingLabel(value?: string) {
  const date = getDate(value)
  if (!date) return 'Chờ duyệt'
  const hours = (Date.now() - date.getTime()) / 36e5
  if (hours >= 24) return 'Chờ lâu'
  return 'Vừa gửi'
}

const thaoTacNhanh: QuickActionModel[] = [
  { icon: Users, label: 'Người dùng', to: '/quan-tri/nguoi-dung' },
  { icon: Building2, label: 'Công ty', to: '/quan-tri/cong-ty' },
  { icon: Briefcase, label: 'Tin tuyển dụng', to: '/quan-tri/tin-tuyen-dung' },
  { icon: Server, label: 'Cài đặt', to: '/quan-tri/cai-dat' },
]

export default function DashboardQuanTriVien() {
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<{
    nguoiDung: any[]
    tinTuyenDung: any[]
    nhaTuyenDung: any[]
    hoSoUngTuyen: any[]
    canhBaoQuanTri: any[]
    capNhatCanhBaoLuc?: string
  }>({ nguoiDung: [], tinTuyenDung: [], nhaTuyenDung: [], hoSoUngTuyen: [], canhBaoQuanTri: [] })

  async function load() {
    try {
      setLoading(true)
      setError('')
      const [nguoiDung, tinTuyenDung, nhaTuyenDung, hoSoUngTuyen, canhBao] = await Promise.all([
        api('/nguoidung'),
        api('/tintuyendung'),
        api('/nhatuyendung'),
        api('/hosoungtuyen'),
        api('/canhbaoquantri').catch(() => ({ canhBao: [], capNhatLuc: undefined })),
      ])
      setData({
        nguoiDung: Array.isArray(nguoiDung) ? nguoiDung : [],
        tinTuyenDung: Array.isArray(tinTuyenDung) ? tinTuyenDung : [],
        nhaTuyenDung: Array.isArray(nhaTuyenDung) ? nhaTuyenDung : [],
        hoSoUngTuyen: Array.isArray(hoSoUngTuyen) ? hoSoUngTuyen : [],
        canhBaoQuanTri: Array.isArray(canhBao?.canhBao) ? canhBao.canhBao : [],
        capNhatCanhBaoLuc: canhBao?.capNhatLuc,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const tinChoDuyetRaw = useMemo(
    () => data.tinTuyenDung.filter((item) => item.trangThai === 'cho_duyet'),
    [data.tinTuyenDung],
  )
  const congTyChoDuyet = useMemo(
    () => data.nhaTuyenDung.filter((item) => item.trangThaiDuyet === 'cho_duyet'),
    [data.nhaTuyenDung],
  )
  const tinDangMo = useMemo(
    () => data.tinTuyenDung.filter((item) => item.trangThai === 'dang_mo'),
    [data.tinTuyenDung],
  )
  const hoSoMoiTrong24h = useMemo(() => {
    const moc = Date.now() - 24 * 60 * 60 * 1000
    return data.hoSoUngTuyen.filter((item) => {
      const raw = item.ngayNop ?? item.ngayTao
      const time = raw ? new Date(raw).getTime() : 0
      return time >= moc
    })
  }, [data.hoSoUngTuyen])

  const thongKe: StatCardModel[] = [
    { icon: Users, so: formatNumber(data.nguoiDung.length), nhan: 'Tổng người dùng', phu: `${data.nguoiDung.filter((x) => x.trangThai === 'hoat_dong').length} tài khoản hoạt động`, tone: 'blue' },
    { icon: Briefcase, so: formatNumber(tinDangMo.length), nhan: 'Việc làm đang mở', phu: `${tinChoDuyetRaw.length} tin chờ duyệt`, tone: 'green' },
    { icon: Building2, so: formatNumber(congTyChoDuyet.length), nhan: 'Công ty chờ duyệt', phu: congTyChoDuyet.length ? 'Cần xử lý trong hôm nay' : 'Không còn hồ sơ tồn', tone: congTyChoDuyet.length ? 'red' : 'green' },
    { icon: FileText, so: formatNumber(hoSoMoiTrong24h.length), nhan: 'Ứng tuyển mới', phu: `${data.hoSoUngTuyen.length} hồ sơ toàn hệ thống`, tone: hoSoMoiTrong24h.length > 30 ? 'yellow' : 'blue' },
  ]

  const tinChoDuyet: PendingJobModel[] = tinChoDuyetRaw.slice(0, 5).map((item) => ({
    id: item.id,
    tieuDe: item.tieuDe ?? 'Tin tuyển dụng',
    congTy: item.nhaTuyenDung?.tenCongTy ?? 'Chưa có công ty',
    diaDiem: item.diaChi ?? 'Chưa cập nhật',
    thoiGian: relativeTime(item.ngayTao ?? item.ngayDang ?? item.ngayCapNhat),
    trangThai: pendingLabel(item.ngayTao ?? item.ngayDang ?? item.ngayCapNhat),
  }))

  const canhBao: AlertModel[] = data.canhBaoQuanTri.map((item) => ({
    loai: item.loai === 'error' ? 'error' : 'warning',
    icon: item.id?.includes('cong-ty') ? Building2 : item.id?.includes('tai-khoan') ? Users : item.id?.includes('ung-tuyen') ? FileText : item.id?.includes('het-han') ? Clock : AlertTriangle,
    tieu: item.tieu,
    moTa: item.moTa,
  }))
  async function patchTin(id: string | number, patch: Record<string, unknown>) {
    await api(`/tintuyendung/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await load()
  }

  return (
    <div className="mx-auto grid w-full max-w-[1360px] gap-4 pb-4 text-slate-900">
      {confirm && (
        <ConfirmDialog
          isOpen
          title={confirm.title}
          message={confirm.message}
          type={confirm.type}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <header className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-[#0e4d7d]">ITJob Admin</span>
          <h1 className="break-words text-[26px] font-black leading-tight text-slate-950">Tổng quan hệ thống</h1>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
            Theo dõi dữ liệu vận hành và cảnh báo được backend tính định kỳ bằng cron.
          </p>
          {error && <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={load}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#062a4d]/30 hover:text-[#062a4d] sm:w-auto"
          >
            <AppIcon icon={RefreshCw} size={16} />
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <Link
            to="/quan-tri/tin-tuyen-dung"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg !border !border-[#062a4d] !bg-[#062a4d] px-4 text-sm font-black !text-white shadow-[0_10px_22px_rgba(6,42,77,0.28)] transition hover:!border-[#041b33] hover:!bg-[#041b33] sm:w-auto"
          >
            <AppIcon icon={CheckCircle} size={16} />
            Kiểm duyệt ngay
          </Link>
        </div>
      </header>

      <div className="admin-dashboard-kpi-grid grid grid-cols-2 gap-2.5 max-[360px]:grid-cols-1 sm:gap-3 xl:grid-cols-4">
        {thongKe.map((item) => <StatCard key={item.nhan} item={item} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className={panelClass}>
          <div className="mb-4 grid gap-2 border-b border-slate-100 pb-4 min-[520px]:flex min-[520px]:items-start min-[520px]:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-black leading-tight text-slate-950">Tin tuyển dụng chờ duyệt</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">Danh sách lấy từ `/tintuyendung` với trạng thái `cho_duyet`.</p>
            </div>
            <Link to="/quan-tri/tin-tuyen-dung" className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-black text-[#062a4d] hover:bg-slate-100">Xem tất cả</Link>
          </div>

          <div className="grid gap-2.5">
            {tinChoDuyet.length ? tinChoDuyet.map((tin) => (
              <PendingJobRow
                key={tin.id}
                tin={tin}
                onReject={(t) =>
                  setConfirm({
                    title: 'Từ chối tin tuyển dụng',
                    message: `Bạn có chắc muốn từ chối tin "${t.tieuDe}"?`,
                    type: 'danger',
                    onConfirm: async () => {
                      await patchTin(t.id, { trangThai: 'tu_choi' })
                      setConfirm(null)
                    },
                  })
                }
                onApprove={(t) =>
                  setConfirm({
                    title: 'Duyệt tin tuyển dụng',
                    message: `Bạn có chắc muốn duyệt tin "${t.tieuDe}"? Tin sẽ được hiển thị công khai.`,
                    type: 'info',
                    onConfirm: async () => {
                      await patchTin(t.id, { trangThai: 'dang_mo' })
                      setConfirm(null)
                    },
                  })
                }
              />
            )) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-bold text-slate-500">
                Không còn tin tuyển dụng chờ duyệt.
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-4 lg:sticky lg:top-6 lg:self-start">
          <section className={panelClass}>
            <div className="mb-3">
              <h2 className="text-xl font-black leading-tight text-slate-950">Cảnh báo vận hành</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {data.capNhatCanhBaoLuc ? `Cron cập nhật lúc ${new Date(data.capNhatCanhBaoLuc).toLocaleString('vi-VN', { hour12: false })}` : 'Đang chờ cron tính dữ liệu'}
              </p>
            </div>
            <div className="grid gap-3">
              {canhBao.length ? canhBao.map((item) => <AlertItem key={item.tieu} item={item} />) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-bold text-emerald-700">
                  Không có cảnh báo cần xử lý.
                </div>
              )}
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="mb-3 text-xl font-black leading-tight text-slate-950">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 gap-3">
              {thaoTacNhanh.map((item) => <QuickActionCard key={item.to} item={item} />)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
