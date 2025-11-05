import { findEligibleClues, normalizeString } from './sentenceTransform'
import type { Sentence, Clue } from '../models/sentence'

/**
 * Recursively finds a clue by its path in a sentence structure.
 * @param sentenceObj - The sentence containing clues
 * @param targetPath - The path to find (e.g., "0", "0-1", "0-1-2")
 * @param currentPath - Current path being traversed (used for recursion)
 * @returns The clue and its text, or null if not found
 */
export function findClueByPath(
  sentenceObj: Sentence,
  targetPath: string,
  currentPath: string = ""
): { clue: Clue; clueText: string } | null {
  if (!sentenceObj.clues || sentenceObj.clues.length === 0) {
    return null
  }

  for (let i = 0; i < sentenceObj.clues.length; i++) {
    const clue = sentenceObj.clues[i]
    const cluePath = currentPath ? `${currentPath}-${i}` : `${i}`
    
    if (cluePath === targetPath) {
      return { clue, clueText: clue.text }
    }

    if (clue.clues) {
      const nested = findClueByPath(clue, targetPath, cluePath)
      if (nested) {
        return nested
      }
    }
  }

  return null
}

/**
 * Finds a matching clue from eligible clues based on user input.
 * Matching is case-insensitive and accent-insensitive.
 * 
 * @param sentence - The sentence containing clues
 * @param solvedClues - Set of already solved clue paths
 * @param inputValue - User input to match against clue values
 * @returns The matching clue with its path, or undefined if no match found
 */
export function findMatchingClue(
  sentence: Sentence,
  solvedClues: Set<string>,
  inputValue: string
): { clue: Clue; path: string } | undefined {
  if (!inputValue.trim()) {
    return undefined
  }

  const eligibleClues = findEligibleClues(sentence, solvedClues)
  const normalizedInput = normalizeString(inputValue)

  return eligibleClues.find(
    ({ clue }) => normalizeString(clue.value) === normalizedInput
  )
}

