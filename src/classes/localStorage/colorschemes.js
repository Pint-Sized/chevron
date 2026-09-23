import LocalStorageObject from './localStorageObject.js'

export default class ColorSchemes extends LocalStorageObject {
  static objectName = 'colorschemes'
  static get initialState() {
    return {}
  }

  constructor() {
    super(ColorSchemes.objectName, ColorSchemes.initialState)
  }

  set(newSchemes) {
    this.object = newSchemes
    this.sync()
  }
}
