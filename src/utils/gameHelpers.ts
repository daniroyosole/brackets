import { findEligibleClues, normalizeString } from './sentenceTransform'
import type { Sentence, Clue } from '../models/sentence'

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

