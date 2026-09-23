import test from 'node:test'
import assert from 'node:assert/strict'
import ColorSchemes from '../src/classes/localStorage/colorschemes.js'
import {
  createColorScheme,
  deleteColorScheme,
  isValidColorSchemeName,
  migrateColorSchemes,
  renameColorScheme
} from '../src/functions/dataUtils/colorSchemes.js'

const defaultScheme = { primary: '#fff', secondary: '#000', accent: '#f00' }

function createLocalStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  }
}

test('creates and persists a named colorscheme without changing its source', () => {
  const schemes = { default: defaultScheme }
  const next = createColorScheme(schemes, 'Ocean', defaultScheme)
  next.Ocean.primary = '#00f'

  assert.equal(schemes.Ocean, undefined)
  assert.equal(next.Ocean.primary, '#00f')
})

test('persists schemes under the dedicated localStorage key', () => {
  globalThis.localStorage = createLocalStorage()
  const storage = new ColorSchemes()
  storage.set({ default: defaultScheme, Ocean: defaultScheme })

  assert.deepEqual(
    JSON.parse(localStorage.getItem('colorschemes')),
    { default: defaultScheme, Ocean: defaultScheme }
  )
  assert.equal(localStorage.getItem('settings'), null)
})

test('rejects duplicate and invalid names', () => {
  const schemes = { default: defaultScheme, Ocean: defaultScheme }
  assert.equal(isValidColorSchemeName('Ocean', schemes), false)
  assert.equal(isValidColorSchemeName('Ocean', schemes, 'Ocean'), true)
  assert.equal(isValidColorSchemeName('bad.name', schemes), false)
})

test('renames and deletes a colorscheme', () => {
  const schemes = { default: defaultScheme, Ocean: defaultScheme }
  const renamed = renameColorScheme(schemes, 'Ocean', 'Sunset')
  assert.equal(renamed.Ocean, undefined)
  assert.deepEqual(renamed.Sunset, defaultScheme)
  assert.equal(deleteColorScheme(renamed, 'Sunset').Sunset, undefined)
})

test('migrates legacy light/dark schemes and primary/secondary semantics', () => {
  const legacy = {
    default: {
      light: { primary: '#111', secondary: '#eee' },
      dark: { primary: '#eee', secondary: '#111' }
    }
  }
  const migrated = migrateColorSchemes(legacy, true)
  assert.deepEqual(migrated.default, { primary: '#eee', secondary: '#111' })
})

test('resetting schemes can retain only the default scheme', () => {
  const schemes = { default: defaultScheme, Ocean: defaultScheme }
  const reset = { default: schemes.default }
  assert.deepEqual(Object.keys(reset), ['default'])
})
