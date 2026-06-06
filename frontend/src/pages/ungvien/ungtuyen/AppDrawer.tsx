import { useState } from 'react'
import { Download, ExternalLink, FileText, MessageCircle, RotateCcw, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from '../../../components/ui/Button'
import { useChat } from '../../../contexts/ChatContext'
import { apiCoXacThuc } from '../../../lib/auth'
import { formatDateTime } from '../../../lib/format'
import { applicationStatusLabel, toneForApplicationStatus } from '../../../lib/statusLabels'
import { toast } from '../../../lib/toast'
import type { DanhGiaCongTy, HoSoUngTuyen } from '../../../types/recruitment'
import { Badge, Drawer } from '../shared/UngVienAtoms'

const TRANG_THAI_DUOC_CHAT = ['da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']
const TIMELINE = ['da_nop', 'da_xem', 'dang_xet_duyet', 'moi_phong_van', 'dat']

function ReviewSection({
  item,
  danhGia,
  duDieuKien,
  onSubmitted,
}: {
  item: HoSoUngTuyen
  danhGia?: DanhGiaCongTy
  duDieuKien: boolean
  onSubmitted: () => Promise<void> | void
}) {
  const [diem, setDiem] = useState(5)
  const [noiDung, setNoiDung] = useState('')
  const [anDanh, setAnDanh] = useState(false)
  const [dangGui, setDangGui] = useState(false)

  const submit = async () => {
    const noiDungSach = noiDung.trim()
    if (noiDungSach.length < 10) {
      toast.error('Nội dung đánh giá cần ít nhất 10 ký tự.')
      return
    }
    try {
      setDangGui(true)
      await apiCoXacThuc(`/danhgiacongty/tu-ho-so/${item.id}`, {
        method: 'POST',
        body: JSON.stringify({ diem, noiDung: noiDungSach, anDanh }),
      })
      toast.success('Đã gửi đánh giá, chờ quản trị viên duyệt.')
      setNoiDung('')
      setAnDanh(false)
      setDiem(5)
      await onSubmitted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi đánh giá công ty.')
    } finally {
      setDangGui(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Đánh giá công ty</p>
      {danhGia ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={16} fill={index < danhGia.diem ? 'currentColor' : 'none'} />
              ))}
            </div>
            <Badge tone={danhGia.daDuyet ? 'green' : 'yellow'}>{danhGia.daDuyet ? 'Đã duyệt' : 'Chờ duyệt'}</Badge>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{danhGia.noiDung}</p>
          {danhGia.anDanh && <p className="mt-2 text-xs font-bold text-slate-500">Bạn đã chọn hiển thị ẩn danh.</p>}
        </div>
      ) : duDieuKien ? (
        <div className="mt-3 grid gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1
              return (
                <button
                  key={value}
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                  aria-label={`${value} sao`}
                  onClick={() => setDiem(value)}
                >
                  <Star size={18} fill={value <= diem ? 'currentColor' : 'none'} />
                </button>
              )
            })}
          </div>
          <textarea
            className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400"
            value={noiDung}
            onChange={event => setNoiDung(event.target.value)}
            placeholder="Chia sẻ trải nghiệm phỏng vấn, cách công ty trao đổi và mức độ chuyên nghiệp..."
          />
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" checked={anDanh} onChange={event => setAnDanh(event.target.checked)} />
            Hiển thị đánh giá ẩn danh
          </label>
          <Button size="sm" variant="primary" icon={<Star size={16} />} loading={dangGui} onClick={() => void submit()}>
            Gửi đánh giá
          </Button>
        </div>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold leading-6 text-slate-500">
          Bạn có thể đánh giá công ty sau khi được mời phỏng vấn.
        </p>
      )}
    </section>
  )
}

