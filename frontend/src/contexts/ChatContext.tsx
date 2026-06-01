import { createContext, useContext, useEffect, useReducer, useRef, useCallback, useState } from 'react'
import { langNgheEvent, boLangNgheEvent, guiEvent } from '../lib/socket'
import { layNguoiDung, layAccessToken } from '../lib/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NguoiGuiTinNhan {
  _id: string
  hoTen: string
  email: string
  vaiTro: string
}

export interface TepDinhKem {
  tenFile: string
  duongDan: string
  kichThuoc: number
  loaiFile: string
}

export interface TinNhan {
  id: string
  _id?: string
  maCuocTroChuyenId: string
  nguoiGui: NguoiGuiTinNhan
  noiDung: string
  loai: 'text' | 'file' | 'image' | 'system'
  tepDinhKem?: TepDinhKem[]
  traloiTinNhan?: TinNhan | null
  daDuocDocBoi?: Array<{ nguoiDung: string; thoiGian: string }>
  phanUng?: Array<{ nguoiDung: string; emoji: string }>
  daXoa?: boolean
  ngayTao: string
}

export interface NguoiThamGia {
  _id: string
  hoTen: string
  email: string
  vaiTro: string
}

export interface CuocTroChuyenPreview {
  _id: string
  nguoiThamGia: NguoiThamGia[]
  tinNhanCuoiCung?: {
    noiDung: string
    nguoiGui: string
    thoiGian: string
  }
  soChuaDocCuaToi?: number
  ngayCapNhat: string
}

export type ChatContextMeta = {
  loai?: string
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
}

// ─── State ────────────────────────────────────────────────────────────────────

interface ChatState {
  moChat: boolean
  danhSachCuocTroChuyen: CuocTroChuyenPreview[]
  cuocTroChuyenHienTai: CuocTroChuyenPreview | null
  tinNhanList: TinNhan[]
  nguoiDungOnline: Set<string>
  nguoiDangNhap: Set<string>  // userId đang gõ trong conversation hiện tại
  dangTaiCuocTroChuyen: boolean
  dangTaiTinNhan: boolean
  dangGui: boolean
  tongSoChuaDoc: number
  tinNhanDangTraLoi: TinNhan | null
}

