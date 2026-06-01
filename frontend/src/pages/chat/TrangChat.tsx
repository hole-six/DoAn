/**
 * TrangChat.tsx — Trang chat đầy đủ cho cả 3 dashboard
 *
 * Logic phân quyền:
 * - Ứng viên: xem chat 1-1 với NTD (khi được mời phỏng vấn), tham gia nhóm cộng đồng
 * - NTD: chat 1-1 với ứng viên (từ pipeline), chat với admin, tham gia nhóm cộng đồng
 * - Admin: chat với NTD (hỗ trợ), quản lý nhóm cộng đồng, xem tất cả
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  ArrowLeft, Check, CheckCheck, Hash, MessageCircle,
  MessageSquare, Plus, Reply, Search, Send, Shield,
  Smile, Trash2, Users, X,
} from 'lucide-react'
import { layNguoiDung } from '../../lib/auth'
import { guiEvent, langNgheEvent, boLangNgheEvent } from '../../lib/socket'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type VaiTro = 'ung_vien' | 'nha_tuyen_dung' | 'admin'

interface NguoiDungInfo {
  id: string; hoTen: string; email: string; vaiTro: VaiTro
}

interface TinNhan {
  id: string; _id?: string
  maCuocTroChuyenId: string
  nguoiGui: { _id: string; hoTen: string; email: string; vaiTro: string }
  noiDung: string; loai: string
  traloiTinNhan?: TinNhan | null
  daDuocDocBoi?: { nguoiDung: string }[]
  phanUng?: { nguoiDung: string; emoji: string }[]
  daXoa?: boolean; ngayTao: string
}

interface CuocTroChuyen {
  _id: string; id?: string
  nguoiThamGia: { _id: string; hoTen: string; email: string; vaiTro: string }[]
  loai: 'ung_vien_nha_tuyen_dung' | 'admin_support' | 'nhom_cong_dong'
  tenNhom?: string; moTaNhom?: string; anhNhom?: string
  quanTriNhom?: { _id: string; hoTen: string }[]
  tinNhanCuoiCung?: { noiDung: string; thoiGian: string }
  soChuaDocCuaToi?: number; ngayCapNhat: string
  soThanhVien?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function headers() {
  const token = localStorage.getItem('itjob_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}
async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.thongBao ?? 'Thao tác thất bại')
  return data.duLieu
}

function thoiGianNgan(v: string) {
  const d = new Date(v), now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Vừa xong'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function thoiGianDay(v: string) {
  return new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string) {
  return name.trim().split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?'
}

const AVATAR_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#0e4d7d', '#059669']
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏']

// ─── Avatar component ─────────────────────────────────────────────────────────
function Avatar({ name, size = 40, online }: { name: string; size?: number; online?: boolean }) {
  const color = avatarColor(name)
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: size * 0.36, fontWeight: 700, userSelect: 'none',
      }}>
        {initials(name)}
      </div>
      {online !== undefined && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? '#10b981' : '#9ca3af', border: '2px solid white',
        }} />
      )}
    </div>
  )
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
          animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>đang nhập...</span>
    </div>
  )
}

// ─── Tin nhắn item ────────────────────────────────────────────────────────────
function TinNhanItem({ msg, isMe, showAvatar, onReply, onDelete, onReact, isGroup }: {
  msg: TinNhan; isMe: boolean; showAvatar: boolean
  onReply: (m: TinNhan) => void; onDelete: (id: string) => void
  onReact: (id: string, emoji: string) => void; isGroup?: boolean
}) {
  const [showActions, setShowActions] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  if (msg.daXoa) {
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
        <div style={{ padding: '8px 14px', borderRadius: 16, background: '#f3f4f6', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>
          Tin nhắn đã bị xóa
        </div>
      </div>
    )
  }

  if (msg.loai === 'system') {
    return (
      <div style={{ textAlign: 'center', padding: '6px 0', color: '#9ca3af', fontSize: 12 }}>
        <span style={{ background: '#f3f4f6', borderRadius: 12, padding: '3px 12px' }}>
          {msg.nguoiGui?.hoTen} {msg.noiDung}
        </span>
      </div>
    )
  }

  const phanUngNhom = (msg.phanUng || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc
  }, {})

  return (
    <div
      style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 2, gap: 8 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false) }}
    >
      {!isMe && (
        <div style={{ width: 32, alignSelf: 'flex-end', flexShrink: 0 }}>
          {showAvatar && <Avatar name={msg.nguoiGui.hoTen} size={32} />}
        </div>
      )}
      <div style={{ maxWidth: '72%', position: 'relative' }}>
        {!isMe && showAvatar && isGroup && (
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3, paddingLeft: 4 }}>
            {msg.nguoiGui.hoTen}
            <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af' }}>
              {msg.nguoiGui.vaiTro === 'admin' ? '🛡️ Admin' : msg.nguoiGui.vaiTro === 'nha_tuyen_dung' ? '🏢 NTD' : '👤 UV'}
            </span>
          </div>
        )}
        {msg.traloiTinNhan && (
          <div style={{
            background: isMe ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
            borderLeft: `3px solid ${isMe ? 'rgba(255,255,255,0.6)' : '#667eea'}`,
            padding: '4px 10px', borderRadius: '8px 8px 0 0',
            fontSize: 12, color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280', marginBottom: -4,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{(msg.traloiTinNhan as TinNhan).nguoiGui?.hoTen}</div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(msg.traloiTinNhan as TinNhan).noiDung}
            </div>
          </div>
        )}
        <div style={{
          background: isMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
          color: isMe ? 'white' : '#111827',
          padding: '10px 14px',
          borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', wordBreak: 'break-word',
        }}>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.noiDung}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            {thoiGianDay(msg.ngayTao)}
            {isMe && (msg.daDuocDocBoi?.length ? <CheckCheck size={13} /> : <Check size={13} />)}
          </div>
        </div>
        {Object.keys(phanUngNhom).length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            {Object.entries(phanUngNhom).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2px 7px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                {emoji} <span style={{ fontSize: 11, color: '#6b7280' }}>{count}</span>
              </button>
            ))}
          </div>
        )}
        {showActions && (
          <div style={{ position: 'absolute', top: -8, [isMe ? 'left' : 'right']: -4, display: 'flex', gap: 4, zIndex: 10 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowEmoji(!showEmoji)} className="chat-action-btn" title="Phản ứng"><Smile size={14} /></button>
              {showEmoji && (
                <div style={{ position: 'absolute', bottom: '100%', marginBottom: 4, [isMe ? 'left' : 'right']: 0, background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px 10px', display: 'flex', gap: 6, zIndex: 20, border: '1px solid #f3f4f6' }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 2, borderRadius: 6, transition: 'transform 0.1s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.3)')}
                      onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => onReply(msg)} className="chat-action-btn" title="Trả lời"><Reply size={14} /></button>
            {isMe && <button onClick={() => onDelete(msg.id)} className="chat-action-btn chat-action-btn--danger" title="Xóa"><Trash2 size={14} /></button>}
          </div>
        )}
      </div>
      {isMe && (
        <div style={{ width: 32, alignSelf: 'flex-end', flexShrink: 0 }}>
          {showAvatar && <Avatar name={layNguoiDung()?.hoTen || 'Me'} size={32} />}
        </div>
      )}
    </div>
  )
}

// ─── Hook quản lý chat state ──────────────────────────────────────────────────
function useChatState(nguoiDung: NguoiDungInfo | null) {
  const [danhSach, setDanhSach] = useState<CuocTroChuyen[]>([])
  const [nhomCongDong, setNhomCongDong] = useState<CuocTroChuyen[]>([])
  const [cuocTroChuyenHienTai, setCuocTroChuyenHienTai] = useState<CuocTroChuyen | null>(null)
  const [tinNhanList, setTinNhanList] = useState<TinNhan[]>([])
  const [online, setOnline] = useState<Set<string>>(new Set())
  const [dangNhap, setDangNhap] = useState<Set<string>>(new Set())
  const [dangTaiTN, setDangTaiTN] = useState(false)
  const [traLoi, setTraLoi] = useState<TinNhan | null>(null)
  const token = localStorage.getItem('itjob_token')

  const taiDanhSach = useCallback(async () => {
    if (!token) return
    try {
      const [ds, nhom] = await Promise.all([
        api('/tinnhan/cuoc-tro-chuyen'),
        api('/tinnhan/nhom-cong-dong'),
      ])
      setDanhSach(ds || [])
      setNhomCongDong(nhom || [])
    } catch { /* ignore */ }
  }, [token])

  const moCuocTroChuyen = useCallback(async (ctc: CuocTroChuyen) => {
    if (cuocTroChuyenHienTai) guiEvent('leave_conversation', { conversationId: cuocTroChuyenHienTai._id })
    setCuocTroChuyenHienTai(ctc)
    setTinNhanList([])
    setDangTaiTN(true)
    guiEvent('join_conversation', { conversationId: ctc._id })
    try {
      const msgs = await api(`/tinnhan/cuoc-tro-chuyen/${ctc._id}/tin-nhan?limit=60`)
      setTinNhanList(msgs || [])
      if ((ctc.soChuaDocCuaToi || 0) > 0) {
        await api(`/tinnhan/cuoc-tro-chuyen/${ctc._id}/danh-dau-da-doc`, { method: 'POST' })
        setDanhSach(prev => prev.map(c => c._id === ctc._id ? { ...c, soChuaDocCuaToi: 0 } : c))
      }
    } finally { setDangTaiTN(false) }
  }, [cuocTroChuyenHienTai])

  const guiTinNhan = useCallback(async (noiDung: string) => {
    if (!noiDung.trim() || !cuocTroChuyenHienTai || !nguoiDung) return
    guiEvent('typing_stop', { conversationId: cuocTroChuyenHienTai._id })
    const tempId = `temp_${Date.now()}`
    const tempMsg: TinNhan = {
      id: tempId, maCuocTroChuyenId: cuocTroChuyenHienTai._id,
      nguoiGui: { _id: nguoiDung.id, hoTen: nguoiDung.hoTen, email: nguoiDung.email, vaiTro: nguoiDung.vaiTro },
      noiDung, loai: 'text', traloiTinNhan: traLoi, ngayTao: new Date().toISOString(),
    }
    setTinNhanList(prev => [...prev, tempMsg])
    setTraLoi(null)
    try {
      const body: any = { noiDung }
      if (traLoi) body.traloiTinNhan = traLoi.id
      const res = await api(`/tinnhan/cuoc-tro-chuyen/${cuocTroChuyenHienTai._id}/tin-nhan`, { method: 'POST', body: JSON.stringify(body) })
      setTinNhanList(prev => prev.filter(m => m.id !== tempId).concat({ ...res, id: res.id || res._id }))
      setDanhSach(prev => prev.map(c => c._id === cuocTroChuyenHienTai._id
        ? { ...c, tinNhanCuoiCung: { noiDung, thoiGian: new Date().toISOString() } } : c))
    } catch { setTinNhanList(prev => prev.filter(m => m.id !== tempId)) }
  }, [cuocTroChuyenHienTai, nguoiDung, traLoi])

  const xoaTinNhan = useCallback(async (id: string) => {
    await api(`/tinnhan/tin-nhan/${id}`, { method: 'DELETE' })
    setTinNhanList(prev => prev.map(m => m.id === id ? { ...m, daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } : m))
  }, [])

  const themPhanUng = useCallback(async (id: string, emoji: string) => {
    if (!nguoiDung) return
    await api(`/tinnhan/tin-nhan/${id}/phan-ung`, { method: 'POST', body: JSON.stringify({ emoji }) })
    setTinNhanList(prev => prev.map(m => {
      if (m.id !== id) return m
      const pu = (m.phanUng || []).filter(r => r.nguoiDung !== nguoiDung.id)
      pu.push({ nguoiDung: nguoiDung.id, emoji })
      return { ...m, phanUng: pu }
    }))
  }, [nguoiDung])

  const thamGiaNhom = useCallback(async (nhomId: string) => {
    await api(`/tinnhan/nhom-cong-dong/tham-gia/${nhomId}`, { method: 'POST' })
    await taiDanhSach()
  }, [taiDanhSach])

  // Socket listeners
  useEffect(() => {
    if (!token || !nguoiDung) return
    const onTinNhanMoi = (data: any) => {
      setTinNhanList(prev => {
        if (prev.some(m => m.id === data.tinNhan.id)) return prev
        return [...prev, data.tinNhan]
      })
      taiDanhSach()
    }
    const onXoa = (data: any) => setTinNhanList(prev => prev.map(m => m.id === data.maTinNhan ? { ...m, daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } : m))
    const onPhanUng = (data: any) => setTinNhanList(prev => prev.map(m => {
      if (m.id !== data.maTinNhan) return m
      const pu = (m.phanUng || []).filter(r => r.nguoiDung !== data.nguoiDung)
      if (data.emoji) pu.push({ nguoiDung: data.nguoiDung, emoji: data.emoji })
      return { ...m, phanUng: pu }
    }))
    const onOnline = (d: any) => setOnline(prev => new Set([...prev, d.userId]))
    const onOffline = (d: any) => setOnline(prev => { const s = new Set(prev); s.delete(d.userId); return s })
    const onTyping = (d: any) => setDangNhap(prev => {
      const s = new Set(prev)
      if (d.isTyping) s.add(d.userId); else s.delete(d.userId)
      return s
    })
    langNgheEvent('tin_nhan_moi', onTinNhanMoi)
    langNgheEvent('tin_nhan_da_xoa', onXoa)
    langNgheEvent('phan_ung_moi', onPhanUng)
    langNgheEvent('user_online', onOnline)
    langNgheEvent('user_offline', onOffline)
    langNgheEvent('user_typing', onTyping)
    taiDanhSach()
    return () => {
      boLangNgheEvent('tin_nhan_moi', onTinNhanMoi)
      boLangNgheEvent('tin_nhan_da_xoa', onXoa)
      boLangNgheEvent('phan_ung_moi', onPhanUng)
      boLangNgheEvent('user_online', onOnline)
      boLangNgheEvent('user_offline', onOffline)
      boLangNgheEvent('user_typing', onTyping)
    }
  }, [token, nguoiDung?.id])

  const tongChuaDoc = danhSach.reduce((s, c) => s + (c.soChuaDocCuaToi || 0), 0)

  return {
    danhSach, nhomCongDong, cuocTroChuyenHienTai, tinNhanList,
    online, dangNhap, dangTaiTN, traLoi, tongChuaDoc,
    taiDanhSach, moCuocTroChuyen, guiTinNhan, xoaTinNhan, themPhanUng,
    thamGiaNhom, setTraLoi,
    quayLai: () => {
      if (cuocTroChuyenHienTai) guiEvent('leave_conversation', { conversationId: cuocTroChuyenHienTai._id })
      setCuocTroChuyenHienTai(null); setTinNhanList([])
    },
  }
}

