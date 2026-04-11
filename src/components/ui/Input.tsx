'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={props.id} className={styles.label}>{label}</label>}
        <div className={cn(styles.inputWrapper, error && styles.hasError)}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input ref={ref} id={props.id} className={cn(styles.input, className)} {...props} />
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
