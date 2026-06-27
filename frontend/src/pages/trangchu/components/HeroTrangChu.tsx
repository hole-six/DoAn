import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import effortBg from '../../../assets/EffortBackground.png'
import { API_URL } from '../../../lib/env'
import { thongDiepChayNgang } from '../../../data/trangChuData'
import SearchSuggestionPanel from '../../../components/search/SearchSuggestionPanel'
import { useSearchSuggestions, type SuggestionItem } from '../../../components/search/useSearchSuggestions'

export function HeroTrangChu() {
  const [tuKhoa, setTuKhoa] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { groups, loading, hasAny } = useSearchSuggestions({
    query: tuKhoa,
    active: searchActive,
    apiUrl: API_URL,
  })

  const timKiem = () => {
    const params = new URLSearchParams()
    if (tuKhoa.trim()) params.set('tuKhoa', tuKhoa.trim())
    setSearchActive(false)
    navigate(`/viec-lam${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const chonGoiY = (item: SuggestionItem) => {
    setTuKhoa(item.queryValue)
    setSearchActive(false)
    if (item.href) {
      navigate(item.href)
      return
    }
    navigate(`/viec-lam?tuKhoa=${encodeURIComponent(item.queryValue)}`)
  }

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

  return (
    <section className="trangchu-hero">
      <img
        src={effortBg}
        alt=""
        className="trangchu-hero-nen"
        aria-hidden="true"
      />
      {searchActive && (loading || hasAny) && (
        <button
          type="button"
          className="search-overlay"
          onClick={() => setSearchActive(false)}
          aria-label="Đóng gợi ý tìm kiếm"
        />
      )}

      <div className={`trangchu-hero-noidung${searchActive ? ' search-focus-active' : ''}`}>
        <p className="eyebrow">Nền tảng tuyển dụng CNTT</p>
        <h1>Tìm việc chất IT Đà Nẵng</h1>

        <div ref={searchWrapRef} className={`trangchu-khop-timkiem${searchActive ? ' search-shell-active' : ''}`}>
          <label className="trangchu-search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tên vị trí, công ty, kỹ năng..."
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
              onFocus={() => setSearchActive(true)}
              onKeyDown={e => { if (e.key === 'Enter') timKiem() }}
            />
            {tuKhoa && (
              <button
                type="button"
                className="search-clear-button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setTuKhoa('')}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <button className="primary-button large" onClick={timKiem}>
            <Search size={18} />
            Tìm kiếm
          </button>
          {searchActive && (
            <SearchSuggestionPanel
              groups={groups}
              loading={loading}
              query={tuKhoa}
              onSelect={chonGoiY}
              onClearQuery={() => setTuKhoa('')}
            />
          )}
        </div>

        <div className="trangchu-goiy">
          <span>Kỹ năng nổi bật:</span>
          {['React', 'Node.js', 'TypeScript', 'Java', 'DevOps', 'Data Engineer'].map(kn => (
            <button key={kn} onClick={() => navigate(`/viec-lam?tuKhoa=${encodeURIComponent(kn)}`)}>{kn}</button>
          ))}
        </div>

        <div className="bang-chay-thong-bao">
          <span className="bang-chay-icon">HOT</span>
          <div className="bang-chay-cua-so">
            <div className="bang-chay-duong">
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
              <span className="bang-chay-muc">{thongDiepChayNgang}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