export function AppDrawer({
  item,
  danhGia,
  coLichPhongVan,
  onClose,
  onWithdraw,
  onReviewSubmitted,
}: {
  item: HoSoUngTuyen
  danhGia?: DanhGiaCongTy
  coLichPhongVan: boolean
  onClose: () => void
  onWithdraw: () => void
  onReviewSubmitted: () => Promise<void> | void
}) {
  const navigate = useNavigate()
  const { moChatVoiNguoiDung } = useChat()
  const employerUserId = (item.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung?.id
    ?? (item.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung?._id
    ?? (item.tinTuyenDung?.nhaTuyenDung as any)?.maNguoiDung
    ?? (item.tinTuyenDung?.nhaTuyenDung as any)?.nguoiDung?.id
    ?? (item.tinTuyenDung?.nhaTuyenDung as any)?.nguoiDung?._id
  const canChat = TRANG_THAI_DUOC_CHAT.includes(item.trangThai) && Boolean(employerUserId)
  const duDieuKienDanhGia = item.trangThai === 'moi_phong_van' || coLichPhongVan || Boolean(danhGia)
  const hoSo = item.hoSoNangLuc
  const laPdfUpload = hoSo?.loaiHoSo === 'file_upload' || Boolean(hoSo?.fileCvData)

  const openChat = async () => {
    if (!employerUserId) return
    const cuocTroChuyen = await moChatVoiNguoiDung(employerUserId, {
      loai: 'ung_vien_nha_tuyen_dung',
      maHoSoUngTuyen: item.id,
      maTinTuyenDung: item.maTinTuyenDung,
    })
    const id = (cuocTroChuyen as any)?._id ?? (cuocTroChuyen as any)?.id
    navigate(id ? `/ung-vien/chat?cuocTroChuyen=${id}` : '/ung-vien/chat')
  }

  return (
    <Drawer
      title="Chi tiết ứng tuyển"
      onClose={onClose}
      footer={(
        <ButtonGroup>
          <Button size="sm" onClick={onClose}>Đóng</Button>
          <Button size="sm" variant="secondary" icon={<MessageCircle size={16} />} disabled={!canChat} onClick={() => void openChat()}>
            Nhắn nhà tuyển dụng
          </Button>
          <Button size="sm" variant="danger" icon={<RotateCcw size={16} />} disabled={['dat', 'tu_choi', 'da_rut'].includes(item.trangThai)} onClick={onWithdraw}>
            Rút hồ sơ
          </Button>
        </ButtonGroup>
      )}
    >
      <div className="grid gap-4">
        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Vị trí</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{item.tinTuyenDung?.tieuDe ?? '-'}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{item.tinTuyenDung?.nhaTuyenDung?.tenCongTy ?? '-'}</p>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái hiện tại</p>
          <div className="mt-2"><Badge tone={toneForApplicationStatus(item.trangThai)}>{applicationStatusLabel[item.trangThai]}</Badge></div>
          <p className="mt-3 text-sm font-semibold text-slate-600">Nộp lúc {formatDateTime(item.ngayNop)}</p>
          {item.trangThai === 'moi_phong_van' && (
            <p className="mt-2 text-sm font-bold text-emerald-700">Bạn đã được mời phỏng vấn và có thể nhắn trực tiếp với nhà tuyển dụng.</p>
          )}
        </section>

        <ReviewSection item={item} danhGia={danhGia} duDieuKien={duDieuKienDanhGia} onSubmitted={onReviewSubmitted} />

        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">CV đã nộp</p>
          {hoSo ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#0b5c91]">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-black text-slate-950">{hoSo.tieuDe || hoSo.fileCvTen || 'CV ứng tuyển'}</strong>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {laPdfUpload ? 'CV PDF đã upload' : 'CV tạo trong hệ thống'}{hoSo.cvChinh ? ' · CV chính' : ''}
                  </p>
                  {hoSo.fileCvTen && <p className="mt-1 truncate text-xs font-semibold text-slate-500">{hoSo.fileCvTen}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {hoSo.fileCvData ? (
                  <>
                    <Button size="sm" variant="secondary" icon={<ExternalLink size={14} />} onClick={() => window.open(String(hoSo.fileCvData), '_blank', 'noopener,noreferrer')}>
                      Xem PDF
                    </Button>
                    <a className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black text-slate-800" href={String(hoSo.fileCvData)} download={hoSo.fileCvTen || 'cv.pdf'}>
                      <Download size={14} /> Tải PDF
                    </a>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" icon={<ExternalLink size={14} />} onClick={() => navigate('/ung-vien/ho-so')}>
                    Mở hồ sơ
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-500">Hồ sơ ứng tuyển này chưa có dữ liệu CV đính kèm.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Timeline</p>
          <ol className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
            {TIMELINE.map(step => (
              <li key={step} className={step === item.trangThai ? 'text-sky-800' : ''}>• {applicationStatusLabel[step]}</li>
            ))}
          </ol>
        </section>
      </div>
    </Drawer>
  )
}
