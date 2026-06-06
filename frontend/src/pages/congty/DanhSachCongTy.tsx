import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Filter, MapPin, Search, SlidersHorizontal, Star, Users, X, Zap } from 'lucide-react'
import congTyCongNgheBg from '../../assets/CongTyCongNGhe.png'
import Pagination from '../../components/Pagination'
import SearchSuggestionPanel from '../../components/search/SearchSuggestionPanel'
import { type SuggestionItem, useSearchSuggestions } from '../../components/search/useSearchSuggestions'
import { API_URL, taoUrlTaiNguyen } from '../../lib/env'
import { normalizeSkills } from '../../lib/skillDisplay'
import '../vieclam/vieclam-styles.css'
import './congty-styles.css'

const logoDuPhong = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80'

type CongTy = {
  id: string
  tenCongTy: string
  diaChi?: string
  logo?: string
  moTa?: string
  nganh?: string
  quyMo?: number
  trangThaiDuyet?: string
}

type TinTuyenDung = {
  id: string
  maNhaTuyenDung: string
  trangThai?: string
  kyNang?: unknown[]
}

type DanhGia = {
  maNhaTuyenDung: string
  diem: number
  daDuyet: boolean
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
}

function layJson(path: string) {
  return fetch(`${API_URL}${path}`).then(async res => {
    const body = await res.json()
    if (!res.ok) throw new Error(body.thongBao ?? 'Không tải được dữ liệu')
    return body.duLieu
  })
}

function formatQuyMo(quyMo?: number) {
  if (!quyMo) return 'Đang cập nhật'
  if (quyMo >= 1000) return `${quyMo.toLocaleString('vi-VN')}+`
  return String(quyMo)
}

const quyMoLabels: Record<string, string> = {
  '1-50': '1-50 nhân viên',
  '51-150': '51-150 nhân viên',
  '151-300': '151-300 nhân viên',
  '300+': '300+ nhân viên',
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value]
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/đ/g, 'd')
}

function imageUrl(value?: string) {
  return taoUrlTaiNguyen(value)
}

function quyMoKey(quyMo?: number) {
  if (!quyMo || quyMo <= 50) return '1-50'
  if (quyMo <= 150) return '51-150'
  if (quyMo <= 300) return '151-300'
  return '300+'
}

function hienThiTiengViet(value?: string, fallback = '') {
  let text = (value?.trim() || fallback).trim()
  const replacements: Array<[RegExp, string]> = [
    [/\bDa Nang\b/gi, 'Đà Nẵng'],
    [/\bHo Chi Minh City\b/gi, 'Hồ Chí Minh City'],
    [/\bHo Chi Minh\b/gi, 'Hồ Chí Minh'],
    [/\bViet Nam\b/gi, 'Việt Nam'],
    [/\bcong nghe thong tin\b/gi, 'công nghệ thông tin'],
    [/\bcong nghe\b/gi, 'công nghệ'],
    [/\bthong tin\b/gi, 'thông tin'],
    [/\bphan mem\b/gi, 'phần mềm'],
    [/\bquy mo\b/gi, 'quy mô'],
    [/\bchuyen doi so\b/gi, 'chuyển đổi số'],
    [/\bsan pham\b/gi, 'sản phẩm'],
    [/\bthuong mai dien tu\b/gi, 'thương mại điện tử'],
    [/\btap doan\b/gi, 'tập đoàn'],
    [/\bhang dau\b/gi, 'hàng đầu'],
    [/\bphat trien\b/gi, 'phát triển'],
    [/\bnguoi dung\b/gi, 'người dùng'],
    [/\blinh vuc\b/gi, 'lĩnh vực'],
    [/\bthiet ke\b/gi, 'thiết kế'],
    [/\bnghien cuu\b/gi, 'nghiên cứu'],
    [/\bdu lieu\b/gi, 'dữ liệu'],
    [/\btri tue nhan tao\b/gi, 'trí tuệ nhân tạo'],
    [/\bla\b/gi, 'là'],
    [/\bva\b/gi, 'và'],
  ]
  replacements.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement)
  })
  return text
}

