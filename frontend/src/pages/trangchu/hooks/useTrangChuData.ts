import { useEffect, useState } from 'react'
import { API_URL, taoUrlTaiNguyen } from '../../../lib/env'
import { isPublicJobVisible } from '../../../lib/jobVisibility'
import { formatJobDeadlineState } from '../../../lib/jobPresentation'
import type { HomeJob, HomeCompany } from '../../../data/trangChuData'

export function useTrangChuData() {
  const [state, setState] = useState<{ 
    jobs: HomeJob[]
    companies: HomeCompany[]
    loading: boolean 
  }>({ 
    jobs: [], 
    companies: [], 
    loading: true 
  })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          fetch(`${API_URL}/tintuyendung`, { cache: 'no-store' }).then(res => res.json()),
          fetch(`${API_URL}/nhatuyendung`).then(res => res.json()),
        ])
        if (!active) return
        
        const rawJobs = jobsRes.duLieu ?? []
        const rawCompanies = companiesRes.duLieu ?? []
        
        const jobsByCompany = rawJobs.reduce((acc: Record<string, number>, job: any) => {
          acc[job.maNhaTuyenDung] = (acc[job.maNhaTuyenDung] ?? 0) + (isPublicJobVisible(job) ? 1 : 0)
          return acc
        }, {})

        setState({
          loading: false,
          jobs: rawJobs
            .filter((job: any) => isPublicJobVisible(job))
            .slice(0, 6)
            .map((job: any, index: number) => ({
              id: job.id,
              tieuDe: job.tieuDe,
              congTy: job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
              logo: taoUrlTaiNguyen(job.nhaTuyenDung?.logo) || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
              diaDiem: job.diaChi ?? 'Đà Nẵng',
              luong: job.luongMin || job.luongMax 
                ? `${job.luongMin?.toLocaleString('vi-VN') ?? '?'} - ${job.luongMax?.toLocaleString('vi-VN') ?? '?'} VND` 
                : 'Thỏa thuận',
              loaiViec: job.loaiHinh ?? 'toan_thoi_gian',
              kyNang: (job.kyNang ?? [])
                .map((skill: any) => skill.tenKyNang ?? skill.maKyNang?.tenKyNang)
                .filter(Boolean)
                .slice(0, 4),
              badge: index < 2 ? 'HOT' : null,
              ngayDang: job.ngayDang,
              hanNop: job.hanNop,
              hanNopConLai: formatJobDeadlineState(job.hanNop),
              featured: index < 2,
            })),
          companies: rawCompanies
            .filter((company: any) => company.trangThaiDuyet === 'da_duyet')
            .slice(0, 6)
            .map((company: any) => ({
              id: company.id,
              ten: company.tenCongTy,
              logo: taoUrlTaiNguyen(company.logo) || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80',
              logoBg: '#ffffff',
              diaDiem: company.diaChi ?? 'Đà Nẵng',
              soViec: jobsByCompany[company.id] ?? 0,
              kyNang: [
                company.nganh, 
                company.quyMo ? `${company.quyMo}+ nhân sự` : '', 
                company.trangThaiDuyet === 'da_duyet' ? 'Đã xác thực' : ''
              ].filter(Boolean),
            })),
        })
      } catch {
        if (active) setState({ jobs: [], companies: [], loading: false })
      }
    }
    load()
    return () => { active = false }
  }, [])

  return state
}
