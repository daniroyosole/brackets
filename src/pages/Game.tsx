import { useState, useEffect, useRef } from 'react'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { HelpModal } from '../components/game/HelpModal'
import { ClueActionModal } from '../components/game/ClueActionModal'
import { ScoreModal } from '../components/game/ScoreModal'
import { StatsModal } from '../components/game/StatsModal'
import { GameStats } from '../components/game/GameStats'
import { useGameState } from '../hooks/useGameState'
import { useGameHandlers } from '../hooks/useGameHandlers'
import { useHelpModal } from '../hooks/useHelpModal'
import { saveGameResult } from '../utils/statsApi'
import { getTodayDate } from '../utils/api'
import './Game.css'

const Game = () => {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState(false)
  const [firstLetterModal, setFirstLetterModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; firstLetter: string } | null>(null)
  const [solveClueModal, setSolveClueModal] = useState<{ isOpen: boolean; cluePath: string; clueText: string; clueValue: string } | null>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

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
    eligibleCluePaths,
    isLoading,
    error
  } = useGameState()

  const { isHelpModalOpen, setIsHelpModalOpen } = useHelpModal()

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
    setSolveClueModal,
    setInputError
  })

  // Show score modal when game finishes (including on page load if already finished)
  useEffect(() => {
    if (isGameFinished) {
      setIsScoreModalOpen(true)
      // Save game result to statistics
      saveGameResult(score, getTodayDate()).catch(err => {
        console.error('Error saving game result:', err)
      })
    }
  }, [isGameFinished, score])

  const answerInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) {
    return (
      <div className="game-container">
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregant partida...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="game-error">
          <div className="error-emoji">🏖️</div>
          <p className="error-text">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button
          onClick={() => setIsStatsModalOpen(true)}
          className="stats-btn"
          title="Estadístiques"
        >
          📊
        </button>
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
            className={`answer-input ${inputError ? 'input-error' : ''}`}
            disabled={isGameFinished}
          />
          <button type="submit" className="submit-btn" disabled={isGameFinished}>Enviar</button>
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
          message={`Vols revelar la primera lletra de la pista <strong>"${firstLetterModal.clueText}"</strong>?`}
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
          message={`Vols resoldre la pista <strong>"${solveClueModal.clueText}"</strong>?`}
          onConfirm={handleSolveClue}
          onCancel={handleCancelSolveClue}
        />
      )}

          <ScoreModal
            isOpen={isScoreModalOpen}
            score={score}
            onClose={() => setIsScoreModalOpen(false)}
            onShowStats={() => {
              setIsScoreModalOpen(false)
              setIsStatsModalOpen(true)
            }}
            solvedClues={solvedClues.size}
            totalClues={totalClues}
            revealedFirstLetters={revealedFirstLetters.size}
            fullClueReveals={fullClueReveals}
            wrongAnswers={wrongAnswers}
          />

          <StatsModal
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
          />
        </div>
      )
    }
    
    export default Game

