import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  activeModal: string | null
  modalData: Record<string, unknown> | null

  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openModal: (modalId, data = null) =>
        set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),
    }),
    {
      name: 'nova-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme)
        }
      },
    }
  )
)
