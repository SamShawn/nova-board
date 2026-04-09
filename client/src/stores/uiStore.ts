import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      setTheme: (theme) => set({ theme }),
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
    }
  )
)
