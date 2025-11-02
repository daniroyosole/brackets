import type { Sentence, Clue } from "../models/sentence";

/**
 * Normalizes a string by removing accents and converting to lowercase.
 * Used for case-insensitive and accent-insensitive string comparison.
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase()
    .trim();
}

/**
 * Recursively transforms a sentence by replacing clue values with their text.
 * For each clue, it replaces the substring at startIndex to startIndex+value.length
 * with the clue's text (after recursively transforming nested clues).
 * If a clue is solved (in solvedClues Set), shows its value instead of [text].
 */
export function transformSentence(
  sentence: Sentence,
  solvedClues: Set<string>,
  path: string = ""
): string {
  if (!sentence.clues || sentence.clues.length === 0) {
    return sentence.text;
  }

  let result = sentence.text;
  
  // Process clues in reverse order by startIndex to avoid index shifting issues
  // Map clues with their original indices before sorting
  const cluesWithIndices = sentence.clues.map((clue, idx) => ({ clue, originalIdx: idx }));
  const sortedClues = [...cluesWithIndices].sort((a, b) => b.clue.startIndex - a.clue.startIndex);
  
  for (const { clue, originalIdx } of sortedClues) {
    const cluePath = path ? `${path}-${originalIdx}` : `${originalIdx}`;
    const isSolved = solvedClues.has(cluePath);
    
    if (isSolved) {
      // If solved, show the value directly
      const before = result.substring(0, clue.startIndex);
      const after = result.substring(clue.startIndex + clue.value.length);
      result = before + clue.value + after;
    } else {
      // If not solved, recursively transform the clue's text
      const transformedClueText = transformSentence(clue, solvedClues, cluePath);
      
      // Replace the substring at the clue's position with the transformed clue text wrapped in brackets
      const before = result.substring(0, clue.startIndex);
      const after = result.substring(clue.startIndex + clue.value.length);
      result = before + `[${transformedClueText}]` + after;
    }
  }
  
  return result;
}

/**
 * Recursively finds all eligible clues (ones that can be solved).
 * A clue is eligible if:
 * - It has no clues array, OR
 * - All of its inner clues have been solved
 */
export function findEligibleClues(
  sentence: Sentence,
  solvedClues: Set<string>,
  path: string = "",
  eligibleClues: Array<{ clue: Clue; path: string }> = []
): Array<{ clue: Clue; path: string }> {
  if (!sentence.clues || sentence.clues.length === 0) {
    return eligibleClues;
  }

  for (let i = 0; i < sentence.clues.length; i++) {
    const clue = sentence.clues[i];
    const cluePath = path ? `${path}-${i}` : `${i}`;
    
    // Skip already solved clues
    if (solvedClues.has(cluePath)) {
      // Recursively check nested clues even if this one is solved
      if (clue.clues && clue.clues.length > 0) {
        findEligibleClues(clue, solvedClues, cluePath, eligibleClues);
      }
      continue;
    }
    
    // Check if all inner clues are solved
    const allInnerCluesSolved = !clue.clues || clue.clues.length === 0 || 
      clue.clues.every((_, innerIdx) => {
        const innerPath = `${cluePath}-${innerIdx}`;
        return solvedClues.has(innerPath);
      });
    
    // If this clue has no inner clues OR all inner clues are solved, it's eligible
    if (!clue.clues || clue.clues.length === 0 || allInnerCluesSolved) {
      eligibleClues.push({ clue, path: cluePath });
    }
    
    // Recursively check nested clues (only if this clue is not already solved)
    if (clue.clues && clue.clues.length > 0) {
      findEligibleClues(clue, solvedClues, cluePath, eligibleClues);
    }
  }
  
  return eligibleClues;
}

