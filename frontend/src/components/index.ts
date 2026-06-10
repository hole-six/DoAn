// Loading States
export { DashboardSkeleton, EmptyState, ErrorState, LoadingSpinner } from './LoadingStates'

// Dialogs
export { ConfirmDialog, useConfirm } from './ConfirmDialog'

// Admin dashboard widgets
export * from './admin/AdminDashboardWidgets'

// Buttons
export { Button, IconButton } from './Button'


// Inputs
export { Input, Textarea, Select } from './Input'

// Cards
export { Card, CardHeader, CardBody, CardFooter, KpiCard } from './Card'

// Badges
export { Badge, StatusBadge } from './Badge'

// Pagination (dùng chung 3 vai trò)
export { PhanTrang, usePhanTrang, KICH_THUOC_TRANG_MAC_DINH } from './PhanTrang'
export type { KetQuaPhanTrang } from './PhanTrang'
// Dashboard Shell
export { default as DashboardShell } from './DashboardShell'
export { default as BottomNav } from './BottomNav'

// Chat & Notifications
export { ChatBox } from './ChatBox'
export { ThongBaoCenter, ThongBaoToastContainer } from './ThongBaoCenter'
