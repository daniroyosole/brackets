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
    <div className="selection-card">
      <div className="card-header">
        <h3>Create Clue</h3>
        <button onClick={onCancel} className="close-card-btn" title="Close">
          ×
        </button>
      </div>
      <div className="card-content">
        <div className="card-field">
          <label>Selected Value:</label>
          <div className="selected-value">{selection.text}</div>
        </div>
        <div className="card-field">
          <label>Clue Text (what the user will see):</label>
          <input
            type="text"
            value={selection.clueText}
            onChange={(e) => onClueTextChange(selectionId, e.target.value)}
            placeholder="Enter clue description..."
            className="clue-text-input"
            autoFocus
          />
        </div>
        <div className="card-actions">
          <button 
            onClick={() => onCreateClue(selectionId)} 
            className="create-btn"
          >
            Create Clue
          </button>
          <button 
            onClick={onCancel} 
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

