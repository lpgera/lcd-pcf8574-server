declare module 'lcdi2c' {
  export default class LCD {
    constructor(device: number, address: number, columns: number, rows: number)

    on(): void

    off(): void

    clear(): void

    createChar(
      characterCode: number,
      bytes: [number, number, number, number, number, number, number, number]
    ): void

    setCursor(x: number, y: number): void

    print(text: string): void
  }
}
