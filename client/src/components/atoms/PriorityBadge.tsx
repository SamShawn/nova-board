import { clsx } from 'clsx'
import type { Priority } from '@nova-board/common'
import { FlagIcon } from './Icons'
import styles from './PriorityBadge.module.css'

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
  className?: string
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'var(--priority-low)' },
  MEDIUM: { label: 'Medium', color: 'var(--priority-medium)' },
  HIGH: { label: 'High', color: 'var(--priority-high)' },
  URGENT: { label: 'Urgent', color: 'var(--priority-urgent)' },
}

export function PriorityBadge({ priority, size = 'md', className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <span
      className={clsx(styles.badge, styles[size], className)}
      style={{ color: config.color }}
      title={`Priority: ${config.label}`}
    >
      <FlagIcon size={size === 'sm' ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  )
}
