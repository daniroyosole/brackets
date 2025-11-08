import './ScoreModal.css'
import { useNextGameTimer } from '../../hooks/useNextGameTimer'
import { useState } from 'react'

interface ScoreModalProps {
  isOpen: boolean
  score: number
  onClose: () => void
  onShowStats?: () => void
  solvedClues: number
  totalClues: number
  revealedFirstLetters: number
  fullClueReveals: number
  wrongAnswers: number
}

export const ScoreModal = ({ 
  isOpen, 
  score, 
  onClose,
  onShowStats,
  solvedClues, 
  totalClues, 
  revealedFirstLetters, 
  fullClueReveals, 
  wrongAnswers 
}: ScoreModalProps) => {
  const timeRemaining = useNextGameTimer()
  const [copied, setCopied] = useState(false)
  
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

  const formatDate = () => {
    const today = new Date()
    const day = today.getDate()
    const month = today.toLocaleDateString('ca-ES', { month: 'long' })
    const year = today.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  const generateShareText = () => {
    const emoji = getScoreEmoji()
    const date = formatDate()
    
    return `[Claudàtors] - ${date}

${emoji} Puntuació: ${score.toFixed(0)}/100

📊 Estadístiques:
✅ Encerts: ${solvedClues}/${totalClues}
🔍 Primera lletra: ${revealedFirstLetters}
💡 Pista sencera: ${fullClueReveals}
❌ Errors: ${wrongAnswers}

Juga a: https://brackets-delta.vercel.app/`
  }

  const handleShare = async () => {
    const shareText = generateShareText()
    
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '[Claudàtors]',
          text: shareText,
        })
        return
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
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
          <button onClick={handleShare} className="score-modal-share-btn">
            {copied ? '✓ Copiat!' : '📤 Compartir resultats'}
          </button>
          {onShowStats && (
            <button onClick={onShowStats} className="score-modal-stats-btn">
              📊 Veure estadístiques
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

