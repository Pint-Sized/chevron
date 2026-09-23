import copyObj from './copyObj.js'

export function isValidColorSchemeName(name, schemes, currentName=null) {
  const trimmedName = name.trim()
  return Boolean(
    trimmedName
    && trimmedName !== 'default'
    && !trimmedName.includes('.')
    && !(trimmedName in Object.prototype)
    && (trimmedName === currentName || !Object.prototype.hasOwnProperty.call(schemes, trimmedName))
  )
}

export function createColorScheme(schemes, name, source) {
  const next = copyObj(schemes)
  next[name.trim()] = copyObj(source)
  return next
}

export function renameColorScheme(schemes, currentName, newName) {
  const next = copyObj(schemes)
  next[newName.trim()] = next[currentName]
  delete next[currentName]
  return next
}

export function deleteColorScheme(schemes, name) {
  const next = copyObj(schemes)
  delete next[name]
  return next
}

export function migrateColorSchemes(schemes, shouldSwap=false) {
  const next = copyObj(schemes)
  for (const theme of Object.values(next)) {
    if (theme.light) {
      Object.assign(theme, theme.light)
      delete theme.light
      delete theme.dark
    }
    if (shouldSwap) {
      const primary = theme.primary
      theme.primary = theme.secondary
      theme.secondary = primary
    }
  }
  return next
}
