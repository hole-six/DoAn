import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function SectionCTA() {
  return (
    <section className="section home-cta-section" style={{ paddingBottom: 0 }}>
      <div
        className="dashboard-hero home-cta-card"
        style={{ borderRadius: 24, marginTop: 0 }}
      >
        <div>
          <p className="eyebrow">Bắt đầu ngay hôm nay</p>
          <h2>Sẵn sàng bước vào<br />cơ hội tiếp theo?</h2>
          <p>Tạo hồ sơ miễn phí, kết nối với nhà tuyển dụng và theo dõi quá trình ứng tuyển rõ ràng.</p>
          <div className="detail-actions home-cta-actions" style={{ border: 0, padding: '20px 0 0' }}>
            <Link to="/dang-ky" className="primary-button large">
              Tạo hồ sơ miễn phí <ArrowRight size={18} />
            </Link>
            <Link to="/viec-lam" className="ghost-button large">
              Khám phá việc làm
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=720&q=80"
          alt="Team làm việc"
        />
      </div>
    </section>
  )
}
