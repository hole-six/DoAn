import { MessageCircle, Send, X, Check, CheckCheck } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { langNgheEvent, boLangNgheEvent, guiEvent } from '../lib/socket'

interface Message {
  id: string
  nguoiGui: {
    _id: string
    hoTen: string
  }
  noiDung: string
  loai: string
  ngayTao: string
  daDuocDocBoi?: any[]
  phanUng?: any[]
}

interface Conversation {
  _id: string
  nguoiThamGia: Array<{
    _id: string
    hoTen: string
    email: string
    vaiTro: string
  }>
  tinNhanCuoiCung?: {
    noiDung: string
    thoiGian: string
  }
  soChuaDocCuaToi?: number
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export function ChatBox() {
  const [moChat, setMoChat] = useState(false)
  const [danhSachCuocTroChuyenModel, setDanhSachCuocTroChuyenModel] = useState<Conversation[]>([])
  const [cuocTroChuyenModelHienTai, setCuocTroChuyenModelHienTai] = useState<Conversation | null>(null)
  const [tinNhanList, setTinNhanList] = useState<Message[]>([])
  const [tinNhanMoi, setTinNhanMoi] = useState('')
  const [dangNhap, setDangNhap] = useState(false)
  const [nguoiDungOnline, setNguoiDungOnline] = useState<Set<string>>(new Set())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const token = localStorage.getItem('accessToken')
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!token) return

    // Lắng nghe tin nhắn mới
    const xuLyTinNhanMoi = (data: any) => {
      if (cuocTroChuyenModelHienTai && data.maCuocTroChuyenId === cuocTroChuyenModelHienTai._id) {
        setTinNhanList((prev) => [...prev, data.tinNhan])
        scrollToBottom()
        
        // Đánh dấu đã đọc
        guiEvent('message_read', {
          conversationId: data.maCuocTroChuyenId,
          messageId: data.tinNhan.id,
        })
      }
      
      // Cập nhật danh sách cuộc trò chuyện
      taiDanhSachCuocTroChuyenModel()
    }

    const xuLyUserOnline = (data: { userId: string }) => {
      setNguoiDungOnline((prev) => new Set(prev).add(data.userId))
    }

