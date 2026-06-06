import { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Briefcase, Check, CheckCheck, Hash, MessageCircle, Search, Shield, Users, X, Send } from 'lucide-react'
import { useChat, type CuocTroChuyenPreview, type TinNhan } from '../../contexts/ChatContext'
import { layNguoiDung } from '../../lib/auth'

type VaiTro = 'ung_vien' | 'nha_tuyen_dung' | 'admin'

function shortTime(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function relativeTime(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'vừa xong'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}p`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase() || '?'
}

function Avatar({ name, size = 40, online }: { name: string; size?: number; online?: boolean }) {
  const palette = ['#0e4d7d', '#764ba2', '#2563eb', '#059669', '#c026d3']
  const seed = name.trim().charCodeAt(0)
  const color = palette[Number.isFinite(seed) ? seed % palette.length : 0]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, fontSize: size * 0.36, fontWeight: 900 }}
      >
        {initials(name)}
      </div>
      {online !== undefined && (
        <span className={clsx('absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white', online ? 'bg-emerald-500' : 'bg-slate-400')} />
      )}
    </div>
  )
}

function TypePill({ loai }: { loai: string }) {
  if (loai === 'nhom_cong_dong') return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600"><Hash size={12} /> Nhóm</span>
  if (loai === 'admin_support') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800"><Shield size={12} /> Hỗ trợ</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-black text-sky-800"><MessageCircle size={12} /> 1-1</span>
}

function ContextChip({ conversation, compact = false }: { conversation?: CuocTroChuyenPreview | null; compact?: boolean }) {
  const summary = conversation?.contextSummary
  if (!summary?.tieuDeTin && !summary?.tenCongTy) return null
  return (
    <span className={clsx(
      'inline-flex min-w-0 items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 text-sky-800',
      compact ? 'max-w-full px-2 py-0.5 text-[11px] font-black' : 'max-w-full px-3 py-1 text-xs font-black',
    )}>
      <Briefcase size={compact ? 12 : 14} className="shrink-0" />
      <span className="truncate">
        {summary.tieuDeTin || 'Hồ sơ ứng tuyển'}{summary.tenCongTy ? ` · ${summary.tenCongTy}` : ''}
      </span>
    </span>
  )
}

function MessageItem({
  message,
  isMe,
  showAvatar,
  currentUserName,
  onReply,
  onReact,
  onDelete,
}: {
  message: TinNhan
  isMe: boolean
  showAvatar: boolean
  currentUserName: string
  onReply: (message: TinNhan) => void
  onReact: (id: string, emoji: string) => void
  onDelete: (id: string) => void
}) {
  if (message.loai === 'system') {
    return (
      <div className="mb-3 flex justify-center">
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{message.noiDung}</span>
      </div>
    )
  }

  const reactions: Record<string, number> = {}
  for (const item of Array.isArray((message as any).phanUng) ? (message as any).phanUng : []) {
    reactions[String(item.emoji)] = (reactions[String(item.emoji)] || 0) + 1
  }

  if (message.daXoa) {
    return (
      <div className={clsx('mb-2 flex', isMe ? 'justify-end' : 'justify-start')}>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs italic text-slate-400">Tin nhắn đã bị xóa</div>
      </div>
    )
  }

  return (
    <div className={clsx('group mb-3 flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && <div className="w-9 shrink-0">{showAvatar ? <Avatar name={message.nguoiGui.hoTen} size={36} /> : null}</div>}
      <div className="max-w-[82%] sm:max-w-[74%]">
        {!isMe && showAvatar && <div className="mb-1 px-1 text-xs font-bold text-slate-500">{message.nguoiGui.hoTen}</div>}
        {message.traloiTinNhan && (
          <div className="rounded-t-xl border-l-4 border-sky-500 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <div className="font-bold text-slate-700">{message.traloiTinNhan.nguoiGui?.hoTen}</div>
            <div className="truncate">{message.traloiTinNhan.noiDung}</div>
          </div>
        )}
        <div className={clsx('rounded-2xl px-4 py-3 shadow-sm', isMe ? 'rounded-tr-sm bg-[#0e4d7d] text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-900')}>
          <div className="whitespace-pre-wrap break-words text-sm leading-6">{message.noiDung}</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[11px] opacity-80">
            {shortTime(message.ngayTao)}
            {isMe && ((message.daDuocDocBoi?.length || 0) > 0 ? <CheckCheck size={13} /> : <Check size={13} />)}
          </div>
        </div>
        {Object.keys(reactions).length > 0 && (
          <div className={clsx('mt-1 flex flex-wrap gap-1', isMe ? 'justify-end' : 'justify-start')}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm"
              >
                {emoji} <span className="text-[11px]">{count}</span>
              </button>
            ))}
          </div>
        )}
        <div className={clsx('mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100', isMe ? 'justify-end' : 'justify-start')}>
          <button type="button" onClick={() => onReply(message)} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">Trả lời</button>
          <button type="button" onClick={() => onReact(message.id, '👍')} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">👍</button>
          {isMe && <button type="button" onClick={() => onDelete(message.id)} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">Xóa</button>}
        </div>
      </div>
      {isMe && <div className="w-9 shrink-0">{showAvatar ? <Avatar name={currentUserName} size={36} /> : null}</div>}
    </div>
  )
}

export default function TrangChat({ vaiTro }: { vaiTro: VaiTro }) {
  const nguoiDung = layNguoiDung()
  const chat = useChat()
  const [tab, setTab] = useState<'all' | 'direct' | 'group'>('all')
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')

  useEffect(() => {
    const targetId = new URLSearchParams(window.location.search).get('cuocTroChuyen')
    if (!targetId || chat.cuocTroChuyenHienTai || !chat.danhSachCuocTroChuyen.length) return
    const found = chat.danhSachCuocTroChuyen.find(item => item._id === targetId)
    if (found) {
      void chat.moCuocTroChuyen(found)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [chat])

  const chatItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return chat.danhSachCuocTroChuyen.filter(conversation => {
      if (tab === 'group' && conversation.loai !== 'nhom_cong_dong') return false
      if (tab === 'direct' && conversation.loai === 'nhom_cong_dong') return false
      if (!query) return true
      const other = chat.layNguoiKhac(conversation)
      return [
        other?.hoTen,
        conversation.tinNhanCuoiCung?.noiDung,
        conversation.tenNhom,
        conversation.moTaNhom,
        conversation.contextSummary?.tieuDeTin,
        conversation.contextSummary?.tenCongTy,
      ].some(value => String(value ?? '').toLowerCase().includes(query))
    })
  }, [chat, search, tab])

  if (!nguoiDung) {
    return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-slate-500">Vui lòng đăng nhập để sử dụng chat.</div>
  }

  const titleByRole: Record<VaiTro, string> = {
    ung_vien: 'ITJob Candidate',
    nha_tuyen_dung: 'ITJob Employer',
    admin: 'ITJob Admin',
  }
  const subtitleByRole: Record<VaiTro, string> = {
    ung_vien: 'Nhắn tin với nhà tuyển dụng khi hồ sơ đủ điều kiện.',
    nha_tuyen_dung: 'Chat với ứng viên trong pipeline và liên hệ quản trị viên hỗ trợ.',
    admin: 'Theo dõi và hỗ trợ toàn bộ nhà tuyển dụng trong hệ thống.',
  }

  const selected = chat.cuocTroChuyenHienTai
  const isGroup = selected?.loai === 'nhom_cong_dong'
  const other = selected && !isGroup ? chat.layNguoiKhac(selected) : null
  const online = other ? chat.kiemTraOnline(other._id) : false
  const typing = other ? chat.nguoiDangNhap.has(other._id) : false

  const send = async () => {
    if (!input.trim()) return
    const value = input
    setInput('')
    await chat.guiTinNhan(value)
  }

  return (
    <div className="chat-page grid min-h-[calc(100dvh-140px)] gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className={clsx('chat-list-panel min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm', selected && 'max-lg:hidden')}>
        <div className="border-b border-slate-200 p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-700">{titleByRole[vaiTro]}</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Tin nhắn</h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{subtitleByRole[vaiTro]}</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400" placeholder="Tìm cuộc trò chuyện..." />
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 px-3 py-2 text-sm font-black">
          {[
            ['all', 'Tất cả'],
            ['direct', 'Tin nhắn'],
            ['group', 'Nhóm'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={clsx('min-h-10 flex-1 rounded-xl px-2 transition', tab === value ? 'border border-sky-200 bg-sky-50 text-sky-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[calc(100dvh-320px)] overflow-y-auto">
          {chatItems.length ? chatItems.map(conversation => {
            const otherPerson = chat.layNguoiKhac(conversation)
            const unread = conversation.soChuaDocCuaToi || 0
            const active = selected?._id === conversation._id
            const isGroupItem = conversation.loai === 'nhom_cong_dong'
            const isOnline = otherPerson ? chat.kiemTraOnline(otherPerson._id) : false
            const name = isGroupItem ? (conversation.tenNhom || 'Nhóm cộng đồng') : (otherPerson?.hoTen || 'Người dùng')
            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => void chat.moCuocTroChuyen(conversation)}
                className={clsx(
                  'flex min-h-[88px] w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition',
                  active ? 'bg-sky-50' : 'hover:bg-slate-50',
                )}
              >
                <div className="pt-0.5">
                  {isGroupItem
                    ? <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><Hash size={16} /></div>
                    : <Avatar name={name} size={40} online={isOnline} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="min-w-0 truncate text-sm font-black text-slate-950">{name}</strong>
                    {conversation.tinNhanCuoiCung?.thoiGian && <span className="shrink-0 text-[11px] font-bold text-slate-400">{relativeTime(conversation.tinNhanCuoiCung.thoiGian)}</span>}
                  </div>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                    <TypePill loai={conversation.loai ?? 'truc_tiep'} />
                    <ContextChip conversation={conversation} compact />
                    {unread > 0 && <span className="shrink-0 rounded-full bg-sky-700 px-2 py-0.5 text-[11px] font-black text-white">{unread > 9 ? '9+' : unread}</span>}
                  </div>
                  <span className="mt-1 block truncate text-xs font-semibold text-slate-500">{conversation.tinNhanCuoiCung?.noiDung || 'Chưa có tin nhắn'}</span>
                </div>
              </button>
            )
          }) : (
            <div className="grid place-items-center px-4 py-10 text-center text-sm font-semibold text-slate-400">
              <Users size={32} className="mb-2 opacity-30" />
              Không có cuộc trò chuyện nào.
            </div>
          )}
        </div>
      </aside>

      <section className={clsx('chat-thread-panel min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm', !selected && 'max-lg:hidden')}>
        {selected ? (
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <button type="button" onClick={() => chat.quayLaiDanhSach()} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden">
                <ArrowLeft size={18} className="text-slate-500" />
              </button>
              {isGroup ? <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><Hash size={16} /></div> : <Avatar name={other?.hoTen || 'Người dùng'} size={40} online={online} />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-black text-slate-950">{isGroup ? (selected.tenNhom || 'Nhóm cộng đồng') : (other?.hoTen || 'Người dùng')}</div>
                <div className="text-sm font-semibold text-slate-500">{isGroup ? `${selected.nguoiThamGia?.length || 0} thành viên` : typing ? 'Đang nhập...' : online ? 'Đang online' : 'Offline'}</div>
                <div className="mt-1"><ContextChip conversation={selected} /></div>
              </div>
              {selected.loai === 'admin_support' && <span className="hidden items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 sm:inline-flex"><Shield size={13} /> Hỗ trợ</span>}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
              {chat.dangTaiTinNhan ? (
                <div className="grid min-h-48 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-700" /></div>
              ) : chat.tinNhanList.length ? (
                chat.tinNhanList.map((message, index) => {
                  const isMe = message.nguoiGui._id === nguoiDung.id
                  const next = chat.tinNhanList[index + 1]
                  const showAvatar = !next || next.nguoiGui._id !== message.nguoiGui._id
                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isMe={isMe}
                      showAvatar={showAvatar}
                      currentUserName={nguoiDung.hoTen}
                      onReply={chat.setTinNhanTraLoi}
                      onDelete={chat.xoaTinNhan}
                      onReact={chat.themPhanUng}
                    />
                  )
                })
              ) : (
                <div className="grid min-h-48 place-items-center text-center text-sm font-semibold text-slate-400">
                  <MessageCircle size={52} className="mb-2 opacity-20" />
                  Chưa có tin nhắn trong cuộc trò chuyện này.
                </div>
              )}
              <div className="h-4" />
            </div>

            {chat.tinNhanDangTraLoi && (
              <div className="border-t border-slate-200 bg-sky-50 px-4 py-3">
                <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black uppercase tracking-wide text-sky-700">Trả lời</div>
                    <div className="truncate text-sm font-bold text-slate-900">{chat.tinNhanDangTraLoi.nguoiGui.hoTen}</div>
                    <div className="truncate text-sm text-slate-500">{chat.tinNhanDangTraLoi.noiDung}</div>
                  </div>
                  <button type="button" onClick={() => chat.setTinNhanTraLoi(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <footer className="border-t border-slate-200 bg-white p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                  rows={1}
                  placeholder={isGroup ? `Nhắn tin vào ${selected.tenNhom || 'nhóm'}...` : `Nhắn tin cho ${other?.hoTen || 'người dùng'}...`}
                  className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none placeholder:text-slate-400"
                />
                <button type="button" onClick={() => void send()} disabled={!input.trim()} className={clsx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white transition', input.trim() ? 'bg-[#0e4d7d]' : 'bg-slate-300')}>
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="grid h-full min-h-[40vh] place-items-center px-4 text-center text-sm font-semibold text-slate-400">
            <div>
              <MessageCircle size={60} className="mx-auto mb-3 opacity-20" />
              Chọn một cuộc trò chuyện để bắt đầu.
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export function ChatUngVienPage() { return <TrangChat vaiTro="ung_vien" /> }
export function ChatNhaTuyenDungPage() { return <TrangChat vaiTro="nha_tuyen_dung" /> }
export function ChatAdminPage() { return <TrangChat vaiTro="admin" /> }
