import './ScoreModal.css'

interface ScoreModalProps {
  isOpen: boolean
  score: number
  onClose: () => void
}

export const ScoreModal = ({ isOpen, score, onClose }: ScoreModalProps) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getScoreMessage = () => {
    if (score >= 90) return 'Excel·lent!'
    if (score >= 75) return 'Molt bé!'
    if (score >= 60) return 'Bé!'
    if (score >= 40) return 'No està malament'
    return 'Pots millorar!'
  }

  return (
    <div className="score-modal-overlay" onClick={handleOverlayClick}>
      <div className="score-modal">
        <div className="score-modal-header">
          <h2>[Partida Finalitzada]</h2>
          <button onClick={onClose} className="score-modal-close-btn" title="Tancar">
            ×
          </button>
        </div>
        <div className="score-modal-content">
          <div className="score-display">
            <div className="score-value">{score.toFixed(0)} / 100</div>
            <div className="score-label">Puntuació</div>
          </div>
          <div className="score-message">{getScoreMessage()}</div>
        </div>
        <div className="score-modal-footer">
          <button onClick={onClose} className="score-modal-ok-btn">
            Entesos
          </button>
        </div>
      </div>
    </div>
  )
}

