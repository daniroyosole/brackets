import './FirstLetterModal.css'

interface FirstLetterModalProps {
  isOpen: boolean
  clueText: string
  firstLetter: string
  onConfirm: () => void
  onCancel: () => void
}

export const FirstLetterModal = ({ isOpen, clueText, onConfirm, onCancel }: FirstLetterModalProps) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="first-letter-modal-overlay" onClick={handleOverlayClick}>
      <div className="first-letter-modal">
        <div className="first-letter-modal-header">
          <h3>Revelar Primera Lletra</h3>
          <button onClick={onCancel} className="first-letter-modal-close-btn" title="Tancar">
            ×
          </button>
        </div>
        <div className="first-letter-modal-content">
          <p>Vols veure la primera lletra de la pista <strong>"{clueText}"</strong>?</p>
        </div>
        <div className="first-letter-modal-footer">
          <button onClick={onConfirm} className="first-letter-confirm-btn">
            Sí, revelar
          </button>
          <button onClick={onCancel} className="first-letter-cancel-btn">
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  )
}

