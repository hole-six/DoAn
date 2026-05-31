import { Bell, Check, CheckCheck, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThongBao, type ThongBao, type ToastThongBao } from '../contexts/ThongBaoContext'
import AppIcon from './AppIcon'
// ─── Màu sắc theo loại ────────────────────────────────────────────────────────

const mauTheoLoai: Record<string, string> = {
  he_thong: '#3b82f6',
  ho_so_ung_tuyen: '#10b981',
  lich_phong_van: '#f59e0b',
  ket_qua_phong_van: '#ef4444',
  tin_nhan: '#8b5cf6',
  tin_tuyen_dung: '#06b6d4',
  cong_ty: '#f97316',
}

const iconTheoLoai: Record<string, string> = {
  he_thong: '⚙️',
  ho_so_ung_tuyen: '📄',
  lich_phong_van: '📅',
  ket_qua_phong_van: '🎯',
  tin_nhan: '💬',
  tin_tuyen_dung: '💼',
  cong_ty: '🏢',
}

function layMau(loai: string, mauTuy?: string) {
  return mauTuy || mauTheoLoai[loai] || '#6b7280'
}

function layIcon(loai: string, iconTuy?: string) {
  return iconTuy || iconTheoLoai[loai] || '🔔'
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

// ─── Toast notification ───────────────────────────────────────────────────────

export function ThongBaoToastContainer() {
  const { toasts, xoaToast } = useThongBao()
  const navigate = useNavigate()

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 80, right: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, maxWidth: 360,
    }}>
      {toasts.map((toast: ToastThongBao) => (
        <div
          key={toast.toastId}
          className="thongbao-toast"
          style={{ borderLeft: `4px solid ${layMau(toast.loai, toast.mauSac)}` }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{layIcon(toast.loai, toast.icon)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3 }}>
                {toast.tieuDe}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>
                {toast.noiDung}
              </div>
              {toast.lienKet && (
                <button
                  onClick={() => { navigate(toast.lienKet!); xoaToast(toast.toastId) }}
                  style={{
                    marginTop: 6, background: 'none', border: 'none',
                    color: layMau(toast.loai, toast.mauSac), cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, padding: 0,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Xem ngay <AppIcon icon={ExternalLink} size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => xoaToast(toast.toastId)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 2, color: '#9ca3af', flexShrink: 0,
              }}
            >
              <AppIcon icon={X} size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Notification item ────────────────────────────────────────────────────────

function ThongBaoItem({ tb, onDoc }: { tb: ThongBao; onDoc: (id: string) => void }) {
  const navigate = useNavigate()
  const mau = layMau(tb.loai, tb.mauSac)
  const icon = layIcon(tb.loai, tb.icon)

  const xuLyClick = () => {
    if (!tb.daDoc) onDoc(tb._id)
    if (tb.lienKet) navigate(tb.lienKet)
  }

  return (
    <div
      onClick={xuLyClick}
      className="thongbao-item"
      style={{ background: tb.daDoc ? 'white' : '#faf5ff' }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: `${mau}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: tb.daDoc ? 400 : 600,
          color: '#111827', marginBottom: 3, lineHeight: 1.4,
        }}>
          {tb.tieuDe}
        </div>
        <div style={{
          fontSize: 12, color: '#6b7280', marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {tb.noiDung}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {dinhDangThoiGian(tb.ngayTao)}
        </div>

        {/* Action buttons */}
        {tb.hanhDong && tb.hanhDong.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {tb.hanhDong.map((hd, idx) => (
              <button
                key={idx}
                onClick={e => { e.stopPropagation(); navigate(hd.url) }}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: hd.loai === 'primary' ? mau : hd.loai === 'danger' ? '#ef4444' : '#f3f4f6',
                  color: hd.loai === 'secondary' ? '#374151' : 'white',
                }}
              >
                {hd.nhan}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unread dot + mark read */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {!tb.daDoc && (
          <>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: mau }} />
            <button
              onClick={e => { e.stopPropagation(); onDoc(tb._id) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af' }}
              title="Đánh dấu đã đọc"
            >
              <AppIcon icon={Check} size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ThongBaoCenter ───────────────────────────────────────────────────────────

export function ThongBaoCenter() {
  const [moPopup, setMoPopup] = useState(false)
  const { danhSach, soLuongChuaDoc, dangTai, danhDauDaDoc, danhDauTatCaDaDoc, taiThongBao } = useThongBao()

  const xuLyMo = () => {
    setMoPopup(!moPopup)
    if (!moPopup) taiThongBao()
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={xuLyMo}
        aria-label="Thông báo"
        className="thongbao-bell-btn"
      >
        <AppIcon icon={Bell} size={20} />
        {soLuongChuaDoc > 0 && (
          <span className="thongbao-badge">
            {soLuongChuaDoc > 9 ? '9+' : soLuongChuaDoc}
          </span>
        )}
      </button>

      {/* Popup */}
      {moPopup && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMoPopup(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />

          <div className="thongbao-popup">
            {/* Header */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Thông báo</h3>
                {soLuongChuaDoc > 0 && (
                  <p style={{ margin: 0, fontSize: 12, color: '#7c3aed' }}>
                    {soLuongChuaDoc} chưa đọc
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {soLuongChuaDoc > 0 && (
                  <button
                    onClick={danhDauTatCaDaDoc}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#7c3aed', fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    <AppIcon icon={CheckCheck} size={14} />
                    Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setMoPopup(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af' }}
                >
                  <AppIcon icon={X} size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {dangTai ? (
                <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                  <div className="chat-spinner" />
                </div>
              ) : danhSach.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                  <p style={{ margin: 0, fontSize: 14 }}>Không có thông báo nào</p>
                </div>
              ) : (
                danhSach.map(tb => (
                  <ThongBaoItem key={tb._id} tb={tb} onDoc={danhDauDaDoc} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
