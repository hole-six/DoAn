interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  dot?: boolean
}

export function Badge({ children, variant = 'primary', size = 'md', icon, dot = false }: BadgeProps) {
  const variants = {
    primary: { bg: '#dbeafe', text: '#0e4d7d', border: '#93c5fd' },
    success: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    danger: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    info: { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' },
    gray: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' },
  }

  const sizes = {
    sm: { padding: '4px 10px', fontSize: '12px', iconSize: 12, dotSize: 6 },
    md: { padding: '6px 12px', fontSize: '13px', iconSize: 14, dotSize: 8 },
    lg: { padding: '8px 16px', fontSize: '14px', iconSize: 16, dotSize: 10 },
  }

  const variantStyle = variants[variant]
  const sizeStyle = sizes[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: variantStyle.bg,
        color: variantStyle.text,
        border: `1px solid ${variantStyle.border}`,
        borderRadius: '999px',
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: sizeStyle.dotSize,
            height: sizeStyle.dotSize,
            borderRadius: '50%',
            background: variantStyle.text,
            flexShrink: 0,
          }}
        />
      )}
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  )
}

// Status Badge với mapping tự động
interface StatusBadgeProps {
  status: string
  statusMap?: Record<string, { label: string; variant: BadgeProps['variant'] }>
}

export function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const defaultStatusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    // Trạng thái ứng tuyển
    da_nop: { label: 'Đã nộp', variant: 'info' },
    da_xem: { label: 'Đã xem', variant: 'primary' },
    dang_xet_duyet: { label: 'Đang xét duyệt', variant: 'warning' },
    moi_phong_van: { label: 'Mời phỏng vấn', variant: 'success' },
    dat: { label: 'Đạt', variant: 'success' },
    tu_choi: { label: 'Từ chối', variant: 'danger' },
    da_rut: { label: 'Đã rút', variant: 'gray' },

    // Trạng thái lịch phỏng vấn
    da_len_lich: { label: 'Cần phản hồi', variant: 'warning' },
    da_xac_nhan: { label: 'Đã xác nhận', variant: 'success' },
    doi_lich: { label: 'Xin đổi lịch', variant: 'warning' },
    hoan_thanh: { label: 'Hoàn thành', variant: 'success' },
    da_huy: { label: 'Đã hủy', variant: 'danger' },

    // Trạng thái tin tuyển dụng
    dang_mo: { label: 'Đang mở', variant: 'success' },
    da_dong: { label: 'Đã đóng', variant: 'gray' },
    cho_duyet: { label: 'Chờ duyệt', variant: 'warning' },

    // Trạng thái chung
    active: { label: 'Hoạt động', variant: 'success' },
    inactive: { label: 'Không hoạt động', variant: 'gray' },
    pending: { label: 'Chờ xử lý', variant: 'warning' },
  }

  const map = statusMap || defaultStatusMap
  const statusInfo = map[status] || { label: status, variant: 'gray' as const }

  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}
