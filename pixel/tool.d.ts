type gameObject = {
  delta:number
}

export const tool: {
  loop(gameFnLoop: (gameObject: gameObject) => gameObject): void
  toggleFullScreen(): void
}