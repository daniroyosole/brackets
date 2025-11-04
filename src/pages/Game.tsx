import { useState, useMemo, useCallback, useEffect } from 'react'
import { initialSentence } from '../mockData'
import type { Sentence, Clue } from '../models/sentence'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { findMatchingClue } from '../utils/gameHelpers'
import { findEligibleClues } from '../utils/sentenceTransform'
import { HelpModal } from '../components/game/HelpModal'
import { FirstLetterModal } from '../components/game/FirstLetterModal'
import './Game.css'

const Game = () => {
  const [jsonInput, setJsonInput] = useState<string>(() => {
    const saved = localStorage.getItem('gameJsonInput')
    return saved || JSON.stringify(initialSentence, null, 2)
  })
  const [solvedClues, setSolvedClues] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('gameSolvedClues')
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch {
        return new Set()
      }
    }
    return new Set()
  })
  const [revealedFirstLetters, setRevealedFirstLetters] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('gameRevealedFirstLetters')
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch {
        return new Set()
      }
    }
    return new Set()
  })
  const [inputValue, setInputValue] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonExpanded, setIsJsonExpanded] = useState(() => {
    const saved = localStorage.getItem('gameJsonExpanded')
    return saved === 'true'
  })
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [firstLetterModal, setFirstLetterModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; } | null>(null)

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('hasSeenHelp')
    if (!hasSeenHelp) {
      setIsHelpModalOpen(true)
      localStorage.setItem('hasSeenHelp', 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gameJsonInput', jsonInput)
  }, [jsonInput])

  useEffect(() => {
    localStorage.setItem('gameSolvedClues', JSON.stringify(Array.from(solvedClues)))
  }, [solvedClues])

  useEffect(() => {
    localStorage.setItem('gameJsonExpanded', String(isJsonExpanded))
  }, [isJsonExpanded])

  useEffect(() => {
    localStorage.setItem('gameRevealedFirstLetters', JSON.stringify(Array.from(revealedFirstLetters)))
  }, [revealedFirstLetters])

  const findClueByPath = useCallback((sentenceObj: Sentence, targetPath: string, currentPath: string = ""): { clue: Clue; clueText: string } | null => {
    if (!sentenceObj.clues || sentenceObj.clues.length === 0) {
      return null
    }

    for (let i = 0; i < sentenceObj.clues.length; i++) {
      const clue = sentenceObj.clues[i]
      const cluePath = currentPath ? `${currentPath}-${i}` : `${i}`
      
      if (cluePath === targetPath) {
        return { clue, clueText: clue.text }
      }

      if (clue.clues) {
        const nested = findClueByPath(clue, targetPath, cluePath)
        if (nested) {
          return nested
        }
      }
    }

    return null
  }, [])

  const handleRevealFirstLetter = useCallback(() => {
    if (firstLetterModal) {
      setRevealedFirstLetters(prev => new Set(prev).add(firstLetterModal.cluePath))
      setFirstLetterModal(null)
    }
  }, [firstLetterModal])

  const handleCancelFirstLetter = useCallback(() => {
    setFirstLetterModal(null)
  }, [])

  const sentence = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput) as Sentence
      setJsonError(null)
      return parsed
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'JSON invàlid')
      return initialSentence
    }
  }, [jsonInput])

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value)
    // Clear solved clues and revealed first letters when JSON changes
    setSolvedClues(new Set())
    setRevealedFirstLetters(new Set())
  }, [])

  const eligibleCluePaths = useMemo(() => {
    const eligible = findEligibleClues(sentence, solvedClues)
    return new Set(eligible.map(({ path }) => path))
  }, [sentence, solvedClues])

  const handleClueClick = useCallback((cluePath: string) => {
    if (revealedFirstLetters.has(cluePath)) {
      return
    }

    const clueInfo = findClueByPath(sentence, cluePath)
    if (clueInfo) {
      setFirstLetterModal({
        isOpen: true,
        cluePath,
        clueText: clueInfo.clueText,
      })
    }
  }, [sentence, revealedFirstLetters, findClueByPath])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const matchingClue = findMatchingClue(sentence, solvedClues, inputValue)
    
    if (matchingClue) {
      setSolvedClues(prev => new Set(prev).add(matchingClue.path))
      setInputValue('')
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>[Claudàtors]</h1>
        <div className="game-header-actions">
          {solvedClues.size > 0 && (
            <button 
              onClick={() => {
                setSolvedClues(new Set())
                setInputValue('')
              }} 
              className="reset-game-btn"
            >
              Reiniciar
            </button>
          )}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="help-btn"
            title="Ajuda"
          >
            ?
          </button>
        </div>
      </div>
      
      <div className="json-input-section">
        <div className="json-input-header">
          <label htmlFor="sentence-json">Entrada JSON de la frase:</label>
          <button
            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
            className="collapse-toggle-btn"
            type="button"
          >
            {isJsonExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isJsonExpanded && (
          <>
            {jsonError && (
              <div className="json-error">
                Error JSON: {jsonError}
              </div>
            )}
            <textarea
              id="sentence-json"
              value={jsonInput}
              onChange={handleJsonChange}
              className="sentence-json-input"
              rows={10}
              readOnly={solvedClues.size > 0}
            />
            {solvedClues.size > 0 && (
              <div className="json-locked-message">
                El JSON està bloquejat mentre jugues. Reinicia per editar.
              </div>
            )}
          </>
        )}
      </div>

      <div className="game-content">
        <SentenceComponent 
          sentence={sentence} 
          solvedClues={solvedClues}
          eligibleCluePaths={eligibleCluePaths}
          revealedFirstLetters={revealedFirstLetters}
          onClueClick={handleClueClick}
        />
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
              placeholder="Introdueix una resposta..."
            className="answer-input"
          />
          <button type="submit" className="submit-btn">Enviar</button>
        </form>
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {firstLetterModal && (
        <FirstLetterModal
          isOpen={firstLetterModal.isOpen}
          clueText={firstLetterModal.clueText}
          onConfirm={handleRevealFirstLetter}
          onCancel={handleCancelFirstLetter}
        />
      )}
    </div>
  )
}

export default Game

