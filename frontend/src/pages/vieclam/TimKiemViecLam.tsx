import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, Clock, DollarSign, Filter, MapPin, MessageCircle, Search, Send, Sparkles, SlidersHorizontal } from 'lucide-react'
import timJobBg from '../../assets/timjob.png'
import SearchSuggestionPanel from '../../components/search/SearchSuggestionPanel'
import { type SuggestionItem, useSearchSuggestions } from '../../components/search/useSearchSuggestions'
import { apiCoXacThuc, layNguoiDung } from '../../lib/auth'
import { API_URL } from '../../lib/env'
import './vieclam-styles.css'

type ViecLamItem = {
  id: string
  tieuDe: string
  congTy: string
  logo: string
  diaDiem: string
  luong: string
  loai: string
  capBac: string
  kyNang: Array<{ id: string; ten: string; loai: string }>
  moTa: string
  yeuCau: string
  ngay: string
  featured: boolean
}

const nhanLoaiKyNang: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps & Cloud',
  mobile: 'Mobile',
  du_lieu: 'Data & AI',
  kiem_thu: 'Testing / QA',
  testing: 'Testing / QA',
  thiet_ke: 'Design',
  phan_tich: 'Business Analyst',
  quan_ly: 'Product / Management',
  ngon_ngu: 'Ngôn ngữ',
  ky_nang_mem: 'Kỹ năng mềm',
}

function formatLuong(min?: number, max?: number) {
  if (!min && !max) return 'Thỏa thuận'
  return `${min?.toLocaleString('vi-VN') ?? '?'} - ${max?.toLocaleString('vi-VN') ?? '?'} VND`
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/reactjs/g, 'react')
    .replace(/node\.?js/g, 'nodejs')
    .replace(/vue\.?js/g, 'vuejs')
    .replace(/da nang|dn/g, 'danang')
    .replace(/ho chi minh|hcm|tp hcm|tphcm|sai gon|saigon/g, 'hochiminh')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .trim()
}

function includesNormalized(source: string, query: string) {
  const normalizedSource = normalize(source)
  const normalizedQuery = normalize(query)
  return !normalizedQuery || normalizedSource.includes(normalizedQuery)
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value]
}

