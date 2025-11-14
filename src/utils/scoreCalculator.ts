import type { Sentence, Clue } from '../models/sentence'

export function getAllCluePaths(
  sentence: Sentence | Clue,
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

  // Scale penalties to be more proportional across different N values
  // Adjust scaling factor based on N to prevent excessive penalties for small N
  // Use a logarithmic-style scaling that's more lenient for small N
  const baseScale = Math.min(1, N / 26) // Normalize to N=26 as baseline
  const adjustedScale = 0.3 + (baseScale * 0.7) // Scale between 0.3 and 1.0 (more lenient)
  
  const firstLetterPenalty = (100 / N) * adjustedScale * firstLetterRequests
  const fullCluePenalty = (100 / N) * 2.5 * adjustedScale * fullClueReveals
  const wrongAnswerPenalty = (100 / (N * 3)) * adjustedScale * wrongAnswers

  const score = 100 - firstLetterPenalty - fullCluePenalty - wrongAnswerPenalty

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100))
}

/**
 * Returns the emoji corresponding to a score
 * 🥔 (0-20), 🥦 (21-40), 🍋 (41-60), 🍑 (61-80), 🍉 (81-99), 🍓 (100)
 */
export function getScoreEmoji(score: number): string {
  if (score === 100) return '🍓'
  if (score >= 81) return '🍉'
  if (score >= 61) return '🍑'
  if (score >= 41) return '🍋'
  if (score >= 21) return '🥦'
  return '🥔'
}

/**
 * Returns the message corresponding to a score
 */
export function getScoreMessage(score: number): string {
  if (score === 100) return 'Excel·lent'
  if (score >= 81) return 'Espectacular!'
  if (score >= 61) return 'Fantàstic!'
  if (score >= 41) return 'Molt bé!'
  if (score >= 21) return "T'hi vas acostant!"
  return 'Quasi bé!'
}

