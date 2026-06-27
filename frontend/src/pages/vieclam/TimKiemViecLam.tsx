import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bookmark, Briefcase, Clock, DollarSign, Filter, MapPin, MessageCircle, Search, Send, Sparkles, SlidersHorizontal, X } from 'lucide-react'
import timJobBg from '../../assets/timjob.png'
import Pagination from '../../components/Pagination'
import SearchSuggestionPanel from '../../components/search/SearchSuggestionPanel'
import { type SuggestionItem, useSearchSuggestions } from '../../components/search/useSearchSuggestions'
import { apiCoXacThuc, duongDanTheoVaiTro, layNguoiDung } from '../../lib/auth'
import { API_URL, taoUrlTaiNguyen } from '../../lib/env'
import { isPublicJobVisible } from '../../lib/jobVisibility'
import { formatJobDate, formatJobDateLine, formatJobDeadlineState } from '../../lib/jobPresentation'
import { normalizeSkills } from '../../lib/skillDisplay'
import { toast } from '../../lib/toast'

type ViecLamItem = {
  id: string; tieuDe: string; congTy: string; logo: string; anhDaiDien?: string
  diaDiem: string; luong: string; loai: string; capBac: string
  kyNang: Array<{ id: string; ten: string; loai: string }>
  moTa: string; yeuCau: string
  ngayDangRaw?: string; hanNopRaw?: string
  ngayDang: string; hanNop: string; hanNopConLai: string; featured: boolean
}

type BoLocFacet = {
  loaiKyNang: Array<{ loai: string; soLuong: number }>
  kyNang: Array<{ id: string; ten: string; loai: string; soLuong: number }>
  capBac: Array<{ capBac: string; soLuong: number }>
  loaiHinh: Array<{ loaiHinh: string; soLuong: number }>
}

const nhanLoaiKyNang: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', database: 'Database',
  devops: 'DevOps & Cloud', mobile: 'Mobile', du_lieu: 'Data & AI',
  kiem_thu: 'Testing / QA', testing: 'Testing / QA', thiet_ke: 'Design',
  phan_tich: 'Business Analyst', quan_ly: 'Product / Management',
  ngon_ngu: 'Ngôn ngữ', ky_nang_mem: 'Kỹ năng mềm',
}

function formatLuong(min?: number, max?: number) {
  if (!min && !max) return 'Thỏa thuận'
  return `${min?.toLocaleString('vi-VN') ?? '?'} - ${max?.toLocaleString('vi-VN') ?? '?'} VND`
}

function docSoTrang(v: string | null, d: number) {
  const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.floor(n) : d
}

function toggleArr(list: string[], v: string) {
  return list.includes(v) ? list.filter(i => i !== v) : [...list, v]
}

