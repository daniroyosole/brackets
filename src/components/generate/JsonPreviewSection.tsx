import type { Sentence } from '../../models/sentence'

interface JsonPreviewSectionProps {
  sentence: Sentence
  isExpanded: boolean
  onToggle: () => void
}

export const JsonPreviewSection = ({ sentence, isExpanded, onToggle }: JsonPreviewSectionProps) => {
  return (
    <div className="json-preview-section">
      <div className="json-preview-section-header">
        <h2>Resultat JSON</h2>
        <button
          onClick={onToggle}
          className="collapse-toggle-btn"
          type="button"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      {isExpanded && (
        <div className="json-preview-container">
          <pre className="json-preview-content">
            {JSON.stringify(sentence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