export default function DanhSachCongTy() {
  const navigate = useNavigate()
  const [tuKhoa, setTuKhoa] = useState('')
  const [quyMoDangChon, setQuyMoDangChon] = useState<string[]>([])
  const [linhVucDangChon, setLinhVucDangChon] = useState<string[]>([])
  const [loaiKyNangDangChon, setLoaiKyNangDangChon] = useState<string[]>([])
  const [kyNangDangChon, setKyNangDangChon] = useState<string[]>([])
  const [danhGiaToiThieu, setDanhGiaToiThieu] = useState(0)
  const [sapXep, setSapXep] = useState('de_xuat')
  const [companies, setCompanies] = useState<CongTy[]>([])
  const [jobs, setJobs] = useState<TinTuyenDung[]>([])
  const [reviews, setReviews] = useState<DanhGia[]>([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const { groups, loading, hasAny } = useSearchSuggestions({
    query: tuKhoa,
    active: searchActive,
    apiUrl: API_URL,
  })

  useEffect(() => {
    let active = true
    Promise.all([layJson('/nhatuyendung'), layJson('/tintuyendung'), layJson('/danhgiacongty')])
      .then(([companyData, jobData, reviewData]) => {
        if (!active) return
        setCompanies((companyData ?? []).filter((item: CongTy) => item.trangThaiDuyet === 'da_duyet'))
        setJobs(jobData ?? [])
        setReviews(reviewData ?? [])
        setLoi('')
      })
      .catch(error => setLoi(error instanceof Error ? error.message : 'Không tải được dữ liệu công ty'))
      .finally(() => active && setDangTai(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchActive(false)
        setFilterOpen(false)
      }
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
    document.body.style.overflow = searchActive || filterOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [searchActive, filterOpen])

  const stats = useMemo(() => {
    const jobCount = new Map<string, number>()
    const reviewMap = new Map<string, { total: number; count: number }>()
    const skillMap = new Map<string, { id: string; ten: string; loai: string; count: number }>()
    const companySkillMap = new Map<string, Set<string>>()
    const companySkillTypeMap = new Map<string, Set<string>>()
    const approvedCompanyIds = new Set(companies.map(company => company.id))

    jobs.filter(job => job.trangThai === 'dang_mo' && approvedCompanyIds.has(job.maNhaTuyenDung)).forEach(job => {
      jobCount.set(job.maNhaTuyenDung, (jobCount.get(job.maNhaTuyenDung) ?? 0) + 1)
      const companySkills = companySkillMap.get(job.maNhaTuyenDung) ?? new Set<string>()
      const companySkillTypes = companySkillTypeMap.get(job.maNhaTuyenDung) ?? new Set<string>()
      normalizeSkills(job.kyNang).forEach(skill => {
        const { id, ten, loai } = skill
        companySkills.add(id)
        companySkillTypes.add(loai)
        const current = skillMap.get(id)
        skillMap.set(id, { id, ten, loai, count: (current?.count ?? 0) + 1 })
      })
      companySkillMap.set(job.maNhaTuyenDung, companySkills)
      companySkillTypeMap.set(job.maNhaTuyenDung, companySkillTypes)
    })

    reviews.filter(review => review.daDuyet).forEach(review => {
      const current = reviewMap.get(review.maNhaTuyenDung) ?? { total: 0, count: 0 }
      reviewMap.set(review.maNhaTuyenDung, { total: current.total + review.diem, count: current.count + 1 })
    })

    return { jobCount, reviewMap, skillMap, companySkillMap, companySkillTypeMap }
  }, [companies, jobs, reviews])

  const boLocDong = useMemo(() => {
    const quyMoMap = new Map<string, number>()
    const linhVucMap = new Map<string, number>()
    const loaiKyNangMap = new Map<string, number>()

    companies.forEach(company => {
      quyMoMap.set(quyMoKey(company.quyMo), (quyMoMap.get(quyMoKey(company.quyMo)) ?? 0) + 1)
      ;(company.nganh ?? 'Công nghệ thông tin')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .forEach(item => linhVucMap.set(item, (linhVucMap.get(item) ?? 0) + 1))
    })

    stats.skillMap.forEach(skill => {
      loaiKyNangMap.set(skill.loai, (loaiKyNangMap.get(skill.loai) ?? 0) + skill.count)
    })

    return {
      quyMo: [...quyMoMap.entries()].sort((a, b) => ['1-50', '51-150', '151-300', '300+'].indexOf(a[0]) - ['1-50', '51-150', '151-300', '300+'].indexOf(b[0])),
      linhVuc: [...linhVucMap.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi')),
      loaiKyNang: [...loaiKyNangMap.entries()].sort((a, b) => b[1] - a[1]),
      kyNang: [...stats.skillMap.values()].sort((a, b) => b.count - a.count || a.ten.localeCompare(b.ten, 'vi')),
    }
  }, [companies, stats])

  const ketQua = companies.filter(c => {
    const keyword = normalize(tuKhoa)
    const ratingStat = stats.reviewMap.get(c.id)
    const rating = ratingStat ? ratingStat.total / ratingStat.count : 5
    const companySkills = stats.companySkillMap.get(c.id) ?? new Set<string>()
    const companySkillTypes = stats.companySkillTypeMap.get(c.id) ?? new Set<string>()
    const industryText = c.nganh ?? ''

    return (!keyword || normalize(`${c.tenCongTy} ${c.diaChi ?? ''} ${industryText}`).includes(keyword))
      && (!quyMoDangChon.length || quyMoDangChon.includes(quyMoKey(c.quyMo)))
      && (!linhVucDangChon.length || linhVucDangChon.some(item => normalize(industryText).includes(normalize(item))))
      && (!loaiKyNangDangChon.length || loaiKyNangDangChon.some(item => companySkillTypes.has(item)))
      && (!kyNangDangChon.length || kyNangDangChon.every(item => companySkills.has(item)))
      && rating >= danhGiaToiThieu
  }).sort((a, b) => {
    if (sapXep === 'nhieu_viec') return (stats.jobCount.get(b.id) ?? 0) - (stats.jobCount.get(a.id) ?? 0)
    if (sapXep === 'danh_gia') {
      const ar = stats.reviewMap.get(a.id)
      const br = stats.reviewMap.get(b.id)
      return ((br?.total ?? 5) / (br?.count ?? 1)) - ((ar?.total ?? 5) / (ar?.count ?? 1))
    }
    return (stats.jobCount.get(b.id) ?? 0) - (stats.jobCount.get(a.id) ?? 0)
  })

  useEffect(() => {
    setPage(1)
  }, [tuKhoa, quyMoDangChon, linhVucDangChon, loaiKyNangDangChon, kyNangDangChon, danhGiaToiThieu, sapXep])

  const tongTrang = Math.max(1, Math.ceil(ketQua.length / pageSize))
  const pageHienTai = Math.min(page, tongTrang)
  const ketQuaPhanTrang = ketQua.slice((pageHienTai - 1) * pageSize, pageHienTai * pageSize)

  const xoaBoLoc = () => {
    setTuKhoa('')
    setQuyMoDangChon([])
    setLinhVucDangChon([])
    setLoaiKyNangDangChon([])
    setKyNangDangChon([])
    setDanhGiaToiThieu(0)
  }

  const chonGoiY = (item: SuggestionItem) => {
    setTuKhoa(item.queryValue)
    setSearchActive(false)
    if (item.type !== 'company') {
      navigate(`/viec-lam?tuKhoa=${encodeURIComponent(item.queryValue)}`)
    }
  }

  return (
    <main className="app-page jobs-real-page company-real-page">
      <section className={`jobs-real-hero company-real-hero${searchActive ? ' search-focus-active' : ''}`}>
        <img src={congTyCongNgheBg} alt="" />
        <div />
        <article>
          <h1>Khám phá công ty IT bằng dữ liệu thật</h1>
          <p>{dangTai ? 'Đang tải dữ liệu công ty...' : `${ketQua.length} công ty phù hợp từ hệ thống ITJob`}</p>
          <div ref={searchWrapRef} className={`jobs-real-search company-real-search${searchActive ? ' search-shell-active' : ''}`}>
            <label>
              <Search size={18} />
              <input
                type="text"
                placeholder="Tên công ty, lĩnh vực, địa điểm..."
                value={tuKhoa}
                onChange={e => setTuKhoa(e.target.value)}
                onFocus={() => setSearchActive(true)}
              />
            </label>
            <button className="primary-button" onClick={() => setSearchActive(false)}><Search size={17} /> Tìm kiếm</button>
            {searchActive && (
              <SearchSuggestionPanel groups={groups} loading={loading} query={tuKhoa} onSelect={chonGoiY} />
            )}
          </div>
          {searchActive && (loading || hasAny) && (
            <button type="button" className="search-overlay" onClick={() => setSearchActive(false)} aria-label="Đóng gợi ý tìm kiếm" />
          )}
          <div className="jobs-real-tags">
            {boLocDong.linhVuc.slice(0, 8).map(([label]) => (
              <button key={label} onClick={() => setLinhVucDangChon(prev => toggleValue(prev, label))}>{hienThiTiengViet(label)}</button>
            ))}
          </div>
        </article>
      </section>

      <section className="jobs-real-body company-real-body">
        {filterOpen && (
          <button
            className="jobs-filter-backdrop"
            type="button"
            aria-label="Đóng bộ lọc"
            onClick={() => setFilterOpen(false)}
          />
        )}
        <aside className={`jobs-real-filter company-real-filter ${filterOpen ? 'is-mobile-open' : ''}`}>
          <div><SlidersHorizontal size={18} /><strong>Bộ lọc nhanh</strong></div>
          <button className="jobs-mobile-filter-close" type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc">
            <X size={18} />
          </button>
          <section className="jobs-filter-group">
            <h3>Quy mô</h3>
            {boLocDong.quyMo.map(([label, count]) => (
              <button className={quyMoDangChon.includes(label) ? 'active' : ''} key={label} onClick={() => setQuyMoDangChon(prev => toggleValue(prev, label))}>
                <Users size={15} /> <span>{quyMoLabels[label] ?? label}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Lĩnh vực</h3>
            {boLocDong.linhVuc.slice(0, 14).map(([label, count]) => (
              <button className={linhVucDangChon.includes(label) ? 'active' : ''} key={label} onClick={() => setLinhVucDangChon(prev => toggleValue(prev, label))}>
                <Building2 size={15} /> <span>{hienThiTiengViet(label)}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Danh mục kỹ năng</h3>
            {boLocDong.loaiKyNang.map(([label, count]) => (
              <button className={loaiKyNangDangChon.includes(label) ? 'active' : ''} key={label} onClick={() => setLoaiKyNangDangChon(prev => toggleValue(prev, label))}>
                <Filter size={15} /> <span>{nhanLoaiKyNang[label] ?? label}</span><em>{count}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Kỹ năng liên quan</h3>
            {boLocDong.kyNang
              .filter(skill => !loaiKyNangDangChon.length || loaiKyNangDangChon.includes(skill.loai))
              .slice(0, 18)
              .map(skill => (
                <button className={kyNangDangChon.includes(skill.id) ? 'active' : ''} key={skill.id} onClick={() => setKyNangDangChon(prev => toggleValue(prev, skill.id))}>
                  <Filter size={15} /> <span>{skill.ten}</span><em>{skill.count}</em>
                </button>
              ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Đánh giá</h3>
            {[5, 4, 3].map(rate => (
              <button className={danhGiaToiThieu === rate ? 'active' : ''} key={rate} onClick={() => setDanhGiaToiThieu(prev => prev === rate ? 0 : rate)}>
                <Star size={15} /> <span>{rate}+ sao</span>
              </button>
            ))}
          </section>
          <button className="jobs-filter-clear" onClick={xoaBoLoc}>Xóa bộ lọc</button>
          <button className="jobs-filter-apply-mobile" onClick={() => setFilterOpen(false)}>Áp dụng bộ lọc</button>
        </aside>

        <div>
          <div className="result-toolbar">
            <p>{dangTai ? 'Đang tải...' : <>Tìm thấy <strong>{ketQua.length}</strong> công ty</>}</p>
            <button className="jobs-mobile-filter-trigger" type="button" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal size={18} />
              Bộ lọc
            </button>
            <select value={sapXep} onChange={e => setSapXep(e.target.value)}>
              <option value="de_xuat">Đề xuất</option>
              <option value="danh_gia">Đánh giá cao</option>
              <option value="nhieu_viec">Nhiều việc làm</option>
            </select>
          </div>
          {loi && <div className="jobs-real-error">{loi}</div>}
          {ketQua.length > 0 && (
            <Pagination
              page={pageHienTai}
              pageSize={pageSize}
              total={ketQua.length}
              onPageChange={setPage}
              onPageSizeChange={(next) => { setPageSize(next); setPage(1) }}
            />
          )}
          <div className="company-real-grid">
            {ketQuaPhanTrang.map((cty, index) => {
              const reviewStat = stats.reviewMap.get(cty.id)
              const rating = reviewStat ? Math.round((reviewStat.total / reviewStat.count) * 10) / 10 : 5
              const soReview = reviewStat?.count ?? 0
              const soViec = stats.jobCount.get(cty.id) ?? 0
              const hot = ((pageHienTai - 1) * pageSize + index) < 3 || soViec >= 3

              return (
                <article key={cty.id} className={`company-real-card${hot ? ' hot' : ''}`}>
                  {hot && <span className="company-hot-badge"><Zap size={12} /> Hot</span>}
                  <div className="company-real-card-head">
                    <div className="company-real-logo">
                      <img src={imageUrl(cty.logo) || logoDuPhong} alt={cty.tenCongTy} onError={e => { if (e.currentTarget.src !== logoDuPhong) e.currentTarget.src = logoDuPhong }} />
                    </div>
                    <div>
                      <h2>{hienThiTiengViet(cty.tenCongTy)}</h2>
                      <p className="company-rating"><Star size={14} /> <strong>{rating}</strong><span>({soReview} reviews)</span></p>
                      <p className="company-location"><MapPin size={14} /> {hienThiTiengViet(cty.diaChi, 'Đà Nẵng')}</p>
                    </div>
                  </div>
                  <p className="company-desc">{hienThiTiengViet(cty.moTa, 'Công ty chưa cập nhật mô tả.')}</p>
                  <div className="company-tags">
                    {[hienThiTiengViet(cty.nganh, 'Công nghệ thông tin'), cty.trangThaiDuyet === 'da_duyet' ? 'Đã xác thực' : 'Chờ duyệt'].map(label => <span key={label}>{label}</span>)}
                  </div>
                  <div className="company-card-foot">
                    <span><Users size={14} /> {formatQuyMo(cty.quyMo)} nhân viên</span>
                    <Link to={`/cong-ty/${cty.id}`}>{soViec} Việc làm <ArrowRight size={14} /></Link>
                  </div>
                </article>
              )
            })}
          </div>
          {ketQua.length > pageSize && (
            <Pagination
              page={pageHienTai}
              pageSize={pageSize}
              total={ketQua.length}
              onPageChange={setPage}
              onPageSizeChange={(next) => { setPageSize(next); setPage(1) }}
            />
          )}
        </div>
      </section>
    </main>
  )
}
