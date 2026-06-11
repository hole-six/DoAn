import { useEffect, useState } from 'react'
import { apiCoXacThuc, layNguoiDung } from '../../../lib/auth'
import { refId } from '../../../lib/employerGate'
import { langNgheCapNhatCongTyNhaTuyenDung } from '../../../lib/employerCompanySync'
import type { HoSoUngTuyen, KyNang, LichPhongVan, NhaTuyenDung, ThongBao, TinTuyenDung } from '../../../types/recruitment'

type EmployerState = {
  loading: boolean
  error: string
  user: ReturnType<typeof layNguoiDung>
  company?: NhaTuyenDung
  jobs: TinTuyenDung[]
  applications: HoSoUngTuyen[]
  interviews: LichPhongVan[]
  notifications: ThongBao[]
  skills: KyNang[]
}

const initialState: EmployerState = {
  loading: true,
  error: '',
  user: null,
  jobs: [],
  applications: [],
  interviews: [],
  notifications: [],
  skills: [],
}

export function useEmployerData() {
  const [state, setState] = useState<EmployerState>(initialState)

  const load = async () => {
    const user = layNguoiDung()
    try {
      setState(prev => ({ ...prev, loading: true, error: '', user }))
      const [companies, jobs, applications, interviews, notifications, skills] = await Promise.all([
        apiCoXacThuc('/nhatuyendung') as Promise<NhaTuyenDung[]>,
        apiCoXacThuc('/tintuyendung') as Promise<TinTuyenDung[]>,
        apiCoXacThuc('/hosoungtuyen') as Promise<HoSoUngTuyen[]>,
        apiCoXacThuc('/lichphongvan') as Promise<LichPhongVan[]>,
        apiCoXacThuc('/thongbao?limit=200') as Promise<ThongBao[]>,
        apiCoXacThuc('/danhmuckynang') as Promise<KyNang[]>,
      ])
      const company = companies.find(item => refId(item.maNguoiDung) === user?.id)
      const myJobs = jobs.filter(item => refId(item.maNhaTuyenDung) === company?.id)
      const jobIds = new Set(myJobs.map(item => item.id))
      const myApplications = applications.filter(item => jobIds.has(item.maTinTuyenDung))
      const appIds = new Set(myApplications.map(item => item.id))
      const myInterviews = interviews.filter(item => appIds.has(item.maHoSoUngTuyen))
      const myNotifications = notifications.filter(item => refId(item.maNguoiDung) === user?.id)
      setState({ loading: false, error: '', user, company, jobs: myJobs, applications: myApplications, interviews: myInterviews, notifications: myNotifications, skills })
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, user, error: error instanceof Error ? error.message : 'Không tải được dữ liệu' }))
    }
  }

  useEffect(() => {
    void load()
    const huyLangNghe = langNgheCapNhatCongTyNhaTuyenDung(() => {
      void load()
    })
    const onFocus = () => { void load() }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, 20000)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      huyLangNghe()
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(intervalId)
    }
  }, [])

  const updateCompany = (company?: NhaTuyenDung) => {
    setState(prev => ({ ...prev, company }))
  }

  return { ...state, reload: load, updateCompany }
}
