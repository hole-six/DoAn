import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { trangChuFallbackCompanies, type HomeCompany } from '../../../data/trangChuData'

interface Props {
  companies?: HomeCompany[]
}

export function SectionNhaTuyenDung({ companies }: Props) {
  const items = companies?.length ? companies : trangChuFallbackCompanies
  
  return (
    <section className="section section-why-full">
      <div className="section-title">
        <div>
          <p className="eyebrow">Đối tác tuyển dụng</p>
          <h2>Nhà tuyển dụng hàng đầu</h2>
          <p>Các công ty công nghệ đang tuyển dụng tích cực trên Effort Job</p>
        </div>
        <Link to="/cong-ty" className="text-link">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>

      <div className="ntd-grid">
        {items.map(cty => (
          <Link to={`/cong-ty/${cty.id}`} key={cty.id} className="ntd-card">
            <div className="ntd-card-top">
              <div className="ntd-logo-wrap" style={{ background: cty.logoBg }}>
                <img
                  src={cty.logo}
                  alt={`Logo ${cty.ten}`}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <h3 className="ntd-ten">{cty.ten}</h3>
              <div className="ntd-tags">
                {cty.kyNang.map(kn => (
                  <span key={kn} className="ntd-tag">{kn}</span>
                ))}
              </div>
            </div>

            <div className="ntd-card-bottom">
              <span className="ntd-dia-diem">{cty.diaDiem}</span>
              <div className="ntd-viec">
                <span className="ntd-dot" />
                <span>{cty.soViec} việc làm</span>
                <span className="ntd-arrow">›</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