    const xuLyUserOffline = (data: { userId: string }) => {
      setNguoiDungOnline((prev) => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    }

    const xuLyUserTyping = (data: { userId: string; isTyping: boolean }) => {
      // TODO: Hiển thị "đang nhập..."
      console.log('User typing:', data)
    }

    langNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
    langNgheEvent('user_online', xuLyUserOnline)
    langNgheEvent('user_offline', xuLyUserOffline)
    langNgheEvent('user_typing', xuLyUserTyping)

    return () => {
      boLangNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
      boLangNgheEvent('user_online', xuLyUserOnline)
      boLangNgheEvent('user_offline', xuLyUserOffline)
      boLangNgheEvent('user_typing', xuLyUserTyping)
    }
  }, [token, cuocTroChuyenModelHienTai])

  useEffect(() => {
    if (moChat && token) {
      taiDanhSachCuocTroChuyenModel()
    }
  }, [moChat, token])

  const taiDanhSachCuocTroChuyenModel = async () => {
    try {
      const response = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDanhSachCuocTroChuyenModel(data.duLieu || [])
    } catch (error) {
      console.error('Lỗi tải danh sách cuộc trò chuyện:', error)
    }
  }

  const moCuocTroChuyenModel = async (cuocTroChuyenModel: Conversation) => {
    setCuocTroChuyenModelHienTai(cuocTroChuyenModel)
    setDangNhap(true)

    // Join conversation room
    guiEvent('join_conversation', { conversationId: cuocTroChuyenModel._id })

    // Tải tin nhắn
    try {
      const response = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${cuocTroChuyenModel._id}/tin-nhan?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setTinNhanList(data.duLieu || [])
      scrollToBottom()

      // Đánh dấu đã đọc
      await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${cuocTroChuyenModel._id}/danh-dau-da-doc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      taiDanhSachCuocTroChuyenModel()
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error)
    } finally {
      setDangNhap(false)
    }
  }

  const guiTinNhanMoi = async () => {
    if (!tinNhanMoi.trim() || !cuocTroChuyenModelHienTai) return

    const noiDung = tinNhanMoi
    setTinNhanMoi('')

    // Stop typing indicator
    guiEvent('typing_stop', { conversationId: cuocTroChuyenModelHienTai._id })

    try {
      const response = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${cuocTroChuyenModelHienTai._id}/tin-nhan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ noiDung }),
      })
      await response.json()
      
      // Tin nhắn sẽ được thêm vào qua Socket.IO event
      scrollToBottom()
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      setTinNhanMoi(noiDung) // Restore message on error
    }
  }

  const xuLyNhapTinNhan = (value: string) => {
    setTinNhanMoi(value)

    if (!cuocTroChuyenModelHienTai) return

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing start
    guiEvent('typing_start', { conversationId: cuocTroChuyenModelHienTai._id })

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      guiEvent('typing_stop', { conversationId: cuocTroChuyenModelHienTai._id })
    }, 2000)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const layNguoiKhac = (cuocTroChuyenModel: Conversation) => {
    return cuocTroChuyenModel.nguoiThamGia.find((ng) => ng._id !== currentUser._id)
  }

  const kiemTraOnline = (userId: string) => {
    return nguoiDungOnline.has(userId)
  }

  const tongSoChuaDoc = danhSachCuocTroChuyenModel.reduce((sum, c) => sum + (c.soChuaDocCuaToi || 0), 0)

  if (!moChat) {
    return (
      <button
        onClick={() => setMoChat(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <MessageCircle size={28} color="white" />
        {tongSoChuaDoc > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {tongSoChuaDoc > 9 ? '9+' : tongSoChuaDoc}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 380,
        height: 600,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              {cuocTroChuyenModelHienTai ? layNguoiKhac(cuocTroChuyenModelHienTai)?.hoTen : 'Tin nhắn'}
            </h3>
            {cuocTroChuyenModelHienTai && layNguoiKhac(cuocTroChuyenModelHienTai) && (
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {kiemTraOnline(layNguoiKhac(cuocTroChuyenModelHienTai)!._id) ? '🟢 Đang online' : '⚫ Offline'}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setMoChat(false)
            setCuocTroChuyenModelHienTai(null)
            if (cuocTroChuyenModelHienTai) {
              guiEvent('leave_conversation', { conversationId: cuocTroChuyenModelHienTai._id })
            }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={20} color="white" />
        </button>
      </div>

      {/* Body */}
      {!cuocTroChuyenModelHienTai ? (
        // Danh sách cuộc trò chuyện
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {danhSachCuocTroChuyenModel.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            danhSachCuocTroChuyenModel.map((cuocTroChuyenModel) => {
              const nguoiKhac = layNguoiKhac(cuocTroChuyenModel)
              return (
                <div
                  key={cuocTroChuyenModel._id}
                  onClick={() => moCuocTroChuyenModel(cuocTroChuyenModel)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: 'white',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 600,
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {nguoiKhac?.hoTen.charAt(0).toUpperCase()}
                    {nguoiKhac && kiemTraOnline(nguoiKhac._id) && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: '#10b981',
                          border: '2px solid white',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: cuocTroChuyenModel.soChuaDocCuaToi ? 600 : 400,
                        color: '#111827',
                        marginBottom: 4,
                      }}
                    >
                      {nguoiKhac?.hoTen}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cuocTroChuyenModel.tinNhanCuoiCung?.noiDung || 'Chưa có tin nhắn'}
                    </div>
                  </div>
                  {(cuocTroChuyenModel.soChuaDocCuaToi || 0) > 0 && (
                    <div
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {cuocTroChuyenModel.soChuaDocCuaToi}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        // Chi tiết cuộc trò chuyện
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f9fafb' }}>
            {dangNhap ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>Đang tải...</div>
            ) : tinNhanList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
              </div>
            ) : (
              tinNhanList.map((msg) => {
                const isMe = msg.nguoiGui._id === currentUser._id
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        background: isMe ? '#667eea' : 'white',
                        color: isMe ? 'white' : '#111827',
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.noiDung}</div>
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          justifyContent: 'flex-end',
                        }}
                      >
                        {new Date(msg.ngayTao).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMe && (
                          <>
                            {msg.daDuocDocBoi && msg.daDuocDocBoi.length > 0 ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', background: 'white' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={tinNhanMoi}
                onChange={(e) => xuLyNhapTinNhan(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    guiTinNhanMoi()
                  }
                }}
                placeholder="Nhập tin nhắn..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 24,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={guiTinNhanMoi}
                disabled={!tinNhanMoi.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: tinNhanMoi.trim() ? '#667eea' : '#e5e7eb',
                  border: 'none',
                  cursor: tinNhanMoi.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={18} color={tinNhanMoi.trim() ? 'white' : '#9ca3af'} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
