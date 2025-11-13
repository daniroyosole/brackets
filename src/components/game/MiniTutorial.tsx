import { useState, useEffect, useRef } from 'react'
import type { Sentence } from '../../models/sentence'
import { Sentence as SentenceComponent } from './Sentence'
import { findMatchingClue } from '../../utils/gameHelpers'
import { findEligibleClues } from '../../utils/sentenceTransform'

interface MiniTutorialProps {
  sentence: Sentence
  onComplete: () => void
}

export const MiniTutorial = ({ sentence, onComplete }: MiniTutorialProps) => {
  const [input, setInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [revealedFirstLetters, setRevealedFirstLetters] = useState<Set<string>>(new Set())
  const [inputError, setInputError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input after 2 seconds
  useEffect(() => {
    if (!solved) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [solved])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const solvedClues = solved ? new Set(['0']) : new Set<string>()
    const matchingClue = findMatchingClue(sentence, solvedClues, input)
    
    if (matchingClue) {
      setSolved(true)
      setInput('')
      setInputError(false)
    } else if (input.trim()) {
      setInputError(true)
      setTimeout(() => {
        setInput('')
        setInputError(false)
      }, 800)
    }
  }

  const handleClueClick = (cluePath: string) => {
    // Only allow revealing the first letter, not solving the clue
    if (!revealedFirstLetters.has(cluePath)) {
      setRevealedFirstLetters(prev => new Set(prev).add(cluePath))
    }
  }

  const eligibleCluePaths = new Set(findEligibleClues(sentence, new Set()).map(({ path }) => path))

  return (
    <>
      <div className="help-modal-content">
        <div className="help-section">
          <p><strong>Escriu</strong> aquesta pista per continuar:</p>
          <p className="mini-tutorial-hint">💡 Pots clicar <strong>un cop</strong> a la pista per saber la primera lletra.</p>
          <div className="mini-tutorial-sentence">
            <SentenceComponent 
              sentence={sentence} 
              solvedClues={solved ? new Set(['0']) : new Set()}
              eligibleCluePaths={eligibleCluePaths}
              revealedFirstLetters={revealedFirstLetters}
              lastSolvedClue={solved ? '0' : null}
              onClueClick={handleClueClick}
            />
          </div>
          {solved ? (
            <p className="mini-tutorial-success">✅ Correcte! Ara pots començar a jugar.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mini-tutorial-form">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Introdueix la resposta..."
                className={`mini-tutorial-input ${inputError ? 'input-error' : ''}`}
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
          onClick={onComplete} 
          className="help-modal-ok-btn"
          disabled={!solved}
        >
          Començar
        </button>
      </div>
    </>
  )
}

