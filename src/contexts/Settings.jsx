import { createContext, useEffect, useState } from 'react'
import assignDeep from 'assign-deep'
import settings from '../../settings/settings'
import LocalSettings from '../classes/localStorage/settings'
import ColorSchemes from '../classes/localStorage/colorschemes'
import copyObj from '../functions/dataUtils/copyObj'
import { migrateColorSchemes } from '../functions/dataUtils/colorSchemes'

const localSettigns = new LocalSettings()
const localColorSchemes = new ColorSchemes()
const storedSettings = copyObj(localSettigns.object)
const storedColorSchemes = copyObj(localColorSchemes.object)
const hasLegacyColorSchemes = Boolean(
  Object.keys(storedSettings.appearance?.themes || {}).length
  || Object.keys(storedColorSchemes).length
)

if (!Object.keys(storedColorSchemes).length) {
  Object.assign(storedColorSchemes, storedSettings.appearance?.themes || {})
  if (!storedColorSchemes.default)
    storedColorSchemes.default = copyObj(settings.defaults.appearance.themes.default)
}

if (
  hasLegacyColorSchemes
  && !localStorage.getItem('colorscheme-semantics-version')
) {
  Object.assign(storedColorSchemes, migrateColorSchemes(storedColorSchemes, true))
  localStorage.setItem('colorscheme-semantics-version', '2')
} else {
  Object.assign(storedColorSchemes, migrateColorSchemes(storedColorSchemes))
}
localColorSchemes.set(storedColorSchemes)

delete storedSettings.appearance?.themes
delete storedSettings.appearance?.colorScheme
delete storedSettings.query?.AI
const assignedSettings = assignDeep(settings.defaults, storedSettings)
assignedSettings.appearance.themes = storedColorSchemes

export const SettingsContext = createContext(null)
export const SetSettingsContext = createContext(null)
export const ThemeContext = createContext(null)
export const ColorSchemeContext = createContext(null)

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(assignedSettings)

  const activeTheme = settings.appearance.activeTheme
  const colorScheme = 'default'
  const theme = settings.appearance.themes[activeTheme]

  // sync settings with localStorage
  useEffect(() => {
    const settingsToStore = copyObj(settings)
    delete settingsToStore.appearance.themes
    localSettigns.set(settingsToStore)
    localColorSchemes.set(settings.appearance.themes)
  }, [settings])

  // sync JOY UI color scheme
  useEffect(() => {
    localStorage.setItem('joy-mode', colorScheme)
  }, [colorScheme])

  return (
    <SettingsContext.Provider value={settings}>
      <SetSettingsContext.Provider value={setSettings}>
        <ThemeContext.Provider value={theme}>
          <ColorSchemeContext.Provider value={colorScheme}>
            {children}
          </ColorSchemeContext.Provider>
        </ThemeContext.Provider>
      </SetSettingsContext.Provider>
    </SettingsContext.Provider>
  )
}