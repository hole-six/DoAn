import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { DashboardSkeleton } from '../../../components/LoadingStates'
import { getEmployerGate } from '../../../lib/employerGate'
import { useEmployerData } from './useEmployerData'

export function EmployerRecruitmentGate({ children }: { children: ReactNode }) {
  const data = useEmployerData()
  const location = useLocation()

  if (data.loading) return <DashboardSkeleton />

  const gate = getEmployerGate(data.company)
  if (!gate.allowed) {
    const params = new URLSearchParams({
      gate: gate.status,
      redirect: `${location.pathname}${location.search}`,
    })
    return <Navigate to={`/nha-tuyen-dung/cong-ty?${params.toString()}`} replace />
  }

  return <>{children}</>
}
