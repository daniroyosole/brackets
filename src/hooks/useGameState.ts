import { useState, useEffect, useMemo } from 'react'
import type { Sentence } from '../models/sentence'
import { 
  checkGameVersion, 
  getStoredSet, 
  saveSet, 
  getStoredNumber, 
  saveNumber, 
  checkAndClearIfDateChanged,
  getDefaultGameState,
  isStoredDateValid
} from '../utils/storageUtils'
import { countAllClues, calculateScore, areAllCluesSolved } from '../utils/scoreCalculator'
import { findEligibleClues } from '../utils/sentenceTransform'
import { getDailySentence, getTodayDate } from '../utils/api'

const NO_SENTENCE_ERROR = 'Avui de moment no hi ha frase, segurament estem de vacances'

/**
 * Hook to manage all game state including localStorage persistence
 */
export const useGameState = () => {
  // Check version on mount (runs synchronously before state initialization)
  checkGameVersion()
  
  // Check if date changed and clear storage if needed (before initializing state)
  // This must be done synchronously before state initialization
  const today = getTodayDate()
  checkAndClearIfDateChanged(today) // Clear if date changed
  const isValidDate = isStoredDateValid(today)

  // Initialize state with stored values or defaults
  const [solvedClues, setSolvedClues] = useState<Set<string>>(() => {
    return isValidDate ? getStoredSet('gameSolvedClues') : new Set()
  })
  
  const [revealedFirstLetters, setRevealedFirstLetters] = useState<Set<string>>(() => {
    return isValidDate ? getStoredSet('gameRevealedFirstLetters') : new Set()
  })
  
  const [wrongAnswers, setWrongAnswers] = useState<number>(() => {
    return isValidDate ? getStoredNumber('gameWrongAnswers', 0) : 0
  })
  
  const [fullClueReveals, setFullClueReveals] = useState<number>(() => {
    return isValidDate ? getStoredNumber('gameFullClueReveals', 0) : 0
  })

  // Persist to localStorage
  useEffect(() => {
    saveSet('gameSolvedClues', solvedClues)
  }, [solvedClues])

  useEffect(() => {
    saveSet('gameRevealedFirstLetters', revealedFirstLetters)
  }, [revealedFirstLetters])

  useEffect(() => {
    saveNumber('gameWrongAnswers', wrongAnswers)
  }, [wrongAnswers])

  useEffect(() => {
    saveNumber('gameFullClueReveals', fullClueReveals)
  }, [fullClueReveals])

  // State for sentence loaded from API
  const [sentence, setSentence] = useState<Sentence>({ text: '', date: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to reset game state to defaults
  const resetGameState = () => {
    const defaults = getDefaultGameState()
    setSolvedClues(defaults.solvedClues)
    setRevealedFirstLetters(defaults.revealedFirstLetters)
    setWrongAnswers(defaults.wrongAnswers)
    setFullClueReveals(defaults.fullClueReveals)
  }

  // Fetch daily sentence on mount
  useEffect(() => {
    const fetchDailySentence = async () => {
      setIsLoading(true)
      try {
        const today = getTodayDate()
        const dailySentence = await getDailySentence(today)
        
        // Check if the date matches the stored date
        if (checkAndClearIfDateChanged(dailySentence.date)) {
          // Date changed, reset state to defaults
          resetGameState()
        }
        
        setSentence(dailySentence)
        // Save to localStorage
        localStorage.setItem('gameJsonInput', JSON.stringify(dailySentence))
        localStorage.setItem('gameDate', dailySentence.date)
      } catch (error) {
        console.error('Error fetching daily sentence:', error)
        // Fallback to localStorage or show error
        const saved = localStorage.getItem('gameJsonInput')
        if (saved) {
          try {
            const savedSentence = JSON.parse(saved) as Sentence
            const today = getTodayDate()
            
            // Check if stored date matches today
            if (checkAndClearIfDateChanged(today)) {
              // Date changed, reset state and show error
              resetGameState()
              setError(NO_SENTENCE_ERROR)
            } else {
              setSentence(savedSentence)
            }
          } catch {
            setError(NO_SENTENCE_ERROR)
          }
        } else {
          setError(NO_SENTENCE_ERROR)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailySentence()
  }, [])

  // Calculate derived state
  const totalClues = useMemo(() => countAllClues(sentence), [sentence])
  const score = useMemo(() => {
    return calculateScore(
      totalClues,
      revealedFirstLetters.size,
      fullClueReveals,
      wrongAnswers
    )
  }, [totalClues, revealedFirstLetters.size, fullClueReveals, wrongAnswers])

  const isGameFinished = useMemo(() => {
    return areAllCluesSolved(sentence, solvedClues)
  }, [sentence, solvedClues])

  const eligibleCluePaths = useMemo(() => {
    const eligible = findEligibleClues(sentence, solvedClues)
    return new Set(eligible.map(({ path }) => path))
  }, [sentence, solvedClues])

  return {
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
  }
}

