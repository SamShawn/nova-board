import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { Avatar } from '../atoms/Avatar'
import {
  LayoutGridIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  SearchIcon,
} from '../atoms/Icons'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme, sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={clsx(styles.layout, sidebarCollapsed && styles.collapsed)}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M8 12h6v2H8v-2zm0 4h10v2H8v-2zm0 4h8v2H8v-2z" fill="white" opacity="0.9" />
              <rect x="18" y="10" width="6" height="14" rx="2" fill="white" />
            </svg>
            {!sidebarCollapsed && <span className={styles.logoText}>Nova Board</span>}
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
          >
            <LayoutGridIcon size={20} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.iconButton} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
          <button type="button" className={styles.iconButton} title="Notifications">
            <BellIcon size={20} />
          </button>
          <div className={styles.userMenu}>
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
            {!sidebarCollapsed && (
              <span className={styles.userName}>{user?.name}</span>
            )}
          </div>
          <button type="button" className={styles.iconButton} onClick={handleLogout} title="Log out">
            <LogOutIcon size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.searchWrapper}>
            <SearchIcon size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search issues..."
              className={styles.searchInput}
            />
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
