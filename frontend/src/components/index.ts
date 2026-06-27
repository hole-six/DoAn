// Loading States
export { DashboardSkeleton, EmptyState, ErrorState, LoadingSpinner } from './LoadingStates'

// Dialogs
export { ConfirmDialog, useConfirm } from './ConfirmDialog'

// Admin dashboard widgets
export * from './admin/AdminDashboardWidgets'

// Pagination (dùng chung 3 vai trò)
export { PhanTrang, usePhanTrang, KICH_THUOC_TRANG_MAC_DINH } from './PhanTrang'
export type { KetQuaPhanTrang } from './PhanTrang'

// Dashboard Shell
export { default as DashboardShell } from './DashboardShell'
export { default as BottomNav } from './BottomNav'

// Chat & Notifications
export { ChatBox } from './ChatBox'
export { ThongBaoCenter, ThongBaoToastContainer } from './ThongBaoCenter'
