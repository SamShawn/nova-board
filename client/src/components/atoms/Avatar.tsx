import { clsx } from 'clsx'
import styles from './Avatar.module.css'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6',
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(styles.avatar, styles[size], className)}
      />
    )
  }

  return (
    <div
      className={clsx(styles.avatar, styles[size], styles.initials, className)}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  )
}
