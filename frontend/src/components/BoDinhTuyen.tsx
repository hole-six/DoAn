import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PublicBottomNav from './PublicBottomNav'

export default function BoDinhTuyen() {
  return (
    <div className="public-layout">
      <Header />
      <Outlet />
      <Footer />
      <PublicBottomNav />
    </div>
  )
}
