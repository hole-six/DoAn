import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { khoiTaoSocket, langNgheEvent, boLangNgheEvent } from '../lib/socket'

interface ThongBao {
  _id: string
  loai: string
  tieuDe: string
  noiDung: string
  lienKet?: string
  mucDoUuTien?: string
  icon?: string
  mauSac?: string
  daDoc: boolean
  ngayTao: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export function ThongBaoCenter() {
  const [moPopup, setMoPopup] = useState(false)
  const [thongBaoList, setThongBaoList] = useState<ThongBao[]>([])
  const [soLuongChuaDoc, setSoLuongChuaDoc] = useState(0)
  const [dangTai, setDangTai] = useState(false)

  // Lấy token từ localStorage
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    if (!token) return

    // Khởi tạo Socket.IO
    khoiTaoSocket(token)

    // Lắng nghe thông báo mới
    const xuLyThongBaoMoi = (thongBao: ThongBao) => {
      console.log('📬 Thông báo mới:', thongBao)
      setThongBaoList((prev) => [thongBao, ...prev])
      setSoLuongChuaDoc((prev) => prev + 1)
      
      // Hiển thị browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(thongBao.tieuDe, {
          body: thongBao.noiDung,
          icon: '/favicon.svg',
        })
      }
    }

    langNgheEvent('thong_bao_moi', xuLyThongBaoMoi)

    // Tải danh sách thông báo
    taiThongBao()
    demChuaDoc()

    return () => {
      boLangNgheEvent('thong_bao_moi', xuLyThongBaoMoi)
    }
  }, [token])

  const taiThongBao = async () => {
    setDangTai(true)
    try {
      const response = await fetch(`${API_URL}/thongbao?limit=20&sort=-ngayTao`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setThongBaoList(data.duLieu || [])
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    } finally {
      setDangTai(false)
    }
  }

  const demChuaDoc = async () => {
    try {
      const response = await fetch(`${API_URL}/thongbao/dem-chua-doc`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setSoLuongChuaDoc(data.duLieu?.soLuong || 0)
    } catch (error) {
      console.error('Lỗi đếm thông báo:', error)
    }
  }

  const danhDauDaDoc = async (id: string) => {
    try {
      await fetch(`${API_URL}/thongbao/${id}/danh-dau-da-doc`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      setThongBaoList((prev) =>
        prev.map((tb) => (tb._id === id ? { ...tb, daDoc: true } : tb))
      )
      setSoLuongChuaDoc((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  const danhDauTatCaDaDoc = async () => {
    try {
      await fetch(`${API_URL}/thongbao/danh-dau-tat-ca-da-doc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      setThongBaoList((prev) => prev.map((tb) => ({ ...tb, daDoc: true })))
      setSoLuongChuaDoc(0)
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả:', error)
    }
  }

  const layMauSacTheoLoai = (loai: string) => {
    const mauSac: Record<string, string> = {
      he_thong: '#3b82f6',
      ho_so_ung_tuyen: '#10b981',
      lich_phong_van: '#f59e0b',
      ket_qua_phong_van: '#ef4444',
      tin_nhan: '#8b5cf6',
      tin_tuyen_dung: '#06b6d4',
    }
    return mauSac[loai] || '#6b7280'
  }

  const dinhDangThoiGian = (ngay: string) => {
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

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <button
        onClick={() => setMoPopup(!moPopup)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell size={20} color="#64748b" />
        {soLuongChuaDoc > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {soLuongChuaDoc > 9 ? '9+' : soLuongChuaDoc}
          </span>
        )}
      </button>

      {/* Popup */}
      {moPopup && (
        <>
          <div
            onClick={() => setMoPopup(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 400,
              maxWidth: '90vw',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Thông báo
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {soLuongChuaDoc > 0 && (
                  <button
                    onClick={danhDauTatCaDaDoc}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: '#3b82f6',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCheck size={16} />
                    Đánh dấu tất cả
                  </button>
                )}
                <button
                  onClick={() => setMoPopup(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {dangTai ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Đang tải...
                </div>
              ) : thongBaoList.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Không có thông báo
                </div>
              ) : (
                thongBaoList.map((tb) => (
                  <div
                    key={tb._id}
                    onClick={() => {
                      if (!tb.daDoc) danhDauDaDoc(tb._id)
                      if (tb.lienKet) window.location.href = tb.lienKet
                    }}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: tb.daDoc ? 'white' : '#eff6ff',
                      display: 'flex',
                      gap: 12,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = tb.daDoc ? 'white' : '#eff6ff'
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: tb.daDoc ? 'transparent' : layMauSacTheoLoai(tb.loai),
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: tb.daDoc ? 400 : 600,
                          color: '#111827',
                          marginBottom: 4,
                        }}
                      >
                        {tb.tieuDe}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {tb.noiDung}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {dinhDangThoiGian(tb.ngayTao)}
                      </div>
                    </div>
                    {!tb.daDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          danhDauDaDoc(tb._id)
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          flexShrink: 0,
                        }}
                      >
                        <Check size={16} color="#3b82f6" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
