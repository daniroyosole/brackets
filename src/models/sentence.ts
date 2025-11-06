export interface Sentence {
  date: string
  text: string
  clues?: Clue[]
}

export interface Clue extends Sentence {
  value: string
  startIndex: number
}