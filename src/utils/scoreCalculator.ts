import type { Sentence } from '../models/sentence'

export function getAllCluePaths(
  sentence: Sentence,
  path: string = "",
  allPaths: string[] = []
): string[] {
  if (!sentence.clues || sentence.clues.length === 0) {
    return allPaths
  }

  for (let i = 0; i < sentence.clues.length; i++) {
    const clue = sentence.clues[i]
    const cluePath = path ? `${path}-${i}` : `${i}`
    allPaths.push(cluePath)
    
    if (clue.clues && clue.clues.length > 0) {
      getAllCluePaths(clue, cluePath, allPaths)
    }
  }

  return allPaths
}

export function countAllClues(sentence: Sentence): number {
  return getAllCluePaths(sentence).length
}

export function areAllCluesSolved(sentence: Sentence, solvedClues: Set<string>): boolean {
  const allPaths = getAllCluePaths(sentence)
  return allPaths.length > 0 && allPaths.every(path => solvedClues.has(path))
}

export function calculateScore(
  N: number,
  firstLetterRequests: number,
  fullClueReveals: number,
  wrongAnswers: number
): number {
  if (N === 0) {
    return 100
  }

  const firstLetterPenalty = (100 / (N )) * firstLetterRequests
  const fullCluePenalty = (100 / N) * 2.5 * fullClueReveals
  const wrongAnswerPenalty = (100 / (N * 1.5)) * wrongAnswers

  const score = 100 - firstLetterPenalty - fullCluePenalty - wrongAnswerPenalty

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100))
}

