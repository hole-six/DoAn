import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, Clock, DollarSign, Filter, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import timJobBg from '../../assets/timjob.png'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type ViecLamItem = {
  id: string
  tieuDe: string
  congTy: string
  logo: string
  diaDiem: string
  luong: string
  loai: string
  capBac: string
  kyNang: string[]
  ngay: string
  featured: boolean
}

const danhMucIT = ['React', 'NodeJS', 'TypeScript', 'Python', 'Java', 'DevOps', 'MongoDB', 'Docker', 'UI/UX']

function formatLuong(min?: number, max?: number) {
  if (!min && !max) return 'Thỏa thuận'
  return `${min?.toLocaleString('vi-VN') ?? '?'} - ${max?.toLocaleString('vi-VN') ?? '?'} VND`
}

export default function TimKiemViecLam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tuKhoa, setTuKhoa] = useState(searchParams.get('tuKhoa') ?? '')
  const [diaDiem, setDiaDiem] = useState(searchParams.get('diaDiem') ?? 'Đà Nẵng')
  const [viecLam, setViecLam] = useState<ViecLamItem[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>(() => JSON.parse(localStorage.getItem('itjob_saved_jobs') ?? '[]'))

  useEffect(() => {
    setTuKhoa(searchParams.get('tuKhoa') ?? '')
    setDiaDiem(searchParams.get('diaDiem') ?? 'Đà Nẵng')
  }, [searchParams])

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
            kyNang: (job.kyNang ?? []).map((skill: any) => skill.tenKyNang ?? skill.maKyNang?.tenKyNang).filter(Boolean).slice(0, 6),
            ngay: job.ngayDang ? new Date(job.ngayDang).toLocaleDateString('vi-VN') : 'Mới đăng',
            featured: index < 2,
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

  const submitSearch = () => {
    const params = new URLSearchParams()
    if (tuKhoa.trim()) params.set('tuKhoa', tuKhoa.trim())
    if (diaDiem.trim()) params.set('diaDiem', diaDiem.trim())
    setSearchParams(params)
  }

  const toggleSave = (id: string) => {
    const next = savedIds.includes(id) ? savedIds.filter(item => item !== id) : [...savedIds, id]
    setSavedIds(next)
    localStorage.setItem('itjob_saved_jobs', JSON.stringify(next))
  }

  const ketQua = viecLam.filter(job => {
    const q = tuKhoa.trim().toLowerCase()
    const location = diaDiem.trim().toLowerCase()
    const matchKeyword = !q || job.tieuDe.toLowerCase().includes(q) || job.congTy.toLowerCase().includes(q) || job.kyNang.some(skill => skill.toLowerCase().includes(q))
    const matchLocation = !location || job.diaDiem.toLowerCase().includes(location)
    return matchKeyword && matchLocation
  })

  return (
    <main className="app-page jobs-real-page">
      <section className="jobs-real-hero">
        <img src={timJobBg} alt="" />
        <div />
        <article>
          <h1>Tìm việc IT bằng dữ liệu tuyển dụng thật</h1>
          <p>{dangTai ? 'Đang tải dữ liệu...' : `${ketQua.length} việc làm phù hợp từ hệ thống ITJob`}</p>
          <div className="jobs-real-search">
            <label>
              <Search size={18} />
              <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitSearch() }} placeholder="Chức danh, kỹ năng, công ty..." />
            </label>
            <label>
              <MapPin size={18} />
              <input value={diaDiem} onChange={e => setDiaDiem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitSearch() }} placeholder="Địa điểm" />
            </label>
            <button className="primary-button" onClick={submitSearch}><Search size={17} /> Tìm việc</button>
          </div>
          <div className="jobs-real-tags">
            {danhMucIT.map(tag => <button key={tag} onClick={() => setSearchParams({ tuKhoa: tag })}>{tag}</button>)}
          </div>
        </article>
      </section>

      <section className="jobs-real-body">
        <aside className="jobs-real-filter">
          <div><SlidersHorizontal size={18} /><strong>Bộ lọc nhanh</strong></div>
          <button onClick={() => setSearchParams({ diaDiem: 'Đà Nẵng' })}><MapPin size={15} /> Đà Nẵng</button>
          <button onClick={() => setSearchParams({ tuKhoa: 'React' })}><Filter size={15} /> React</button>
          <button onClick={() => setSearchParams({ tuKhoa: 'NodeJS' })}><Filter size={15} /> NodeJS</button>
          <button onClick={() => setSearchParams({ tuKhoa: 'Senior' })}><Filter size={15} /> Senior</button>
          <button onClick={() => setSearchParams({})}>Xóa bộ lọc</button>
        </aside>

        <div className="jobs-real-list">
          <div className="jobs-real-heading">
            <div>
              <h2>{dangTai ? 'Đang tải việc làm' : `Tìm thấy ${ketQua.length} việc làm`}</h2>
              <p>Dữ liệu lấy từ API `/tintuyendung`, lọc theo từ khóa và địa điểm.</p>
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
                  <div className="jobs-real-skills">{job.kyNang.map(skill => <span key={skill}>{skill}</span>)}</div>
                </div>
                <button onClick={() => toggleSave(job.id)} title={isSaved ? 'Bỏ lưu' : 'Lưu việc'}>
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
