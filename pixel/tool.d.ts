interface gameObject {}

export const tool: {
  loop(gameFnLoop: (delta: number, gameObject: gameObject) => gameObject): void
  toggleFullScreen(): void
}