import { useState, useEffect, useRef } from 'react'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { HelpModal } from '../components/game/HelpModal'
import { ClueActionModal } from '../components/game/ClueActionModal'
import { ScoreModal } from '../components/game/ScoreModal'
import { GameStats } from '../components/game/GameStats'
import { useGameState } from '../hooks/useGameState'
import { useGameHandlers } from '../hooks/useGameHandlers'
import { useHelpModal } from '../hooks/useHelpModal'
import { useViewportHeight } from '../hooks/useViewportHeight'
import './Game.css'

const Game = () => {
  const [inputValue, setInputValue] = useState('')
  const [firstLetterModal, setFirstLetterModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; firstLetter: string } | null>(null)
  const [solveClueModal, setSolveClueModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; clueValue: string } | null>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)

  const {
    sentence,
    solvedClues,
    setSolvedClues,
    revealedFirstLetters,
    setRevealedFirstLetters,
    wrongAnswers,
    setWrongAnswers,
    fullClueReveals,
    setFullClueReveals,
    totalClues,
    score,
    isGameFinished,
    eligibleCluePaths
  } = useGameState()

  const { isHelpModalOpen, setIsHelpModalOpen } = useHelpModal()
  const viewportHeight = useViewportHeight()

  const {
    handleClueClick,
    handleRevealFirstLetter,
    handleCancelFirstLetter,
    handleSolveClue,
    handleCancelSolveClue,
    handleSubmit,
    handleInputFocus
  } = useGameHandlers({
    sentence,
    solvedClues,
    setSolvedClues,
    revealedFirstLetters,
    setRevealedFirstLetters,
    setWrongAnswers,
    setFullClueReveals,
    setFirstLetterModal,
    setSolveClueModal
  })

  // Show score modal when game finishes (including on page load if already finished)
  useEffect(() => {
    if (isGameFinished) {
      setIsScoreModalOpen(true)
    }
  }, [isGameFinished])

  const answerInputRef = useRef<HTMLInputElement>(null)

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

      <GameStats
        solvedClues={solvedClues.size}
        totalClues={totalClues}
        revealedFirstLetters={revealedFirstLetters.size}
        fullClueReveals={fullClueReveals}
        wrongAnswers={wrongAnswers}
      />

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
        <form onSubmit={(e) => handleSubmit(e, inputValue, setInputValue)} className="answer-form">
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

