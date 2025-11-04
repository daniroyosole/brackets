import type { Sentence as SentenceType } from "../../models/sentence";
import { renderSentenceWithHighlighting } from "../../utils/sentenceTransform";
import './Sentence.css'

interface SentenceComponentProps {
  sentence: SentenceType;
  solvedClues: Set<string>;
  eligibleCluePaths: Set<string>;
  revealedFirstLetters: Set<string>;
  onClueClick: (cluePath: string) => void;
}

export const Sentence = ({ 
  sentence, 
  solvedClues,
  eligibleCluePaths,
  revealedFirstLetters,
  onClueClick
}: SentenceComponentProps) => {
  return (
    <div className="sentence">
      {renderSentenceWithHighlighting(sentence, solvedClues, eligibleCluePaths, revealedFirstLetters, onClueClick)}
    </div>
  );
}

