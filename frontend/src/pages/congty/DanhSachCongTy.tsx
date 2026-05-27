import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Users, ArrowRight, Zap, SlidersHorizontal, ChevronDown, Filter, MapPin } from 'lucide-react'
import congTyCongNgheBg from '../../assets/CongTyCongNGhe.png'

const danhSachCongTy = [
  { id: 1, ten: 'KMS Technology', diaDiem: 'Đà Nẵng', logo: 'https://logo.clearbit.com/kms-technology.com', danhGia: 4.8, soReview: 120, moTa: 'Công ty dịch vụ phần mềm 100% vốn đầu tư Mỹ, chuyên cung cấp dịch vụ phát triển phần mềm và tư vấn giải pháp công nghệ.', linh: ['Outsourcing', 'Product'], quyMo: '1,000+', soViec: 12, hot: false },
  { id: 2, ten: 'FPT Software Da Nang', diaDiem: 'Đà Nẵng', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png', danhGia: 4.5, soReview: 500, moTa: 'Công ty phần mềm lớn nhất Việt Nam, cung cấp dịch vụ CNTT cho các tập đoàn lớn trên toàn cầu.', linh: ['Outsourcing', 'AI/IoT'], quyMo: '3,000+', soViec: 45, hot: false },
  { id: 3, ten: 'Axon Active', diaDiem: 'Đà Nẵng', logo: 'https://logo.clearbit.com/axonactive.com', danhGia: 4.9, soReview: 85, moTa: 'Tiên phong về Agile Offshore Development tại Việt Nam, môi trường làm việc chuẩn Thụy Sĩ.', linh: ['Agile', 'Outsourcing'], quyMo: '500+', soViec: 8, hot: true },
  { id: 4, ten: 'Enouvo IT Solutions', diaDiem: 'Đà Nẵng', logo: 'https://logo.clearbit.com/enouvo.com', danhGia: 4.7, soReview: 42, moTa: 'Cung cấp giải pháp phần mềm sáng tạo và không gian làm việc chung (coworking space) hàng đầu.', linh: ['Product', 'Mobile Dev'], quyMo: '100-300', soViec: 5, hot: false },
  { id: 5, ten: 'Mgm Technology Partners', diaDiem: 'Đà Nẵng', logo: 'https://logo.clearbit.com/mgm-tp.com', danhGia: 4.6, soReview: 60, moTa: 'Chuyên phát triển các ứng dụng web phức tạp và có tính mở rộng cao cho các khách hàng lớn ở Đức.', linh: ['Outsourcing', 'Java'], quyMo: '300+', soViec: 3, hot: false },
  { id: 6, ten: 'VNG Corporation', diaDiem: 'TP. Hồ Chí Minh', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/VNG_Corporation_logo.svg/200px-VNG_Corporation_logo.svg.png', danhGia: 4.4, soReview: 200, moTa: 'Tập đoàn công nghệ hàng đầu Việt Nam, chủ sở hữu Zalo, ZaloPay và nhiều sản phẩm internet lớn.', linh: ['Internet', 'Gaming'], quyMo: '5,000+', soViec: 87, hot: true },
]

const logoDuPhong = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80'

export default function DanhSachCongTy() {
  const [tuKhoa, setTuKhoa] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quyMo: true, linhVuc: true, danhGia: false,
  })
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const ketQua = danhSachCongTy.filter(c =>
    c.ten.toLowerCase().includes(tuKhoa.toLowerCase())
  )

  return (
    <main className="app-page" style={{ paddingTop: 0, background: '#ffffff' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        color: '#ffffff',
        minHeight: 360,
        padding: '58px max(24px, calc((100vw - 1280px)/2)) 52px',
        borderBottom: '1px solid #e5e7eb',
        backgroundImage: `linear-gradient(90deg, rgba(7, 18, 34, 0.82), rgba(7, 18, 34, 0.58), rgba(7, 18, 34, 0.20)), url(${congTyCongNgheBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: 720 }}>
          <p className="eyebrow" style={{ color: '#bfdbfe' }}>Khám phá</p>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            Top IT Companies
          </h1>
          <p style={{ color: '#e5edf8', fontSize: 18, marginBottom: 28, maxWidth: 620 }}>
            Khám phá {danhSachCongTy.length}+ công ty công nghệ hàng đầu tại Đà Nẵng và Việt Nam
          </p>
          <div style={{
            display: 'flex',
            gap: 10,
            maxWidth: 680,
            background: '#ffffff',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 18px 40px rgba(2, 6, 23, 0.28)',
          }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', border: '1px solid #d8dde6', borderRadius: 6, padding: '0 14px', minHeight: 46 }}>
              <Search size={18} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Tìm kiếm công ty..."
                value={tuKhoa}
                onChange={e => setTuKhoa(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0b1c30', width: '100%', fontSize: 15 }}
              />
            </label>
            <button className="primary-button" style={{ background: '#0058be', minWidth: 126, borderRadius: 6 }}>Tìm kiếm</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '272px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Filter */}
        <aside style={{
          background: '#ffffff',
          borderRadius: 6,
          border: '1px solid #dfe3ea',
          overflow: 'hidden',
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            background: '#0b1c30',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: '#ffffff' }}>
              <SlidersHorizontal size={14} color="rgba(255,255,255,0.80)" />
              Bộ lọc
            </div>
            <button style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 10.5, color: 'rgba(255,255,255,0.80)', fontWeight: 600,
              padding: '3px 8px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Xóa tất cả
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {[
              { key: 'quyMo', label: 'QUY MÔ', items: ['1–50', '51–150', '151–300', '300+'] },
              { key: 'linhVuc', label: 'LĨNH VỰC', items: ['Outsourcing', 'Product', 'Fintech', 'E-commerce', 'AI/ML', 'Gaming'] },
              { key: 'danhGia', label: 'ĐÁNH GIÁ', items: ['5 sao', '4+ sao', '3+ sao'] },
            ].map(section => (
              <div key={section.key} style={{ borderBottom: '1px solid #e8eaf0' }}>
                <button
                  onClick={() => toggleSection(section.key)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '10px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em' }}>
                    {section.label}
                  </span>
                  <ChevronDown
                    size={13}
                    color="#94a3b8"
                    style={{
                      transform: openSections[section.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                {openSections[section.key] && (
                  <div style={{
                    padding: '0 16px 12px',
                    display: 'grid',
                    gridTemplateColumns: section.items.length > 4 ? '1fr 1fr' : '1fr',
                    gap: '4px 8px',
                  }}>
                    {section.items.map(item => (
                      <label
                        key={item}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '4px 6px', cursor: 'pointer',
                          fontSize: 12.5,
                          color: hoveredFilter === `${section.key}-${item}` ? '#0058be' : '#45464d',
                          borderRadius: 4,
                          background: hoveredFilter === `${section.key}-${item}` ? '#eff4ff' : 'transparent',
                          transition: 'all 0.12s',
                          lineHeight: 1.4,
                          fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                        onMouseEnter={() => setHoveredFilter(`${section.key}-${item}`)}
                        onMouseLeave={() => setHoveredFilter(null)}
                      >
                        <input
                          type="checkbox"
                          style={{
                            width: 14, height: 14, accentColor: '#0058be',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 12.5, lineHeight: 1.3 }}>{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Apply button */}
          <div style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid #e8eaf0',
            background: '#fff',
            flexShrink: 0,
          }}>
            <button style={{
              width: '100%',
              background: '#0058be',
              color: '#ffffff', border: 'none', cursor: 'pointer',
              borderRadius: 6, padding: '10px 0',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2170e4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0058be')}
            >
              <Filter size={13} /> Áp dụng
            </button>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="result-toolbar">
            <p>Tìm thấy <strong>{ketQua.length}</strong> công ty</p>
            <select style={{ border: 'none', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              <option>Đề xuất</option>
              <option>Đánh giá cao</option>
              <option>Nhiều việc làm</option>
            </select>
          </div>

          <div className="company-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {ketQua.map(cty => (
              <div key={cty.id} className="company-card" style={{ position: 'relative', overflow: 'hidden', padding: 22, display: 'flex', flexDirection: 'column', border: cty.hot ? '1px solid rgba(0,88,190,0.28)' : '1px solid #dfe3ea', borderRadius: 8, background: '#ffffff', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }}>
                {/* Accent top line on hover */}
                {cty.hot && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,88,190,0.08)', color: 'var(--secondary)', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={11} /> Hot
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div className="logo-box" style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 6, border: '1px solid #e1e5ec', background: '#f8fafc', overflow: 'hidden' }}>
                    <img
                      src={cty.logo}
                      alt={cty.ten}
                      onError={e => {
                        const img = e.currentTarget
                        if (img.src !== logoDuPhong) img.src = logoDuPhong
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', padding: 0, display: 'block' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{cty.ten}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{cty.danhGia}</span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: 12 }}>({cty.soReview}+ reviews)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#667085', fontSize: 12.5, marginTop: 6 }}>
                      <MapPin size={13} /> {cty.diaDiem}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  {cty.moTa}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {cty.linh.map(l => (
                    <span key={l} style={{ background: '#f4f6f9', border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>{l}</span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(198,198,205,0.5)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: 13 }}>
                    <Users size={14} /> {cty.quyMo} nhân viên
                  </div>
                  <Link to={`/cong-ty/${cty.id}`} style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {cty.soViec} Việc làm <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
