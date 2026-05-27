import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react'

const baiViet = [
  { id: 1, tieuDe: 'Báo Cáo Lương IT Đà Nẵng 2024: Nhu Cầu Tăng Vọt Chuyển Đổi Số', tomTat: 'Theo báo cáo mới nhất, mức lương trung bình của Software Engineer tại Đà Nẵng đã tăng 15% so với năm trước.', chuyenMuc: 'Thị trường', ngay: '24/10/2024', thoiGianDoc: '5 phút', luotXem: '15K', anhBia: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', noiBat: true },
  { id: 2, tieuDe: 'Làm Thế Nào Để Trở Thành Senior React Developer Trong 2 Năm?', tomTat: 'Lộ trình chi tiết và những framework bạn cần nắm vững để bứt phá sự nghiệp Frontend.', chuyenMuc: 'Kỹ năng', ngay: '20/10/2024', thoiGianDoc: '8 phút', luotXem: '12K', anhBia: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', noiBat: false },
  { id: 3, tieuDe: 'Văn Hóa Làm Việc Remote Tại Các Tech Hub Đà Nẵng', tomTat: 'Phân tích ưu nhược điểm và cách các công ty công nghệ hàng đầu duy trì hiệu suất khi nhân viên làm việc từ xa.', chuyenMuc: 'Công sở', ngay: '18/10/2024', thoiGianDoc: '6 phút', luotXem: '9.5K', anhBia: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', noiBat: false },
  { id: 4, tieuDe: 'AI & Machine Learning Sẽ Thay Đổi Cách Tuyển Dụng IT?', tomTat: 'Trí tuệ nhân tạo đang giúp các nhà tuyển dụng tối ưu hóa quy trình lọc CV và đánh giá ứng viên hiệu quả hơn.', chuyenMuc: 'Công nghệ', ngay: '15/10/2024', thoiGianDoc: '7 phút', luotXem: '8K', anhBia: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80', noiBat: false },
]

const chuyenMuc = ['Tất cả', 'Thị trường', 'Kỹ năng', 'Công sở', 'Công nghệ', 'Đầu tư']

export default function Blog() {
  const [chuyenMucChon, setChuyenMucChon] = useState('Tất cả')
  const [tuKhoa, setTuKhoa] = useState('')

  const ketQua = baiViet.filter(b =>
    (chuyenMucChon === 'Tất cả' || b.chuyenMuc === chuyenMucChon) &&
    b.tieuDe.toLowerCase().includes(tuKhoa.toLowerCase())
  )

  const noiBat = ketQua.find(b => b.noiBat)
  const conLai = ketQua.filter(b => !b.noiBat)

  return (
    <main className="app-page" style={{ paddingTop: 0 }}>
      {/* Header */}
      <div style={{ background: 'var(--primary-container)', color: '#fff', padding: '56px max(24px, calc((100vw - 1280px)/2)) 48px' }}>
        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>IT Market Insights</h1>
        <p style={{ color: '#dbeafe', fontSize: 18, maxWidth: 600 }}>
          Phân tích chuyên sâu, xu hướng công nghệ và tin tức thị trường tuyển dụng IT tại Đà Nẵng.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        {/* Main */}
        <div>
          {/* Featured */}
          {noiBat && (
            <Link to={`/blog/${noiBat.id}`} style={{ display: 'block', marginBottom: 32 }}>
              <article className="featured-article" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(198,198,205,0.5)', boxShadow: '0 10px 40px rgba(0,88,190,0.06)' }}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={noiBat.anhBia} alt={noiBat.tieuDe} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 300 }} />
                  <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--secondary)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {noiBat.chuyenMuc}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} />{noiBat.ngay}</span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{noiBat.thoiGianDoc}</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>{noiBat.tieuDe}</h2>
                  <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: 20 }}>{noiBat.tomTat}</p>
                  <span style={{ color: 'var(--secondary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Đọc tiếp <ArrowRight size={16} />
                  </span>
                </div>
              </article>
            </Link>
          )}

          {/* Grid */}
          <div className="article-grid">
            {conLai.map(b => (
              <Link to={`/blog/${b.id}`} key={b.id}>
                <article className="article-card">
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={b.anhBia} alt={b.tieuDe} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                    <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--surface-container-high)', color: 'var(--secondary)', fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
                      {b.chuyenMuc}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, color: 'var(--on-surface-variant)', fontSize: 12, marginBottom: 8 }}>
                      <span>{b.ngay}</span> · <span>{b.thoiGianDoc}</span>
                    </div>
                    <h3>{b.tieuDe}</h3>
                    <p>{b.tomTat}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {[1, 2, 3].map(p => (
              <button key={p} className={p === 1 ? 'primary-button' : 'secondary-button'} style={{ minWidth: 40, minHeight: 40, padding: '0 12px' }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'grid', gap: 24, position: 'sticky', top: 100 }}>
          {/* Search */}
          <div className="side-card">
            <h3 style={{ marginBottom: 14 }}>Tìm kiếm</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-low)', border: '1px solid rgba(198,198,205,0.8)', borderRadius: 10, padding: '0 14px', minHeight: 46 }}>
              <Search size={16} style={{ color: 'var(--on-surface-variant)' }} />
              <input type="text" placeholder="Tìm kiếm bài viết..." value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: 14 }} />
            </label>
          </div>

          {/* Categories */}
          <div className="side-card">
            <h3 style={{ marginBottom: 14 }}>Chuyên mục</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {chuyenMuc.map(cm => (
                <button key={cm} onClick={() => setChuyenMucChon(cm)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: chuyenMucChon === cm ? 'var(--surface-low)' : 'transparent', color: chuyenMucChon === cm ? 'var(--secondary)' : 'var(--on-surface-variant)', fontWeight: chuyenMucChon === cm ? 800 : 500, fontSize: 14 }}>
                  <span>{cm}</span>
                  <span style={{ background: 'var(--surface-container)', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                    {cm === 'Tất cả' ? baiViet.length : baiViet.filter(b => b.chuyenMuc === cm).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular */}
          <div className="side-card">
            <h3 style={{ marginBottom: 16 }}>Bài viết nổi bật</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {baiViet.slice(0, 3).map((b, i) => (
                <Link to={`/blog/${b.id}`} key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--surface-high)', lineHeight: 1 }}>0{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--on-surface)' }}>{b.tieuDe}</p>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, display: 'block' }}>{b.luotXem} lượt xem</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ background: 'var(--primary-container)', borderRadius: 16, padding: 24, color: '#fff' }}>
            <h3 style={{ color: '#fff', marginBottom: 8 }}>Nhận tin tức mới nhất</h3>
            <p style={{ color: '#dbeafe', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>Đăng ký email để nhận thông tin cập nhật về thị trường IT.</p>
            <input type="email" placeholder="Email của bạn" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, marginBottom: 10, outline: 'none' }} />
            <button className="primary-button" style={{ width: '100%', background: 'var(--secondary)' }}>Đăng ký</button>
          </div>
        </aside>
      </div>
    </main>
  )
}
