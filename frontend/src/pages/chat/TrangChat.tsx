import { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Check, CheckCheck, Hash, MessageCircle, Search, Shield, Users } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'
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
  const colors = ['#0e4d7d', '#764ba2', '#2563eb', '#059669', '#c026d3']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, fontSize: size * 0.36, fontWeight: 800 }}
      >
        {initials(name)}
      </div>
      {online !== undefined && (
        <span className={clsx('absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white', online ? 'bg-emerald-500' : 'bg-slate-400')} />
      )}
    </div>
  )
}

function MessageItem({
  message,
  isMe,
  showAvatar,
  onReply,
  onReact,
  onDelete,
  currentUserName,
}: {
  message: any
  isMe: boolean
  showAvatar: boolean
  onReply: (message: any) => void
  onReact: (id: string, emoji: string) => void
  onDelete: (id: string) => void
  currentUserName: string
}) {
  const reactions: Record<string, number> = {}
  for (const item of Array.isArray(message.phanUng) ? message.phanUng : []) {
    reactions[String(item.emoji)] = (reactions[String(item.emoji)] || 0) + 1
  }

  if (message.daXoa) {
    return (
      <div className={clsx('mb-1 flex', isMe ? 'justify-end' : 'justify-start')}>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs italic text-slate-400">Tin nhắn đã bị xóa</div>
      </div>
    )
  }

  return (
    <div className={clsx('group mb-1 flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && <div className="w-9 shrink-0">{showAvatar ? <Avatar name={message.nguoiGui.hoTen} size={36} /> : null}</div>}
      <div className="max-w-[78%]">
        {!isMe && showAvatar && <div className="mb-1 px-1 text-xs font-bold text-slate-500">{message.nguoiGui.hoTen}</div>}
        {message.traloiTinNhan && (
          <div className="rounded-t-xl border-l-4 border-violet-500 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <div className="font-bold text-slate-700">{message.traloiTinNhan.nguoiGui?.hoTen}</div>
            <div className="truncate">{message.traloiTinNhan.noiDung}</div>
          </div>
        )}
        <div className={clsx('rounded-2xl px-4 py-3 shadow-sm', isMe ? 'rounded-tr-sm bg-gradient-to-br from-sky-600 to-violet-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-900')}>
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
                {emoji} <span className="text-[11px]">{Number(count)}</span>
              </button>
            ))}
          </div>
        )}
        <div className={clsx('mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100', isMe ? 'justify-end' : 'justify-start')}>
          <button type="button" onClick={() => onReply(message)} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">Trả lời</button>
          <button type="button" onClick={() => onReact(message.id, '👍')} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">👍</button>
          {isMe && (
            <button type="button" onClick={() => onDelete(message.id)} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
              Xóa
            </button>
          )}
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
  }, [chat.danhSachCuocTroChuyen, chat.cuocTroChuyenHienTai])

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
      ].some(value => String(value ?? '').toLowerCase().includes(query))
    })
  }, [chat.danhSachCuocTroChuyen, search, tab, chat])

  if (!nguoiDung) {
    return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-slate-500">Vui lòng đăng nhập để sử dụng chat.</div>
  }

  const titleByRole: Record<VaiTro, string> = {
    ung_vien: 'ITJob ứng viên',
    nha_tuyen_dung: 'ITJob nhà tuyển dụng',
    admin: 'ITJob quản trị',
  }

  const subtitleByRole: Record<VaiTro, string> = {
    ung_vien: 'Nhắn tin với nhà tuyển dụng và nhận hỗ trợ.',
    nha_tuyen_dung: 'Chat với ứng viên và liên hệ admin hỗ trợ.',
    admin: 'Hỗ trợ nhà tuyển dụng và quản lý nhóm cộng đồng.',
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
    <div className="grid min-h-[calc(100vh-140px)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className={clsx('min-h-0 rounded-2xl border border-slate-200 bg-white', selected && 'max-lg:hidden')}>
        <div className="border-b border-slate-200 p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-violet-600">{titleByRole[vaiTro]}</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Tin nhắn & Cộng đồng</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{subtitleByRole[vaiTro]}</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              placeholder="Tìm cuộc trò chuyện..."
            />
          </div>
        </div>
        <div className="flex border-b border-slate-200 px-3 py-2 text-sm font-black">
          {[
            ['all', 'Tất cả'],
            ['direct', 'Tin nhắn'],
            ['group', 'Nhóm'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={clsx(
                'flex-1 rounded-xl px-3 py-2 transition',
                tab === value
                  ? 'border border-violet-200 bg-violet-50 text-violet-900'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {chatItems.length ? chatItems.map(conversation => {
            const otherPerson = chat.layNguoiKhac(conversation)
            const unread = conversation.soChuaDocCuaToi || 0
            const active = selected?._id === conversation._id
            const isGroupItem = conversation.loai === 'nhom_cong_dong'
            const icon = isGroupItem ? <Hash size={14} /> : conversation.loai === 'admin_support' ? <Shield size={14} /> : <MessageCircle size={14} />
            const isOnline = otherPerson ? chat.kiemTraOnline(otherPerson._id) : false
            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => void chat.moCuocTroChuyen(conversation)}
                className={clsx(
                  'flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition',
                  active ? 'bg-violet-50' : 'hover:bg-slate-50',
                )}
              >
                <div className="relative shrink-0">
                  {isGroupItem ? (
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">{icon}</div>
                  ) : (
                    <Avatar name={otherPerson?.hoTen || 'U'} size={40} online={isOnline} />
                  )}
                  <span className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-violet-600">{icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm font-black text-slate-950">{isGroupItem ? (conversation.tenNhom || 'Nhóm') : (otherPerson?.hoTen || 'Người dùng')}</strong>
                    {conversation.tinNhanCuoiCung?.thoiGian && <span className="shrink-0 text-[11px] font-bold text-slate-400">{relativeTime(conversation.tinNhanCuoiCung.thoiGian)}</span>}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-slate-500">{conversation.tinNhanCuoiCung?.noiDung || 'Chưa có tin nhắn'}</span>
                    {unread > 0 && <span className="shrink-0 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-black text-white">{unread > 9 ? '9+' : unread}</span>}
                  </div>
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

      <section className={clsx('min-h-0 rounded-2xl border border-slate-200 bg-white', !selected && 'max-lg:hidden')}>
        {selected ? (
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => chat.quayLaiDanhSach()}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden"
              >
                <ArrowLeft size={18} className="text-slate-500" />
              </button>
              {isGroup ? (
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><Hash size={16} /></div>
              ) : (
                <Avatar name={other?.hoTen || 'U'} size={40} online={online} />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-black text-slate-950">{isGroup ? (selected.tenNhom || 'Nhóm cộng đồng') : (other?.hoTen || 'Người dùng')}</div>
                <div className="text-sm font-semibold text-slate-500">
                  {isGroup ? `${selected.nguoiThamGia?.length || 0} thành viên` : typing ? 'Đang nhập...' : online ? 'Đang online' : 'Offline'}
                </div>
              </div>
              {selected.loai === 'admin_support' && <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800"><Shield size={13} /> Hỗ trợ</span>}
              {isGroup && <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700"><Users size={13} /> Nhóm</span>}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
              {chat.dangTaiTinNhan ? (
                <div className="grid min-h-48 place-items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
                </div>
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
                  Chọn một cuộc trò chuyện để bắt đầu.
                </div>
              )}
              <div className="h-4" />
            </div>

            {chat.tinNhanDangTraLoi && (
              <div className="border-t border-slate-200 bg-violet-50 px-4 py-3">
                <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black uppercase tracking-wide text-violet-700">Trả lời</div>
                    <div className="truncate text-sm font-bold text-slate-900">{chat.tinNhanDangTraLoi.nguoiGui.hoTen}</div>
                    <div className="truncate text-sm text-slate-500">{chat.tinNhanDangTraLoi.noiDung}</div>
                  </div>
                  <button type="button" onClick={() => chat.setTinNhanTraLoi(null)} className="text-slate-400 hover:text-slate-700">x</button>
                </div>
              </div>
            )}

            <footer className="border-t border-slate-200 p-3">
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
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!input.trim()}
                  className={clsx('grid h-11 w-11 place-items-center rounded-2xl text-white transition', input.trim() ? 'bg-gradient-to-br from-sky-600 to-violet-600' : 'bg-slate-300')}
                >
                  <MessageCircle size={18} />
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