export default function TimKiemViecLam() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tuKhoaUrl = searchParams.get('tuKhoa') ?? ''
  const trangUrl = docSoTrang(searchParams.get('trang'), 1)
  const kichThuocTrangUrl = docSoTrang(searchParams.get('kichThuocTrang'), 12)
  const loaiKyNangUrl = searchParams.getAll('loai')
  const kyNangUrl = searchParams.getAll('kyNang')
  const capBacUrl = searchParams.getAll('capBac')
  const loaiHinhUrl = searchParams.getAll('loaiHinh')

  const [tuKhoa, setTuKhoa] = useState(tuKhoaUrl)
  const [viecLam, setViecLam] = useState<ViecLamItem[]>([])
  const [boLocFacet, setBoLocFacet] = useState<BoLocFacet>({ loaiKyNang: [], kyNang: [], capBac: [], loaiHinh: [] })
  const [tongSo, setTongSo] = useState(0)
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [searchActive, setSearchActive] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [chiViecDaLuu, setChiViecDaLuu] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const nguoiDungHienTai = layNguoiDung()
  const laUngVien = nguoiDungHienTai?.vaiTro === 'ung_vien'
  const { groups, loading, hasAny } = useSearchSuggestions({ query: tuKhoa, active: searchActive, apiUrl: API_URL })

  useEffect(() => { setTuKhoa(searchParams.get('tuKhoa') ?? '') }, [searchParams])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearchActive(false); setFilterOpen(false) } }
    const onDown = (e: MouseEvent) => { if (!searchWrapRef.current?.contains(e.target as Node)) setSearchActive(false) }
    window.addEventListener('keydown', onKey); window.addEventListener('mousedown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = searchActive || filterOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [searchActive, filterOpen])

  useEffect(() => {
    let active = true
    setDangTai(true); setLoi('')
    const params = new URLSearchParams()
    if (tuKhoaUrl) params.set('tuKhoa', tuKhoaUrl)
    params.set('trang', String(trangUrl))
    params.set('kichThuocTrang', String(kichThuocTrangUrl))
    loaiKyNangUrl.forEach(v => params.append('loai', v))
    kyNangUrl.forEach(v => params.append('kyNang', v))
    capBacUrl.forEach(v => params.append('capBac', v))
    loaiHinhUrl.forEach(v => params.append('loaiHinh', v))
    fetch(`${API_URL}/tintuyendung?${params.toString()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!active) return
        const items = (data.duLieu ?? []).filter((job: any) => isPublicJobVisible(job)).map((job: any, i: number) => ({
          id: job.id, tieuDe: job.tieuDe,
          congTy: job.nhaTuyenDung?.tenCongTy ?? 'Nhà tuyển dụng',
          logo: taoUrlTaiNguyen(job.nhaTuyenDung?.logo) || 'https://placehold.co/80x80/eaf2ff/2563eb?text=IT',
          anhDaiDien: job.anhDaiDien, diaDiem: job.diaChi ?? 'Đà Nẵng',
          luong: formatLuong(job.luongMin, job.luongMax),
          loai: job.loaiHinh ?? 'toan_thoi_gian', capBac: job.capBac ?? 'junior',
          kyNang: normalizeSkills(job.kyNang).slice(0, 8),
          moTa: job.moTa ?? '', yeuCau: job.yeuCau ?? '',
          ngayDangRaw: job.ngayDang, hanNopRaw: job.hanNop,
          ngayDang: formatJobDate(job.ngayDang), hanNop: formatJobDate(job.hanNop),
          hanNopConLai: formatJobDeadlineState(job.hanNop), featured: i < 3,
        }))
        setViecLam(items); setTongSo(data.tongSo ?? items.length)
        if (data.boLocFacet) setBoLocFacet(data.boLocFacet)
        setDangTai(false)
      })
      .catch(() => { if (!active) return; setLoi('Không tải được dữ liệu.'); setDangTai(false) })
    return () => { active = false }
  }, [tuKhoaUrl, trangUrl, kichThuocTrangUrl, loaiKyNangUrl.join(','), kyNangUrl.join(','), capBacUrl.join(','), loaiHinhUrl.join(',')])

  useEffect(() => {
    if (layNguoiDung()?.vaiTro !== 'ung_vien') return
    apiCoXacThuc('/viec-lam-da-luu').then((items: any[]) => setSavedIds((items ?? []).map((i: any) => i.maTinTuyenDung).filter(Boolean))).catch(() => undefined)
  }, [])

  const submitSearch = () => {
    setSearchActive(false)
    const p = new URLSearchParams()
    if (tuKhoa.trim()) p.set('tuKhoa', tuKhoa.trim())
    p.set('trang', '1'); p.set('kichThuocTrang', String(kichThuocTrangUrl))
    loaiKyNangUrl.forEach(v => p.append('loai', v)); kyNangUrl.forEach(v => p.append('kyNang', v))
    capBacUrl.forEach(v => p.append('capBac', v)); loaiHinhUrl.forEach(v => p.append('loaiHinh', v))
    setSearchParams(p)
  }

  const chonGoiY = (item: SuggestionItem) => {
    setTuKhoa(item.queryValue); setSearchActive(false)
    if (item.href) { navigate(item.href); return }
    navigate(`/viec-lam?tuKhoa=${encodeURIComponent(item.queryValue)}`)
  }

  const toggleFilter = (key: 'loai' | 'kyNang' | 'capBac' | 'loaiHinh', value: string) => {
    const next = toggleArr(searchParams.getAll(key), value)
    const p = new URLSearchParams(searchParams); p.delete(key); next.forEach(v => p.append(key, v)); p.set('trang', '1'); setSearchParams(p)
  }

  const resetBoLoc = () => { const p = new URLSearchParams(); if (tuKhoaUrl) p.set('tuKhoa', tuKhoaUrl); p.set('kichThuocTrang', String(kichThuocTrangUrl)); setSearchParams(p) }
  const changePage = (page: number) => { const p = new URLSearchParams(searchParams); p.set('trang', String(page)); setSearchParams(p) }
  const changePageSize = (size: number) => { const p = new URLSearchParams(searchParams); p.set('kichThuocTrang', String(size)); p.set('trang', '1'); setSearchParams(p) }

  const askAi = async () => {
    const cauHoi = aiQuestion.trim(); if (!cauHoi) return
    setAiBusy(true); setAiAnswer('')
    try {
      const res = await fetch(`${API_URL}/ai/chatbot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cauHoi }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.thongBao ?? 'Không hỏi được AI')
      setAiAnswer(data.duLieu?.traLoi ?? '')
    } catch (err) { setAiAnswer(err instanceof Error ? err.message : 'Không hỏi được AI') }
    finally { setAiBusy(false) }
  }

  const toggleSave = async (id: string) => {
    const nd = layNguoiDung()
    if (!nd) { toast.info('Bạn cần đăng nhập.'); navigate(`/dang-nhap?redirect=${encodeURIComponent('/viec-lam')}`); return }
    if (nd.vaiTro !== 'ung_vien') { toast.warning('Chỉ ứng viên mới lưu được.'); navigate(duongDanTheoVaiTro[nd.vaiTro]); return }
    const isSaved = savedIds.includes(id)
    setSavedIds(isSaved ? savedIds.filter(i => i !== id) : [...savedIds, id])
    try { await apiCoXacThuc(`/viec-lam-da-luu/${id}`, { method: isSaved ? 'DELETE' : 'POST' }); toast.success(isSaved ? 'Đã bỏ lưu.' : 'Đã lưu.') }
    catch { setSavedIds(savedIds); toast.error('Không lưu được.') }
  }

  const danhSachHienThi = chiViecDaLuu ? viecLam.filter(j => savedIds.includes(j.id)) : viecLam
  const coBoLoc = loaiKyNangUrl.length + kyNangUrl.length + capBacUrl.length + loaiHinhUrl.length
  const goiYKyNang = boLocFacet.kyNang.slice(0, 12)

  return (
    <main className="app-page jobs-real-page">
      <section className={`jobs-real-hero${searchActive ? ' search-focus-active' : ''}`}>
        <img src={timJobBg} alt="" /><div />
        <article>
          <h1>Tìm việc IT bằng dữ liệu tuyển dụng thật</h1>
          <p>{dangTai ? 'Đang tải dữ liệu...' : `${tongSo} việc làm phù hợp từ hệ thống ITJob`}</p>
          <div ref={searchWrapRef} className={`jobs-real-search${searchActive ? ' search-shell-active' : ''}`}>
            <label>
              <Search size={18} />
              <input value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} onFocus={() => setSearchActive(true)}
                onKeyDown={e => { if (e.key === 'Enter') submitSearch() }} placeholder="Chức danh, kỹ năng, công ty..." />
              {tuKhoa && (
                <button type="button" className="search-clear-button" aria-label="Xóa từ khóa" onClick={() => { setTuKhoa(''); setSearchActive(false); const p = new URLSearchParams(searchParams); p.delete('tuKhoa'); p.set('trang','1'); setSearchParams(p) }}>
                  <X size={16} />
                </button>
              )}
            </label>
            <button className="primary-button" onClick={submitSearch}><Search size={17} /> Tìm việc</button>
            {searchActive && <SearchSuggestionPanel groups={groups} loading={loading} query={tuKhoa} onSelect={chonGoiY} onClearQuery={() => setTuKhoa('')} />}
          </div>
          {searchActive && (loading || hasAny) && <button type="button" className="search-overlay" onClick={() => setSearchActive(false)} aria-label="Đóng gợi ý" />}
          <div className="jobs-real-tags">
            {goiYKyNang.map(skill => (
              <button key={skill.id} className={kyNangUrl.includes(skill.id) ? 'active' : ''} onClick={() => toggleFilter('kyNang', skill.id)}>{skill.ten}</button>
            ))}
          </div>
        </article>
      </section>

      <section className="jobs-real-body">
        {filterOpen && <button className="jobs-filter-backdrop" type="button" aria-label="Đóng bộ lọc" onClick={() => setFilterOpen(false)} />}
        <aside className={`jobs-real-filter ${filterOpen ? 'is-mobile-open' : ''}`}>
          <div className="jobs-mobile-filter-head">
            <span><SlidersHorizontal size={18} /><strong>Bộ lọc nhanh</strong></span>
            <button type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc"><X size={18} /></button>
          </div>
          <section className="jobs-filter-group">
            <h3>Danh mục kỹ năng</h3>
            {boLocFacet.loaiKyNang.map(({ loai, soLuong }) => (
              <button key={loai} className={loaiKyNangUrl.includes(loai) ? 'active' : ''} onClick={() => toggleFilter('loai', loai)}>
                <Filter size={15} /> <span>{nhanLoaiKyNang[loai] ?? loai}</span><em>{soLuong}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Kỹ năng liên quan</h3>
            {boLocFacet.kyNang.filter(s => !loaiKyNangUrl.length || loaiKyNangUrl.includes(s.loai)).slice(0, 18).map(skill => (
              <button key={skill.id} className={kyNangUrl.includes(skill.id) ? 'active' : ''} onClick={() => toggleFilter('kyNang', skill.id)}>
                <Filter size={15} /> <span>{skill.ten}</span><em>{skill.soLuong}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group two-col">
            <h3>Cấp bậc</h3>
            {boLocFacet.capBac.map(({ capBac, soLuong }) => (
              <button key={capBac} className={capBacUrl.includes(capBac) ? 'active' : ''} onClick={() => toggleFilter('capBac', capBac)}>
                <span>{capBac}</span><em>{soLuong}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3>Hình thức</h3>
            {boLocFacet.loaiHinh.map(({ loaiHinh, soLuong }) => (
              <button key={loaiHinh} className={loaiHinhUrl.includes(loaiHinh) ? 'active' : ''} onClick={() => toggleFilter('loaiHinh', loaiHinh)}>
                <Briefcase size={15} /> <span>{loaiHinh}</span><em>{soLuong}</em>
              </button>
            ))}
          </section>
          <section className="jobs-filter-group">
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><MessageCircle size={15} /> Trợ lý AI</h3>
            <textarea value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} rows={4} placeholder="Hỏi AI: tìm việc frontend ở Đà Nẵng..." style={{ width:'100%', borderRadius:10, border:'1px solid #dbe4f0', padding:10, fontSize:13, resize:'vertical' }} />
            <button className="primary-button" style={{ width:'100%', marginTop:8 }} onClick={() => void askAi()} disabled={aiBusy}>
              {aiBusy ? <Sparkles size={17} /> : <Send size={17} />} {aiBusy ? 'Đang trả lời...' : 'Hỏi AI'}
            </button>
            {aiAnswer && <div style={{ marginTop:10, borderRadius:12, border:'1px solid #dbe4f0', background:'#f8fbff', padding:12, fontSize:13, lineHeight:1.7, color:'#0f172a', whiteSpace:'pre-line' }}>{aiAnswer}</div>}
          </section>
          <button className="jobs-filter-clear" onClick={resetBoLoc}>Xóa bộ lọc</button>
          <button className="jobs-filter-apply-mobile" onClick={() => setFilterOpen(false)}>Áp dụng bộ lọc</button>
        </aside>

        <div className="jobs-real-list">
          <div className="jobs-real-heading">
            <div>
              <h2>{dangTai ? 'Đang tải việc làm' : `Tìm thấy ${tongSo} việc làm`}</h2>
              <p>Bộ lọc từ dữ liệu thật — chọn danh mục, kỹ năng, cấp bậc để lọc chính xác.</p>
            </div>
            <div className="jobs-real-heading-actions">
              {laUngVien && (
                <>
                  <button type="button" className={`jobs-saved-toggle${chiViecDaLuu ? ' active' : ''}`} aria-pressed={chiViecDaLuu} onClick={() => setChiViecDaLuu(p => !p)}>
                    <Bookmark size={16} fill={chiViecDaLuu ? '#2563eb' : 'none'} />
                    Việc đã lưu{savedIds.length ? ` (${savedIds.length})` : ''}
                  </button>
                  <Link to="/ung-vien/viec-da-luu" className="jobs-saved-link">Mở trang quản lý</Link>
                </>
              )}
              <button className="jobs-mobile-filter-trigger" type="button" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal size={18} /> Bộ lọc {coBoLoc > 0 ? `(${coBoLoc})` : ''}
              </button>
            </div>
          </div>

          {coBoLoc > 0 && (
            <div className="filter-summary">
              <div className="filter-summary-head">
                <strong>Bộ lọc đang chọn</strong>
                <button type="button" className="filter-summary-clear" onClick={resetBoLoc}>Xóa nhanh</button>
              </div>
              <div className="filter-summary-chips">
                {loaiKyNangUrl.map(v => <button key={`loai-${v}`} type="button" className="filter-summary-chip" onClick={() => toggleFilter('loai', v)}><span>Danh mục: {nhanLoaiKyNang[v] ?? v}</span><X size={14} /></button>)}
                {kyNangUrl.map(v => <button key={`ky-${v}`} type="button" className="filter-summary-chip" onClick={() => toggleFilter('kyNang', v)}><span>Kỹ năng: {boLocFacet.kyNang.find(k => k.id === v)?.ten ?? v}</span><X size={14} /></button>)}
                {capBacUrl.map(v => <button key={`cb-${v}`} type="button" className="filter-summary-chip" onClick={() => toggleFilter('capBac', v)}><span>Cấp bậc: {v}</span><X size={14} /></button>)}
                {loaiHinhUrl.map(v => <button key={`lh-${v}`} type="button" className="filter-summary-chip" onClick={() => toggleFilter('loaiHinh', v)}><span>Hình thức: {v}</span><X size={14} /></button>)}
              </div>
            </div>
          )}

          {loi && <div className="jobs-real-error">{loi}</div>}
          {!dangTai && danhSachHienThi.length === 0 && (
            chiViecDaLuu
              ? <div className="jobs-real-empty">Không có việc đã lưu trong bộ lọc hiện tại.</div>
              : <div className="jobs-real-empty">Không có việc làm phù hợp bộ lọc hiện tại.</div>
          )}

          {tongSo > 0 && <Pagination page={trangUrl} pageSize={kichThuocTrangUrl} total={tongSo} onPageChange={changePage} onPageSizeChange={changePageSize} />}

          {danhSachHienThi.map(job => {
            const isSaved = savedIds.includes(job.id)
            return (
              <article className="jobs-real-card" key={job.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/viec-lam/${job.id}`)}>
                <img src={job.anhDaiDien || job.logo} alt={job.congTy} />
                <div>
                  <div className="jobs-real-title">
                    <span>{job.tieuDe}</span>
                    {job.featured && <span className="badge-featured">FEATURED</span>}
                  </div>
                  <strong>{job.congTy}</strong>
                  <p><MapPin size={14} /> {job.diaDiem}</p>
                  <p><DollarSign size={14} /> {job.luong}</p>
                  <p><Briefcase size={14} /> {job.loai} · {job.capBac}</p>
                  <p><Clock size={14} /> {formatJobDateLine(job.ngayDangRaw, job.hanNopRaw)}</p>
                  <div className="jobs-real-skills">{job.kyNang.map(s => <span key={s.id}>{s.ten}</span>)}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); void toggleSave(job.id) }} title={isSaved ? 'Bỏ lưu' : 'Lưu việc'}>
                  <Bookmark size={21} fill={isSaved ? '#2563eb' : 'none'} color={isSaved ? '#2563eb' : '#94a3b8'} />
                </button>
              </article>
            )
          })}

          {tongSo > kichThuocTrangUrl && <Pagination page={trangUrl} pageSize={kichThuocTrangUrl} total={tongSo} onPageChange={changePage} onPageSizeChange={changePageSize} />}
        </div>
      </section>
    </main>
  )
}