type ChatAction =
  | { type: 'MO_CHAT' }
  | { type: 'DONG_CHAT' }
  | { type: 'SET_DANH_SACH'; payload: CuocTroChuyenPreview[] }
  | { type: 'SET_CUOC_TRO_CHUYEN'; payload: CuocTroChuyenPreview | null }
  | { type: 'SET_TIN_NHAN'; payload: TinNhan[] }
  | { type: 'THEM_TIN_NHAN'; payload: TinNhan }
  | { type: 'XOA_TIN_NHAN'; payload: string }
  | { type: 'CAP_NHAT_PHAN_UNG'; payload: { maTinNhan: string; nguoiDung: string; emoji: string } }
  | { type: 'USER_ONLINE'; payload: string }
  | { type: 'USER_OFFLINE'; payload: string }
  | { type: 'SET_ONLINE_LIST'; payload: string[] }
  | { type: 'USER_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN'; payload: boolean }
  | { type: 'SET_DANG_TAI_TIN_NHAN'; payload: boolean }
  | { type: 'SET_DANG_GUI'; payload: boolean }
  | { type: 'CAP_NHAT_SO_CHUA_DOC' }
  | { type: 'SET_TIN_NHAN_TRA_LOI'; payload: TinNhan | null }
  | { type: 'DANH_DAU_DA_DOC'; payload: string }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'MO_CHAT':
      return { ...state, moChat: true }
    case 'DONG_CHAT':
      return { ...state, moChat: false, cuocTroChuyenHienTai: null, tinNhanList: [], tinNhanDangTraLoi: null }
    case 'SET_DANH_SACH':
      return {
        ...state,
        danhSachCuocTroChuyen: action.payload,
        tongSoChuaDoc: action.payload.reduce((s, c) => s + (c.soChuaDocCuaToi || 0), 0),
      }
    case 'SET_CUOC_TRO_CHUYEN':
      return { ...state, cuocTroChuyenHienTai: action.payload, tinNhanList: [], tinNhanDangTraLoi: null }
    case 'SET_TIN_NHAN':
      return { ...state, tinNhanList: action.payload }
    case 'THEM_TIN_NHAN': {
      const exists = state.tinNhanList.some(m => m.id === action.payload.id)
      if (exists) return state
      return { ...state, tinNhanList: [...state.tinNhanList, action.payload] }
    }
    case 'XOA_TIN_NHAN':
      return {
        ...state,
        tinNhanList: state.tinNhanList.map(m =>
          m.id === action.payload ? { ...m, daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } : m
        ),
      }
    case 'CAP_NHAT_PHAN_UNG':
      return {
        ...state,
        tinNhanList: state.tinNhanList.map(m => {
          if (m.id !== action.payload.maTinNhan) return m
          const phanUng = (m.phanUng || []).filter(r => r.nguoiDung !== action.payload.nguoiDung)
          if (action.payload.emoji) phanUng.push({ nguoiDung: action.payload.nguoiDung, emoji: action.payload.emoji })
          return { ...m, phanUng }
        }),
      }
    case 'USER_ONLINE': {
      const newSet = new Set(state.nguoiDungOnline)
      newSet.add(action.payload)
      return { ...state, nguoiDungOnline: newSet }
    }
    case 'USER_OFFLINE': {
      const newSet = new Set(state.nguoiDungOnline)
      newSet.delete(action.payload)
      return { ...state, nguoiDungOnline: newSet }
    }
    case 'SET_ONLINE_LIST':
      return { ...state, nguoiDungOnline: new Set(action.payload) }
    case 'USER_TYPING': {
      const newSet = new Set(state.nguoiDangNhap)
      if (action.payload.isTyping) newSet.add(action.payload.userId)
      else newSet.delete(action.payload.userId)
      return { ...state, nguoiDangNhap: newSet }
    }
    case 'SET_DANG_TAI_CUOC_TRO_CHUYEN':
      return { ...state, dangTaiCuocTroChuyen: action.payload }
    case 'SET_DANG_TAI_TIN_NHAN':
      return { ...state, dangTaiTinNhan: action.payload }
    case 'SET_DANG_GUI':
      return { ...state, dangGui: action.payload }
    case 'CAP_NHAT_SO_CHUA_DOC':
      return {
        ...state,
        tongSoChuaDoc: state.danhSachCuocTroChuyen.reduce((s, c) => s + (c.soChuaDocCuaToi || 0), 0),
      }
    case 'SET_TIN_NHAN_TRA_LOI':
      return { ...state, tinNhanDangTraLoi: action.payload }
    case 'DANH_DAU_DA_DOC':
      return {
        ...state,
        danhSachCuocTroChuyen: state.danhSachCuocTroChuyen.map(c =>
          c._id === action.payload ? { ...c, soChuaDocCuaToi: 0 } : c
        ),
        tongSoChuaDoc: Math.max(0, state.tongSoChuaDoc - (
          state.danhSachCuocTroChuyen.find(c => c._id === action.payload)?.soChuaDocCuaToi || 0
        )),
      }
    default:
      return state
  }
}

