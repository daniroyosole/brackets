import { useState, useEffect } from 'react'
import type { Sentence } from '../../models/sentence'
import { Sentence as SentenceComponent } from './Sentence'
import { findMatchingClue } from '../../utils/gameHelpers'
import { findEligibleClues } from '../../utils/sentenceTransform'
import './HelpModal.css'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mini tutorial sentence
const miniTutorialSentence: Sentence = {
  text: 'Benvingut a Claudàtors',
  clues: [
    {
      text: 'Obre una porta o una partitura',
      value: 'Clau',
      startIndex: 12
    }
  ]
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [isMiniTutorial, setIsMiniTutorial] = useState(false)
  const [miniTutorialInput, setMiniTutorialInput] = useState('')
  const [miniTutorialSolved, setMiniTutorialSolved] = useState(false)
  const [miniTutorialRevealedFirstLetters, setMiniTutorialRevealedFirstLetters] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setIsMiniTutorial(false)
      setMiniTutorialInput('')
      setMiniTutorialSolved(false)
      setMiniTutorialRevealedFirstLetters(new Set())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContinue = () => {
    if (step === 1) {
      setStep(2)
      setIsMiniTutorial(true)
    } else if (miniTutorialSolved) {
      // Only mark tutorial as completed when user solves the mini tutorial
      localStorage.setItem('hasSeenHelp', 'true')
      setIsMiniTutorial(false)
      onClose()
    }
  }

  const handleMiniTutorialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const solvedClues = miniTutorialSolved ? new Set(['0']) : new Set<string>()
    const matchingClue = findMatchingClue(miniTutorialSentence, solvedClues, miniTutorialInput)
    
    if (matchingClue) {
      setMiniTutorialSolved(true)
      setMiniTutorialInput('')
    } else if (miniTutorialInput.trim()) {
      // Wrong answer - could show feedback but for now just clear
      setMiniTutorialInput('')
    }
  }

  const handleMiniTutorialClueClick = (cluePath: string) => {
    if (miniTutorialRevealedFirstLetters.has(cluePath)) {
      // Second click - reveal full clue (solved)
      setMiniTutorialSolved(true)
      setMiniTutorialRevealedFirstLetters(prev => {
        const updated = new Set(prev)
        updated.delete(cluePath)
        return updated
      })
    } else {
      // First click - reveal first letter
      setMiniTutorialRevealedFirstLetters(prev => new Set(prev).add(cluePath))
    }
  }

  const eligibleCluePaths = new Set(findEligibleClues(miniTutorialSentence, new Set()).map(({ path }) => path))

  if (step === 2 && isMiniTutorial) {
    return (
      <div className="help-modal-overlay help-modal-overlay-locked">
        <div className="help-modal">
          <div className="help-modal-header">
            <h2>Prova-ho tu mateix</h2>
          </div>
          <div className="help-modal-content">
            <div className="help-section">
              <p><strong>Escriu</strong> aquesta pista per continuar:</p>
              <p className="mini-tutorial-hint">💡 Pots clicar <strong>un cop</strong> a la pista per saber la primera lletra, o <strong>dos cops</strong> per resoldre-la si t'has encallat.</p>
              <div className="mini-tutorial-sentence">
                <SentenceComponent 
                  sentence={miniTutorialSentence} 
                  solvedClues={miniTutorialSolved ? new Set(['0']) : new Set()}
                  eligibleCluePaths={eligibleCluePaths}
                  revealedFirstLetters={miniTutorialRevealedFirstLetters}
                  onClueClick={handleMiniTutorialClueClick}
                />
              </div>
              {miniTutorialSolved ? (
                <p className="mini-tutorial-success">✅ Correcte! Ara pots començar a jugar.</p>
              ) : (
                <form onSubmit={handleMiniTutorialSubmit} className="mini-tutorial-form">
                  <input
                    type="text"
                    value={miniTutorialInput}
                    onChange={(e) => setMiniTutorialInput(e.target.value)}
                    placeholder="Introdueix la resposta..."
                    className="mini-tutorial-input"
                    autoFocus
                  />
                  <button type="submit" className="mini-tutorial-submit-btn">
                    Enviar
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="help-modal-footer">
            <button 
              onClick={handleContinue} 
              className="help-modal-ok-btn"
              disabled={!miniTutorialSolved}
            >
              Començar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="help-modal-overlay">
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>[Com Jugar]</h2>
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
          <button onClick={handleContinue} className="help-modal-ok-btn">
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

