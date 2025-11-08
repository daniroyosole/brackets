import { useCallback, useMemo } from 'react'
import type { Sentence, Clue } from '../models/sentence'
import type { ClueNode } from '../hooks/useGenerateState'

export const useGenerateHelpers = (
  sentenceText: string,
  clues: Map<string, ClueNode>,
  scheduledDate: string
) => {
  const getRootClues = useCallback(() => {
    return Array.from(clues.values()).filter(c => !c.parentId)
  }, [clues])

  const buildSentence = useCallback((): Sentence => {
    const rootClues = getRootClues()
    
    const convertClueNode = (clueNode: ClueNode): Clue => {
      const latestClue = clues.get(clueNode.id) || clueNode
      const nestedClues = (latestClue.clues || []).filter(c => (c as ClueNode).id) as ClueNode[]
      const latestNestedClues = nestedClues.map(nested => clues.get(nested.id) || nested)
      
      return {
        text: latestClue.text,
        value: latestClue.value,
        startIndex: latestClue.startIndex,
        clues: latestNestedClues.length > 0 ? latestNestedClues.map(convertClueNode) : undefined
      }
    }
    
    return {
      date: scheduledDate,
      text: sentenceText,
      clues: rootClues.length > 0 ? rootClues.map(convertClueNode) : undefined
    }
  }, [sentenceText, clues, getRootClues, scheduledDate])

  const sentence = useMemo(() => buildSentence(), [buildSentence])

  return {
    getRootClues,
    sentence
  }
}

