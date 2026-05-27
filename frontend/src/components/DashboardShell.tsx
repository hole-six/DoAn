import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Users, Calendar, Bell,
  Settings, LogOut, Menu, X, Building2, BarChart2,
  FileText, Star, Shield, UserCheck, BookOpen,
} from 'lucide-react'
import logoWeb from '../assets/logoweb.png'

const techIcons = [
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
]

type VaiTro = 'ungvien' | 'nhatuyendung' | 'quantrivien'

interface Props { vaiTro: VaiTro }

const menuUngVien = [
  { to: '/ung-vien', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/ung-vien/ho-so', icon: FileText, label: 'Hồ sơ năng lực' },
  { to: '/ung-vien/viec-da-luu', icon: Star, label: 'Việc đã lưu' },
  { to: '/ung-vien/ung-tuyen', icon: Briefcase, label: 'Hồ sơ ứng tuyển' },
  { to: '/ung-vien/lich-phong-van', icon: Calendar, label: 'Lịch phỏng vấn' },
  { to: '/ung-vien/thong-bao', icon: Bell, label: 'Thông báo' },
  { to: '/ung-vien/cai-dat', icon: Settings, label: 'Cài đặt' },
]

const menuNTD = [
  { to: '/nha-tuyen-dung/dashboard', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/nha-tuyen-dung/quan-ly-tin', icon: Briefcase, label: 'Quản lý tin' },
  { to: '/nha-tuyen-dung/tao-tin', icon: FileText, label: 'Tạo tin mới' },
  { to: '/nha-tuyen-dung/ung-vien', icon: Users, label: 'Pipeline ứng viên' },
  { to: '/nha-tuyen-dung/lich-phong-van', icon: Calendar, label: 'Lịch phỏng vấn' },
  { to: '/nha-tuyen-dung/cong-ty', icon: Building2, label: 'Thông tin công ty' },
  { to: '/nha-tuyen-dung/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/nha-tuyen-dung/thong-bao', icon: Bell, label: 'Thông báo' },
  { to: '/nha-tuyen-dung/cai-dat', icon: Settings, label: 'Cài đặt' },
]

const menuAdmin = [
  { to: '/quan-tri/dashboard', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/quan-tri/nguoi-dung', icon: Users, label: 'Quản lý người dùng' },
  { to: '/quan-tri/cong-ty', icon: Building2, label: 'Xác thực công ty' },
  { to: '/quan-tri/tin-tuyen-dung', icon: Briefcase, label: 'Duyệt tin tuyển dụng' },
  { to: '/quan-tri/ky-nang', icon: BookOpen, label: 'Danh mục kỹ năng' },
  { to: '/quan-tri/analytics', icon: BarChart2, label: 'Báo cáo' },
  { to: '/quan-tri/review', icon: UserCheck, label: 'Review công ty' },
  { to: '/quan-tri/cai-dat', icon: Settings, label: 'Cài đặt' },
  { to: '/quan-tri/logs', icon: Shield, label: 'System Logs' },
]

const menuMap = { ungvien: menuUngVien, nhatuyendung: menuNTD, quantrivien: menuAdmin }
const nhanMap = { ungvien: 'Ứng viên', nhatuyendung: 'Nhà tuyển dụng', quantrivien: 'Quản trị viên' }

export default function DashboardShell({ vaiTro }: Props) {
  const [open, setOpen] = useState(false)
  const menu = menuMap[vaiTro]
  const nguoiDung = JSON.parse(localStorage.getItem('itjob_nguoidung') ?? 'null')

  const dangXuat = () => {
    localStorage.removeItem('itjob_token')
    localStorage.removeItem('itjob_nguoidung')
  }

  return (
    <div className="dashboard-shell" style={{ position: 'relative', background: '#ffffff' }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ display: open ? 'flex' : undefined, background: '#ffffff', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ paddingBottom: 20, borderBottom: '1px solid rgba(198,198,205,0.72)', marginBottom: 8 }}>
          <Link to="/" className="brand">
            <img src={logoWeb} alt="ITJob" className="logo-thuonghieu" style={{ height: 44 }} />
          </Link>
        </div>
        <div className="role-badge">
          <span>{nhanMap[vaiTro].toUpperCase()}</span>
          <p>{nguoiDung?.hoTen ?? 'Người dùng'}</p>
        </div>
        <nav>
          {menu.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                style={({ isActive }) => ({
                  background: isActive ? 'var(--surface-low)' : 'transparent',
                  color: isActive ? 'var(--secondary)' : 'var(--on-surface-variant)',
                })}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <Link to="/dang-nhap" className="sidebar-link" onClick={dangXuat} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
          <LogOut size={18} /> Đăng xuất
        </Link>

        {/* Tech Stack Footer */}
        <div style={{
          padding: '16px 0',
          borderTop: '1px solid rgba(198,198,205,0.3)',
          marginTop: 16,
        }}>
          <p style={{
            fontSize: 10,
            color: '#64748b',
            textAlign: 'center',
            marginBottom: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            POWERED BY
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: '0 12px',
          }}>
            {techIcons.map((icon, idx) => (
              <div key={idx} style={{
                width: 28,
                height: 28,
                background: 'rgba(100,116,139,0.1)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <img
                  src={icon}
                  alt="tech"
                  style={{ width: 18, height: 18, opacity: 0.7 }}
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', flex: 1 }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 64, background: '#fff',
          borderBottom: '1px solid rgba(198,198,205,0.72)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{nhanMap[vaiTro]}</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Bell size={20} style={{ color: 'var(--on-surface-variant)' }} />
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, borderRadius: 14 }}>NA</div>
          </div>
        </div>
        <div className="dashboard-main" style={{ background: '#ffffff' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
