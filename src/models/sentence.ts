export interface Sentence {
  text: string
  clues?: Clue[]
}

export interface Clue extends Sentence {
  value: string
  startIndex: number
}