// ─── Sidebar: danh sách cuộc trò chuyện ──────────────────────────────────────
function Sidebar({ nguoiDung, chat, tab, setTab, search, setSearch }: {
  nguoiDung: NguoiDungInfo; chat: ReturnType<typeof useChatState>
  tab: 'dm' | 'nhom'; setTab: (t: 'dm' | 'nhom') => void
  search: string; setSearch: (s: string) => void
}) {
  const dmList = chat.danhSach.filter(c => c.loai !== 'nhom_cong_dong')
  const nhomDaThamGia = chat.danhSach.filter(c => c.loai === 'nhom_cong_dong')
  const nhomChuaThamGia = chat.nhomCongDong.filter(n => !nhomDaThamGia.some(j => j._id === n._id))

  const filterDm = dmList.filter(c => {
    const other = c.nguoiThamGia.find(p => p._id !== nguoiDung.id)
    return !search || other?.hoTen.toLowerCase().includes(search.toLowerCase())
  })

  const labelLoai = (loai: string) => {
    if (loai === 'admin_support') return { icon: '🛡️', label: 'Hỗ trợ Admin' }
    if (loai === 'ung_vien_nha_tuyen_dung') return { icon: '💼', label: 'Tuyển dụng' }
    return { icon: '💬', label: 'Chat' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Header sidebar */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Tin nhắn</h2>
        {chat.tongChuaDoc > 0 && (
          <span style={{ display: 'inline-block', marginTop: 4, background: '#7c3aed', color: 'white', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
            {chat.tongChuaDoc} chưa đọc
          </span>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 10, padding: '8px 12px' }}>
          <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm cuộc trò chuyện..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, flex: 1, color: '#111827' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
        {[{ key: 'dm', label: 'Tin nhắn', icon: MessageSquare }, { key: 'nhom', label: 'Nhóm', icon: Hash }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? '#7c3aed' : '#6b7280', borderBottom: tab === t.key ? '2px solid #7c3aed' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'dm' ? (
          filterDm.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>Chưa có cuộc trò chuyện</p>
              {nguoiDung.vaiTro === 'nha_tuyen_dung' && <p style={{ margin: '4px 0 0', fontSize: 12 }}>Chat với ứng viên từ trang Pipeline</p>}
            </div>
          ) : filterDm.map(ctc => {
            const other = ctc.nguoiThamGia.find(p => p._id !== nguoiDung.id)
            const isOnline = other ? chat.online.has(other._id) : false
            const unread = ctc.soChuaDocCuaToi || 0
            const { icon } = labelLoai(ctc.loai)
            const isActive = chat.cuocTroChuyenHienTai?._id === ctc._id
            return (
              <button key={ctc._id} onClick={() => chat.moCuocTroChuyen(ctc)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? '#f5f3ff' : unread > 0 ? '#fafaf9' : 'white', borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent', transition: 'background 0.15s' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar name={other?.hoTen || '?'} size={42} online={isOnline} />
                  <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 12 }}>{icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {other?.hoTen || 'Người dùng'}
                    </span>
                    {ctc.tinNhanCuoiCung?.thoiGian && <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{thoiGianNgan(ctc.tinNhanCuoiCung.thoiGian)}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: unread > 0 ? '#7c3aed' : '#6b7280', fontWeight: unread > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {ctc.tinNhanCuoiCung?.noiDung || 'Chưa có tin nhắn'}
                    </span>
                    {unread > 0 && <span style={{ background: '#7c3aed', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{unread > 9 ? '9+' : unread}</span>}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div style={{ padding: '8px 0' }}>
            {nhomDaThamGia.length > 0 && (
              <>
                <div style={{ padding: '6px 14px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Đã tham gia</div>
                {nhomDaThamGia.map(nhom => {
                  const isActive = chat.cuocTroChuyenHienTai?._id === nhom._id
                  const unread = nhom.soChuaDocCuaToi || 0
                  return (
                    <button key={nhom._id} onClick={() => chat.moCuocTroChuyen(nhom)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? '#f5f3ff' : 'white', borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, flexShrink: 0 }}>
                        {nhom.anhNhom ? <img src={nhom.anhNhom} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} alt="" /> : '#'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nhom.tenNhom || 'Nhóm cộng đồng'}</span>
                          {unread > 0 && <span style={{ background: '#7c3aed', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>}
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{nhom.soThanhVien || nhom.nguoiThamGia?.length || 0} thành viên</span>
                      </div>
                    </button>
                  )
                })}
              </>
            )}
            {nhomChuaThamGia.length > 0 && (
              <>
                <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Khám phá nhóm</div>
                {nhomChuaThamGia.map(nhom => (
                  <div key={nhom._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #43e97b, #38f9d7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, flexShrink: 0 }}>#</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{nhom.tenNhom || 'Nhóm cộng đồng'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{nhom.moTaNhom || ''} · {nhom.soThanhVien || 0} thành viên</div>
                    </div>
                    <button onClick={() => chat.thamGiaNhom(nhom._id)}
                      style={{ flexShrink: 0, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus size={12} /> Tham gia
                    </button>
                  </div>
                ))}
              </>
            )}
            {nhomDaThamGia.length === 0 && nhomChuaThamGia.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                <Hash size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>Chưa có nhóm nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Khu vực tin nhắn ─────────────────────────────────────────────────────────
function KhuVucTinNhan({ nguoiDung, chat }: { nguoiDung: NguoiDungInfo; chat: ReturnType<typeof useChatState> }) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ctc = chat.cuocTroChuyenHienTai!
  const isGroup = ctc.loai === 'nhom_cong_dong'
  const other = !isGroup ? ctc.nguoiThamGia.find(p => p._id !== nguoiDung.id) : null
  const isOnline = other ? chat.online.has(other._id) : false
  const isDangNhap = other ? chat.dangNhap.has(other._id) : [...chat.dangNhap].some(id => id !== nguoiDung.id)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat.tinNhanList.length])
  useEffect(() => { inputRef.current?.focus() }, [ctc._id])

  const xuLyNhap = (val: string) => {
    setInput(val)
    if (typingRef.current) clearTimeout(typingRef.current)
    guiEvent('typing_start', { conversationId: ctc._id })
    typingRef.current = setTimeout(() => guiEvent('typing_stop', { conversationId: ctc._id }), 2000)
  }

  const xuLyGui = async () => {
    if (!input.trim()) return
    const text = input; setInput('')
    await chat.guiTinNhan(text)
  }

  // Nhóm tin nhắn liên tiếp cùng người gửi
  const nhomTN = chat.tinNhanList.map((msg, i) => {
    const next = chat.tinNhanList[i + 1]
    const isMe = msg.nguoiGui._id === nguoiDung.id
    return {
      msg, isMe,
      showAvatar: !next || next.nguoiGui._id !== msg.nguoiGui._id,
    }
  })

  const headerTitle = isGroup
    ? (ctc.tenNhom || 'Nhóm cộng đồng')
    : (other?.hoTen || 'Người dùng')

  const headerSub = isGroup
    ? `${ctc.nguoiThamGia?.length || 0} thành viên`
    : isDangNhap ? '✏️ đang nhập...' : isOnline ? '● Đang online' : '○ Offline'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, background: 'white', flexShrink: 0 }}>
        <button onClick={chat.quayLai} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} style={{ color: '#6b7280' }} />
        </button>
        {isGroup
          ? <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, flexShrink: 0 }}>#</div>
          : <Avatar name={other?.hoTen || '?'} size={38} online={isOnline} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{headerTitle}</div>
          <div style={{ fontSize: 12, color: isOnline && !isGroup ? '#10b981' : '#9ca3af' }}>{headerSub}</div>
        </div>
        {ctc.loai === 'admin_support' && <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#92400e' }}><Shield size={13} /> Hỗ trợ Admin</div>}
        {isGroup && <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#ede9fe', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#5b21b6' }}><Users size={13} /> Nhóm</div>}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#f9fafb' }}>
        {chat.dangTaiTN ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div className="chat-spinner" />
          </div>
        ) : chat.tinNhanList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 14 }}>
            {isGroup ? '👋 Hãy là người đầu tiên nhắn tin trong nhóm!' : '👋 Hãy bắt đầu cuộc trò chuyện!'}
          </div>
        ) : nhomTN.map(({ msg, isMe, showAvatar }) => (
          <TinNhanItem key={msg.id} msg={msg} isMe={isMe} showAvatar={showAvatar} isGroup={isGroup}
            onReply={chat.setTraLoi} onDelete={chat.xoaTinNhan} onReact={chat.themPhanUng} />
        ))}
        {isDangNhap && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            {other && <Avatar name={other.hoTen} size={28} />}
            <div style={{ background: 'white', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Reply preview */}
      {chat.traLoi && (
        <div style={{ padding: '8px 16px', background: '#f5f3ff', borderTop: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, borderLeft: '3px solid #7c3aed', paddingLeft: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>{chat.traLoi.nguoiGui.hoTen}</div>
            <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.traLoi.noiDung}</div>
          </div>
          <button onClick={() => chat.setTraLoi(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><X size={14} /></button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input ref={inputRef} type="text" value={input} onChange={e => xuLyNhap(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); xuLyGui() } }}
            placeholder={isGroup ? `Nhắn tin vào ${ctc.tenNhom || 'nhóm'}...` : `Nhắn tin cho ${other?.hoTen || ''}...`}
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 22, padding: '10px 16px', fontSize: 14, outline: 'none', background: '#f9fafb', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = '#7c3aed')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          <button onClick={xuLyGui} disabled={!input.trim()}
            style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb', color: 'white', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main TrangChat component ─────────────────────────────────────────────────
export default function TrangChat({ vaiTro }: { vaiTro: VaiTro }) {
  const nguoiDung = layNguoiDung() as NguoiDungInfo | null
  const chat = useChatState(nguoiDung)
  const [tab, setTab] = useState<'dm' | 'nhom'>('dm')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const targetId = new URLSearchParams(window.location.search).get('cuocTroChuyen')
    if (!targetId || chat.cuocTroChuyenHienTai || !chat.danhSach.length) return
    const found = chat.danhSach.find(item => item._id === targetId || item.id === targetId)
    if (found) {
      void chat.moCuocTroChuyen(found)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [chat.danhSach, chat.cuocTroChuyenHienTai])

  if (!nguoiDung) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 14 }}>
      Vui lòng đăng nhập để sử dụng chat.
    </div>
  )

  const eyebrowMap: Record<VaiTro, string> = {
    ung_vien: 'ITJob Ứng viên',
    nha_tuyen_dung: 'ITJob Employer',
    admin: 'ITJob Admin',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Page header */}
      <div className="relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(14,77,125,0.07)] sm:flex-row sm:items-center sm:justify-between sm:p-5 mb-3">
        <span className="pointer-events-none absolute -right-14 -top-20 h-40 w-56 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="relative z-[1] min-w-0">
          <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.1em] text-violet-600">{eyebrowMap[vaiTro]}</span>
          <h1 className="break-words text-2xl font-black leading-tight text-slate-950">Tin nhắn & Cộng đồng</h1>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
            {vaiTro === 'admin' && 'Hỗ trợ nhà tuyển dụng, quản lý nhóm cộng đồng và theo dõi cuộc trò chuyện.'}
            {vaiTro === 'nha_tuyen_dung' && 'Chat với ứng viên, liên hệ admin hỗ trợ và tham gia nhóm cộng đồng.'}
            {vaiTro === 'ung_vien' && 'Nhận tin từ nhà tuyển dụng, tham gia nhóm cộng đồng IT.'}
          </p>
        </div>
        {chat.tongChuaDoc > 0 && (
          <div className="relative z-[1] flex-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-700">
              <MessageCircle size={14} /> {chat.tongChuaDoc} tin chưa đọc
            </span>
          </div>
        )}
      </div>

      {/* Chat layout */}
      <div style={{
        flex: 1, display: 'grid', minHeight: 0,
        gridTemplateColumns: chat.cuocTroChuyenHienTai ? '1fr' : '1fr',
        borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', background: 'white',
        boxShadow: '0 8px 24px rgba(14,77,125,0.07)',
        // Desktop: sidebar + content
      }} className="chat-layout">
        {/* Sidebar — ẩn trên mobile khi đang xem conversation */}
        <div className={clsx('chat-sidebar', chat.cuocTroChuyenHienTai && 'chat-sidebar--hidden')}>
          <Sidebar nguoiDung={nguoiDung} chat={chat} tab={tab} setTab={setTab} search={search} setSearch={setSearch} />
        </div>

        {/* Content area */}
        <div className={clsx('chat-content', !chat.cuocTroChuyenHienTai && 'chat-content--hidden')}>
          {chat.cuocTroChuyenHienTai ? (
            <KhuVucTinNhan nguoiDung={nguoiDung} chat={chat} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: 12 }}>
              <MessageCircle size={56} style={{ opacity: 0.2 }} />
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Chọn một cuộc trò chuyện để bắt đầu</p>
              <p style={{ margin: 0, fontSize: 13 }}>Hoặc tham gia nhóm cộng đồng từ tab Nhóm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Wrapper exports cho từng dashboard ──────────────────────────────────────
export function ChatUngVienPage() { return <TrangChat vaiTro="ung_vien" /> }
export function ChatNhaTuyenDungPage() { return <TrangChat vaiTro="nha_tuyen_dung" /> }
export function ChatAdminPage() { return <TrangChat vaiTro="admin" /> }
