
function boxToBox({ x: x0, y: y0, width: w0, height: h0 }, { x: x1, y: y1, width: w1, height: h1 }) {
  return (x0 < x1 + w1 &&
    x0 + w0 > x1 &&
    y0 < y1 + h1 &&
    h0 + y0 > y1)
}

export const collision = {
  boxToBox: boxToBox,
}