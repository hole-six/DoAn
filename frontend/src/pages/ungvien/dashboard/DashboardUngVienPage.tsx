import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Briefcase, Calendar, FileText, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { DashboardSkeleton } from '../../../components/LoadingStates'
import { apiCoXacThuc } from '../../../lib/auth'
import { toast } from '../../../lib/toast'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, interviewStatusLabel, toneForApplicationStatus, toneForInterviewStatus } from '../../../lib/statusLabels'
import { Badge, EmptyState, ErrorState, Page, Panel, Row } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

function Kpi({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: number }) {
  return (
    <div className="uv-dashboard-kpi-card rounded-xl border border-slate-200 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)] sm:p-4">
      <Icon size={20} className="mb-2 text-sky-800 sm:mb-3" />
      <p className="text-[11px] font-black uppercase leading-snug tracking-wide text-slate-500 sm:text-xs">{label}</p>
      <strong className="mt-1 block text-2xl font-black leading-none text-slate-950 sm:text-3xl">{value}</strong>
    </div>
  )
}

function GoiYWarning({ canhBao }: { canhBao?: { ma?: string; thongBao?: string } }) {
  if (!canhBao?.ma) return null
  const action = canhBao.ma === 'NO_PRIMARY_CV' ? 'Má»Ÿ há»“ sÆ¡ Ä‘á»ƒ Ä‘áº·t CV chÃ­nh' : 'QuÃ©t nhanh Ä‘á»ƒ thá»­ Ä‘á»c PDF báº±ng AI'
  const href = canhBao.ma === 'NO_PRIMARY_CV' ? '/ung-vien/ho-so' : undefined
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
      <strong className="block text-base font-black">{canhBao.ma === 'NO_PRIMARY_CV' ? 'ChÆ°a cÃ³ CV chÃ­nh' : 'CV PDF cáº§n Ä‘á»c láº¡i ná»™i dung'}</strong>
      <p className="mt-1">{canhBao.thongBao}</p>
      {href ? (
        <a className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-amber-600 px-3 text-sm font-black text-white" href={href}>{action}</a>
      ) : (
        <p className="mt-2 text-xs font-black uppercase tracking-wide text-amber-700">{action}</p>
      )}
    </div>
  )
}

