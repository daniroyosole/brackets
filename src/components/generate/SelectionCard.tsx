import './GenerateComponents.css'

interface SelectionState {
  sourceId: string | null
  start: number
  end: number
  text: string
  clueText: string
}

interface SelectionCardProps {
  selection: SelectionState
  selectionId: string
  onClueTextChange: (selectionId: string, clueText: string) => void
  onCreateClue: (selectionId: string) => void
  onCancel: () => void
}

export const SelectionCard = ({
  selection,
  selectionId,
  onClueTextChange,
  onCreateClue,
  onCancel
}: SelectionCardProps) => {
  return (
    <div
      className="selection-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="selection-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-header">
          <h3>Crear Pista</h3>
          <button onClick={onCancel} className="close-card-btn" title="Tancar">
            ×
          </button>
        </div>
        <div className="card-content">
          <div className="card-field">
            <label className="card-label">Valor Seleccionat:</label>
            <div className="selected-value">{selection.text}</div>
          </div>
          <div className="card-field">
            <label className="card-label">Text de la Pista (el que veurà l'usuari):</label>
            <input
              type="text"
              value={selection.clueText}
              onChange={(e) => onClueTextChange(selectionId, e.target.value)}
              placeholder="Introdueix la descripció de la pista..."
              className="clue-text-input"
              autoFocus
            />
          </div>
          <div className="card-actions">
            <button 
              onClick={() => onCreateClue(selectionId)} 
              className="button button-primary"
            >
              Crear Pista
            </button>
            <button 
              onClick={onCancel} 
              className="button button-secondary"
            >
              Cancel·lar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

