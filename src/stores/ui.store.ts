import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

type UiState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'sprint-lens-theme'

const resolveTheme = (): ThemeMode => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export const initializeTheme = () => {
  const theme = resolveTheme()
  applyTheme(theme)
  return theme
}

export const useUiStore = create<UiState>((set) => ({
  theme: resolveTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(nextTheme)
      return { theme: nextTheme }
    }),
}))
