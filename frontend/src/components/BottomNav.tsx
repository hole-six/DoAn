import { Briefcase, Building2, Home, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { layNguoiDung } from '../lib/auth'
import AppIcon from './AppIcon'

export default function BottomNav() {
  const nguoiDung = layNguoiDung()
  if (!nguoiDung) return null
  if (nguoiDung.vaiTro === 'admin') return null

  const navItems =
    nguoiDung.vaiTro === 'ung_vien'
      ? [
          { to: '/ung-vien', icon: Home, label: 'Tổng quan', end: true },
          { to: '/viec-lam', icon: Briefcase, label: 'Việc làm' },
          { to: '/cong-ty', icon: Building2, label: 'Công ty' },
          { to: '/ung-vien/ho-so', icon: User, label: 'Hồ sơ' },
        ]
      : nguoiDung.vaiTro === 'nha_tuyen_dung'
        ? [
            { to: '/nha-tuyen-dung/dashboard', icon: Home, label: 'Tổng quan', end: true },
            { to: '/nha-tuyen-dung/quan-ly-tin', icon: Briefcase, label: 'Tin' },
            { to: '/nha-tuyen-dung/ung-vien', icon: User, label: 'Ứng viên' },
            { to: '/nha-tuyen-dung/cong-ty', icon: Building2, label: 'Công ty' },
          ]
        : [
            { to: '/quan-tri/dashboard', icon: Home, label: 'Tổng quan', end: true },
            { to: '/quan-tri/nguoi-dung', icon: User, label: 'Người dùng' },
            { to: '/quan-tri/cong-ty', icon: Building2, label: 'Công ty' },
            { to: '/quan-tri/tin-tuyen-dung', icon: Briefcase, label: 'Tin' },
          ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[80] grid h-[72px] grid-cols-4 gap-1 border-t border-[#0e4d7d]/10 bg-white/95 px-2 py-1.5 shadow-[0_-6px_18px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
      aria-label="Điều hướng nhanh"
    >
      {navItems.map(item => {
        const Icon = item.icon
        return (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <span
                className={clsx(
                  'grid h-full min-w-0 place-items-center gap-0.5 rounded-xl px-1 text-[9px] font-black uppercase text-slate-400',
                  isActive && 'bg-[#0e4d7d]/10 text-[#0e4d7d]',
                )}
              >
                <AppIcon icon={Icon} size={19} />
                <span className="max-w-full truncate">{item.label}</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
