'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Checkbox.module.css'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate, ...props }, ref) => {
    const inputId = props.id || `checkbox-${Math.random().toString(36).slice(2)}`
    return (
      <label className={cn(styles.wrapper, className)}>
        <div className={styles.box}>
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={styles.input}
            aria-checked={indeterminate ? 'mixed' : undefined}
            {...props}
          />
          <div className={cn(styles.check, (props.checked || indeterminate) && styles.checked)}>
            {(props.checked || indeterminate) && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
