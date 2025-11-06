import type { Sentence, Clue } from "../models/sentence";
import React from "react";

/**
 * Normalizes a string by removing accents and converting to lowercase.
 * Used for case-insensitive and accent-insensitive string comparison.
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .trim();
}

/**
 * Recursively renders a sentence with highlighted eligible clues.
 * Replaces clue values with their text (after recursively transforming nested clues).
 * If a clue is solved, shows its value instead of [text].
 * Eligible clues are highlighted with the 'clue-eligible' class.
 */
export function renderSentenceWithHighlighting(
  sentence: Sentence,
  solvedClues: Set<string>,
  eligibleCluePaths: Set<string>,
  revealedFirstLetters: Set<string>,
  onClueClick: (cluePath: string) => void,
  path: string = ""
): React.ReactNode {
  if (!sentence.clues || sentence.clues.length === 0) {
    return sentence.text;
  }

  const result: React.ReactNode[] = [];
  const text = sentence.text;

  // Sort clues by startIndex in forward order for rendering
  const cluesWithIndices = sentence.clues.map((clue, idx) => ({ clue, originalIdx: idx }));
  const sortedClues = [...cluesWithIndices].sort((a, b) => a.clue.startIndex - b.clue.startIndex);

  let lastIndex = 0;

  for (const { clue, originalIdx } of sortedClues) {
    const cluePath = path ? `${path}-${originalIdx}` : `${originalIdx}`;
    const isSolved = solvedClues.has(cluePath);
    const isEligible = eligibleCluePaths.has(cluePath);

    // Add text before this clue
    if (clue.startIndex > lastIndex) {
      result.push(text.substring(lastIndex, clue.startIndex));
    }

    if (isSolved) {
      // If solved, show the value directly
      result.push(clue.value);
    } else {
      // If not solved, recursively render the clue
      const clueContent = renderSentenceWithHighlighting(clue, solvedClues, eligibleCluePaths, revealedFirstLetters, onClueClick, cluePath);
      
      const hasFirstLetterRevealed = revealedFirstLetters.has(cluePath);
      const displayContent = hasFirstLetterRevealed 
        ? <>{clueContent} <strong>({clue.value[0].toUpperCase()})</strong></>
        : clueContent;

      // Wrap in brackets with highlighting if eligible
      if (isEligible) {
        result.push(
          <span 
            key={cluePath} 
            className="clue-eligible"
            onClick={() => onClueClick(cluePath)}
            style={{ cursor: 'pointer' }}
          >
            [{displayContent}]
          </span>
        );
      } else {
        result.push(<span key={cluePath}>[{clueContent}]</span>);
      }
    }

    lastIndex = clue.startIndex + clue.value.length;
  }

  // Add remaining text after all clues
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return <>{result}</>;
}

/**
 * Creates a path string for a clue at a given index.
 * Optimized to avoid repeated string concatenation.
 * @param parentPath - The parent path (empty string for root)
 * @param index - The clue index
 * @returns The full path string
 */
function createCluePath(parentPath: string, index: number): string {
  return parentPath ? `${parentPath}-${index}` : `${index}`;
}

/**
 * Checks if all inner clues of a clue are solved.
 * Separated for better readability and testability.
 * @param clue - The clue to check
 * @param cluePath - The path of the clue
 * @param solvedClues - Set of solved clue paths
 * @returns True if all inner clues are solved or there are no inner clues
 */
function areAllInnerCluesSolved(
  clue: Clue,
  cluePath: string,
  solvedClues: Set<string>
): boolean {
  if (!clue.clues || clue.clues.length === 0) {
    return true;
  }
  
  return clue.clues.every((_, innerIdx) => {
    const innerPath = createCluePath(cluePath, innerIdx);
    return solvedClues.has(innerPath);
  });
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
    const cluePath = createCluePath(path, i);
    const hasInnerClues = Boolean(clue.clues && clue.clues.length > 0);
    
    // Skip already solved clues - if a clue is solved, all its inner clues are also solved
    if (solvedClues.has(cluePath)) {
      continue;
    }
    
    // Check if this clue is eligible (no inner clues or all inner clues solved)
    if (!hasInnerClues || areAllInnerCluesSolved(clue, cluePath, solvedClues)) {
      eligibleClues.push({ clue, path: cluePath });
    }
    
    // Recursively check nested clues (only if this clue is not solved)
    if (hasInnerClues) {
      findEligibleClues(clue, solvedClues, cluePath, eligibleClues);
    }
  }
  
  return eligibleClues;
}

