import { useState, useEffect } from 'react'
import { getTomorrowDate } from '../utils/api'
import type { Clue } from '../models/sentence'

export interface ClueNode extends Clue {
  id: string
  parentId?: string
  level: number
}

export interface SelectionState {
  sourceId: string | null // null for sentence, clue ID for clues
  start: number
  end: number
  text: string
}

const STORAGE_KEY = 'brackets-generator-state'

interface PersistedState {
  sentenceText: string
  isSentenceLocked: boolean
  clues: Array<[string, ClueNode]>
  selections: Array<[string, SelectionState & { clueText: string }]>
  isPreviewExpanded: boolean
  isJsonExpanded: boolean
  scheduledDate: string
}

const loadState = (): Partial<PersistedState> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

const saveState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save generator state:', error)
  }
}

export const useGenerateState = () => {
  const [sentenceText, setSentenceText] = useState('')
  const [isSentenceLocked, setIsSentenceLocked] = useState(false)
  const [clues, setClues] = useState<Map<string, ClueNode>>(new Map())
  const [selections, setSelections] = useState<Map<string, SelectionState & { clueText: string }>>(new Map())
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(getTomorrowDate())
  const [isInitialized, setIsInitialized] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadState()
    if (loaded) {
      if (loaded.sentenceText !== undefined) setSentenceText(loaded.sentenceText)
      if (loaded.isSentenceLocked !== undefined) setIsSentenceLocked(loaded.isSentenceLocked)
      if (loaded.clues) setClues(new Map(loaded.clues))
      if (loaded.selections) setSelections(new Map(loaded.selections))
      if (loaded.isPreviewExpanded !== undefined) setIsPreviewExpanded(loaded.isPreviewExpanded)
      if (loaded.isJsonExpanded !== undefined) setIsJsonExpanded(loaded.isJsonExpanded)
      if (loaded.scheduledDate) setScheduledDate(loaded.scheduledDate)
    }
    setIsInitialized(true)
  }, [])

  // Save state to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return

    saveState({
      sentenceText,
      isSentenceLocked,
      clues: Array.from(clues.entries()),
      selections: Array.from(selections.entries()),
      isPreviewExpanded,
      isJsonExpanded,
      scheduledDate
    })
  }, [sentenceText, isSentenceLocked, clues, selections, isPreviewExpanded, isJsonExpanded, scheduledDate, isInitialized])

  return {
    sentenceText,
    setSentenceText,
    isSentenceLocked,
    setIsSentenceLocked,
    clues,
    setClues,
    selections,
    setSelections,
    isPreviewExpanded,
    setIsPreviewExpanded,
    isJsonExpanded,
    setIsJsonExpanded,
    scheduledDate,
    setScheduledDate
  }
}

