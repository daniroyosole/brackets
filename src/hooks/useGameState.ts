import { useState, useEffect, useMemo } from 'react'
import { initialSentence } from '../mockData'
import type { Sentence } from '../models/sentence'
import { checkGameVersion, getStoredSet, saveSet, getStoredNumber, saveNumber } from '../utils/storageUtils'
import { countAllClues, calculateScore, areAllCluesSolved } from '../utils/scoreCalculator'
import { findEligibleClues } from '../utils/sentenceTransform'

/**
 * Hook to manage all game state including localStorage persistence
 */
export const useGameState = () => {
  // Check version on mount (runs synchronously before state initialization)
  checkGameVersion()

  const [solvedClues, setSolvedClues] = useState<Set<string>>(() => 
    getStoredSet('gameSolvedClues')
  )
  const [revealedFirstLetters, setRevealedFirstLetters] = useState<Set<string>>(() => 
    getStoredSet('gameRevealedFirstLetters')
  )
  const [wrongAnswers, setWrongAnswers] = useState<number>(() => 
    getStoredNumber('gameWrongAnswers', 0)
  )
  const [fullClueReveals, setFullClueReveals] = useState<number>(() => 
    getStoredNumber('gameFullClueReveals', 0)
  )

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

  // Get sentence from localStorage or use initial
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
    eligibleCluePaths
  }
}

