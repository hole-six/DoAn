import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'

type AppIconProps = {
  icon: LucideIcon
  size?: number
  className?: string
  style?: CSSProperties
  title?: string
}

export default function AppIcon({ icon: Icon, size = 18, className, style, title }: AppIconProps) {
  return (
    <Icon
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className ? `app-icon ${className}` : 'app-icon'}
      size={size}
      strokeWidth={2.15}
      style={style}
      absoluteStrokeWidth
    />
  )
}
