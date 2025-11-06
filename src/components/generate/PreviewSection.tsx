import { Sentence as SentenceComponent } from '../game/Sentence'
import type { Sentence } from '../../models/sentence'

interface PreviewSectionProps {
  sentence: Sentence
  isExpanded: boolean
  onToggle: () => void
}

export const PreviewSection = ({ sentence, isExpanded, onToggle }: PreviewSectionProps) => {
  return (
    <div className="preview-section">
      <div className="preview-section-header">
        <h2>Vista prèvia</h2>
        <button
          onClick={onToggle}
          className="collapse-toggle-btn"
          type="button"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      {isExpanded && (
        <div className="preview-content">
          <SentenceComponent 
            sentence={sentence}
            solvedClues={new Set()}
            eligibleCluePaths={new Set()}
            revealedFirstLetters={new Set()}
            onClueClick={() => {}}
          />
        </div>
      )}
    </div>
  )
}

