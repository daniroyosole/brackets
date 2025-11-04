import './ClueActionModal.css'

interface ClueActionModalProps {
  isOpen: boolean
  title: string
  clueText: string
  confirmButtonText: string
  onConfirm: () => void
  onCancel: () => void
}

export const ClueActionModal = ({ 
  isOpen, 
  title, 
  clueText, 
  confirmButtonText, 
  onConfirm, 
  onCancel 
}: ClueActionModalProps) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="clue-action-modal-overlay" onClick={handleOverlayClick}>
      <div className="clue-action-modal">
        <div className="clue-action-modal-header">
          <h3>{title}</h3>
          <button onClick={onCancel} className="clue-action-modal-close-btn" title="Tancar">
            ×
          </button>
        </div>
        <div className="clue-action-modal-content">
          <p>Vols {title.toLowerCase()} la pista <strong>"{clueText}"</strong>?</p>
        </div>
        <div className="clue-action-modal-footer">
          <button onClick={onConfirm} className="clue-action-confirm-btn">
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}

