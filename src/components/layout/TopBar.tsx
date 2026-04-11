'use client'

import { useUIStore } from '@/features/boards/stores/uiStore'
import { Sun, Moon, Monitor } from 'lucide-react'
import styles from './TopBar.module.css'

export function TopBar() {
  const { theme, setTheme } = useUIStore()

  return (
    <header className={styles.topbar}>
      <div className={styles.left} />
      <div className={styles.right}>
        <button
          className={styles.themeBtn}
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
        </button>
      </div>
    </header>
  )
}
