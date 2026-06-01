import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Calendar, Bell, Star, TrendingUp, Eye } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from '../../lib/toast'
import { DashboardSkeleton, EmptyState, ErrorState, Card, CardHeader, StatusBadge, Button } from '../../components'
import { layNguoiDung } from '../../lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThongKe { daUngTuyen: number; lichPhongVan: number; viecDaLuu: number; thongBaoMoi: number }
interface HoSoUngTuyen { id: string; viTri: string; congTy: string; trangThai: string; ngay: string }
interface LichPhongVan { id: string; viTri: string; congTy: string; ngay: string; gio: string; hinh: string }
interface DashboardData {
  thongKe: ThongKe
  hoSoUngTuyen: HoSoUngTuyen[]
  lichPhongVan: LichPhongVan[]
  hoSo?: { doHoanThien: number; luotXem: number }
}

// ─── Mock data hook ───────────────────────────────────────────────────────────

function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      await new Promise(r => setTimeout(r, 600))
      setData({
        thongKe: { daUngTuyen: 12, lichPhongVan: 3, viecDaLuu: 8, thongBaoMoi: 5 },
        hoSoUngTuyen: [
          { id: '1', viTri: 'Senior ReactJS Developer', congTy: 'FPT Software',   trangThai: 'Đang xem xét', ngay: '20/05/2025' },
          { id: '2', viTri: 'Frontend Lead',            congTy: 'Axon Active',    trangThai: 'Phỏng vấn',    ngay: '18/05/2025' },
          { id: '3', viTri: 'UI/UX Designer',           congTy: 'KMS Technology', trangThai: 'Offer gửi',    ngay: '15/05/2025' },
        ],
        lichPhongVan: [
          { id: '1', viTri: 'Frontend Lead',            congTy: 'Axon Active',  ngay: '26/05/2025', gio: '14:00', hinh: 'Online (Google Meet)' },
          { id: '2', viTri: 'Senior ReactJS Developer', congTy: 'FPT Software', ngay: '28/05/2025', gio: '09:30', hinh: 'Tại văn phòng' },
        ],
        hoSo: { doHoanThien: 72, luotXem: 24 },
      })
    } catch (err: any) {
      const msg = err.response?.data?.thongBao || err.message || 'Không thể tải dữ liệu'
      setError(msg); toast.error('Không thể tải dữ liệu. Vui lòng thử lại!')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])
  return { loading, error, data, refetch: fetchData }
}

// ─── Progress ring (SVG) ──────────────────────────────────────────────────────

