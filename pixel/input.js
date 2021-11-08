let renderResolution = {
  width: null,
  height: null,
}

let inputs = []

function correctPointerPosition(
  canvas,
  { width: renderWidth, height: renderHeight },
  { pageX, pageY }
) {
  let { top, left, width, height } = canvas.getBoundingClientRect()
  let x = ((pageX - left) / width) * renderWidth
  let y = ((pageY - top) / height) * renderHeight
  return { x: Math.floor(x), y: Math.floor(y) }
}

function mousePoint({ x, y }, event, type) {
  return [({
    type: type,
    timeStamp: event.timeStamp,
    identifier: 0,
    x, y
  })]
}

function init(canvasId, width, height) {
  let canvas = document.getElementById(canvasId)
  let mouseType = 'mouseup'
  let renderRes = { width, height }

  canvas.onmousedown = e => {
    let point = correctPointerPosition(canvas, renderRes, e)
    mouseType = e.type
    inputs = mousePoint(point, e, 'start')
  }

  canvas.onmouseup = e => {
    let point = correctPointerPosition(canvas, renderRes, e)
    mouseType = e.type
    inputs = mousePoint(point, e, 'end')
  }

  canvas.onmousemove = e => {
    let point = correctPointerPosition(canvas, renderRes, e)
    if (mouseType === 'mousedown') {
      inputs = mousePoint(point, e, 'move')
    }
  }

  canvas.ontouchstart = e => {
    inputs = Array.from(e.touches).map(v => ({
      type: 'start',
      timeStamp: e.timeStamp,
      identifier: v.identifier,
      ...correctPointerPosition(canvas, renderRes, v)
    }))
  }

  canvas.ontouchend = e => {
    inputs = Array.from(e.changedTouches).map(v => ({
      type: 'end',
      timeStamp: e.timeStamp,
      identifier: v.identifier,
      ...correctPointerPosition(canvas, renderRes, v)
    }))
  }

  canvas.ontouchmove = e => {
    inputs = Array.from(e.changedTouches).map(v => ({
      type: 'move',
      timeStamp: e.timeStamp,
      identifier: v.identifier,
      ...correctPointerPosition(canvas, renderRes, v)
    }))
  }
}

function getInput() {
  const tmpInput = [...inputs]
  inputs = []
  return tmpInput
}

function isInput() {
  return inputs.length > 0
}

export const input = {
  init: init,
  get: getInput,
  is: isInput,
}