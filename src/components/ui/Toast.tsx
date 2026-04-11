'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Toast.module.css'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]))
}

export function toast(message: string, variant: ToastVariant = 'info') {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, variant }]
  notifyListeners()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notifyListeners()
  }, 4000)
}

const icons = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
}

export function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    setMounted(true)
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className={styles.container} role="status">
      {currentToasts.map(t => (
        <div key={t.id} className={cn(styles.toast, styles[t.variant])}>
          <span className={styles.icon}>{icons[t.variant]}</span>
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  )
}
