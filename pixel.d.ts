export function loop(gameloop: (delta: Number) => void): void
export function toggleFullScreen(): void

export const pixel: {
  set: (canvasId: String, width: Number, height: Number) => void
  flip: (flipX: Number, flipY: Number) => void
  position: (x: Number, y: Number) => void
  sprite: (offsetRect: {
    offsetX: Number
    offsetY: Number
    width: Number
    height: Number
  }) => void
  camera: (x: Number, y: Number) => void
  uploadPalette: (data: Number[], palette: Number) => void
  palette: (number: Number) => void
  uploadSprite: (data: Number[], offsetRect: {
    offsetX: Number
    offsetY: Number
    width: Number
    height: Number
  }) => void
  clear: () => void
  draw: () => void
}
