import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { boLangNgheEvent, guiEvent, langNgheEvent } from '../lib/socket'
import { apiCoXacThuc, layAccessToken, layNguoiDung } from '../lib/auth'

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
  id?: string
  loai?: 'ung_vien_nha_tuyen_dung' | 'admin_support' | 'nhom_cong_dong'
  tenNhom?: string
  moTaNhom?: string
  anhNhom?: string
  nguoiThamGia: NguoiThamGia[]
  tinNhanCuoiCung?: {
    noiDung: string
    nguoiGui: string
    thoiGian: string
  }
  soChuaDocCuaToi?: number
  ngayCapNhat: string
  soThanhVien?: number
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
  maHoSoUngTuyenGanNhat?: string | { _id?: string; id?: string; trangThai?: string }
  maTinTuyenDungGanNhat?: string | { _id?: string; id?: string; tieuDe?: string }
  contextSummary?: {
    tieuDeTin?: string
    tenCongTy?: string
    maHoSoUngTuyen?: string
    maTinTuyenDung?: string
    capNhatLuc?: string
  }
}

export type ChatContextMeta = {
  loai?: string
  maHoSoUngTuyen?: string
  maTinTuyenDung?: string
}

interface ChatState {
  moChat: boolean
  danhSachCuocTroChuyen: CuocTroChuyenPreview[]
  cuocTroChuyenHienTai: CuocTroChuyenPreview | null
  tinNhanList: TinNhan[]
  nguoiDungOnline: Set<string>
  nguoiDangNhap: Set<string>
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
  | { type: 'CAP_NHAT_TIN_NHAN'; payload: { tempId: string; tinNhan: TinNhan } }
  | { type: 'XOA_TIN_NHAN'; payload: string }
  | { type: 'CAP_NHAT_PHAN_UNG'; payload: { maTinNhan: string; nguoiDung: string; emoji: string } }
  | { type: 'SET_ONLINE'; payload: { userId: string; online: boolean } }
  | { type: 'SET_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN'; payload: boolean }
  | { type: 'SET_DANG_TAI_TIN_NHAN'; payload: boolean }
  | { type: 'SET_DANG_GUI'; payload: boolean }
  | { type: 'SET_TIN_NHAN_TRA_LOI'; payload: TinNhan | null }
  | { type: 'DANH_DAU_DA_DOC'; payload: string }

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

function normalizedMessage(tinNhan: any): TinNhan {
  return { ...tinNhan, id: String(tinNhan.id ?? tinNhan._id) }
}

function tinhTongChuaDoc(danhSach: CuocTroChuyenPreview[]) {
  return danhSach.reduce((sum, item) => sum + (item.soChuaDocCuaToi || 0), 0)
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'MO_CHAT':
      return { ...state, moChat: true }
    case 'DONG_CHAT':
      return { ...state, moChat: false, cuocTroChuyenHienTai: null, tinNhanList: [], tinNhanDangTraLoi: null }
    case 'SET_DANH_SACH':
      return { ...state, danhSachCuocTroChuyen: action.payload, tongSoChuaDoc: tinhTongChuaDoc(action.payload) }
    case 'SET_CUOC_TRO_CHUYEN':
      return { ...state, cuocTroChuyenHienTai: action.payload, tinNhanList: [], tinNhanDangTraLoi: null }
    case 'SET_TIN_NHAN':
      return { ...state, tinNhanList: action.payload.map(normalizedMessage) }
    case 'THEM_TIN_NHAN':
      if (state.tinNhanList.some(item => item.id === action.payload.id)) return state
      return { ...state, tinNhanList: [...state.tinNhanList, normalizedMessage(action.payload)] }
    case 'CAP_NHAT_TIN_NHAN':
      return {
        ...state,
        tinNhanList: state.tinNhanList.map(item => item.id === action.payload.tempId ? normalizedMessage(action.payload.tinNhan) : item),
      }
    case 'XOA_TIN_NHAN':
      return {
        ...state,
        tinNhanList: state.tinNhanList.map(item => item.id === action.payload ? { ...item, daXoa: true, noiDung: 'Tin nhắn đã bị xóa' } : item),
      }
    case 'CAP_NHAT_PHAN_UNG':
      return {
        ...state,
        tinNhanList: state.tinNhanList.map(item => {
          if (item.id !== action.payload.maTinNhan && item._id !== action.payload.maTinNhan) return item
          const phanUng = (item.phanUng || []).filter(reaction => reaction.nguoiDung !== action.payload.nguoiDung)
          if (action.payload.emoji) phanUng.push({ nguoiDung: action.payload.nguoiDung, emoji: action.payload.emoji })
          return { ...item, phanUng }
        }),
      }
    case 'SET_ONLINE': {
      const next = new Set(state.nguoiDungOnline)
      if (action.payload.online) next.add(action.payload.userId)
      else next.delete(action.payload.userId)
      return { ...state, nguoiDungOnline: next }
    }
    case 'SET_TYPING': {
      const next = new Set(state.nguoiDangNhap)
      if (action.payload.isTyping) next.add(action.payload.userId)
      else next.delete(action.payload.userId)
      return { ...state, nguoiDangNhap: next }
    }
    case 'SET_DANG_TAI_CUOC_TRO_CHUYEN':
      return { ...state, dangTaiCuocTroChuyen: action.payload }
    case 'SET_DANG_TAI_TIN_NHAN':
      return { ...state, dangTaiTinNhan: action.payload }
    case 'SET_DANG_GUI':
      return { ...state, dangGui: action.payload }
    case 'SET_TIN_NHAN_TRA_LOI':
      return { ...state, tinNhanDangTraLoi: action.payload }
    case 'DANH_DAU_DA_DOC': {
      const danhSach = state.danhSachCuocTroChuyen.map(item => item._id === action.payload ? { ...item, soChuaDocCuaToi: 0 } : item)
      return { ...state, danhSachCuocTroChuyen: danhSach, tongSoChuaDoc: tinhTongChuaDoc(danhSach) }
    }
    default:
      return state
  }
}

