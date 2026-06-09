import { useEffect, useMemo, useRef, useState } from 'react'

export type SuggestionType = 'job' | 'company' | 'skill'

export type SuggestionItem = {
  id: string
  type: SuggestionType
  title: string
  subtitle?: string
  meta?: string
  queryValue: string
  href?: string
}

export type SuggestionGroups = {
  jobs: SuggestionItem[]
  companies: SuggestionItem[]
  skills: SuggestionItem[]
}

const emptyGroups: SuggestionGroups = { jobs: [], companies: [], skills: [] }
const cache = new Map<string, SuggestionGroups>()

function asGroups(payload: Partial<SuggestionGroups> | null | undefined): SuggestionGroups {
  return {
    jobs: payload?.jobs ?? [],
    companies: payload?.companies ?? [],
    skills: payload?.skills ?? [],
  }
}

function sameGroups(a: SuggestionGroups, b: SuggestionGroups) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizeKeyword(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

function compactKeyword(value: string) {
  return normalizeKeyword(value).replace(/\s+/g, '')
}

function scoreSuggestion(item: SuggestionItem, query: string) {
  const normalizedQuery = normalizeKeyword(query)
  const compactQuery = compactKeyword(query)
  const fields = [item.title, item.subtitle, item.meta, item.queryValue].filter(Boolean) as string[]
  let score = -1

  for (const field of fields) {
    const normalized = normalizeKeyword(field)
    const compact = compactKeyword(field)
    let next = -1

    if (compact === compactQuery) next = 120
    else if (normalized === normalizedQuery) next = 110
    else if (compact.startsWith(compactQuery)) next = 100
    else if (normalized.startsWith(normalizedQuery)) next = 95
    else if (compact.includes(compactQuery)) next = 80
    else if (normalized.includes(normalizedQuery)) next = 70

    score = Math.max(score, next)
  }

  return score
}

function rankSuggestions(items: SuggestionItem[], query: string, limit: number) {
  return items
    .map(item => ({ item, score: scoreSuggestion(item, query) }))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.item)
}

export function useSearchSuggestions(params: {
  query: string
  active: boolean
  apiUrl: string
  debounceMs?: number
}) {
  const { query, active, apiUrl, debounceMs = 220 } = params
  const [groups, setGroups] = useState<SuggestionGroups>(emptyGroups)
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const keyword = query.trim()
    if (!active || !keyword) {
      setLoading(false)
      if (!sameGroups(groups, emptyGroups)) setGroups(emptyGroups)
      return
    }

    const normalizedKey = normalizeKeyword(keyword)
    const cached = cache.get(normalizedKey)
    if (cached) {
      setGroups(prev => (sameGroups(prev, cached) ? prev : cached))
      setLoading(false)
      return
    }

    const myRequestId = ++requestIdRef.current
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [jobsRes, companiesRes, skillsRes] = await Promise.all([
          fetch(`${apiUrl}/tintuyendung?tuKhoa=${encodeURIComponent(keyword)}&limit=8`, { signal: controller.signal }).then(r => r.json()),
          fetch(`${apiUrl}/nhatuyendung?tuKhoa=${encodeURIComponent(keyword)}&limit=6`, { signal: controller.signal }).then(r => r.json()),
          fetch(`${apiUrl}/danhmuckynang?tuKhoa=${encodeURIComponent(keyword)}&limit=10`, { signal: controller.signal }).then(r => r.json()),
        ])

        if (requestIdRef.current !== myRequestId) return

        const nextGroups: SuggestionGroups = asGroups({
          jobs: rankSuggestions((jobsRes.duLieu ?? []).map((job: any) => ({
            id: String(job.id ?? job._id ?? job.tieuDe),
            type: 'job' as const,
            title: String(job.tieuDe ?? 'Tin tuyển dụng'),
            subtitle: String(job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng'),
            meta: String(job.diaChi ?? ''),
            queryValue: String(job.tieuDe ?? ''),
            href: job.id ? `/viec-lam/${job.id}` : undefined,
          })), keyword, 5),
          companies: rankSuggestions((companiesRes.duLieu ?? []).map((company: any) => ({
            id: String(company.id ?? company._id ?? company.tenCongTy),
            type: 'company' as const,
            title: String(company.tenCongTy ?? 'Công ty'),
            subtitle: String(company.nganh ?? ''),
            meta: String(company.diaChi ?? ''),
            queryValue: String(company.tenCongTy ?? ''),
            href: company.id ? `/cong-ty/${company.id}` : undefined,
          })), keyword, 4),
          skills: rankSuggestions((skillsRes.duLieu ?? []).map((skill: any) => ({
            id: String(skill.id ?? skill._id ?? skill.tenKyNang),
            type: 'skill' as const,
            title: String(skill.tenKyNang ?? 'Kỹ năng'),
            subtitle: String(skill.loaiKyNang ?? ''),
            meta: typeof skill.soLuongViecLam === 'number' ? `${skill.soLuongViecLam} việc làm` : '',
            queryValue: String(skill.tenKyNang ?? ''),
            href: skill.tenKyNang ? `/viec-lam?tuKhoa=${encodeURIComponent(String(skill.tenKyNang))}` : undefined,
          })), keyword, 6),
        })

        cache.set(normalizedKey, nextGroups)
        setGroups(prev => (sameGroups(prev, nextGroups) ? prev : nextGroups))
      } catch (error) {
        if ((error as Error).name !== 'AbortError' && requestIdRef.current === myRequestId) {
          setGroups(emptyGroups)
        }
      } finally {
        if (requestIdRef.current === myRequestId) setLoading(false)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, active, apiUrl, debounceMs])

  const flatItems = useMemo(
    () => [...groups.jobs, ...groups.companies, ...groups.skills],
    [groups],
  )

  return {
    groups,
    loading,
    flatItems,
    hasAny: flatItems.length > 0,
  }
}
