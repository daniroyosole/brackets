import { useCallback } from 'react'
import type { Sentence } from '../models/sentence'
import { findClueByPath } from '../utils/gameHelpers'
import { findMatchingClue } from '../utils/gameHelpers'

interface UseGameHandlersProps {
  sentence: Sentence
  solvedClues: Set<string>
  setSolvedClues: React.Dispatch<React.SetStateAction<Set<string>>>
  revealedFirstLetters: Set<string>
  setRevealedFirstLetters: React.Dispatch<React.SetStateAction<Set<string>>>
  setWrongAnswers: React.Dispatch<React.SetStateAction<number>>
  setFullClueReveals: React.Dispatch<React.SetStateAction<number>>
  setFirstLetterModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; cluePath: string; clueText: string; firstLetter: string } | null>>
  setSolveClueModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; cluePath: string; clueText: string; clueValue: string } | null>>
}

export const useGameHandlers = ({
  sentence,
  solvedClues,
  setSolvedClues,
  revealedFirstLetters,
  setRevealedFirstLetters,
  setWrongAnswers,
  setFullClueReveals,
  setFirstLetterModal,
  setSolveClueModal
}: UseGameHandlersProps) => {
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
  }, [sentence, revealedFirstLetters, setFirstLetterModal, setSolveClueModal])

  const handleRevealFirstLetter = useCallback(() => {
    setFirstLetterModal(prev => {
      if (prev) {
        setRevealedFirstLetters(state => new Set(state).add(prev.cluePath))
        return null
      }
      return prev
    })
  }, [setRevealedFirstLetters, setFirstLetterModal])

  const handleCancelFirstLetter = useCallback(() => {
    setFirstLetterModal(null)
  }, [setFirstLetterModal])

  const handleSolveClue = useCallback(() => {
    setSolveClueModal(prev => {
      if (prev) {
        setSolvedClues(state => new Set(state).add(prev.cluePath))
        setFullClueReveals(state => state + 1)
        return null
      }
      return prev
    })
  }, [setSolvedClues, setFullClueReveals, setSolveClueModal])

  const handleCancelSolveClue = useCallback(() => {
    setSolveClueModal(null)
  }, [setSolveClueModal])

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>, inputValue: string, setInputValue: (value: string) => void) => {
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
  }, [sentence, solvedClues, setSolvedClues, setWrongAnswers])

  const handleInputFocus = useCallback(() => {
    // Scroll to show sentence container top when keyboard opens on mobile
    setTimeout(() => {
      const sentenceWrapper = document.querySelector('.sentence-wrapper') as HTMLElement
      if (sentenceWrapper) {
        // Scroll to top of sentence container so user can see the beginning
        sentenceWrapper.scrollTo({ top: 0, behavior: 'smooth' })
      }
      // Input should already be visible due to flex layout
    }, 300)
  }, [])

  return {
    handleClueClick,
    handleRevealFirstLetter,
    handleCancelFirstLetter,
    handleSolveClue,
    handleCancelSolveClue,
    handleSubmit,
    handleInputFocus
  }
}

