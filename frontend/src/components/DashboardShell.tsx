import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import logoWeb from '../assets/logoweb.png'
import { duongDanTheoVaiTro, layNguoiDung, xoaPhienDangNhap } from '../lib/auth'
import AppIcon from './AppIcon'
import BottomNav from './BottomNav'
import './dashboard-shell.css'
import './dashboard-shell-responsive.css'

type VaiTro = 'ungvien' | 'nhatuyendung' | 'quantrivien'

interface Props {
  vaiTro: VaiTro
}

const menuUngVien = [
  { to: '/ung-vien', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/ung-vien/ho-so', icon: FileText, label: 'Hồ sơ năng lực' },
  { to: '/ung-vien/portfolio', icon: FileText, label: 'Portfolio HTML' },
  { to: '/ung-vien/viec-da-luu', icon: Star, label: 'Việc đã lưu' },
  { to: '/ung-vien/ung-tuyen', icon: Briefcase, label: 'Hồ sơ ứng tuyển' },
  { to: '/ung-vien/lich-phong-van', icon: Calendar, label: 'Lịch phỏng vấn' },
  { to: '/ung-vien/thong-bao', icon: Bell, label: 'Thông báo' },
  { to: '/ung-vien/cai-dat', icon: Settings, label: 'Cài đặt' },
]

const menuNTD = [
  { to: '/nha-tuyen-dung/dashboard', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/nha-tuyen-dung/quan-ly-tin', icon: Briefcase, label: 'Quản lý tin' },
  { to: '/nha-tuyen-dung/ung-vien', icon: Users, label: 'Pipeline ứng viên' },
  { to: '/nha-tuyen-dung/lich-phong-van', icon: Calendar, label: 'Lịch phỏng vấn' },
  { to: '/nha-tuyen-dung/cong-ty', icon: Building2, label: 'Thông tin công ty' },
  { to: '/nha-tuyen-dung/chat', icon: MessageCircle, label: 'Tin nhắn' },
  { to: '/nha-tuyen-dung/thong-bao', icon: Bell, label: 'Thông báo' },
]

const menuAdmin = [
  { to: '/quan-tri/dashboard', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/quan-tri/nguoi-dung', icon: Users, label: 'Quản lý người dùng' },
  { to: '/quan-tri/cong-ty', icon: Building2, label: 'Xác thực công ty' },
  { to: '/quan-tri/tin-tuyen-dung', icon: Briefcase, label: 'Duyệt tin tuyển dụng' },
  { to: '/quan-tri/ky-nang', icon: BookOpen, label: 'Danh mục kỹ năng' },
  { to: '/quan-tri/review', icon: UserCheck, label: 'Review công ty' },
  { to: '/quan-tri/chat', icon: MessageCircle, label: 'Tin nhắn & Hỗ trợ' },
 
]

const menuUngVienHienThi = [
  { to: '/ung-vien', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/ung-vien/ho-so', icon: FileText, label: 'Hồ sơ năng lực' },
  { to: '/ung-vien/portfolio', icon: FileText, label: 'Portfolio HTML' },
  { to: '/ung-vien/viec-da-luu', icon: Star, label: 'Việc đã lưu' },
  { to: '/ung-vien/ung-tuyen', icon: Briefcase, label: 'Hồ sơ ứng tuyển' },
  { to: '/ung-vien/lich-phong-van', icon: Calendar, label: 'Lịch phỏng vấn' },
  { to: '/ung-vien/chat', icon: MessageCircle, label: 'Tin nhắn' },
  { to: '/ung-vien/thong-bao', icon: Bell, label: 'Thông báo' },
  { to: '/ung-vien/cai-dat', icon: Settings, label: 'Cài đặt' },
]

void menuUngVien

const menuMap = { ungvien: menuUngVienHienThi, nhatuyendung: menuNTD, quantrivien: menuAdmin }
const nhanMap = { ungvien: 'Ứng viên', nhatuyendung: 'Nhà tuyển dụng', quantrivien: 'Quản trị viên' }
const vaiTroCanCoMap = { ungvien: 'ung_vien', nhatuyendung: 'nha_tuyen_dung', quantrivien: 'admin' }

const shellTone: Record<VaiTro, string> = {
  ungvien: 'from-[#0e4d7d] to-[#1a6ba8]',
  nhatuyendung: 'from-[#0e4d7d] to-[#15803d]',
  quantrivien: 'from-slate-950 to-[#0e4d7d]',
}

const shellByRole: Record<VaiTro, {
  sidebar: string
  logoWrap: string
  logo: string
  roleCard: string
  roleName: string
  navBase: string
  navActive: string
  sideButton: string
  logout: string
  mobileButton: string
}> = {
  ungvien: {
    sidebar: 'border-slate-800 bg-slate-950 text-white',
    logoWrap: 'border-slate-800',
    logo: 'h-10 max-w-[148px]',
    roleCard: 'border-slate-800 bg-slate-900',
    roleName: 'text-white',
    navBase: 'text-white/85 hover:bg-white/10 hover:text-white',
    navActive: 'border-sky-400/30 bg-[#0b5c91] text-white shadow-[0_10px_18px_rgba(11,92,145,0.24)] hover:bg-[#0b5c91] hover:text-white',
    sideButton: 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800',
    logout: 'text-red-300',
    mobileButton: 'border-[#0e4d7d]/15 text-[#0e4d7d]',
  },
  nhatuyendung: {
    sidebar: 'border-slate-800 bg-slate-950 text-white',
    logoWrap: 'border-slate-800',
    logo: 'h-10 max-w-[148px]',
    roleCard: 'border-slate-800 bg-slate-900',
    roleName: 'text-white',
    navBase: 'text-white/85 hover:bg-white/10 hover:text-white',
    navActive: 'border-emerald-400/30 bg-emerald-600/20 text-white hover:bg-emerald-600/25 hover:text-white',
    sideButton: 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800',
    logout: 'text-red-300',
    mobileButton: 'border-[#0e4d7d]/15 text-[#0e4d7d]',
  },
  quantrivien: {
    sidebar: 'border-slate-800 bg-[#020718] text-white shadow-[8px_0_30px_rgba(2,7,24,0.18)]',
    logoWrap: 'border-slate-800',
    logo: 'h-12 max-w-[138px]',
    roleCard: 'border-slate-800 bg-slate-900/80',
    roleName: 'text-white',
    navBase: 'text-white/90 hover:bg-white/10 hover:text-white',
    navActive: 'border-sky-400/30 bg-[#0b5c91] text-white shadow-[0_10px_18px_rgba(11,92,145,0.24)] hover:bg-[#0b5c91] hover:text-white',
    sideButton: 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800',
    logout: 'text-red-300',
    mobileButton: 'border-slate-200 text-slate-800',
  },
}

export default function DashboardShell({ vaiTro }: Props) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('itjob_sidebar_collapsed') === 'true')
  const menu = menuMap[vaiTro]
  const nguoiDung = layNguoiDung()
  const vaiTroCanCo = vaiTroCanCoMap[vaiTro]
  const shell = shellByRole[vaiTro]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  useEffect(() => {
    localStorage.setItem('itjob_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  if (!nguoiDung) return <Navigate to="/dang-nhap" replace />
  if (nguoiDung.vaiTro !== vaiTroCanCo) return <Navigate to={duongDanTheoVaiTro[nguoiDung.vaiTro]} replace />

  const dangXuat = () => {
    xoaPhienDangNhap()
  }

  const initials = nguoiDung.hoTen?.slice(0, 2).toUpperCase() ?? 'IT'

  return (
    <>
      <div
        className={clsx(
          'min-h-dvh bg-[#edf3f8] text-slate-900 lg:flex lg:h-dvh lg:overflow-hidden',
          collapsed ? 'itdash-collapsed' : 'itdash-expanded',
        )}
        data-role={vaiTro}
        data-collapsed={collapsed ? 'true' : 'false'}
      >
        <aside
          data-open={open ? 'true' : 'false'}
          className={clsx(
            'fixed inset-y-0 left-0 z-[70] hidden w-[min(88vw,300px)] flex-col gap-2.5 overflow-y-auto border-r p-4 transition-[width,padding] duration-200 data-[open=true]:flex lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-none',
            shell.sidebar,
            collapsed ? 'lg:w-[84px] lg:p-3' : 'lg:w-[264px] lg:p-4',
          )}
        >
          <div className={clsx('flex items-center justify-center border-b px-1 pb-4', shell.logoWrap, collapsed ? 'lg:min-h-14 lg:pb-3' : 'min-h-24')}>
            <Link to="/" className="inline-flex min-h-11 items-center justify-center" title="ITJob">
              <img src={logoWeb} alt="ITJob" className={clsx('w-auto object-contain', shell.logo, collapsed && 'lg:h-8 lg:max-w-10')} />
            </Link>
          </div>

          <div className={clsx('rounded-xl border p-3', shell.roleCard, collapsed && 'lg:hidden')}>
            <span className="block text-xs font-black uppercase tracking-wide text-sky-300">{nhanMap[vaiTro]}</span>
            <p className={clsx('mt-1 text-sm font-black leading-snug', shell.roleName)}>{nguoiDung.hoTen ?? 'Người dùng'}</p>
          </div>

          <nav className="grid gap-1">
            {menu.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    clsx(
                      'flex min-h-11 min-w-0 items-center gap-2.5 overflow-hidden rounded-xl border border-transparent px-3 text-sm font-extrabold leading-tight transition',
                      shell.navBase,
                      isActive && shell.navActive,
                      collapsed && 'lg:justify-center lg:px-0',
                    )
                  }
                  onClick={() => setOpen(false)}
                >
                  <AppIcon icon={Icon} className="shrink-0 text-current" />
                  <span className={clsx('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <button
            className={clsx('mt-auto hidden h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition lg:inline-flex', shell.sideButton)}
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <AppIcon icon={collapsed ? PanelLeftOpen : PanelLeftClose} />
            <span className={clsx(collapsed && 'lg:hidden')}>{collapsed ? 'Mở rộng' : 'Thu gọn'}</span>
          </button>

          <Link
            to="/dang-nhap"
            title="Đăng xuất"
            className={clsx(
              'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-black transition hover:bg-red-500/10',
              shell.logout,
              collapsed && 'lg:justify-center lg:px-0',
            )}
            onClick={dangXuat}
          >
            <AppIcon icon={LogOut} className="text-current" />
            <span className={clsx(collapsed && 'lg:hidden')}>Đăng xuất</span>
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-[#0e4d7d]/10 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
            <button
              className={clsx('inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white', shell.mobileButton)}
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
            >
              <AppIcon icon={open ? X : Menu} size={22} />
            </button>
            <span className="text-lg font-black text-slate-900">{nhanMap[vaiTro]}</span>
            <div className="flex items-center gap-2.5">
              <AppIcon icon={Bell} size={20} className="text-slate-700" />
              <div className={clsx('inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-md', shellTone[vaiTro])}>
                {initials}
              </div>
            </div>
          </div>

          {open && (
            <button
              className="fixed inset-0 z-[65] bg-slate-900/45 lg:hidden"
              aria-label="Đóng menu"
              onClick={() => setOpen(false)}
            />
          )}

          <main className="min-w-0 flex-1 overflow-visible p-3 pb-32 sm:p-4 sm:pb-32 lg:h-dvh lg:overflow-y-auto lg:p-6 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
    </>
  )
}

