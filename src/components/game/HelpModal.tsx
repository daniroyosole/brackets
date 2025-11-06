import { useState, useEffect } from 'react'
import type { Sentence } from '../../models/sentence'
import { MiniTutorial } from './MiniTutorial'
import './HelpModal.css'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mini tutorial sentence
const miniTutorialSentence: Sentence = {
  text: 'Benvingut a Claudàtors',
  date: '',
  clues: [
    {
      text: 'Obre una porta o una partitura',
      value: 'Clau',
      startIndex: 12,
      date: ''
    }
  ]
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [isMiniTutorial, setIsMiniTutorial] = useState(false)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const completed = localStorage.getItem('hasSeenHelp') === 'true'
      setHasCompletedTutorial(completed)
      setStep(1)
      setIsMiniTutorial(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only allow closing if tutorial is already completed
    if (hasCompletedTutorial && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleClose = () => {
    // Only allow closing if tutorial is already completed
    if (hasCompletedTutorial) {
      onClose()
    }
  }

  const handleContinue = () => {
    // Only allow going to step 2 if tutorial is not completed
    if (!hasCompletedTutorial && step === 1) {
      setStep(2)
      setIsMiniTutorial(true)
    }
  }

  const handleMiniTutorialComplete = () => {
    // Only mark tutorial as completed when user solves the mini tutorial
    localStorage.setItem('hasSeenHelp', 'true')
    setHasCompletedTutorial(true)
    setIsMiniTutorial(false)
    onClose()
  }

  if (step === 2 && isMiniTutorial) {
    return (
      <div className="help-modal-overlay help-modal-overlay-locked">
        <div className="help-modal">
          <div className="help-modal-header">
            <h2>Prova-ho tu mateix</h2>
          </div>
          <MiniTutorial
            sentence={miniTutorialSentence}
            onComplete={handleMiniTutorialComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="help-modal-overlay" onClick={handleOverlayClick}>
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>[Com Jugar]</h2>
          {hasCompletedTutorial && (
            <button onClick={handleClose} className="help-modal-close-btn" title="Tancar">
              ×
            </button>
          )}
        </div>
        <div className="help-modal-content">
          <div className="help-section">
            <h3>Com funciona</h3>
            <p>Les paraules marcades amb <span className="help-example-clue">[fons blau]</span> són pistes que pots resoldre! ✅</p>
            <p>Pensa la resposta, <strong>escriu-la</strong> al camp inferior i prem <strong>Enter</strong> o clica <strong>Enviar</strong>. Si encertes, la pista es revelarà automàticament! ✨</p>
          </div>
          <div className="help-section">
            <h3>Demanar ajuda</h3>
            <p>Si et quedes encallat, pots clicar una pista blava per demanar ajuda:</p>
            <ul>
              <li><strong>1r clic:</strong> Revela la primera lletra 🔍</li>
              <li><strong>2n clic:</strong> Revela la resposta completa 💡</li>
            </ul>
            <p>Recorda que demanar ajuda redueix la teva puntuació final, però pot ser útil si realment t'encalles! 😊</p>
          </div>
        </div>
        <div className="help-modal-footer">
          {hasCompletedTutorial ? (
            <button onClick={handleClose} className="help-modal-ok-btn">
              Tancar
            </button>
          ) : (
            <button onClick={handleContinue} className="help-modal-ok-btn">
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

