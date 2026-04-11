'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({ options, value, onChange, placeholder = 'Select...', className, disabled }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open && focusedIndex >= 0) {
        onChange?.(options[focusedIndex].value)
        setOpen(false)
      } else {
        setOpen(true)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        setFocusedIndex(i => Math.min(i + 1, options.length - 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className={cn(styles.wrapper, className)} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={cn(styles.trigger, open && styles.open, disabled && styles.disabled)}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={cn(styles.chevron, open && styles.chevronOpen)} />
      </button>
      {open && (
        <div className={styles.menu} role="listbox">
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                styles.option,
                option.value === value && styles.selected,
                i === focusedIndex && styles.focused
              )}
              onClick={() => {
                onChange?.(option.value)
                setOpen(false)
              }}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
              {option.value === value && <Check size={14} className={styles.check} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
