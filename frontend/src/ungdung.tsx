import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/main.css'

// Real-time Components
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { OfflineIndicator } from './components/OfflineIndicator'
import SeoRouteManager from './components/SeoRouteManager'
import { khoiTaoSocket, ngatketnoisocket } from './lib/socket'
import { dangKyPushSubscription, langNgheNotificationClick as langNghePushClick } from './lib/pushNotifications'
import { ChatProvider } from './contexts/ChatContext'
import { ThongBaoProvider } from './contexts/ThongBaoContext'
import { ThongBaoToastContainer } from './components/ThongBaoCenter'
import { layAccessToken } from './lib/auth'
import { EmployerRecruitmentGate } from './pages/nhatuyendung/shared/EmployerRecruitmentGate'
import BoDinhTuyen from './components/BoDinhTuyen'
import DashboardShell from './components/DashboardShell'
import ScrollToTop from './components/ScrollToTop'

// Lazy load pages
const TrangChu = lazy(() => import('./pages/trangchu/TrangChu'))
const DangNhap = lazy(() => import('./pages/xacthuc/DangNhap'))
const DangKy = lazy(() => import('./pages/xacthuc/DangKy'))
const ForgotPasswordPage = lazy(() => import('./pages/xacthuc/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/xacthuc/ResetPasswordPage'))
const TimKiemViecLam = lazy(() => import('./pages/vieclam/TimKiemViecLam'))
const ChiTietViecLam = lazy(() => import('./pages/vieclam/ChiTietViecLam'))
const DanhSachCongTy = lazy(() => import('./pages/congty/DanhSachCongTy'))
const HoSoCongTy = lazy(() => import('./pages/congty/HoSoCongTy'))
const BlogPage = lazy(() => import('./pages/blog/Blog'))

// Dashboard pages - Ứng viên
const DashboardUngVien = lazy(() => import('./pages/ungvien/dashboard/DashboardUngVienPage'))
const HoSoUngVienPage = lazy(() => import('./pages/ungvien/hoso/HoSoUngVienPage'))
const ViecDaLuuPage = lazy(() => import('./pages/ungvien/viecdaluu/ViecDaLuuPage'))
const UngTuyenPage = lazy(() => import('./pages/ungvien/ungtuyen/UngTuyenPage'))
const LichPhongVanPage = lazy(() => import('./pages/ungvien/lichphongvan/LichPhongVanPage'))
const ThongBaoUngVienPage = lazy(() => import('./pages/ungvien/thongbao/ThongBaoUngVienPage'))
const CaiDatUngVienPage = lazy(() => import('./pages/ungvien/caidat/CaiDatUngVienPage'))

// Dashboard pages - Nhà tuyển dụng
const DashboardNhaTuyenDung = lazy(() => import('./pages/nhatuyendung/dashboard/DashboardNhaTuyenDungPage'))
const QuanLyTinNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/jobs/QuanLyTinNhaTuyenDungPage'))
const UngVienNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/candidates/UngVienNhaTuyenDungPage'))
const LichPhongVanNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/interviews/LichPhongVanNhaTuyenDungPage'))
const CongTyNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/company/CongTyNhaTuyenDungPage'))
const ThongBaoNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/notifications/ThongBaoNhaTuyenDungPage'))
const CaiDatNhaTuyenDungPage = lazy(() => import('./pages/nhatuyendung/DashboardNhaTuyenDung').then(module => ({ default: module.CaiDatNhaTuyenDungPage })))

// Dashboard pages - Quản trị viên
const DashboardQuanTriVien = lazy(() => import('./pages/quantrivien/DashboardQuanTriVien'))
const QuanLyNguoiDung = lazy(() => import('./pages/quantrivien/QuanLyNguoiDung'))
const QuanLyCongTyAdmin = lazy(() => import('./pages/quantrivien/congty/QuanLyCongTyAdmin'))
const DuyetTinTuyenDungAdmin = lazy(() => import('./pages/quantrivien/tintuyendung/DuyetTinTuyenDungAdmin'))
const QuanLyKyNangAdmin = lazy(() => import('./pages/quantrivien/kynang/QuanLyKyNangAdmin'))
const QuanLyReviewCongTyAdmin = lazy(() => import('./pages/quantrivien/review/QuanLyReviewCongTyAdmin'))
const ThongBaoAdminPage = lazy(() => import('./pages/quantrivien/thongbao/ThongBaoAdminPage'))
const CaiDatAdminPage = lazy(() => import('./pages/quantrivien/CaiDatQuanTriPage'))

// Chat pages
const ChatUngVienPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatUngVienPage })))
const ChatNhaTuyenDungPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatNhaTuyenDungPage })))
const ChatAdminPage = lazy(() => import('./pages/chat/TrangChat').then(module => ({ default: module.ChatAdminPage })))

// Other pages
const TrangDangXayDungPage = lazy(() => import('./pages/TrangDangXayDung'))

function RouteFallback() {
  return <div className="route-loading">Đang tải...</div>
}

