import styles from './Avatar.module.css'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
  className?: string
}

function stringToColor(str: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${styles.avatar} ${className || ''}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const initials = name ? getInitials(name) : '?'
  const bgColor = name ? stringToColor(name) : '#71717a'

  return (
    <div
      className={`${styles.avatar} ${styles.initials} ${className || ''}`}
      style={{ width: size, height: size, background: bgColor }}
      title={name || undefined}
    >
      {initials}
    </div>
  )
}
