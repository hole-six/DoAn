import { useEffect, useState } from 'react'
import { Briefcase, Building2, Home, LogIn, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { duongDanTheoVaiTro, layNguoiDung } from '../lib/auth'
import AppIcon from './AppIcon'

export default function PublicBottomNav() {
  const [nguoiDung, setNguoiDung] = useState(layNguoiDung())

  useEffect(() => {
    const capNhat = () => setNguoiDung(layNguoiDung())
    window.addEventListener('storage', capNhat)
    window.addEventListener('itjob-auth-change', capNhat)
    return () => {
      window.removeEventListener('storage', capNhat)
      window.removeEventListener('itjob-auth-change', capNhat)
    }
  }, [])

  const navItems = [
    { to: '/', icon: Home, label: 'Trang chủ', end: true },
    { to: '/viec-lam', icon: Briefcase, label: 'Việc làm' },
    { to: '/cong-ty', icon: Building2, label: 'Công ty' },
    nguoiDung
      ? { to: duongDanTheoVaiTro[nguoiDung.vaiTro], icon: User, label: 'Hồ sơ' }
      : { to: '/dang-nhap', icon: LogIn, label: 'Đăng nhập' },
  ]

  return (
    <nav className="public-bottom-nav" aria-label="Điều hướng nhanh">
      {navItems.map(item => {
        const Icon = item.icon
        return (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <span className={clsx('public-bottom-nav__item', isActive && 'is-active')}>
                <AppIcon icon={Icon} size={20} />
                <span>{item.label}</span>
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
