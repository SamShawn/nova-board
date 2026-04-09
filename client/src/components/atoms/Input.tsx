import { clsx } from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(styles.input, error && styles.error, className)}
        {...props}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(styles.textarea, error && styles.error, className)}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}
