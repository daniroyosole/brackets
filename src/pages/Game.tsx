import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { initialSentence } from '../mockData'
import type { Sentence, Clue } from '../models/sentence'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { findMatchingClue } from '../utils/gameHelpers'
import { findEligibleClues } from '../utils/sentenceTransform'
import { HelpModal } from '../components/game/HelpModal'
import { ClueActionModal } from '../components/game/ClueActionModal'
import { ScoreModal } from '../components/game/ScoreModal'
import { countAllClues, calculateScore, areAllCluesSolved } from '../utils/scoreCalculator'
import './Game.css'

const Game = () => {
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [firstLetterModal, setFirstLetterModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; firstLetter: string } | null>(null)
  const [solveClueModal, setSolveClueModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; clueValue: string } | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<number>(() => {
    const saved = localStorage.getItem('gameWrongAnswers')
    if (saved) {
      try {
        return parseInt(saved, 10) || 0
      } catch {
        return 0
      }
    }
    return 0
  })
  const [fullClueReveals, setFullClueReveals] = useState<number>(() => {
    const saved = localStorage.getItem('gameFullClueReveals')
    if (saved) {
      try {
        return parseInt(saved, 10) || 0
      } catch {
        return 0
      }
    }
    return 0
  })
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('hasSeenHelp')
    if (!hasSeenHelp) {
      setIsHelpModalOpen(true)
      localStorage.setItem('hasSeenHelp', 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gameSolvedClues', JSON.stringify(Array.from(solvedClues)))
  }, [solvedClues])

  useEffect(() => {
    localStorage.setItem('gameRevealedFirstLetters', JSON.stringify(Array.from(revealedFirstLetters)))
  }, [revealedFirstLetters])

  useEffect(() => {
    localStorage.setItem('gameWrongAnswers', wrongAnswers.toString())
  }, [wrongAnswers])

  useEffect(() => {
    localStorage.setItem('gameFullClueReveals', fullClueReveals.toString())
  }, [fullClueReveals])

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

  const handleSolveClue = useCallback(() => {
    if (solveClueModal) {
      setSolvedClues(prev => new Set(prev).add(solveClueModal.cluePath))
      setFullClueReveals(prev => prev + 1)
      setSolveClueModal(null)
    }
  }, [solveClueModal])

  const handleCancelSolveClue = useCallback(() => {
    setSolveClueModal(null)
  }, [])

  const sentence = useMemo(() => {
    const saved = localStorage.getItem('gameJsonInput')
    if (saved) {
      try {
        return JSON.parse(saved) as Sentence
      } catch {
        return initialSentence
      }
    }
    return initialSentence
  }, [])

  // Calculate score and check if game is finished
  const totalClues = useMemo(() => countAllClues(sentence), [sentence])
  const score = useMemo(() => {
    return calculateScore(
      totalClues,
      revealedFirstLetters.size,
      fullClueReveals,
      wrongAnswers
    )
  }, [totalClues, revealedFirstLetters.size, fullClueReveals, wrongAnswers])

  // Log score whenever it changes
  useEffect(() => {
    console.log('Current score:', score)
  }, [score])

  const isGameFinished = useMemo(() => {
    return areAllCluesSolved(sentence, solvedClues)
  }, [sentence, solvedClues])

  // Show score modal when game finishes (including on page load if already finished)
  useEffect(() => {
    if (isGameFinished) {
      setIsScoreModalOpen(true)
    }
  }, [isGameFinished])

  const eligibleCluePaths = useMemo(() => {
    const eligible = findEligibleClues(sentence, solvedClues)
    return new Set(eligible.map(({ path }) => path))
  }, [sentence, solvedClues])

  const handleClueClick = useCallback((cluePath: string) => {
    const clueInfo = findClueByPath(sentence, cluePath)
    if (!clueInfo) {
      return
    }

    // Si ja té la primera lletra revelada, mostrar modal per resoldre
    if (revealedFirstLetters.has(cluePath)) {
      setSolveClueModal({
        isOpen: true,
        cluePath,
        clueText: clueInfo.clueText,
        clueValue: clueInfo.clue.value
      })
    } else {
      // Si no té la primera lletra revelada, mostrar modal per revelar primera lletra
      setFirstLetterModal({
        isOpen: true,
        cluePath,
        clueText: clueInfo.clueText,
        firstLetter: clueInfo.clue.value[0] || ''
      })
    }
  }, [sentence, revealedFirstLetters, findClueByPath])

  const answerInputRef = useRef<HTMLInputElement>(null)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  useEffect(() => {
    // Handle viewport changes when keyboard or browser UI appears/disappears
    const handleResize = () => {
      // Use visual viewport if available (better for mobile keyboard)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        setViewportHeight(window.innerHeight)
      }
    }

    // Listen to visual viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const matchingClue = findMatchingClue(sentence, solvedClues, inputValue)
    
    if (matchingClue) {
      setSolvedClues(prev => new Set(prev).add(matchingClue.path))
      setInputValue('')
    } else if (inputValue.trim()) {
      // Track wrong answer only if input is not empty
      setWrongAnswers(prev => prev + 1)
      setInputValue('')
    }
  }

  const handleInputFocus = () => {
    // Scroll to show sentence container top when keyboard opens on mobile
    setTimeout(() => {
      const sentenceWrapper = document.querySelector('.sentence-wrapper') as HTMLElement
      if (sentenceWrapper) {
        // Scroll to top of sentence container so user can see the beginning
        sentenceWrapper.scrollTo({ top: 0, behavior: 'smooth' })
      }
      // Input should already be visible due to flex layout
    }, 300)
  }

  return (
    <div 
      className="game-container"
      style={{ 
        '--viewport-height': `${viewportHeight}px` 
      } as React.CSSProperties}
    >
      <div className="game-header">
        <h1>[Claudàtors]</h1>
        <div className="game-header-actions">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="help-btn"
            title="Ajuda"
          >
            ?
          </button>
        </div>
      </div>

      <div className="game-stats">
        <span className="stat-item">
          <span className="stat-emoji">✅</span>
          <span className="stat-value">{solvedClues.size} / {totalClues}</span>
        </span>
        <span className="stat-item">
          <span className="stat-emoji">🔍</span>
          <span className="stat-value">{revealedFirstLetters.size}</span>
        </span>
        <span className="stat-item">
          <span className="stat-emoji">💡</span>
          <span className="stat-value">{revealedFirstLetters.size + fullClueReveals}</span>
        </span>
        <span className="stat-item">
          <span className="stat-emoji">❌</span>
          <span className="stat-value">{wrongAnswers}</span>
        </span>
      </div>

      <div className="game-content">
        <div className="sentence-wrapper">
          <SentenceComponent 
            sentence={sentence} 
            solvedClues={solvedClues}
            eligibleCluePaths={eligibleCluePaths}
            revealedFirstLetters={revealedFirstLetters}
            onClueClick={handleClueClick}
          />
        </div>
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            ref={answerInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleInputFocus}
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
        <ClueActionModal
          isOpen={firstLetterModal.isOpen}
          title="Revelar la Primera Lletra"
          clueText={firstLetterModal.clueText}
          confirmButtonText="Sí, revelar"
          onConfirm={handleRevealFirstLetter}
          onCancel={handleCancelFirstLetter}
        />
      )}

      {solveClueModal && (
        <ClueActionModal
          isOpen={solveClueModal.isOpen}
          title="Resoldre"
          clueText={solveClueModal.clueText}
          confirmButtonText="Sí, resoldre"
          onConfirm={handleSolveClue}
          onCancel={handleCancelSolveClue}
        />
      )}

      <ScoreModal
        isOpen={isScoreModalOpen}
        score={score}
        onClose={() => setIsScoreModalOpen(false)}
      />
    </div>
  )
}

export default Game

