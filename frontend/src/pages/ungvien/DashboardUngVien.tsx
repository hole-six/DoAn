import { Link } from 'react-router-dom'
import { Briefcase, Calendar, Bell, Star } from 'lucide-react'

const thongKe = [
  { icon: Briefcase, so: 12, nhan: 'Đã ứng tuyển', mau: 'var(--secondary)' },
  { icon: Calendar, so: 3, nhan: 'Lịch phỏng vấn', mau: '#f59e0b' },
  { icon: Star, so: 8, nhan: 'Việc đã lưu', mau: '#10b981' },
  { icon: Bell, so: 5, nhan: 'Thông báo mới', mau: '#e11d48' },
]

const hoSoUngTuyen = [
  { id: 1, viTri: 'Senior ReactJS Developer', congTy: 'FPT Software', trangThai: 'Đang xem xét', ngay: '20/05/2025', mauTT: '#dbeafe', mauChu: 'var(--secondary)' },
  { id: 2, viTri: 'Frontend Lead', congTy: 'Axon Active', trangThai: 'Phỏng vấn', ngay: '18/05/2025', mauTT: '#d1fae5', mauChu: '#065f46' },
  { id: 3, viTri: 'UI/UX Designer', congTy: 'KMS Technology', trangThai: 'Offer gửi', ngay: '15/05/2025', mauTT: '#fef3c7', mauChu: '#92400e' },
]

const lichPhongVan = [
  { id: 1, viTri: 'Frontend Lead', congTy: 'Axon Active', ngay: '26/05/2025', gio: '14:00', hinh: 'Online (Google Meet)' },
  { id: 2, viTri: 'Senior ReactJS Developer', congTy: 'FPT Software', ngay: '28/05/2025', gio: '09:30', hinh: 'Tại văn phòng' },
]

export default function DashboardUngVien() {
  return (
    <div>
      {/* Welcome */}
      <div className="dashboard-hero" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">Chào mừng trở lại</p>
          <h2>Xin chào, Nguyễn Văn A! 👋</h2>
          <p>Hồ sơ của bạn đang được 24 nhà tuyển dụng xem. Tiếp tục cập nhật để tăng cơ hội.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Link to="/ung-vien/ho-so" className="primary-button">Cập nhật hồ sơ</Link>
            <Link to="/viec-lam" className="ghost-button" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Tìm việc mới</Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
            <p style={{ color: '#dbeafe', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Độ hoàn thiện hồ sơ</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: '#2170e4', borderRadius: 999 }} />
              </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>72%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid dashboard-stats">
        {thongKe.map(item => {
          const Icon = item.icon
          return (
            <div key={item.nhan} className="stat-card">
              <div className="icon-shell" style={{ background: `${item.mau}18`, color: item.mau }}>
                <Icon size={22} />
              </div>
              <strong>{item.so}</strong>
              <span>{item.nhan}</span>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        {/* Hồ sơ ứng tuyển */}
        <div className="panel">
          <div className="section-title">
            <h2>Hồ sơ ứng tuyển gần đây</h2>
            <Link to="/ung-vien/ung-tuyen" className="text-link">Xem tất cả</Link>
          </div>
          <div className="table-list">
            {hoSoUngTuyen.map(hs => (
              <div key={hs.id} className="table-row">
                <div>
                  <strong>{hs.viTri}</strong>
                  <span style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: 13, marginTop: 2 }}>{hs.congTy}</span>
                </div>
                <span>{hs.ngay}</span>
                <mark style={{ background: hs.mauTT, color: hs.mauChu, borderRadius: 999, padding: '5px 12px', fontWeight: 800, fontSize: 12 }}>
                  {hs.trangThai}
                </mark>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch phỏng vấn */}
        <div className="panel">
          <div className="section-title">
            <h2>Lịch phỏng vấn</h2>
            <Link to="/ung-vien/lich-phong-van" className="text-link">Xem tất cả</Link>
          </div>
          <div className="timeline">
            {lichPhongVan.map(lv => (
              <article key={lv.id}>
                <div className="icon-shell" style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <strong>{lv.viTri}</strong>
                  <span style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: 13, marginTop: 2 }}>
                    {lv.congTy} · {lv.ngay} {lv.gio}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--secondary)', marginTop: 4, fontWeight: 700 }}>
                    {lv.hinh}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
