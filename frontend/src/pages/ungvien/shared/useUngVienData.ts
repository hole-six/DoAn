import { useEffect, useState } from 'react'
import { apiCoXacThuc, layNguoiDung } from '../../../lib/auth'
import type { DanhGiaCongTy, HoSoNangLuc, HoSoUngTuyen, KyNang, LichPhongVan, ThongBao, TinTuyenDung, UngVien } from '../../../types/recruitment'

type UngVienState = {
  loading: boolean
  error: string
  current: ReturnType<typeof layNguoiDung>
  ungVien?: UngVien
  hoSo: HoSoNangLuc[]
  ungTuyen: HoSoUngTuyen[]
  lich: LichPhongVan[]
  danhGiaCongTy: DanhGiaCongTy[]
  thongBao: ThongBao[]
  tinList: TinTuyenDung[]
  kyNangList: KyNang[]
}

const initialState: UngVienState = {
  loading: true,
  error: '',
  current: null,
  hoSo: [],
  ungTuyen: [],
  lich: [],
  danhGiaCongTy: [],
  thongBao: [],
  tinList: [],
  kyNangList: [],
}

function sameId(left?: string, right?: string) {
  return String(left ?? '') === String(right ?? '')
}

export function useUngVienData() {
  const [state, setState] = useState<UngVienState>(initialState)

  const load = async () => {
    const current = layNguoiDung()
    try {
      setState(prev => ({ ...prev, loading: true, error: '', current }))
      const [ungVien, hoSoList, utList, lichList, danhGiaList, tbList, tinList, kyNangList] = await Promise.all([
        apiCoXacThuc('/ungvien/toi') as Promise<UngVien>,
        apiCoXacThuc('/hosonangluc') as Promise<HoSoNangLuc[]>,
        apiCoXacThuc('/hosoungtuyen') as Promise<HoSoUngTuyen[]>,
        apiCoXacThuc('/lichphongvan') as Promise<LichPhongVan[]>,
        apiCoXacThuc('/danhgiacongty/toi') as Promise<DanhGiaCongTy[]>,
        apiCoXacThuc('/thongbao?limit=200') as Promise<ThongBao[]>,
        apiCoXacThuc('/tintuyendung') as Promise<TinTuyenDung[]>,
        apiCoXacThuc('/danhmuckynang') as Promise<KyNang[]>,
      ])
      const hoSo = hoSoList.filter(item => sameId(item.maUngVien, ungVien?.id))
      const ungTuyen = utList.filter(item => sameId(item.maUngVien, ungVien?.id))
      const applicationIds = new Set(ungTuyen.map(item => item.id))
      const lich = lichList.filter(item => applicationIds.has(item.maHoSoUngTuyen))
      const danhGiaCongTy = danhGiaList.filter(item => item.maHoSoUngTuyen && applicationIds.has(item.maHoSoUngTuyen))
      const thongBao = tbList.filter(item => sameId(String(item.maNguoiDung), current?.id))
      setState({ loading: false, error: '', current, ungVien, hoSo, ungTuyen, lich, danhGiaCongTy, thongBao, tinList, kyNangList })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        current,
        error: error instanceof Error ? error.message : 'Không tải được dữ liệu',
      }))
    }
  }

  useEffect(() => { void load() }, [])

  return { ...state, reload: load }
}
