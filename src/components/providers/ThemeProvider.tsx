'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/features/boards/stores/uiStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      root.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  return <>{children}</>
}
