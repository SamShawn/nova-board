import styles from './Tooltip.module.css'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const tooltipId = `tooltip-${Math.random().toString(36).slice(2)}`
  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <span aria-describedby={tooltipId}>{children}</span>
      <div id={tooltipId} className={`${styles.tooltip} ${styles[side]}`} role="tooltip">
        {content}
      </div>
    </div>
  )
}
