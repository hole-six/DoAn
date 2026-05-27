import { Link } from 'react-router-dom'
import { AlertTriangle, Briefcase, Building2, CheckCircle, Clock, Server, Users, XCircle } from 'lucide-react'

const thongKe = [
  { icon: Users, so: '12,450', nhan: 'Tổng người dùng', phu: '+5.2% trong 30 ngày', tone: 'blue' },
  { icon: Briefcase, so: '1,204', nhan: 'Việc làm đang mở', phu: '28 tin chờ duyệt', tone: 'green' },
  { icon: Building2, so: 12, nhan: 'Công ty chờ duyệt', phu: 'Cần xử lý trong hôm nay', tone: 'red' },
  { icon: Server, so: '99.9%', nhan: 'Uptime', phu: 'Hệ thống ổn định', tone: 'green' },
]

const tinChoDuyet = [
  { id: 1, tieuDe: 'Senior Fullstack Developer (React/NodeJS)', congTy: 'TechNova Solutions', diaDiem: 'Đà Nẵng', thoiGian: '10 phút trước', trangThai: 'Vừa gửi' },
  { id: 2, tieuDe: 'DevOps Engineer (AWS/Kubernetes)', congTy: 'CloudOps Asia', diaDiem: 'Remote / Đà Nẵng', thoiGian: '2 ngày trước', trangThai: 'Chờ lâu' },
  { id: 3, tieuDe: 'Product Designer (UI/UX)', congTy: 'DesignStudio DN', diaDiem: 'Đà Nẵng', thoiGian: '1 giờ trước', trangThai: 'Vừa gửi' },
]

const canhBao = [
  { loai: 'error', icon: AlertTriangle, tieu: 'Spam Detection Alert', moTa: 'Phát hiện 5 tài khoản có dấu hiệu spam tin tuyển dụng.' },
  { loai: 'warning', icon: Clock, tieu: 'Backup Pending', moTa: 'Bản sao lưu dữ liệu hàng ngày đang bị chậm 2 giờ.' },
]

const thaoTacNhanh = [
  { icon: Users, label: 'Người dùng', to: '/quan-tri/nguoi-dung' },
  { icon: Building2, label: 'Công ty', to: '/quan-tri/cong-ty' },
  { icon: Briefcase, label: 'Tin tuyển dụng', to: '/quan-tri/tin-tuyen-dung' },
  { icon: Server, label: 'Cài đặt', to: '/quan-tri/cai-dat' },
]

export default function DashboardQuanTriVien() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p>Trung tâm vận hành ITJob Vietnam Admin Panel.</p>
        </div>
        <Link to="/quan-tri/tin-tuyen-dung" className="primary-button">
          Kiểm duyệt ngay
        </Link>
      </div>

      <div className="admin-kpi-grid">
        {thongKe.map(item => {
          const Icon = item.icon
          return (
            <div key={item.nhan} className="admin-kpi-card">
              <div className={`admin-kpi-icon ${item.tone}`}><Icon size={20} /></div>
              <p>{item.nhan}</p>
              <strong>{item.so}</strong>
              <span>{item.phu}</span>
            </div>
          )
        })}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-section-head">
            <div>
              <h2>Tin tuyển dụng chờ duyệt</h2>
              <p>Danh sách cần xử lý để giữ chất lượng dữ liệu tuyển dụng.</p>
            </div>
            <Link to="/quan-tri/tin-tuyen-dung">Xem tất cả</Link>
          </div>

          <div className="admin-review-list">
            {tinChoDuyet.map(tin => (
              <div key={tin.id} className="admin-review-row">
                <div>
                  <div className="admin-row-meta">
                    <span className={tin.trangThai === 'Chờ lâu' ? 'admin-chip warning' : 'admin-chip'}>{tin.trangThai}</span>
                    <span>{tin.thoiGian}</span>
                  </div>
                  <h3>{tin.tieuDe}</h3>
                  <p>{tin.congTy} · {tin.diaDiem}</p>
                </div>
                <div className="admin-row-actions">
                  <button className="admin-btn danger"><XCircle size={14} /> Từ chối</button>
                  <button className="admin-btn primary"><CheckCircle size={14} /> Duyệt</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="admin-side-stack">
          <section className="admin-panel">
            <div className="admin-section-head compact">
              <h2>Cảnh báo</h2>
            </div>
            <div className="admin-alert-list">
              {canhBao.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.tieu} className={`admin-alert ${item.loai}`}>
                    <Icon size={18} />
                    <div>
                      <strong>{item.tieu}</strong>
                      <p>{item.moTa}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head compact">
              <h2>Thao tác nhanh</h2>
            </div>
            <div className="admin-quick-grid">
              {thaoTacNhanh.map(item => {
                const Icon = item.icon
                return (
                  <Link key={item.to} to={item.to} className="admin-quick-action">
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
