import { Bell, Briefcase, Building2, CalendarDays, Check, CheckCheck, ExternalLink, FileText, MessageCircle, Settings, Target, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThongBao, type ThongBao, type ToastThongBao } from '../contexts/ThongBaoContext'
import AppIcon from './AppIcon'

const mauTheoLoai: Record<string, string> = {
  he_thong: '#3b82f6',
  ho_so_ung_tuyen: '#10b981',
  lich_phong_van: '#f59e0b',
  ket_qua_phong_van: '#ef4444',
  tin_nhan: '#8b5cf6',
  tin_tuyen_dung: '#06b6d4',
  cong_ty: '#f97316',
}

const iconTheoLoai: Record<string, typeof Bell> = {
  he_thong: Settings,
  ho_so_ung_tuyen: FileText,
  lich_phong_van: CalendarDays,
  ket_qua_phong_van: Target,
  tin_nhan: MessageCircle,
  tin_tuyen_dung: Briefcase,
  cong_ty: Building2,
}

function layMau(loai: string, mauTuy?: string) {
  return mauTuy || mauTheoLoai[loai] || '#64748b'
}

function layIcon(loai: string) {
  return iconTheoLoai[loai] || Bell
}

function dinhDangThoiGian(ngay: string) {
  const now = new Date()
  const date = new Date(ngay)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export function ThongBaoToastContainer() {
  const { toasts, xoaToast, danhDauDaDoc } = useThongBao()
  const navigate = useNavigate()
  if (toasts.length === 0) return null

  const openToast = async (toast: ToastThongBao) => {
    if (toast._id && !toast.daDoc) await danhDauDaDoc(toast._id)
    if (toast.lienKet) navigate(toast.lienKet)
    xoaToast(toast.toastId)
  }

  return (
    <div className="thongbao-toast-stack" aria-live="polite" aria-label="Thông báo mới">
      {toasts.map((toast: ToastThongBao) => {
        const Icon = layIcon(toast.loai)
        const mau = layMau(toast.loai, toast.mauSac)
        return (
          <div key={toast.toastId} className="thongbao-toast" style={{ borderLeft: `5px solid ${mau}` }}>
            <div className="thongbao-toast-inner">
              <span className="thongbao-toast-icon" style={{ color: mau, background: `${mau}18` }}>
                <Icon size={19} />
              </span>
              <div className="thongbao-toast-content">
                <strong>{toast.tieuDe}</strong>
                <p>{toast.noiDung}</p>
                {toast.lienKet && (
                  <button onClick={() => void openToast(toast)}>
                    Xem ngay <AppIcon icon={ExternalLink} size={12} />
                  </button>
                )}
              </div>
              <button className="thongbao-toast-close" onClick={() => xoaToast(toast.toastId)} aria-label="Đóng thông báo">
                <AppIcon icon={X} size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ThongBaoItem({ tb, onDoc }: { tb: ThongBao; onDoc: (id: string) => void }) {
  const navigate = useNavigate()
  const mau = layMau(tb.loai, tb.mauSac)
  const Icon = layIcon(tb.loai)

  const xuLyClick = () => {
    if (!tb.daDoc && tb._id) onDoc(tb._id)
    if (tb.lienKet) navigate(tb.lienKet)
  }

  return (
    <button type="button" onClick={xuLyClick} className={`thongbao-item ${tb.daDoc ? '' : 'is-unread'}`}>
      <span className="thongbao-item-icon" style={{ color: mau, background: `${mau}18` }}>
        <Icon size={18} />
      </span>
      <span className="thongbao-item-content">
        <strong>{tb.tieuDe}</strong>
        <span>{tb.noiDung}</span>
        <small>{dinhDangThoiGian(tb.ngayTao)}</small>
        {tb.hanhDong && tb.hanhDong.length > 0 && (
          <span className="thongbao-item-actions">
            {tb.hanhDong.map((hd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={e => { e.stopPropagation(); navigate(hd.url) }}
                className={hd.loai === 'primary' ? 'primary' : ''}
              >
                {hd.nhan}
              </button>
            ))}
          </span>
        )}
      </span>
      {!tb.daDoc && (
        <span className="thongbao-item-unread">
          <i style={{ background: mau }} />
          <button type="button" onClick={e => { e.stopPropagation(); if (tb._id) onDoc(tb._id) }} title="Đánh dấu đã đọc">
            <AppIcon icon={Check} size={14} />
          </button>
        </span>
      )}
    </button>
  )
}

export function ThongBaoCenter() {
  const [moPopup, setMoPopup] = useState(false)
  const { danhSach, soLuongChuaDoc, dangTai, danhDauDaDoc, danhDauTatCaDaDoc, taiThongBao } = useThongBao()

  const xuLyMo = () => {
    setMoPopup(!moPopup)
    if (!moPopup) void taiThongBao()
  }

  return (
    <div className="notification-center">
      <button onClick={xuLyMo} aria-label="Thông báo" className="thongbao-bell-btn">
        <AppIcon icon={Bell} size={20} />
        {soLuongChuaDoc > 0 && (
          <span className="thongbao-badge">{soLuongChuaDoc > 9 ? '9+' : soLuongChuaDoc}</span>
        )}
      </button>

      {moPopup && (
        <>
          <div onClick={() => setMoPopup(false)} className="thongbao-backdrop" />
          <div className="thongbao-popup">
            <div className="thongbao-popup-header">
              <div>
                <h3>Thông báo</h3>
                <p>{soLuongChuaDoc > 0 ? `${soLuongChuaDoc} chưa đọc` : 'Tất cả đã đọc'}</p>
              </div>
              <div>
                {soLuongChuaDoc > 0 && (
                  <button onClick={() => void danhDauTatCaDaDoc()} className="thongbao-mark-all">
                    <AppIcon icon={CheckCheck} size={14} />
                    Đọc tất cả
                  </button>
                )}
                <button onClick={() => setMoPopup(false)} className="thongbao-close" aria-label="Đóng thông báo">
                  <AppIcon icon={X} size={16} />
                </button>
              </div>
            </div>
            <div className="thongbao-list">
              {dangTai ? (
                <div className="thongbao-empty"><div className="chat-spinner" /></div>
              ) : danhSach.length === 0 ? (
                <div className="thongbao-empty">
                  <Bell size={34} />
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                danhSach.map(tb => <ThongBaoItem key={tb._id} tb={tb} onDoc={danhDauDaDoc} />)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
