import { useState } from 'react'
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

export const useGenerateState = () => {
  const [sentenceText, setSentenceText] = useState('')
  const [isSentenceLocked, setIsSentenceLocked] = useState(false)
  const [clues, setClues] = useState<Map<string, ClueNode>>(new Map())
  const [selections, setSelections] = useState<Map<string, SelectionState & { clueText: string }>>(new Map())
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)

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
    setIsJsonExpanded
  }
}

