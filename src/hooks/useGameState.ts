import { useState, useEffect, useMemo } from 'react'
import type { Sentence } from '../models/sentence'
import { checkGameVersion, getStoredSet, saveSet, getStoredNumber, saveNumber, clearGameState } from '../utils/storageUtils'
import { countAllClues, calculateScore, areAllCluesSolved } from '../utils/scoreCalculator'
import { findEligibleClues } from '../utils/sentenceTransform'
import { getDailySentence, getTodayDate } from '../utils/api'

const NO_SENTENCE_ERROR = 'Avui de moment no hi ha frase, segurament estem de vacances'

/**
 * Helper function to check if stored date matches today
 * If not, clears game state (but not core settings like hasSeenHelp)
 */
const checkAndClearIfDateChanged = () => {
  const storedDate = localStorage.getItem('gameDate')
  const today = getTodayDate()
  
  if (storedDate && storedDate !== today) {
    // Date changed, clear game state (but keep core settings)
    clearGameState()
    return true
  }
  return false
}

/**
 * Hook to manage all game state including localStorage persistence
 */
export const useGameState = () => {
  // Check version on mount (runs synchronously before state initialization)
  checkGameVersion()
  
  // Check if date changed and clear storage if needed (before initializing state)
  // This must be done synchronously before state initialization
  const dateChanged = checkAndClearIfDateChanged()

  const [solvedClues, setSolvedClues] = useState<Set<string>>(() => {
    // If date changed or no date stored, return empty set
    if (dateChanged || !localStorage.getItem('gameDate')) return new Set()
    // Double check: compare stored date with today
    const storedDate = localStorage.getItem('gameDate')
    const today = getTodayDate()
    if (storedDate !== today) return new Set()
    return getStoredSet('gameSolvedClues')
  })
  const [revealedFirstLetters, setRevealedFirstLetters] = useState<Set<string>>(() => {
    // If date changed or no date stored, return empty set
    if (dateChanged || !localStorage.getItem('gameDate')) return new Set()
    // Double check: compare stored date with today
    const storedDate = localStorage.getItem('gameDate')
    const today = getTodayDate()
    if (storedDate !== today) return new Set()
    return getStoredSet('gameRevealedFirstLetters')
  })
  const [wrongAnswers, setWrongAnswers] = useState<number>(() => {
    // If date changed or no date stored, return 0
    if (dateChanged || !localStorage.getItem('gameDate')) return 0
    // Double check: compare stored date with today
    const storedDate = localStorage.getItem('gameDate')
    const today = getTodayDate()
    if (storedDate !== today) return 0
    return getStoredNumber('gameWrongAnswers', 0)
  })
  const [fullClueReveals, setFullClueReveals] = useState<number>(() => {
    // If date changed or no date stored, return 0
    if (dateChanged || !localStorage.getItem('gameDate')) return 0
    // Double check: compare stored date with today
    const storedDate = localStorage.getItem('gameDate')
    const today = getTodayDate()
    if (storedDate !== today) return 0
    return getStoredNumber('gameFullClueReveals', 0)
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

  // Fetch daily sentence on mount
  useEffect(() => {
    const fetchDailySentence = async () => {
      setIsLoading(true)
      try {
        const today = getTodayDate()
        const dailySentence = await getDailySentence(today)
        
        // Check if the date matches the stored date
        const storedDate = localStorage.getItem('gameDate')
        if (storedDate && storedDate !== dailySentence.date) {
          // Date changed, clear game state (but keep core settings)
          clearGameState()
          // Reset state to initial values - this is critical to prevent mixing data
          setSolvedClues(new Set())
          setRevealedFirstLetters(new Set())
          setWrongAnswers(0)
          setFullClueReveals(0)
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
            const storedDate = localStorage.getItem('gameDate')
            
            // Check if stored date matches today
            const today = getTodayDate()
            if (storedDate && storedDate !== today) {
              // Date changed, clear game state (but keep core settings)
              clearGameState()
              // Reset state to initial values
              setSolvedClues(new Set())
              setRevealedFirstLetters(new Set())
              setWrongAnswers(0)
              setFullClueReveals(0)
              // Show error message
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

  // Log score whenever it changes
  useEffect(() => {
    console.log('Current score:', score)
  }, [score])

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

