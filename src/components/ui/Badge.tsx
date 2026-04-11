import { cn } from '@/lib/utils'
import styles from './Badge.module.css'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, color = '#6366f1', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[size], className)}
      style={{ '--badge-color': color } as React.CSSProperties}
    >
      {children}
    </span>
  )
}