function ProgressRing({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#7dd3fc" strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardUngVien() {
  const { loading, error, data, refetch } = useDashboardData()
  const navigate = useNavigate()
  const nguoiDung = layNguoiDung()

  if (loading) return <DashboardSkeleton />
  if (error)   return <ErrorState title="Không thể tải dữ liệu" message={error} onRetry={refetch} />
  if (!data)   return <EmptyState title="Chưa có dữ liệu" description="Vui lòng thử lại sau." actionLabel="Tải lại" onAction={refetch} />

  const kpis = [
    { icon: Briefcase, so: data.thongKe.daUngTuyen, nhan: 'Đã ứng tuyển',  color: '#0ea5e9', bg: 'bg-sky-50',     text: 'text-sky-700'     },
    { icon: Calendar,  so: data.thongKe.lichPhongVan, nhan: 'Lịch phỏng vấn', color: '#f59e0b', bg: 'bg-amber-50',  text: 'text-amber-700'   },
    { icon: Star,      so: data.thongKe.viecDaLuu,   nhan: 'Việc đã lưu',   color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { icon: Bell,      so: data.thongKe.thongBaoMoi, nhan: 'Thông báo mới', color: '#e11d48', bg: 'bg-rose-50',    text: 'text-rose-700'    },
  ]

  return (
    <div className="space-y-4 pb-24 sm:space-y-5 sm:pb-6 px-3 sm:px-0">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4 sm:p-5 md:p-6 text-white shadow-lg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative grid gap-4 sm:gap-5 md:grid-cols-[1fr_auto]">
          {/* Left */}
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-300">Chào mừng trở lại</p>
            <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Xin chào, {nguoiDung?.hoTen || 'Ứng viên'}! 👋
            </h2>
            <p className="mt-2 max-w-lg text-xs sm:text-sm font-medium leading-relaxed text-sky-100">
              Hồ sơ của bạn đang được{' '}
              <span className="font-black text-white">{data.hoSo?.luotXem || 0} nhà tuyển dụng</span>{' '}
              xem. Tiếp tục cập nhật để tăng cơ hội.
            </p>

            {/* Quick stats inline */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold backdrop-blur-sm">
                <Eye size={12} className="text-sky-300 shrink-0" />
                <span>{data.hoSo?.luotXem || 0} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold backdrop-blur-sm">
                <TrendingUp size={12} className="text-emerald-300 shrink-0" />
                <span>{data.hoSo?.doHoanThien || 0}% hoàn thiện</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap gap-2">
              <Link
                to="/ung-vien/ho-so"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-sky-400 active:scale-95"
              >
                Cập nhật hồ sơ
              </Link>
              <Link
                to="/viec-lam"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/10 active:scale-95"
              >
                Tìm việc mới
              </Link>
            </div>
          </div>

          {/* Right — progress ring */}
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white/10 p-4 backdrop-blur-sm md:min-w-[140px]">
            <div className="relative">
              <ProgressRing value={data.hoSo?.doHoanThien || 0} size={80} />
              <span className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-black text-white">
                {data.hoSo?.doHoanThien || 0}%
              </span>
            </div>
            <p className="text-center text-xs font-bold text-sky-100">Độ hoàn thiện hồ sơ</p>
          </div>
        </div>
      </div>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {kpis.map(item => (
          <div key={item.nhan} className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md sm:flex-col sm:items-start">
            <div className={clsx('grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg sm:rounded-xl', item.bg, item.text)}>
              <item.icon size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-slate-400 truncate">{item.nhan}</p>
              <strong className="block text-xl sm:text-2xl font-black leading-none text-slate-950 mt-0.5">{item.so}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-col grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">

        {/* Applications */}
        <Card padding="md">
          <CardHeader
            title="Hồ sơ ứng tuyển gần đây"
            action={<Link to="/ung-vien/ung-tuyen" className="no-underline"><Button variant="ghost" size="sm">Xem tất cả</Button></Link>}
          />
          {data.hoSoUngTuyen.length === 0 ? (
            <EmptyState icon={Briefcase} title="Chưa có hồ sơ ứng tuyển" description="Bắt đầu tìm kiếm việc làm ngay!" actionLabel="Tìm việc ngay" onAction={() => navigate('/viec-lam')} />
          ) : (
            <div className="space-y-2">
              {data.hoSoUngTuyen.map(hs => (
                <div key={hs.id} className="grid grid-cols-1 gap-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 transition hover:border-sky-200 hover:bg-sky-50/40 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm sm:text-base font-black text-slate-950">{hs.viTri}</strong>
                    <span className="mt-0.5 block truncate text-xs sm:text-sm font-medium text-slate-500">{hs.congTy}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">{hs.ngay}</span>
                  <StatusBadge status={hs.trangThai} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Interviews */}
        <Card padding="md">
          <CardHeader
            title="Lịch phỏng vấn"
            action={<Link to="/ung-vien/lich-phong-van" className="no-underline"><Button variant="ghost" size="sm">Xem tất cả</Button></Link>}
          />
          {data.lichPhongVan.length === 0 ? (
            <EmptyState icon={Calendar} title="Chưa có lịch phỏng vấn" description="Bạn chưa có lịch phỏng vấn nào được sắp xếp." />
          ) : (
            <div className="space-y-2">
              {data.lichPhongVan.map(lv => (
                <article key={lv.id} className="flex gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 transition hover:border-sky-200 hover:bg-sky-50/40">
                  <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-sky-50 text-sky-700">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm sm:text-base font-black text-slate-950">{lv.viTri}</strong>
                    <span className="mt-0.5 block text-xs sm:text-sm font-medium text-slate-500">
                      {lv.congTy} · {lv.ngay} {lv.gio}
                    </span>
                    <span className="mt-1 block text-[11px] sm:text-xs font-black text-sky-700">{lv.hinh}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
