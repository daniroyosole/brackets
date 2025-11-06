import './ScoreModal.css'
import { useNextGameTimer } from '../../hooks/useNextGameTimer'

interface ScoreModalProps {
  isOpen: boolean
  score: number
  onClose: () => void
}

export const ScoreModal = ({ isOpen, score, onClose }: ScoreModalProps) => {
  const timeRemaining = useNextGameTimer()
  
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getScoreEmoji = (): string => {
    if (score === 100) return '🍓'
    if (score >= 81) return '🍉'
    if (score >= 61) return '🍑'
    if (score >= 41) return '🍋'
    if (score >= 21) return '🥦'
    return '🥔'
  }

  const getScoreMessage = () => {
    if (score === 100) return 'Excel·lent'
    if (score >= 81) return 'Espectacular!'
    if (score >= 61) return 'Fantàstic!'
    if (score >= 41) return 'Molt bé!'
    if (score >= 21) return "T'hi vas acostant!"
    return 'Casi bé!'
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
            <div className="score-emoji">{getScoreEmoji()}</div>
            <div className="score-value">{score.toFixed(0)} / 100</div>
            <div className="score-label">Puntuació</div>
          </div>
          <div className="score-message">{getScoreMessage()}</div>
          <div className="next-game-timer">
            <span className="next-game-text">Proper joc disponible en</span>
            <span className="next-game-time">{timeRemaining}</span>
          </div>
        </div>
        <div className="score-modal-footer">
          <button onClick={onClose} className="score-modal-ok-btn">
            D'acord
          </button>
        </div>
      </div>
    </div>
  )
}

