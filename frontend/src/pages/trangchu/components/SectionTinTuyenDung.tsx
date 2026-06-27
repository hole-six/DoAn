import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import { trangChuFallbackJobs, type HomeJob } from '../../../data/trangChuData'
import { formatJobDateLine } from '../../../lib/jobPresentation'

interface Props {
  jobs?: HomeJob[]
}

export function SectionTinTuyenDung({ jobs }: Props) {
  const items = jobs?.length ? jobs : trangChuFallbackJobs
  
  const nhanBadge = (badge: string | null) => {
    if (!badge) return null
    return badge === 'SUPER HOT' ? 'Ưu tiên' : 'Nổi bật'
  }

  const dinhDangLoaiViec = (loaiViec: string) =>
    loaiViec
      .replaceAll('_', ' ')
      .split(' ')
      .filter(Boolean)
      .map(tu => tu.charAt(0).toUpperCase() + tu.slice(1))
      .join(' ')

  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Cơ hội việc làm</p>
          <h2>Việc làm IT nổi bật</h2>
          <p>Cập nhật mới nhất từ các công ty công nghệ hàng đầu</p>
        </div>
        <Link to="/viec-lam" className="text-link">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="vl-grid">
        {items.map(tin => (
          <Link
            to={`/viec-lam/${tin.id}`}
            key={tin.id}
            className={`vl-card${tin.featured ? ' vl-card--featured' : ''}`}
          >
            {nhanBadge(tin.badge) && (
              <span className={`vl-badge${tin.badge === 'SUPER HOT' ? ' vl-badge--super' : ''}`} title={nhanBadge(tin.badge) ?? undefined}>
                <Flame size={15} fill="currentColor" />
              </span>
            )}

            <p className="vl-time">{tin.hanNopConLai ? formatJobDateLine(tin.ngayDang, tin.hanNop) : `Đăng ${tin.ngayDang}`}</p>
            <h3 className="vl-title">{tin.tieuDe}</h3>
            <div className="vl-company">
              <img
                className="vl-logo"
                src={tin.logo}
                alt={tin.congTy}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="vl-company-name">{tin.congTy}</span>
            </div>
            <div className="vl-salary-wrap">
              <span className="vl-label">Mức lương</span>
              <p className="vl-salary">{tin.luong}</p>
            </div>
            <hr className="vl-divider" />
            <div className="vl-meta">
              <span><strong>Ngành:</strong> {dinhDangLoaiViec(tin.loaiViec)}</span>
              <span><strong>Khu vực:</strong> {tin.diaDiem}</span>
            </div>
            <div className="vl-tags">
              {tin.kyNang.map(kn => (
                <span key={kn} className="vl-tag">{kn}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