interface ChatContextValue extends ChatState {
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
  const nguoiDung = layNguoiDung()
  const token = layAccessToken()

  const taiDanhSachCuocTroChuyen = useCallback(async () => {
    if (!layAccessToken()) return
    dispatch({ type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN', payload: true })
    try {
      const danhSach = await apiCoXacThuc('/tinnhan/cuoc-tro-chuyen') as CuocTroChuyenPreview[]
      dispatch({ type: 'SET_DANH_SACH', payload: danhSach || [] })
    } catch (error) {
      console.error('Lỗi tải cuộc trò chuyện:', error)
    } finally {
      dispatch({ type: 'SET_DANG_TAI_CUOC_TRO_CHUYEN', payload: false })
    }
  }, [])

  useEffect(() => {
    const capNhat = () => setAuthTick(value => value + 1)
    window.addEventListener('itjob-auth-change', capNhat)
    window.addEventListener('storage', capNhat)
    return () => {
      window.removeEventListener('itjob-auth-change', capNhat)
      window.removeEventListener('storage', capNhat)
    }
  }, [])

  useEffect(() => {
    if (!token || !nguoiDung) return

    const xuLyTinNhanMoi = (data: { maCuocTroChuyenId: string; tinNhan: TinNhan }) => {
      if (state.cuocTroChuyenHienTai?._id === data.maCuocTroChuyenId) {
        dispatch({ type: 'THEM_TIN_NHAN', payload: data.tinNhan })
      }
      void taiDanhSachCuocTroChuyen()
    }
    const xuLyTinNhanXoa = (data: { maTinNhan: string }) => dispatch({ type: 'XOA_TIN_NHAN', payload: data.maTinNhan })
    const xuLyPhanUng = (data: { maTinNhan: string; nguoiDung: string; emoji: string }) => dispatch({ type: 'CAP_NHAT_PHAN_UNG', payload: data })
    const xuLyUserOnline = (data: { userId: string }) => dispatch({ type: 'SET_ONLINE', payload: { userId: data.userId, online: true } })
    const xuLyUserOffline = (data: { userId: string }) => dispatch({ type: 'SET_ONLINE', payload: { userId: data.userId, online: false } })
    const xuLyTyping = (data: { userId: string; isTyping: boolean }) => {
      dispatch({ type: 'SET_TYPING', payload: data })
      if (data.isTyping) {
        setTimeout(() => dispatch({ type: 'SET_TYPING', payload: { userId: data.userId, isTyping: false } }), 3000)
      }
    }

    langNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
    langNgheEvent('tin_nhan_da_xoa', xuLyTinNhanXoa)
    langNgheEvent('phan_ung_moi', xuLyPhanUng)
    langNgheEvent('user_online', xuLyUserOnline)
    langNgheEvent('user_offline', xuLyUserOffline)
    langNgheEvent('user_typing', xuLyTyping)

    void taiDanhSachCuocTroChuyen()

    return () => {
      boLangNgheEvent('tin_nhan_moi', xuLyTinNhanMoi)
      boLangNgheEvent('tin_nhan_da_xoa', xuLyTinNhanXoa)
      boLangNgheEvent('phan_ung_moi', xuLyPhanUng)
      boLangNgheEvent('user_online', xuLyUserOnline)
      boLangNgheEvent('user_offline', xuLyUserOffline)
      boLangNgheEvent('user_typing', xuLyTyping)
    }
  }, [authTick, nguoiDung?.id, state.cuocTroChuyenHienTai?._id, taiDanhSachCuocTroChuyen, token])

  const toggleChat = useCallback(() => {
    if (state.moChat) {
      if (state.cuocTroChuyenHienTai) guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
      dispatch({ type: 'DONG_CHAT' })
    } else {
      dispatch({ type: 'MO_CHAT' })
      void taiDanhSachCuocTroChuyen()
    }
  }, [state.cuocTroChuyenHienTai, state.moChat, taiDanhSachCuocTroChuyen])

  const moCuocTroChuyen = useCallback(async (cuocTroChuyen: CuocTroChuyenPreview) => {
    if (state.cuocTroChuyenHienTai?._id && state.cuocTroChuyenHienTai._id !== cuocTroChuyen._id) {
      guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
    }
    dispatch({ type: 'SET_CUOC_TRO_CHUYEN', payload: cuocTroChuyen })
    dispatch({ type: 'SET_DANG_TAI_TIN_NHAN', payload: true })
    guiEvent('join_conversation', { conversationId: cuocTroChuyen._id })

    try {
      const tinNhan = await apiCoXacThuc(`/tinnhan/cuoc-tro-chuyen/${cuocTroChuyen._id}/tin-nhan?limit=50`) as TinNhan[]
      dispatch({ type: 'SET_TIN_NHAN', payload: tinNhan || [] })
      if ((cuocTroChuyen.soChuaDocCuaToi || 0) > 0) {
        await apiCoXacThuc(`/tinnhan/cuoc-tro-chuyen/${cuocTroChuyen._id}/danh-dau-da-doc`, { method: 'POST' })
        dispatch({ type: 'DANH_DAU_DA_DOC', payload: cuocTroChuyen._id })
      }
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error)
    } finally {
      dispatch({ type: 'SET_DANG_TAI_TIN_NHAN', payload: false })
    }
  }, [state.cuocTroChuyenHienTai?._id])

  const quayLaiDanhSach = useCallback(() => {
    if (state.cuocTroChuyenHienTai) guiEvent('leave_conversation', { conversationId: state.cuocTroChuyenHienTai._id })
    dispatch({ type: 'SET_CUOC_TRO_CHUYEN', payload: null })
    void taiDanhSachCuocTroChuyen()
  }, [state.cuocTroChuyenHienTai, taiDanhSachCuocTroChuyen])

  const guiTinNhan = useCallback(async (noiDung: string) => {
    if (!noiDung.trim() || !state.cuocTroChuyenHienTai || !nguoiDung) return

    dispatch({ type: 'SET_DANG_GUI', payload: true })
    guiEvent('typing_stop', { conversationId: state.cuocTroChuyenHienTai._id })

    const tempId = `temp_${Date.now()}`
    const tempMsg: TinNhan = {
      id: tempId,
      maCuocTroChuyenId: state.cuocTroChuyenHienTai._id,
      nguoiGui: {
        _id: nguoiDung.id,
        hoTen: nguoiDung.hoTen,
        email: nguoiDung.email,
        vaiTro: nguoiDung.vaiTro,
      },
      noiDung,
      loai: 'text',
      traloiTinNhan: state.tinNhanDangTraLoi,
      ngayTao: new Date().toISOString(),
    }
    dispatch({ type: 'THEM_TIN_NHAN', payload: tempMsg })
    dispatch({ type: 'SET_TIN_NHAN_TRA_LOI', payload: null })

    try {
      const body: Record<string, string> = { noiDung }
      if (state.tinNhanDangTraLoi) body.traloiTinNhan = state.tinNhanDangTraLoi.id
      const tinNhan = await apiCoXacThuc(`/tinnhan/cuoc-tro-chuyen/${state.cuocTroChuyenHienTai._id}/tin-nhan`, {
        method: 'POST',
        body: JSON.stringify(body),
      }) as TinNhan
      dispatch({ type: 'CAP_NHAT_TIN_NHAN', payload: { tempId, tinNhan } })
      void taiDanhSachCuocTroChuyen()
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      dispatch({ type: 'XOA_TIN_NHAN', payload: tempId })
    } finally {
      dispatch({ type: 'SET_DANG_GUI', payload: false })
    }
  }, [nguoiDung, state.cuocTroChuyenHienTai, state.tinNhanDangTraLoi, taiDanhSachCuocTroChuyen])

  const xoaTinNhan = useCallback(async (maTinNhan: string) => {
    try {
      await apiCoXacThuc(`/tinnhan/tin-nhan/${maTinNhan}`, { method: 'DELETE' })
      dispatch({ type: 'XOA_TIN_NHAN', payload: maTinNhan })
    } catch (error) {
      console.error('Lỗi xóa tin nhắn:', error)
    }
  }, [])

  const themPhanUng = useCallback(async (maTinNhan: string, emoji: string) => {
    if (!nguoiDung) return
    try {
      await apiCoXacThuc(`/tinnhan/tin-nhan/${maTinNhan}/phan-ung`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      })
      dispatch({ type: 'CAP_NHAT_PHAN_UNG', payload: { maTinNhan, nguoiDung: nguoiDung.id, emoji } })
    } catch (error) {
      console.error('Lỗi thêm phản ứng:', error)
    }
  }, [nguoiDung])

