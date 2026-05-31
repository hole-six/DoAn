/**
 * TrangChat.tsx — Trang chat đầy đủ cho cả 3 dashboard
 *
 * Logic phân quyền:
 * - Ứng viên: xem chat 1-1 với NTD (khi được mời phỏng vấn), tham gia nhóm cộng đồng
 * - NTD: chat 1-1 với ứng viên (từ pipeline), chat với admin, tham gia nhóm cộng đồng
 * - Admin: chat với NTD (hỗ trợ), quản lý nhóm cộng đồng, xem tất cả
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import {
  ArrowLeft, Check, CheckCheck, Hash, MessageCircle,
  MessageSquare, Plus, Reply, Search, Send, Shield,
  Smile, Trash2, Users, X,
} from 'lucide-react'
import AppIcon from '../../components/AppIcon'
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
  const [dangTai, setDangTai] = useState(false)
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
    online, dangNhap, dangTai, dangTaiTN, traLoi, tongChuaDoc,
    taiDanhSach, moCuocTroChuyen, guiTinNhan, xoaTinNhan, themPhanUng,
    thamGiaNhom, setTraLoi,
    quayLai: () => {
      if (cuocTroChuyenHienTai) guiEvent('leave_conversation', { conversationId: cuocTroChuyenHienTai._id })
      setCuocTroChuyenHienTai(null); setTinNhanList([])
    },
  }
}
