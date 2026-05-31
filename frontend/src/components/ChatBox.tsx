import {
  ArrowLeft, Check, CheckCheck, MessageCircle,
  MoreVertical, Paperclip, Reply, Send, Smile, Trash2, X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChat, type TinNhan } from '../contexts/ChatContext'
import { guiEvent } from '../lib/socket'
import { layNguoiDung } from '../lib/auth'
import AppIcon from './AppIcon'

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏']

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ ten, online, size = 40 }: { ten: string; online?: boolean; size?: number }) {
  const mau = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a']
  const idx = ten.charCodeAt(0) % mau.length
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${mau[idx]}, ${mau[(idx + 1) % mau.length]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: size * 0.38, fontWeight: 700,
        userSelect: 'none',
      }}>
        {ten.charAt(0).toUpperCase()}
      </div>
      {online !== undefined && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? '#10b981' : '#9ca3af',
          border: '2px solid white',
        }} />
      )}
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
            animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>đang nhập...</span>
    </div>
  )
}

// ─── Tin nhắn item ────────────────────────────────────────────────────────────

function TinNhanItem({
  msg, isMe, onReply, onDelete, onReact, showAvatar,
}: {
  msg: TinNhan
  isMe: boolean
  onReply: (msg: TinNhan) => void
  onDelete: (id: string) => void
  onReact: (id: string, emoji: string) => void
  showAvatar: boolean
}) {
  const [showActions, setShowActions] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const thoiGian = new Date(msg.ngayTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  // Group reactions
  const phanUngNhom = (msg.phanUng || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  if (msg.daXoa) {
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
        <div style={{
          padding: '8px 14px', borderRadius: 16,
          background: '#f3f4f6', color: '#9ca3af',
          fontSize: 13, fontStyle: 'italic',
        }}>
          Tin nhắn đã bị xóa
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 2, gap: 8 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false) }}
    >
      {/* Avatar bên trái (người khác) */}
      {!isMe && (
        <div style={{ width: 32, alignSelf: 'flex-end', flexShrink: 0 }}>
          {showAvatar && <Avatar ten={msg.nguoiGui.hoTen} size={32} />}
        </div>
      )}

      <div style={{ maxWidth: '72%', position: 'relative' }}>
        {/* Tên người gửi */}
        {!isMe && showAvatar && (
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3, paddingLeft: 4 }}>
            {msg.nguoiGui.hoTen}
          </div>
        )}

        {/* Reply preview */}
        {msg.traloiTinNhan && (
          <div style={{
            background: isMe ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
            borderLeft: `3px solid ${isMe ? 'rgba(255,255,255,0.6)' : '#667eea'}`,
            padding: '4px 10px', borderRadius: '8px 8px 0 0',
            fontSize: 12, color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280',
            marginBottom: -4,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {(msg.traloiTinNhan as TinNhan).nguoiGui?.hoTen}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(msg.traloiTinNhan as TinNhan).noiDung}
            </div>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: isMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
          color: isMe ? 'white' : '#111827',
          padding: '10px 14px',
          borderRadius: isMe
            ? (msg.traloiTinNhan ? '16px 4px 16px 16px' : '16px 4px 16px 16px')
            : (msg.traloiTinNhan ? '4px 16px 16px 16px' : '4px 16px 16px 16px'),
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          wordBreak: 'break-word',
        }}>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.noiDung}</div>
          <div style={{
            fontSize: 11, opacity: 0.7, marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 4,
            justifyContent: 'flex-end',
          }}>
            {thoiGian}
            {isMe && (
              msg.daDuocDocBoi && msg.daDuocDocBoi.length > 0
                ? <AppIcon icon={CheckCheck} size={13} />
                : <AppIcon icon={Check} size={13} />
            )}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(phanUngNhom).length > 0 && (
          <div style={{
            display: 'flex', gap: 4, flexWrap: 'wrap',
            marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start',
          }}>
            {Object.entries(phanUngNhom).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                style={{
                  background: 'white', border: '1px solid #e5e7eb',
                  borderRadius: 12, padding: '2px 7px',
                  fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 3,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                {emoji} <span style={{ fontSize: 11, color: '#6b7280' }}>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {showActions && (
          <div style={{
            position: 'absolute', top: -8,
            [isMe ? 'left' : 'right']: -4,
            display: 'flex', gap: 4, zIndex: 10,
          }}>
            {/* Emoji picker toggle */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="chat-action-btn"
                title="Phản ứng"
              >
                <AppIcon icon={Smile} size={14} />
              </button>
              {showEmoji && (
                <div style={{
                  position: 'absolute', bottom: '100%', marginBottom: 4,
                  [isMe ? 'left' : 'right']: 0,
                  background: 'white', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  padding: '8px 10px',
                  display: 'flex', gap: 6, zIndex: 20,
                  border: '1px solid #f3f4f6',
                }}>
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => { onReact(msg.id, e); setShowEmoji(false) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 20, padding: 2, borderRadius: 6,
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.3)')}
                      onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => onReply(msg)} className="chat-action-btn" title="Trả lời">
              <AppIcon icon={Reply} size={14} />
            </button>

            {isMe && (
              <button onClick={() => onDelete(msg.id)} className="chat-action-btn chat-action-btn--danger" title="Xóa">
                <AppIcon icon={Trash2} size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Avatar bên phải (mình) */}
      {isMe && (
        <div style={{ width: 32, alignSelf: 'flex-end', flexShrink: 0 }}>
          {showAvatar && <Avatar ten={layNguoiDung()?.hoTen || 'Me'} size={32} />}
        </div>
      )}
    </div>
  )
}

// ─── Danh sách cuộc trò chuyện ────────────────────────────────────────────────

function DanhSachCuocTroChuyen() {
  const { danhSachCuocTroChuyen, dangTaiCuocTroChuyen, moCuocTroChuyen, layNguoiKhac, kiemTraOnline } = useChat()

  if (dangTaiCuocTroChuyen) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="chat-spinner" />
      </div>
    )
  }

  if (danhSachCuocTroChuyen.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9ca3af', padding: 32 }}>
        <AppIcon icon={MessageCircle} size={48} style={{ opacity: 0.3 }} />
        <p style={{ margin: 0, fontSize: 14, textAlign: 'center' }}>Chưa có cuộc trò chuyện nào</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {danhSachCuocTroChuyen.map(ctc => {
        const nguoiKhac = layNguoiKhac(ctc)
        const online = nguoiKhac ? kiemTraOnline(nguoiKhac._id) : false
        const chuaDoc = ctc.soChuaDocCuaToi || 0

        return (
          <button
            key={ctc._id}
            onClick={() => moCuocTroChuyen(ctc)}
            className="chat-conversation-item"
            style={{ background: chuaDoc > 0 ? '#f5f3ff' : 'white' }}
          >
            <Avatar ten={nguoiKhac?.hoTen || '?'} online={online} size={46} />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: chuaDoc > 0 ? 700 : 500, color: '#111827' }}>
                  {nguoiKhac?.hoTen || 'Người dùng'}
                </span>
                {ctc.tinNhanCuoiCung?.thoiGian && (
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {dinhDangThoiGianNgan(ctc.tinNhanCuoiCung.thoiGian)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 13, color: chuaDoc > 0 ? '#7c3aed' : '#6b7280',
                  fontWeight: chuaDoc > 0 ? 600 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {ctc.tinNhanCuoiCung?.noiDung || 'Chưa có tin nhắn'}
                </span>
                {chuaDoc > 0 && (
                  <span style={{
                    background: '#7c3aed', color: 'white', borderRadius: 10,
                    padding: '1px 7px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6,
                  }}>
                    {chuaDoc > 9 ? '9+' : chuaDoc}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Khu vực tin nhắn ─────────────────────────────────────────────────────────

function KhuVucTinNhan() {
  const {
    cuocTroChuyenHienTai, tinNhanList, dangTaiTinNhan,
    nguoiDangNhap, guiTinNhan, xoaTinNhan, themPhanUng,
    setTinNhanTraLoi, tinNhanDangTraLoi, quayLaiDanhSach,
    layNguoiKhac, kiemTraOnline,
  } = useChat()

  const [noiDung, setNoiDung] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nguoiDung = layNguoiDung()

  const nguoiKhac = cuocTroChuyenHienTai ? layNguoiKhac(cuocTroChuyenHienTai) : null
  const online = nguoiKhac ? kiemTraOnline(nguoiKhac._id) : false
  const daDangNhap = nguoiKhac ? nguoiDangNhap.has(nguoiKhac._id) : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tinNhanList.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [cuocTroChuyenHienTai?._id])

  const xuLyNhap = (val: string) => {
    setNoiDung(val)
    if (!cuocTroChuyenHienTai) return

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    guiEvent('typing_start', { conversationId: cuocTroChuyenHienTai._id })
    typingTimeoutRef.current = setTimeout(() => {
      guiEvent('typing_stop', { conversationId: cuocTroChuyenHienTai._id })
    }, 2000)
  }

  const xuLyGui = async () => {
    if (!noiDung.trim()) return
    const text = noiDung
    setNoiDung('')
    await guiTinNhan(text)
  }

  // Nhóm tin nhắn theo người gửi liên tiếp
  const tinNhanNhom = tinNhanList.map((msg, idx) => {
    const prev = tinNhanList[idx - 1]
    const next = tinNhanList[idx + 1]
    const isMe = msg.nguoiGui._id === nguoiDung?.id
    const sameSenderAsPrev = prev && prev.nguoiGui._id === msg.nguoiGui._id
    const sameSenderAsNext = next && next.nguoiGui._id === msg.nguoiGui._id
    return { msg, isMe, showAvatar: !sameSenderAsNext, isFirst: !sameSenderAsPrev }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-header */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'white',
      }}>
        <button onClick={quayLaiDanhSach} className="chat-back-btn">
          <AppIcon icon={ArrowLeft} size={18} />
        </button>
        {nguoiKhac && <Avatar ten={nguoiKhac.hoTen} online={online} size={36} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{nguoiKhac?.hoTen}</div>
          <div style={{ fontSize: 12, color: online ? '#10b981' : '#9ca3af' }}>
            {daDangNhap ? '✏️ đang nhập...' : online ? '● Đang online' : '○ Offline'}
          </div>
        </div>
        <button className="chat-action-btn" title="Tùy chọn">
          <AppIcon icon={MoreVertical} size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#f9fafb' }}>
        {dangTaiTinNhan ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div className="chat-spinner" />
          </div>
        ) : tinNhanList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 14 }}>
            Hãy bắt đầu cuộc trò chuyện 👋
          </div>
        ) : (
          tinNhanNhom.map(({ msg, isMe, showAvatar }) => (
            <TinNhanItem
              key={msg.id}
              msg={msg}
              isMe={isMe}
              showAvatar={showAvatar}
              onReply={setTinNhanTraLoi}
              onDelete={xoaTinNhan}
              onReact={themPhanUng}
            />
          ))
        )}

        {/* Typing indicator */}
        {daDangNhap && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            {nguoiKhac && <Avatar ten={nguoiKhac.hoTen} size={28} />}
            <div style={{
              background: 'white', padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {tinNhanDangTraLoi && (
        <div style={{
          padding: '8px 16px', background: '#f5f3ff',
          borderTop: '1px solid #ede9fe',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1, borderLeft: '3px solid #7c3aed', paddingLeft: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
              {tinNhanDangTraLoi.nguoiGui.hoTen}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tinNhanDangTraLoi.noiDung}
            </div>
          </div>
          <button onClick={() => setTinNhanTraLoi(null)} className="chat-action-btn">
            <AppIcon icon={X} size={14} />
          </button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button className="chat-action-btn" title="Đính kèm file" style={{ flexShrink: 0 }}>
            <AppIcon icon={Paperclip} size={18} />
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={noiDung}
              onChange={e => xuLyNhap(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); xuLyGui() }
              }}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
            />
          </div>
          <button
            onClick={xuLyGui}
            disabled={!noiDung.trim()}
            className={`chat-send-btn${noiDung.trim() ? ' active' : ''}`}
            title="Gửi"
          >
            <AppIcon icon={Send} size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ChatBox chính ────────────────────────────────────────────────────────────

export function ChatBox() {
  const { moChat, toggleChat, cuocTroChuyenHienTai, tongSoChuaDoc } = useChat()
  const nguoiDung = layNguoiDung()

  if (!nguoiDung) return null

  return (
    <>
      {/* FAB button */}
      <button
        onClick={toggleChat}
        className="chat-fab"
        aria-label="Mở chat"
        title="Tin nhắn"
      >
        <AppIcon icon={moChat ? X : MessageCircle} size={26} style={{ color: 'white' }} />
        {!moChat && tongSoChuaDoc > 0 && (
          <span className="chat-fab-badge">
            {tongSoChuaDoc > 9 ? '9+' : tongSoChuaDoc}
          </span>
        )}
      </button>

      {/* Chat window */}
      {moChat && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AppIcon icon={MessageCircle} size={22} style={{ color: 'white' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  {cuocTroChuyenHienTai ? 'Tin nhắn' : 'Hộp thư'}
                </h3>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>
                  {cuocTroChuyenHienTai ? '' : `${tongSoChuaDoc > 0 ? `${tongSoChuaDoc} chưa đọc` : 'Không có tin mới'}`}
                </p>
              </div>
            </div>
            <button onClick={toggleChat} className="chat-close-btn">
              <AppIcon icon={X} size={18} style={{ color: 'white' }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {cuocTroChuyenHienTai ? <KhuVucTinNhan /> : <DanhSachCuocTroChuyen />}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dinhDangThoiGianNgan(ngay: string) {
  const now = new Date()
  const date = new Date(ngay)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes}p`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