export default function TimKiemViecLam() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tuKhoa, setTuKhoa] = useState(searchParams.get('tuKhoa') ?? '')
  const [diaDiem, setDiaDiem] = useState(searchParams.get('diaDiem') ?? '')
  const [viecLam, setViecLam] = useState<ViecLamItem[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>(() => JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]'))
  const [loaiDangChon, setLoaiDangChon] = useState<string[]>([])
  const [kyNangDangChon, setKyNangDangChon] = useState<string[]>([])
  const [capBacDangChon, setCapBacDangChon] = useState<string[]>([])
  const [loaiHinhDangChon, setLoaiHinhDangChon] = useState<string[]>([])
  const [searchActive, setSearchActive] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const { groups, loading, hasAny } = useSearchSuggestions({
    query: tuKhoa,
    active: searchActive,
    apiUrl: API_URL,
  })

  useEffect(() => {
    setTuKhoa(searchParams.get('tuKhoa') ?? '')
    setDiaDiem(searchParams.get('diaDiem') ?? '')
  }, [searchParams])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchActive(false)
    }
    const onMouseDown = (event: MouseEvent) => {
      if (!searchWrapRef.current) return
      if (!searchWrapRef.current.contains(event.target as Node)) setSearchActive(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = searchActive ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [searchActive])

  useEffect(() => {
    let active = true
    fetch(`${API_URL}/tintuyendung`)
      .then(res => res.json())
      .then(data => {
        if (!active) return
        const items = (data.duLieu ?? [])
          .filter((job: any) => job.trangThai === 'dang_mo')
          .map((job: any, index: number) => ({
            id: job.id,
            tieuDe: job.tieuDe,
            congTy: job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
            logo: job.nhaTuyenDung?.logo || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
            diaDiem: job.diaChi ?? 'Đà Nẵng',
            luong: formatLuong(job.luongMin, job.luongMax),
            loai: job.loaiHinh ?? 'toan_thoi_gian',
            capBac: job.capBac ?? 'junior',
            kyNang: (job.kyNang ?? [])
              .map((skill: any) => ({
                id: String(skill.maKyNang ?? skill.id ?? skill.tenKyNang),
                ten: skill.tenKyNang ?? skill.maKyNang?.tenKyNang,
                loai: skill.loaiKyNang ?? skill.maKyNang?.loaiKyNang ?? 'khac',
              }))
              .filter((skill: any) => skill.ten)
              .slice(0, 8),
            moTa: job.moTa ?? '',
            yeuCau: job.yeuCau ?? '',
            ngay: job.ngayDang ? new Date(job.ngayDang).toLocaleDateString('vi-VN') : 'Mới đăng',
            featured: index < 3,
          }))
        setViecLam(items)
        setDangTai(false)
      })
      .catch(() => {
        setLoi('Không tải được dữ liệu việc làm từ API.')
        setDangTai(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const nguoiDung = layNguoiDung()
    if (nguoiDung?.vaiTro !== 'ung_vien') return
    apiCoXacThuc('/viec-lam-da-luu')
      .then((items: any[]) => {
        const ids = (items ?? []).map(item => item.maTinTuyenDung).filter(Boolean)
        setSavedIds(ids)
      })
      .catch(() => undefined)
  }, [])

  const submitSearch = () => {
    const params = new URLSearchParams()
    if (tuKhoa.trim()) params.set('tuKhoa', tuKhoa.trim())
    if (diaDiem.trim()) params.set('diaDiem', diaDiem.trim())
    setSearchActive(false)
    setSearchParams(params)
  }

  const chonGoiY = (item: SuggestionItem) => {
    setTuKhoa(item.queryValue)
    setSearchActive(false)
    if (item.type === 'company') {
      navigate(`/cong-ty?tuKhoa=${encodeURIComponent(item.queryValue)}`)
      return
    }
    navigate(`/viec-lam?tuKhoa=${encodeURIComponent(item.queryValue)}`)
  }

  const askAi = async () => {
    const cauHoi = aiQuestion.trim()
    if (!cauHoi) return
    setAiBusy(true)
    setAiAnswer('')
    try {
      const res = await fetch(`${API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.thongBao ?? 'Không hỏi được AI')
      setAiAnswer(data.duLieu?.traLoi ?? '')
    } catch (error) {
      setAiAnswer(error instanceof Error ? error.message : 'Không hỏi được AI')
    } finally {
      setAiBusy(false)
    }
  }

  const toggleSave = async (id: string) => {
    const isSaved = savedIds.includes(id)
    const next = isSaved ? savedIds.filter(item => item !== id) : [...savedIds, id]
    const nguoiDung = layNguoiDung()
    setSavedIds(next)

    if (nguoiDung?.vaiTro === 'ung_vien') {
      try {
        await apiCoXacThuc(`/viec-lam-da-luu/${id}`, { method: isSaved ? 'DELETE' : 'POST' })
      } catch {
        setSavedIds(savedIds)
      }
      return
    }

    localStorage.setItem('itjob_saved_jobs', JSON.stringify(next))
  }

  const ketQua = viecLam.filter(job => {
    const skillText = job.kyNang.map(skill => skill.ten).join(' ')
    const skillIds = job.kyNang.map(skill => skill.id)
    const skillTypes = job.kyNang.map(skill => skill.loai)
    const text = `${job.tieuDe} ${job.congTy} ${job.capBac} ${job.loai} ${skillText} ${job.moTa} ${job.yeuCau}`
    return includesNormalized(text, tuKhoa)
      && includesNormalized(job.diaDiem, diaDiem)
      && (!loaiDangChon.length || loaiDangChon.some(loai => skillTypes.includes(loai)))
      && (!kyNangDangChon.length || kyNangDangChon.every(skillId => skillIds.includes(skillId)))
      && (!capBacDangChon.length || capBacDangChon.includes(job.capBac))
      && (!loaiHinhDangChon.length || loaiHinhDangChon.includes(job.loai))
  })

  const boLocDong = useMemo(() => {
    const loaiMap = new Map<string, number>()
    const skillMap = new Map<string, { id: string; ten: string; loai: string; count: number }>()
    const capBacMap = new Map<string, number>()
    const loaiHinhMap = new Map<string, number>()

    viecLam.forEach(job => {
      capBacMap.set(job.capBac, (capBacMap.get(job.capBac) ?? 0) + 1)
      loaiHinhMap.set(job.loai, (loaiHinhMap.get(job.loai) ?? 0) + 1)
      job.kyNang.forEach(skill => {
        loaiMap.set(skill.loai, (loaiMap.get(skill.loai) ?? 0) + 1)
        const current = skillMap.get(skill.id)
        skillMap.set(skill.id, { ...skill, count: (current?.count ?? 0) + 1 })
      })
    })

    return {
      loai: [...loaiMap.entries()].sort((a, b) => b[1] - a[1]),
      kyNang: [...skillMap.values()].sort((a, b) => b.count - a.count || a.ten.localeCompare(b.ten, 'vi')),
      capBac: [...capBacMap.entries()].sort((a, b) => b[1] - a[1]),
      loaiHinh: [...loaiHinhMap.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [viecLam])

  const resetBoLoc = () => {
    setLoaiDangChon([])
    setKyNangDangChon([])
    setCapBacDangChon([])
    setLoaiHinhDangChon([])
    setSearchParams({})
  }

  const goiYKyNang = boLocDong.kyNang.slice(0, 12)

  return (
    <main className="app-page jobs-real-page">
      <section className={`jobs-real-hero${searchActive ? ' search-focus-active' : ''}`}>
        <img src={timJobBg} alt="" />
        <div />
        <article>
          <h1>Tìm việc IT bằng dữ liệu tuyển dụng thật</h1>
          <p>{dangTai ? 'Đang tải dữ liệu...' : `${ketQua.length} việc làm phù hợp từ hệ thống ITJob`}</p>
          <div ref={searchWrapRef} className={`jobs-real-search${searchActive ? ' search-shell-active' : ''}`}>
            <label>
              <Search size={18} />
              <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} onFocus={() => setSearchActive(true)} onKeyDown={e => { if (e.key === 'Enter') submitSearch() }} placeholder="Chức danh, kỹ năng, công ty..." />
            </label>
            <label>
              <MapPin size={18} />
              <input value={diaDiem} onChange={e => setDiaDiem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitSearch() }} placeholder="Địa điểm" />
            </label>
            <button className="primary-button" onClick={submitSearch}><Search size={17} /> Tìm việc</button>
            {searchActive && (
              <SearchSuggestionPanel groups={groups} loading={loading} query={tuKhoa} onSelect={chonGoiY} />
            )}
          </div>
          {searchActive && (loading || hasAny) && (
            <button type="button" className="search-overlay" onClick={() => setSearchActive(false)} aria-label="Đóng gợi ý tìm kiếm" />
          )}
          <div className="jobs-real-tags">
            {goiYKyNang.map(skill => <button key={skill.id} onClick={() => setKyNangDangChon(prev => toggleValue(prev, skill.id))}>{skill.ten}</button>)}
          </div>
        </article>
      </section>

      <section className="jobs-real-body">
        <aside className="jobs-real-filter">
          <div><SlidersHorizontal size={18} /><strong>Bộ lọc nhanh</strong></div>
          <section className="jobs-filter-group">
            <h3>Danh mục kỹ năng</h3>
            {boLocDong.loai.map(([loai, count]) => (
              <button className={loaiDangChon.includes(loai) ? 'active' : ''} key={loai} onClick={() => setLoaiDangChon(prev => toggleValue(prev, loai))}>
                <Filter size={15} /> <span>{nhanLoaiKyNang[loai] ?? loai}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Kỹ năng liên quan</h3>
            {boLocDong.kyNang
              .filter(skill => !loaiDangChon.length || loaiDangChon.includes(skill.loai))
              .slice(0, 18)
              .map(skill => (
                <button className={kyNangDangChon.includes(skill.id) ? 'active' : ''} key={skill.id} onClick={() => setKyNangDangChon(prev => toggleValue(prev, skill.id))}>
                  <Filter size={15} /> <span>{skill.ten}</span><em>{skill.count}</em>
                </button>
              ))}
          </section>
          <section className="jobs-filter-group two-col">
            <h3>Cấp bậc</h3>
            {boLocDong.capBac.map(([capBac, count]) => (
              <button className={capBacDangChon.includes(capBac) ? 'active' : ''} key={capBac} onClick={() => setCapBacDangChon(prev => toggleValue(prev, capBac))}>
                <span>{capBac}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Hình thức</h3>
            {boLocDong.loaiHinh.map(([loai, count]) => (
              <button className={loaiHinhDangChon.includes(loai) ? 'active' : ''} key={loai} onClick={() => setLoaiHinhDangChon(prev => toggleValue(prev, loai))}>
                <Briefcase size={15} /> <span>{loai}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageCircle size={15} /> Trợ lý AI</h3>
            <textarea
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              rows={4}
              placeholder="Hỏi AI: tìm việc frontend ở Đà Nẵng, job React junior, ..."
              style={{ width: '100%', borderRadius: 10, border: '1px solid #dbe4f0', padding: 10, fontSize: 13, resize: 'vertical' }}
            />
            <button className="primary-button" style={{ width: '100%', marginTop: 8 }} onClick={() => void askAi()} disabled={aiBusy}>
              {aiBusy ? <Sparkles size={17} /> : <Send size={17} />} {aiBusy ? 'Đang trả lời...' : 'Hỏi AI'}
            </button>
            {aiAnswer && (
              <div style={{ marginTop: 10, borderRadius: 12, border: '1px solid #dbe4f0', background: '#f8fbff', padding: 12, fontSize: 13, lineHeight: 1.7, color: '#0f172a', whiteSpace: 'pre-line' }}>
                {aiAnswer}
              </div>
            )}
          </section>
          <button className="jobs-filter-clear" onClick={resetBoLoc}>Xóa bộ lọc</button>
        </aside>

        <div className="jobs-real-list">
          <div className="jobs-real-heading">
            <div>
              <h2>{dangTai ? 'Đang tải việc làm' : `Tìm thấy ${ketQua.length} việc làm`}</h2>
              <p>Bộ lọc sinh động từ dữ liệu kỹ năng thật: chọn danh mục để thu hẹp kỹ năng, chọn nhiều kỹ năng để lọc việc giao nhau.</p>
            </div>
          </div>
          {loi && <div className="jobs-real-error">{loi}</div>}
          {!dangTai && ketQua.length === 0 && <div className="jobs-real-empty">Không có việc làm phù hợp bộ lọc hiện tại.</div>}
          {ketQua.map(job => {
            const isSaved = savedIds.includes(job.id)
            return (
              <article className="jobs-real-card" key={job.id}>
                <img src={job.logo} alt={job.congTy} />
                <div>
                  <div className="jobs-real-title">
                    <Link to={`/viec-lam/${job.id}`}>{job.tieuDe}</Link>
                    {job.featured && <span>FEATURED</span>}
                  </div>
                  <strong>{job.congTy}</strong>
                  <p><MapPin size={14} /> {job.diaDiem}</p>
                  <p><DollarSign size={14} /> {job.luong}</p>
                  <p><Briefcase size={14} /> {job.loai} · {job.capBac} · <Clock size={14} /> {job.ngay}</p>
                  <div className="jobs-real-skills">{job.kyNang.map(skill => <span key={skill.id}>{skill.ten}</span>)}</div>
                </div>
                <button onClick={() => void toggleSave(job.id)} title={isSaved ? 'Bỏ lưu' : 'Lưu việc'}>
                  <Bookmark size={21} fill={isSaved ? '#2563eb' : 'none'} color={isSaved ? '#2563eb' : '#94a3b8'} />
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
