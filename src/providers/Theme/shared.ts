import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  // The public site stays on the light token set until a brand theme decision exists.
  return 'light'
}