  const setTinNhanTraLoi = useCallback((tinNhan: TinNhan | null) => {
    dispatch({ type: 'SET_TIN_NHAN_TRA_LOI', payload: tinNhan })
  }, [])

  const moChatVoiNguoiDung = useCallback(async (maNguoiDungKhac: string, context?: ChatContextMeta) => {
    if (!nguoiDung) return
    try {
      const cuocTroChuyen = await apiCoXacThuc('/tinnhan/cuoc-tro-chuyen', {
        method: 'POST',
        body: JSON.stringify({
          nguoiNhan: maNguoiDungKhac,
          loai: context?.loai,
          maHoSoUngTuyen: context?.maHoSoUngTuyen,
          maTinTuyenDung: context?.maTinTuyenDung,
        }),
      }) as CuocTroChuyenPreview
      dispatch({ type: 'MO_CHAT' })
      await moCuocTroChuyen(cuocTroChuyen)
      return cuocTroChuyen
    } catch (error) {
      console.error('Lỗi mở chat:', error)
    }
  }, [moCuocTroChuyen, nguoiDung])

  const layNguoiKhac = useCallback((cuocTroChuyen: CuocTroChuyenPreview) => {
    return cuocTroChuyen.nguoiThamGia.find(item => item._id !== nguoiDung?.id)
  }, [nguoiDung?.id])

  const kiemTraOnline = useCallback((userId: string) => state.nguoiDungOnline.has(userId), [state.nguoiDungOnline])

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
