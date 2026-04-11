'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { useUIStore } from '@/features/boards/stores/uiStore'
import { cn } from '@/lib/utils'
import styles from './Sidebar.module.css'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside className={cn(styles.sidebar, sidebarCollapsed && styles.collapsed)}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon} />
          {!sidebarCollapsed && <span className={styles.logoText}>NovaBoard</span>}
        </Link>
        <button className={styles.collapseBtn} onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.navItem, isActive && styles.active)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <button className={cn(styles.newBtn, sidebarCollapsed && styles.iconOnly)}>
          <Plus size={16} />
          {!sidebarCollapsed && <span>New Project</span>}
        </button>
      </div>
    </aside>
  )
}