export default function UngDung() {
  // ✨ Initialize real-time features
  useEffect(() => {
    langNghePushClick()

    const capNhatSocket = () => {
      const token = layAccessToken()
      if (token) {
        khoiTaoSocket(token)
        dangKyPushSubscription().catch(console.error)
      } else {
        ngatketnoisocket()
      }
    }

    capNhatSocket()
    window.addEventListener('itjob-auth-change', capNhatSocket)
    return () => window.removeEventListener('itjob-auth-change', capNhatSocket)
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SeoRouteManager />
      <ThongBaoProvider>
        <ChatProvider>
          {/* ✨ Real-time UI Components */}
          <PWAInstallPrompt />
          <OfflineIndicator />
          <ThongBaoToastContainer />
      
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public routes với Header + Footer */}
              <Route element={<BoDinhTuyen />}>
                <Route path="/" element={<TrangChu />} />
                <Route path="/viec-lam" element={<TimKiemViecLam />} />
                <Route path="/viec-lam/:id" element={<ChiTietViecLam />} />
                <Route path="/cong-ty" element={<DanhSachCongTy />} />
                <Route path="/cong-ty/:id" element={<HoSoCongTy />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<TrangDangXayDungPage ten="Bài viết" />} />
                <Route path="/luong" element={<TrangDangXayDungPage ten="Báo cáo lương" />} />
                <Route path="/gioi-thieu" element={<TrangDangXayDungPage ten="Giới thiệu" />} />
                <Route path="/lien-he" element={<TrangDangXayDungPage ten="Liên hệ" />} />
                <Route path="/dieu-khoan" element={<TrangDangXayDungPage ten="Điều khoản" />} />
                <Route path="/bao-mat" element={<TrangDangXayDungPage ten="Bảo mật" />} />
              </Route>

              {/* Auth routes (không có Header/Footer) */}
              <Route path="/dang-nhap" element={<DangNhap />} />
              <Route path="/dang-ky" element={<DangKy />} />
              <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
              <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />

              {/* Dashboard ứng viên */}
              <Route path="/ung-vien" element={<DashboardShell vaiTro="ungvien" />}>
                <Route index element={<DashboardUngVien />} />
                <Route path="ho-so" element={<HoSoUngVienPage />} />
                <Route path="viec-da-luu" element={<ViecDaLuuPage />} />
                <Route path="ung-tuyen" element={<UngTuyenPage />} />
                <Route path="lich-phong-van" element={<LichPhongVanPage />} />
                <Route path="chat" element={<ChatUngVienPage />} />
                <Route path="thong-bao" element={<ThongBaoUngVienPage />} />
                <Route path="cai-dat" element={<CaiDatUngVienPage />} />
              </Route>

              {/* Dashboard nhà tuyển dụng */}
              <Route path="/nha-tuyen-dung" element={<DashboardShell vaiTro="nhatuyendung" />}>
                <Route index element={<DashboardNhaTuyenDung />} />
                <Route path="dashboard" element={<DashboardNhaTuyenDung />} />
                <Route path="quan-ly-tin" element={<EmployerRecruitmentGate><QuanLyTinNhaTuyenDungPage /></EmployerRecruitmentGate>} />
                <Route path="tao-tin" element={<EmployerRecruitmentGate><Navigate to="/nha-tuyen-dung/quan-ly-tin?new=1" replace /></EmployerRecruitmentGate>} />
                <Route path="ung-vien" element={<EmployerRecruitmentGate><UngVienNhaTuyenDungPage /></EmployerRecruitmentGate>} />
                <Route path="lich-phong-van" element={<EmployerRecruitmentGate><LichPhongVanNhaTuyenDungPage /></EmployerRecruitmentGate>} />
                <Route path="lich-phong-vaan" element={<Navigate to="/nha-tuyen-dung/lich-phong-van" replace />} />
                <Route path="hat" element={<Navigate to="/nha-tuyen-dung/chat" replace />} />
                <Route path="cong-ty" element={<CongTyNhaTuyenDungPage />} />
                <Route path="chat" element={<ChatNhaTuyenDungPage />} />
                <Route path="thong-bao" element={<ThongBaoNhaTuyenDungPage />} />
                <Route path="cai-dat" element={<CaiDatNhaTuyenDungPage />} />
              </Route>

              {/* Dashboard quản trị viên */}
              <Route path="/quan-tri" element={<DashboardShell vaiTro="quantrivien" />}>
                <Route path="dashboard" element={<DashboardQuanTriVien />} />
                <Route path="nguoi-dung" element={<QuanLyNguoiDung />} />
                <Route path="cong-ty" element={<QuanLyCongTyAdmin />} />
                <Route path="tin-tuyen-dung" element={<DuyetTinTuyenDungAdmin />} />
                <Route path="ky-nang" element={<QuanLyKyNangAdmin />} />
                <Route path="review" element={<QuanLyReviewCongTyAdmin />} />
                <Route path="chat" element={<ChatAdminPage />} />
                <Route path="thong-bao" element={<ThongBaoAdminPage />} />
                <Route path="cai-dat" element={<CaiDatAdminPage />} />
              </Route>

              <Route path="*" element={<TrangDangXayDungPage ten="404 - Không tìm thấy" />} />
            </Routes>
          </Suspense>
        </ChatProvider>
      </ThongBaoProvider>
    </BrowserRouter>
  )
}
