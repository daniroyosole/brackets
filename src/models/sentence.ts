// Base interface for objects that can contain clues
interface ClueContainer {
  text: string
  clues?: Clue[]
}

export interface Sentence extends ClueContainer {
  date: string
}

export interface Clue extends ClueContainer {
  value: string
  startIndex: number
}