import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { boLangNgheEvent, kiemTraKetNoi, langNgheEvent, langNgheTrangThaiKetNoi } from '../lib/socket'
import { layAccessToken, layNguoiDung } from '../lib/auth'
import { API_URL } from '../lib/env'

const POLL_MS_KET_NOI = 45000
const POLL_MS_MAT_KET_NOI = 15000

export interface ThongBao {
  _id: string
  loai: string
  tieuDe: string
  noiDung: string
  lienKet?: string
  mucDoUuTien?: 'thap' | 'trung_binh' | 'cao' | 'khan_cap'
  icon?: string
  mauSac?: string
  daDoc: boolean
  ngayTao: string
  hanhDong?: Array<{ nhan: string; url: string; loai: string }>
}

export interface ToastThongBao extends ThongBao {
  toastId: string
}

interface ThongBaoState {
  danhSach: ThongBao[]
  soLuongChuaDoc: number
  dangTai: boolean
  toasts: ToastThongBao[]
}

type ThongBaoAction =
  | { type: 'SET_DANH_SACH'; payload: ThongBao[] }
  | { type: 'THEM_THONG_BAO'; payload: ThongBao }
  | { type: 'DANH_DAU_DA_DOC'; payload: string }
  | { type: 'DANH_DAU_TAT_CA_DA_DOC' }
  | { type: 'SET_SO_LUONG_CHUA_DOC'; payload: number }
  | { type: 'SET_DANG_TAI'; payload: boolean }
  | { type: 'THEM_TOAST'; payload: ToastThongBao }
  | { type: 'XOA_TOAST'; payload: string }

function thongBaoReducer(state: ThongBaoState, action: ThongBaoAction): ThongBaoState {
  switch (action.type) {
    case 'SET_DANH_SACH':
      return { ...state, danhSach: action.payload }
    case 'THEM_THONG_BAO': {
      const daTonTai = state.danhSach.some(tb => tb._id === action.payload._id)
      const danhSach = daTonTai
        ? state.danhSach.map(tb => (tb._id === action.payload._id ? action.payload : tb))
        : [action.payload, ...state.danhSach].slice(0, 50)
      return {
        ...state,
        danhSach,
        soLuongChuaDoc: daTonTai || action.payload.daDoc ? state.soLuongChuaDoc : state.soLuongChuaDoc + 1,
      }
    }
    case 'DANH_DAU_DA_DOC':
      return {
        ...state,
        danhSach: state.danhSach.map(tb => (tb._id === action.payload ? { ...tb, daDoc: true } : tb)),
        soLuongChuaDoc: Math.max(0, state.soLuongChuaDoc - 1),
      }
    case 'DANH_DAU_TAT_CA_DA_DOC':
      return {
        ...state,
        danhSach: state.danhSach.map(tb => ({ ...tb, daDoc: true })),
        soLuongChuaDoc: 0,
      }
    case 'SET_SO_LUONG_CHUA_DOC':
      return { ...state, soLuongChuaDoc: action.payload }
    case 'SET_DANG_TAI':
      return { ...state, dangTai: action.payload }
    case 'THEM_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'XOA_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.toastId !== action.payload) }
    default:
      return state
  }
}

interface ThongBaoContextValue extends ThongBaoState {
  danhDauDaDoc: (id: string) => Promise<void>
  danhDauTatCaDaDoc: () => Promise<void>
  taiThongBao: () => Promise<void>
  xoaToast: (toastId: string) => void
}

const ThongBaoContext = createContext<ThongBaoContextValue | null>(null)

