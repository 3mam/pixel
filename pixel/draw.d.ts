export const draw: {
  init(canvasId: string, width: number, height: number): void
  flip(flipX: boolean, flipY: boolean): void
  position(x: number, y: number): void
  sprite(offsetRect: {
    offsetX: number
    offsetY: number
    width: number
    height: number
  }): void
  camera(x: number, y: number): void
  uploadPalette(data: number[], palette: number): void
  palette(number: number): void
  uploadSprite(data: number[], offsetRect: {
    offsetX: number
    offsetY: number
    width: number
    height: number
  }): void
  clear(): void
  draw(): void
}
