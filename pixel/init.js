import { draw } from './draw.js'
import { input } from './input.js'

export function init(canvasId, width, height) {
  draw.init(canvasId, width, height)
  input.init(canvasId, width, height)
}