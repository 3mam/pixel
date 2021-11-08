export const input: {
  init(canvasId: String, width: Number, height: Number): void
  is(): Boolean
  get(): [{
    type: String,
    timeStamp: Number,
    identifier: Number,
    x: Number,
    y: Number,
  }]
}