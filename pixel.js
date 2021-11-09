import { draw as d } from './pixel/draw.js'
import { input as i } from './pixel/input.js'
import { collision as c } from './pixel/collision.js'
import { tool as t } from './pixel/tool.js'

export function init(canvasId, width, height) {
  d.init(canvasId, width, height)
  i.init(canvasId, width, height)
}

export const draw = d
export const input = i
export const collision = c
export const tool = t