export default function DashboardUngVienPage() {
  const navigate = useNavigate()
  const data = useUngVienData()
  const [dangQuet, setDangQuet] = useState(false)
  const [moXacNhanQuet, setMoXacNhanQuet] = useState(false)
  const [guiEmailSauQuet, setGuiEmailSauQuet] = useState(false)
  const [goiY, setGoiY] = useState<any>(null)
  const [goiYError, setGoiYError] = useState('')

  const loadGoiY = async () => {
    try {
      const duLieu = await apiCoXacThuc('/ai/goi-y-viec-lam')
      setGoiY(duLieu)
      setGoiYError('')
    } catch (err) {
      setGoiY(null)
      setGoiYError(err instanceof Error ? err.message : 'KhÃ´ng táº£i Ä‘Æ°á»£c gá»£i Ã½ viá»‡c lÃ m')
    }
  }

  useEffect(() => {
    if (data.current && !data.loading) void loadGoiY()
  }, [data.current?.id, data.loading])

  if (data.loading) return <DashboardSkeleton />

  const pendingInterviews = data.lich.filter(item => item.trangThai === 'da_len_lich')
  const activeApplications = data.ungTuyen.filter(item => !['dat', 'tu_choi', 'da_rut'].includes(item.trangThai))
  const unread = data.thongBao.filter(item => !item.daDoc).length

  const quickScan = async (guiEmail = false) => {
    try {
      setDangQuet(true)
      setGoiYError('')
      await apiCoXacThuc('/ai/goi-y-viec-lam/chay-ngay', { method: 'POST' })
      if (guiEmail) {
        await apiCoXacThuc('/ai/goi-y-viec-lam/gui-email', { method: 'POST' })
      }
      await loadGoiY()
      toast.success(guiEmail ? 'ÄÃ£ quÃ©t vÃ  gá»­i email gá»£i Ã½.' : 'ÄÃ£ quÃ©t gá»£i Ã½ viá»‡c lÃ m.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ quÃ©t gá»£i Ã½ viá»‡c lÃ m.'
      setGoiYError(message)
      toast.error(message)
    } finally {
      setDangQuet(false)
      setMoXacNhanQuet(false)
    }
  }

  return (
    <Page
      title="Tá»•ng quan á»©ng viÃªn"
      desc="Theo dÃµi há»“ sÆ¡, lá»‹ch phá»ng váº¥n vÃ  cÃ¡c viá»‡c cáº§n xá»­ lÃ½ trong má»™t mÃ n hÃ¬nh."
      action={(
        <>
          <Button variant="secondary" icon={<Sparkles size={16} />} onClick={() => setMoXacNhanQuet(true)} disabled={dangQuet}>
            {dangQuet ? 'Äang quÃ©t...' : 'QuÃ©t nhanh'}
          </Button>
          <Button variant="primary" icon={<Briefcase size={16} />} onClick={() => navigate('/viec-lam')}>TÃ¬m viá»‡c</Button>
        </>
      )}
    >
      <ErrorState message={data.error} />
      {goiYError && <ErrorState message={goiYError} />}
      {moXacNhanQuet && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">QuÃ©t gá»£i Ã½ viá»‡c lÃ m</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Há»‡ thá»‘ng sáº½ dÃ¹ng CV chÃ­nh Ä‘á»ƒ tÃ¬m viá»‡c Ä‘ang má»Ÿ. Náº¿u CV chÃ­nh lÃ  PDF chÆ°a Ä‘á»c Ä‘Æ°á»£c ná»™i dung, backend sáº½ thá»­ Ä‘á»c láº¡i báº±ng AI trÆ°á»›c khi cháº¥m Ä‘iá»ƒm.
            </p>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={guiEmailSauQuet}
                onChange={e => setGuiEmailSauQuet(e.target.checked)}
              />
              QuÃ©t xong gá»­i email gá»£i Ã½
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setMoXacNhanQuet(false)} disabled={dangQuet}>Há»§y</Button>
              <Button variant="primary" icon={<Sparkles size={16} />} onClick={() => void quickScan(guiEmailSauQuet)} disabled={dangQuet}>
                {dangQuet ? 'Äang quÃ©t...' : guiEmailSauQuet ? 'QuÃ©t vÃ  gá»­i email' : 'Báº¯t Ä‘áº§u quÃ©t'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="uv-dashboard-kpi-grid grid grid-cols-2 gap-2.5 max-[360px]:grid-cols-1 sm:gap-3 xl:grid-cols-4">
        <Kpi icon={FileText} label="CV Ä‘Ã£ táº¡o" value={data.hoSo.length} />
        <Kpi icon={Briefcase} label="ÄÃ£ á»©ng tuyá»ƒn" value={data.ungTuyen.length} />
        <Kpi icon={Calendar} label="Lá»‹ch cáº§n pháº£n há»“i" value={pendingInterviews.length} />
        <Kpi icon={Bell} label="ThÃ´ng bÃ¡o má»›i" value={unread} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Viá»‡c cáº§n lÃ m">
          <div className="grid gap-2">
            {pendingInterviews.length ? pendingInterviews.slice(0, 5).map(item => (
              <Row key={item.id} onClick={() => navigate('/ung-vien/lich-phong-van')}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.hoSoUngTuyen?.tinTuyenDung?.tieuDe ?? 'Lá»‹ch phá»ng váº¥n'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{formatDateTime(item.thoiGianBatDau)}</p>
                </div>
                <Badge tone={toneForInterviewStatus(item.trangThai)}>{interviewStatusLabel[item.trangThai]}</Badge>
              </Row>
            )) : <EmptyState>KhÃ´ng cÃ³ lá»‹ch cáº§n pháº£n há»“i.</EmptyState>}
          </div>
        </Panel>

        <Panel title="Há»“ sÆ¡ Ä‘ang xá»­ lÃ½">
          <div className="grid gap-2">
            {activeApplications.length ? activeApplications.slice(0, 5).map(item => (
              <Row key={item.id} onClick={() => navigate('/ung-vien/ung-tuyen')}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
                </div>
                <Badge tone={toneForApplicationStatus(item.trangThai)}>{applicationStatusLabel[item.trangThai]}</Badge>
              </Row>
            )) : <EmptyState>ChÆ°a cÃ³ há»“ sÆ¡ Ä‘ang xá»­ lÃ½.</EmptyState>}
          </div>
        </Panel>
      </div>

      <Panel
        title="Viá»‡c lÃ m gá»£i Ã½"
        action={<Button size="sm" variant="secondary" icon={<Sparkles size={14} />} onClick={() => void loadGoiY()}>Táº£i láº¡i</Button>}
      >
        {goiY?.canhBao && <GoiYWarning canhBao={goiY.canhBao} />}
        {goiY?.ketQua?.length ? (
          <div className="mt-3 grid gap-2">
            {goiY.ketQua.slice(0, 5).map((item: any) => (
              <Row key={item.maTinTuyenDung} onClick={() => navigate(`/viec-lam/${item.maTinTuyenDung}?apply=1`)}>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? 'Viá»‡c lÃ m phÃ¹ há»£p'}</strong>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
                </div>
                <Badge tone="green">{item.diem}/100</Badge>
              </Row>
            ))}
          </div>
        ) : (
          !goiY?.canhBao && <EmptyState>ChÆ°a cÃ³ káº¿t quáº£ gá»£i Ã½. HÃ£y quÃ©t nhanh Ä‘á»ƒ táº¡o danh sÃ¡ch phÃ¹ há»£p.</EmptyState>
        )}
      </Panel>
    </Page>
  )
}