const initialState: ChatState = {
  moChat: false,
  danhSachCuocTroChuyen: [],
  cuocTroChuyenHienTai: null,
  tinNhanList: [],
  nguoiDungOnline: new Set(),
  nguoiDangNhap: new Set(),
  dangTaiCuocTroChuyen: false,
  dangTaiTinNhan: false,
  dangGui: false,
  tongSoChuaDoc: 0,
  tinNhanDangTraLoi: null,
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ChatContextValue extends ChatState {
  moChat: boolean
  toggleChat: () => void
  moCuocTroChuyen: (cuocTroChuyen: CuocTroChuyenPreview) => Promise<void>
  quayLaiDanhSach: () => void
  guiTinNhan: (noiDung: string) => Promise<void>
  xoaTinNhan: (maTinNhan: string) => Promise<void>
  themPhanUng: (maTinNhan: string, emoji: string) => Promise<void>
  setTinNhanTraLoi: (tinNhan: TinNhan | null) => void
  taiDanhSachCuocTroChuyen: () => Promise<void>
  layNguoiKhac: (cuocTroChuyen: CuocTroChuyenPreview) => NguoiThamGia | undefined
  kiemTraOnline: (userId: string) => boolean
  moChatVoiNguoiDung: (maNguoiDungKhac: string, context?: ChatContextMeta) => Promise<CuocTroChuyenPreview | void>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const [authTick, setAuthTick] = useState(0)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nguoiDung = layNguoiDung()
  const token = layAccessToken()

  useEffect(() => {
    const capNhat = () => setAuthTick(value => value + 1)
    window.addEventListener('itjob-auth-change', capNhat)
    return () => window.removeEventListener('itjob-auth-change', capNhat)
  }, [])

  // ─── Socket listeners ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !nguoiDung) return

    const xuLyTinNhanMoi = (data: { maCuocTroChuyenId: string; tinNhan: TinNhan }) => {
      dispatch({ type: 'THEM_TIN_NHAN', payload: data.tinNhan })
      // Cập nhật danh sách
      taiDanhSachCuocTroChuyen()
    }
    const xuLyTinNhanXoa = (data: { maTinNhan: string }) => {
      dispatch({ type: 'XOA_TIN_NHAN', payload: data.maTinNhan })
    }

    const xuLyPhanUng = (data: { maTinNhan: string; nguoiDung: string; emoji: string }) => {
      dispatch({ type: 'CAP_NHAT_PHAN_UNG', payload: data })
    }

    const xuLyUserOnline = (data: { userId: string }) => {
      dispatch({ type: 'USER_ONLINE', payload: data.userId })
    }

    const xuLyUserOffline = (data: { userId: string }) => {
      dispatch({ type: 'USER_OFFLINE', payload: data.userId })
    }

    const xuLyTyping = (data: { userId: string; isTyping: boolean }) => {
      dispatch({ type: 'USER_TYPING', payload: data })
      // Tự động clear sau 3s
      if (data.isTyping) {
        setTimeout(() => dispatch({ type: 'USER_TYPING', payload: { userId: data.userId, isTyping: false } }), 3000)
      }
    }

    langNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
    langNgheEvent('tin_nhan_da_xoa', xuLyTinNhanXoa)
    langNgheEvent('phan_ung_moi', xuLyPhanUng)
    langNgheEvent('user_online', xuLyUserOnline)
    langNgheEvent('user_offline', xuLyUserOffline)
    langNgheEvent('user_typing', xuLyTyping)

    // Tải danh sách ban đầu
    taiDanhSachCuocTroChuyen()

    return () => {
      boLangNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
      boLangNgheEvent('tin_nhan_da_xoa', xuLyTinNhanXoa)
      boLangNgheEvent('phan_ung_moi', xuLyPhanUng)
      boLangNgheEvent('user_online', xuLyUserOnline)
      boLangNgheEvent('user_offline', xuLyUserOffline)
      boLangNgheEvent('user_typing', xuLyTyping)
    }
  }, [token, nguoiDung?.id, authTick])

  // ─── Actions ───────────────────────────────────────────────────────────────

  const taiDanhSachCuocTroChuyen = useCallback(async () => {
    if (!token) return
    dispatch({ type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN', payload: true })
    try {
      const res = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      dispatch({ type: 'SET_DANH_SACH', payload: data.duLieu || [] })
    } catch (err) {
      console.error('Lỗi tải cuộc trò chuyện:', err)
    } finally {
      dispatch({ type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN', payload: false })
    }
  }, [token])

  const toggleChat = useCallback(() => {
    if (state.moChat) {
      if (state.cuocTroChuyenHienTai) {
        guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
      }
      dispatch({ type: 'DONG_CHAT' })
    } else {
      dispatch({ type: 'MO_CHAT' })
      taiDanhSachCuocTroChuyen()
    }
  }, [state.moChat, state.cuocTroChuyenHienTai, taiDanhSachCuocTroChuyen])

  const moCuocTroChuyen = useCallback(async (cuocTroChuyen: CuocTroChuyenPreview) => {
    // Leave previous
    if (state.cuocTroChuyenHienTai) {
      guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
    }

    dispatch({ type: 'SET_CUOC_TRO_CHUYEN', payload: cuocTroChuyen })
    dispatch({ type: 'SET_DANG_TAI_TIN_NHAN', payload: true })

    guiEvent('join_conversation', { conversationId: cuocTroChuyen._id })

    try {
      const res = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${cuocTroChuyen._id}/tin-nhan?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      dispatch({ type: 'SET_TIN_NHAN', payload: data.duLieu || [] })

      // Đánh dấu đã đọc
      if ((cuocTroChuyen.soChuaDocCuaToi || 0) > 0) {
        await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${cuocTroChuyen._id}/danh-dau-da-doc`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        dispatch({ type: 'DANH_DAU_DA_DOC', payload: cuocTroChuyen._id })
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err)
    } finally {
      dispatch({ type: 'SET_DANG_TAI_TIN_NHAN', payload: false })
    }
  }, [state.cuocTroChuyenHienTai, token])

  const quayLaiDanhSach = useCallback(() => {
    if (state.cuocTroChuyenHienTai) {
      guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
    }
    dispatch({ type: 'SET_CUOC_TRO_CHUYEN', payload: null })
    taiDanhSachCuocTroChuyen()
  }, [state.cuocTroChuyenHienTai, taiDanhSachCuocTroChuyen])

  const guiTinNhan = useCallback(async (noiDung: string) => {
    if (!noiDung.trim() || !state.cuocTroChuyenHienTai || !token) return

    dispatch({ type: 'SET_DANG_GUI', payload: true })

    // Stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    guiEvent('typing_stop', { conversationId: state.cuocTroChuyenHienTai._id })

    // Optimistic UI — thêm tin nhắn tạm
    const tempId = `temp_${Date.now()}`
    const tempMsg: TinNhan = {
      id: tempId,
      maCuocTroChuyenId: state.cuocTroChuyenHienTai._id,
      nguoiGui: {
        _id: nguoiDung!.id,
        hoTen: nguoiDung!.hoTen,
        email: nguoiDung!.email,
        vaiTro: nguoiDung!.vaiTro,
      },
      noiDung,
      loai: 'text',
      traloiTinNhan: state.tinNhanDangTraLoi,
      ngayTao: new Date().toISOString(),
    }
    dispatch({ type: 'THEM_TIN_NHAN', payload: tempMsg })
    dispatch({ type: 'SET_TIN_NHAN_TRA_LOI', payload: null })

    try {
      const body: any = { noiDung }
      if (state.tinNhanDangTraLoi) body.traloiTinNhan = state.tinNhanDangTraLoi.id

      const res = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen/${state.cuocTroChuyenHienTai._id}/tin-nhan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      // Thay thế tin nhắn tạm bằng tin nhắn thật
      if (data.duLieu) {
        dispatch({ type: 'XOA_TIN_NHAN', payload: tempId })
        dispatch({ type: 'THEM_TIN_NHAN', payload: { ...data.duLieu, id: data.duLieu.id || data.duLieu._id } })
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
      dispatch({ type: 'XOA_TIN_NHAN', payload: tempId })
    } finally {
      dispatch({ type: 'SET_DANG_GUI', payload: false })
    }
  }, [state.cuocTroChuyenHienTai, state.tinNhanDangTraLoi, token, nguoiDung])

  const xoaTinNhan = useCallback(async (maTinNhan: string) => {
    if (!token) return
    try {
      await fetch(`${API_URL}/tinnhan/tin-nhan/${maTinNhan}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      dispatch({ type: 'XOA_TIN_NHAN', payload: maTinNhan })
    } catch (err) {
      console.error('Lỗi xóa tin nhắn:', err)
    }
  }, [token])

  const themPhanUng = useCallback(async (maTinNhan: string, emoji: string) => {
    if (!token || !nguoiDung) return
    try {
      await fetch(`${API_URL}/tinnhan/tin-nhan/${maTinNhan}/phan-ung`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      })
      dispatch({ type: 'CAP_NHAT_PHAN_UNG', payload: { maTinNhan, nguoiDung: nguoiDung.id, emoji } })
    } catch (err) {
      console.error('Lỗi thêm phản ứng:', err)
    }
  }, [token, nguoiDung])

  const setTinNhanTraLoi = useCallback((tinNhan: TinNhan | null) => {
    dispatch({ type: 'SET_TIN_NHAN_TRA_LOI', payload: tinNhan })
  }, [])

  const moChatVoiNguoiDung = useCallback(async (maNguoiDungKhac: string, context?: ChatContextMeta) => {
    if (!token || !nguoiDung) return
    try {
      const res = await fetch(`${API_URL}/tinnhan/cuoc-tro-chuyen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nguoiNhan: maNguoiDungKhac,
          loai: context?.loai,
          maHoSoUngTuyen: context?.maHoSoUngTuyen,
          maTinTuyenDung: context?.maTinTuyenDung,
        }),
      })
      const data = await res.json()
      if (data.duLieu) {
        dispatch({ type: 'MO_CHAT' })
        await moCuocTroChuyen(data.duLieu)
        return data.duLieu as CuocTroChuyenPreview
      }
    } catch (err) {
      console.error('Lỗi mở chat:', err)
    }
  }, [token, nguoiDung, moCuocTroChuyen])

  const layNguoiKhac = useCallback((cuocTroChuyen: CuocTroChuyenPreview) => {
    return cuocTroChuyen.nguoiThamGia.find(ng => ng._id !== nguoiDung?.id)
  }, [nguoiDung?.id])

  const kiemTraOnline = useCallback((userId: string) => {
    return state.nguoiDungOnline.has(userId)
  }, [state.nguoiDungOnline])

  return (
    <ChatContext.Provider value={{
      ...state,
      toggleChat,
      moCuocTroChuyen,
      quayLaiDanhSach,
      guiTinNhan,
      xoaTinNhan,
      themPhanUng,
      setTinNhanTraLoi,
      taiDanhSachCuocTroChuyen,
      layNguoiKhac,
      kiemTraOnline,
      moChatVoiNguoiDung,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat phải dùng trong ChatProvider')
  return ctx
}
