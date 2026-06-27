import { trangChuTechCategories } from '../../../data/trangChuData'

export function SectionTechStack() {
  return (
    <section className="section section-tech-stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">Công nghệ phổ biến</p>
          <h2>Kỹ năng được tuyển dụng nhiều nhất</h2>
          <p>Các công nghệ hàng đầu mà nhà tuyển dụng đang tìm kiếm</p>
        </div>
      </div>

      {trangChuTechCategories.map(cat => (
        <div key={cat.category} className="tech-category">
          <h3>{cat.category}</h3>
          <div className="tech-marquee">
            <div className="tech-marquee-track">
              {[...cat.techs, ...cat.techs, ...cat.techs, ...cat.techs].map((tech, idx) => (
                <div key={idx} className="tech-marquee-item">
                  <img src={tech.icon} alt={tech.name} />
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