export function ThongBaoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(thongBaoReducer, {
    danhSach: [],
    soLuongChuaDoc: 0,
    dangTai: false,
    toasts: [],
  })
  const [authTick, setAuthTick] = useState(0)

  const nguoiDung = layNguoiDung()
  const token = layAccessToken()
  const pollTimerRef = useRef<number | null>(null)
  const daTaiLanDauRef = useRef(false)

  useEffect(() => {
    const capNhat = () => setAuthTick(value => value + 1)
    window.addEventListener('itjob-auth-change', capNhat)
    return () => window.removeEventListener('itjob-auth-change', capNhat)
  }, [])

  const taiThongBao = useCallback(async (options?: { background?: boolean }) => {
    const tok = layAccessToken()
    if (!tok) return
    const background = options?.background ?? false
    if (!background || !daTaiLanDauRef.current) {
      dispatch({ type: 'SET_DANG_TAI', payload: true })
    }
    try {
      const res = await fetch(`${API_URL}/thongbao?limit=30&sort=-ngayTao`, {
        headers: { Authorization: `Bearer ${tok}` },
      })
      const data = await res.json()
      dispatch({ type: 'SET_DANH_SACH', payload: data.duLieu || [] })
      daTaiLanDauRef.current = true
    } catch (err) {
      console.error('Loi tai thong bao:', err)
    } finally {
      if (!background || daTaiLanDauRef.current) {
        dispatch({ type: 'SET_DANG_TAI', payload: false })
      }
    }
  }, [])

  const demChuaDoc = useCallback(async () => {
    const tok = layAccessToken()
    if (!tok) return
    try {
      const res = await fetch(`${API_URL}/thongbao/dem-chua-doc`, {
        headers: { Authorization: `Bearer ${tok}` },
      })
      const data = await res.json()
      dispatch({ type: 'SET_SO_LUONG_CHUA_DOC', payload: data.duLieu?.soLuong || 0 })
    } catch {
      // bo qua loi dem thong bao de UI khong bi ngat
    }
  }, [])

  useEffect(() => {
    if (!token || !nguoiDung) return

    const lamMoiDuLieuThongBao = async () => {
      await Promise.all([taiThongBao({ background: true }), demChuaDoc()])
    }

    const xoaPolling = () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }

    const batDauPolling = (thoiGianMs: number) => {
      xoaPolling()
      pollTimerRef.current = window.setInterval(() => {
        void lamMoiDuLieuThongBao()
      }, thoiGianMs)
    }

    const xuLyThongBaoMoi = (thongBao: ThongBao) => {
      dispatch({ type: 'THEM_THONG_BAO', payload: thongBao })

      const toastId = `toast_${Date.now()}`
      dispatch({ type: 'THEM_TOAST', payload: { ...thongBao, toastId } })
      window.setTimeout(() => dispatch({ type: 'XOA_TOAST', payload: toastId }), 5000)

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(thongBao.tieuDe, {
          body: thongBao.noiDung,
          icon: '/favicon.svg',
          tag: thongBao._id,
        })
      }
    }

    langNgheEvent('thong_bao_moi', xuLyThongBaoMoi)
    void Promise.all([taiThongBao(), demChuaDoc()])
    batDauPolling(kiemTraKetNoi() ? POLL_MS_KET_NOI : POLL_MS_MAT_KET_NOI)

    const boLangNgheKetNoi = langNgheTrangThaiKetNoi({
      onConnect: () => {
        void lamMoiDuLieuThongBao()
        batDauPolling(POLL_MS_KET_NOI)
      },
      onReconnect: () => {
        void lamMoiDuLieuThongBao()
        batDauPolling(POLL_MS_KET_NOI)
      },
      onDisconnect: () => {
        batDauPolling(POLL_MS_MAT_KET_NOI)
      },
      onConnectError: () => {
        batDauPolling(POLL_MS_MAT_KET_NOI)
      },
    })

    return () => {
      boLangNgheEvent('thong_bao_moi', xuLyThongBaoMoi)
      boLangNgheKetNoi()
      xoaPolling()
    }
  }, [token, nguoiDung?.id, authTick, taiThongBao, demChuaDoc])

  const danhDauDaDoc = useCallback(async (id: string) => {
    const tok = layAccessToken()
    if (!tok) return
    try {
      await fetch(`${API_URL}/thongbao/${id}/danh-dau-da-doc`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok}` },
      })
      dispatch({ type: 'DANH_DAU_DA_DOC', payload: id })
    } catch (err) {
      console.error('Loi danh dau da doc:', err)
    }
  }, [])

  const danhDauTatCaDaDoc = useCallback(async () => {
    const tok = layAccessToken()
    if (!tok) return
    try {
      await fetch(`${API_URL}/thongbao/danh-dau-tat-ca-da-doc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}` },
      })
      dispatch({ type: 'DANH_DAU_TAT_CA_DA_DOC' })
    } catch (err) {
      console.error('Loi danh dau tat ca da doc:', err)
    }
  }, [])

  const xoaToast = useCallback((toastId: string) => {
    dispatch({ type: 'XOA_TOAST', payload: toastId })
  }, [])

  return (
    <ThongBaoContext.Provider
      value={{
        ...state,
        danhDauDaDoc,
        danhDauTatCaDaDoc,
        taiThongBao,
        xoaToast,
      }}
    >
      {children}
    </ThongBaoContext.Provider>
  )
}

export function useThongBao() {
  const ctx = useContext(ThongBaoContext)
  if (!ctx) throw new Error('useThongBao phai dung trong ThongBaoProvider')
  return ctx
}
