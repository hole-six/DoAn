import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MessageCircle, Search } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { apiCoXacThuc } from '../../../lib/auth'
import { useChat } from '../../../contexts/ChatContext'
import { employerApplicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import type { HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, EmptyState, ErrorState, Page, Panel } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'
import { ScheduleModal } from '../interviews/ScheduleModal'
import type { ScheduleValue } from '../interviews/ScheduleModal'
import { CandidateDrawer } from './CandidateDrawer'

const TRANG_THAI_CHAT = ['dang_xet_duyet', 'moi_phong_van', 'dat'] as const

export default function UngVienNhaTuyenDungPage() {
  const data = useEmployerData()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<HoSoUngTuyen | null>(null)
  const [scheduling, setScheduling] = useState<HoSoUngTuyen | null>(null)
  const { moChatVoiNguoiDung } = useChat()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hoSo = params.get('hoSo')
    if (!hoSo || selected || scheduling || !data.applications.length) return
    const found = data.applications.find(item => item.id === hoSo || item._id === hoSo)
    if (found) {
      setSelected(found)
      if (params.get('action') === 'moi-phong-van') setScheduling(found)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [data.applications, selected, scheduling])

  const view = async () => {
    if (!selected) return
    const updated = await apiCoXacThuc(`/hosoungtuyen/${selected.id}/xem`, { method: 'POST' }) as HoSoUngTuyen
    setSelected(updated)
    await data.reload()
  }

  const review = async (trangThai: 'dang_xet_duyet' | 'tu_choi', giaiDoanTuChoi: 'sang_loc' | 'phong_van' = 'sang_loc') => {
    if (!selected) return
    const ghiChu = trangThai === 'tu_choi'
      ? window.prompt(giaiDoanTuChoi === 'phong_van' ? 'Ly do tu choi sau phong van?' : 'Ly do tu choi sang loc?') ?? ''
      : 'Nha tuyen dung dang xet duyet ho so'
    const updated = await apiCoXacThuc(`/hosoungtuyen/${selected.id}/danh-gia`, {
      method: 'POST',
      body: JSON.stringify({ trangThai, ghiChu, giaiDoanTuChoi }),
    }) as HoSoUngTuyen
    setSelected(updated)
    await data.reload()
  }

  const completeInterview = async (ketQua: 'dat' | 'khong_dat') => {
    if (!selected) return
    const lich = data.interviews.find(item => String((item as any).maHoSoUngTuyen?._id ?? item.maHoSoUngTuyen) === selected.id)
    if (!lich) {
      setScheduling(selected)
      return
    }
    await apiCoXacThuc(`/lichphongvan/${lich.id}/hoan-thanh`, {
      method: 'POST',
      body: JSON.stringify({ ketQua, ghiChu: ketQua === 'dat' ? 'Ung vien dat phong van' : 'Ung vien khong dat phong van' }),
    })
    const updated = await apiCoXacThuc(`/hosoungtuyen/${selected.id}`) as HoSoUngTuyen
    setSelected(updated)
    await data.reload()
  }

  const schedule = async (value: ScheduleValue) => {
    if (!scheduling) return
    await apiCoXacThuc(`/hosoungtuyen/${scheduling.id}/moi-phong-van`, { method: 'POST', body: JSON.stringify(value) })
    setScheduling(null)
    setSelected(null)
    await data.reload()
  }

  const openChat = async (item: HoSoUngTuyen) => {
    const userId = item.ungVien?.nguoiDung?.id ?? item.ungVien?.nguoiDung?._id
    if (!userId || !TRANG_THAI_CHAT.includes(item.trangThai as any)) return
    const cuocTroChuyen = await moChatVoiNguoiDung(userId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.id,
      maTinTuyenDung: item.maTinTuyenDung,
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/nha-tuyen-dung/chat?cuocTroChuyen=${id}` : '/nha-tuyen-dung/chat')
  }

  return (
      <Page title="Pipeline ứng viên" desc="Xem hồ sơ, đánh giá CV, mời phỏng vấn hoặc từ chối theo đúng workflow.">
      <ErrorState message={data.error} />
      <Panel>
        <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-500">
          <Search size={16} />
              <span className="text-sm font-semibold">Danh sách hồ sơ ứng tuyển</span>
        </div>
        <div className="grid gap-2">
          {data.applications.length ? data.applications.map(item => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <span className="min-w-0">
                <strong className="block truncate text-sm font-black text-slate-950">{item.hoSoNangLuc?.hoTenHienThi || item.ungVien?.nguoiDung?.hoTen || 'Ung vien'}</strong>
                <span className="mt-1 block truncate text-xs font-semibold text-slate-500">{item.tinTuyenDung?.tieuDe ?? '-'}</span>
                <span className="mt-1 flex flex-wrap gap-1 text-xs font-bold text-slate-500">
                  {item.hoSoNangLuc?.tieuDe && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5"><FileText size={12} /> {item.hoSoNangLuc.tieuDe}</span>}
                  {item.hoSoNangLuc?.fileCvData && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Co file CV</span>}
                </span>
              </span>
              <Badge tone={toneForApplicationStatus(item.trangThai)}>{employerApplicationStatusLabel[item.trangThai] ?? item.trangThai}</Badge>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" icon={<Search size={14} />} onClick={() => setSelected(item)}>Xem</Button>
                <Button size="sm" variant="secondary" icon={<MessageCircle size={15} />} disabled={!item.ungVien?.nguoiDung?.id || !TRANG_THAI_CHAT.includes(item.trangThai as any)} onClick={() => void openChat(item)}>Chat</Button>
              </div>
            </article>
            )) : <EmptyState>Chưa có ứng viên ứng tuyển.</EmptyState>}
        </div>
      </Panel>
      {selected && (
      <CandidateDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onView={() => void view()}
        onAdvance={(status) => {
          if (status === 'dang_xet_duyet') return void review('dang_xet_duyet', 'sang_loc')
          if (status === 'dat') return void completeInterview('dat')
        }}
        onReject={(phase) => {
          if (phase === 'sang_loc') return void review('tu_choi', 'sang_loc')
          return void completeInterview('khong_dat')
        }}
        onSchedule={() => setScheduling(selected)}
      />
      )}
      {scheduling && <ScheduleModal onClose={() => setScheduling(null)} onSubmit={schedule} />}
    </Page>
  )
}
