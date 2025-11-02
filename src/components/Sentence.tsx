import type { Sentence as SentenceType } from "../models/sentence";

interface SentenceComponentProps {
  sentence: SentenceType;
  solvedClues: Set<string>;
  eligibleCluePaths: Set<string>;
}

/**
 * Recursively renders a sentence with highlighted eligible clues.
 */
function renderSentence(
  sentence: SentenceType,
  solvedClues: Set<string>,
  eligibleCluePaths: Set<string>,
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
      const clueContent = renderSentence(clue, solvedClues, eligibleCluePaths, cluePath);

      // Wrap in brackets with highlighting if eligible
      if (isEligible) {
        result.push(
          <span key={cluePath} className="clue-eligible">
            [{clueContent}]
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

export const Sentence = ({ 
  sentence, 
  solvedClues,
  eligibleCluePaths
}: SentenceComponentProps) => {
  return (
    <div className="sentence">
      {renderSentence(sentence, solvedClues, eligibleCluePaths)}
    </div>
  );
}