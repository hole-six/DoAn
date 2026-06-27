import { Zap, Shield, Globe, CheckCircle, TrendingUp, Award } from 'lucide-react'
import { trangChuLyDo, type TrangChuLyDoIcon } from '../../../data/trangChuData'

const trangChuLyDoIcons: Record<TrangChuLyDoIcon, typeof Zap> = {
  zap: Zap,
  shield: Shield,
  globe: Globe,
  check: CheckCircle,
  trending: TrendingUp,
  award: Award,
}

export function SectionLyDo() {
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Tại sao chọn Effort Job</p>
          <h2>Nền tảng được xây dựng cho<br />ứng viên và nhà tuyển dụng IT</h2>
        </div>
      </div>
      <div className="bento-grid">
        {trangChuLyDo.map((item, idx) => {
          const Icon = trangChuLyDoIcons[item.icon]
          return (
            <div key={item.tieu} className={`bento-card${idx === 0 ? ' dark' : ''}`}>
              <div className="icon-shell"><Icon size={22} /></div>
              <h3>{item.tieu}</h3>
              <p>{item.mo}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
