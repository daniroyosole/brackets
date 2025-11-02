import type { Sentence as SentenceType } from "../../models/sentence";
import { renderSentenceWithHighlighting } from "../../utils/sentenceTransform";
import './Sentence.css'

interface SentenceComponentProps {
  sentence: SentenceType;
  solvedClues: Set<string>;
  eligibleCluePaths: Set<string>;
}

export const Sentence = ({ 
  sentence, 
  solvedClues,
  eligibleCluePaths
}: SentenceComponentProps) => {
  return (
    <div className="sentence">
      {renderSentenceWithHighlighting(sentence, solvedClues, eligibleCluePaths)}
    </div>
  );
}

