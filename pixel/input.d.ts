export const input: {
  init(canvasId: string, width: number, height: number): void
  is(): boolean
  get(): [{
    type: string,
    timeStamp: number,
    identifier: number,
    x: number,
    y: number,
  }]
}