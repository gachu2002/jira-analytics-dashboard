import { create } from 'zustand'

export const THEME_OPTIONS = [
  {
    value: 'dark',
    label: 'Midnight Grid',
    description: 'Deep graphite surfaces with cool signal accents.',
  },
  {
    value: 'light',
    label: 'Daylight Ledger',
    description: 'Clean neutral panels for daytime reporting.',
  },
  {
    value: 'ocean',
    label: 'Tide Ops',
    description: 'Teal-heavy night mode for dense monitoring work.',
  },
  {
    value: 'sand',
    label: 'Field Notes',
    description: 'Warm paper-like theme with calm analytical contrast.',
  },
] as const

export type ThemeMode = (typeof THEME_OPTIONS)[number]['value']

const DEFAULT_THEME: ThemeMode = 'dark'

type UiState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const THEME_STORAGE_KEY = 'sprint-lens-theme'

const isThemeMode = (value: string | null): value is ThemeMode =>
  THEME_OPTIONS.some((theme) => theme.value === value)

const resolveTheme = (): ThemeMode => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeMode(stored) ? stored : DEFAULT_THEME
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
}))
