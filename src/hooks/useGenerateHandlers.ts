import { useCallback } from 'react'
import type { ClueNode, SelectionState } from './useGenerateState'
import { getTomorrowDate } from '../utils/api'

interface UseGenerateHandlersProps {
  sentenceText: string
  clues: Map<string, ClueNode>
  setClues: React.Dispatch<React.SetStateAction<Map<string, ClueNode>>>
  selections: Map<string, SelectionState & { clueText: string }>
  setSelections: React.Dispatch<React.SetStateAction<Map<string, SelectionState & { clueText: string }>>>
  setIsSentenceLocked: React.Dispatch<React.SetStateAction<boolean>>
  setSentenceText: React.Dispatch<React.SetStateAction<string>>
  setScheduledDate: React.Dispatch<React.SetStateAction<string>>
}

export const useGenerateHandlers = ({
  sentenceText,
  clues,
  setClues,
  selections,
  setSelections,
  setIsSentenceLocked,
  setSentenceText,
  setScheduledDate
}: UseGenerateHandlersProps) => {
  const handleSubmitSentence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sentenceText.trim()) {
      alert('Si us plau, introdueix una frase primer')
      return
    }
    setIsSentenceLocked(true)
    setSelections(new Map())
  }

  const handleReset = () => {
    if (clues.size > 0 || selections.size > 0) {
      if (!confirm('Reiniciar esborrarà totes les pistes i seleccions existents. Continuar?')) {
        return
      }
    }
    setSentenceText('')
    setIsSentenceLocked(false)
    setClues(new Map())
    setSelections(new Map())
    setScheduledDate(getTomorrowDate())
    // Clear localStorage
    try {
      localStorage.removeItem('brackets-generator-state')
    } catch (error) {
      console.error('Failed to clear generator state from localStorage:', error)
    }
  }

  const handleSelection = useCallback((sourceId: string | null, start: number, end: number, text: string) => {
    let maxLength: number
    if (sourceId === null) {
      maxLength = sentenceText.length
    } else {
      maxLength = Infinity
    }
    
    if (start >= 0 && end > start && end <= maxLength && text.trim().length > 0) {
      const selectionId = `${sourceId || 'sentence'}-${start}-${end}-${Date.now()}`
      
      setSelections(new Map([
        [selectionId, { 
          sourceId, 
          start, 
          end, 
          text: text.trim(),
          clueText: ''
        }]
      ]))
    }
  }, [sentenceText, setSelections])

  const removeSelection = (selectionId: string) => {
    setSelections(prev => {
      const updated = new Map(prev)
      updated.delete(selectionId)
      return updated
    })
  }

  const updateSelectionClueText = (selectionId: string, clueText: string) => {
    setSelections(prev => {
      const updated = new Map(prev)
      const selection = updated.get(selectionId)
      if (selection) {
        updated.set(selectionId, { ...selection, clueText })
      }
      return updated
    })
  }

  const createClue = (sourceId: string | null, startIndex: number, endIndex: number, clueText: string) => {
    const parentClue = sourceId ? clues.get(sourceId) : null
    
    let selectedValue: string
    let relativeStartIndex: number

    if (parentClue) {
      selectedValue = parentClue.text.substring(startIndex, endIndex)
      relativeStartIndex = startIndex
    } else {
      selectedValue = sentenceText.substring(startIndex, endIndex)
      relativeStartIndex = startIndex
    }

    const clueId = `clue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const level = parentClue ? parentClue.level + 1 : 0

    const newClue: ClueNode = {
      id: clueId,
      text: clueText,
      value: selectedValue,
      startIndex: relativeStartIndex,
      clues: [],
      level,
      parentId: sourceId || undefined,
    }

    setClues(prev => {
      const updated = new Map(prev)
      updated.set(clueId, newClue)
      
      if (sourceId) {
        const parent = updated.get(sourceId)
        if (parent) {
          const existingClues = (parent.clues || []).filter(c => (c as ClueNode).id) as ClueNode[]
          const updatedParent = {
            ...parent,
            clues: [...existingClues, newClue]
          }
          updated.set(sourceId, updatedParent)
        }
      }
      
      return updated
    })
  }

  const handleCreateClue = (selectionId: string) => {
    const selection = selections.get(selectionId)
    
    if (!selection) {
      alert('Selecció no trobada')
      return
    }
    
    if (!selection.clueText.trim()) {
      alert('Si us plau, introdueix un text per la pista')
      return
    }
    
    createClue(selection.sourceId, selection.start, selection.end, selection.clueText)
    removeSelection(selectionId)
  }

  const updateClue = (clueId: string, updates: Partial<ClueNode>) => {
    setClues(prev => {
      const updated = new Map(prev)
      const clue = updated.get(clueId)
      if (clue) {
        const updatedClue = { ...clue, ...updates }
        updated.set(clueId, updatedClue)
        
        if (clue.parentId) {
          const parent = updated.get(clue.parentId)
          if (parent && parent.clues) {
            const updatedParentClues = parent.clues.map(c => {
              const clueNode = c as ClueNode
              return clueNode.id === clueId ? updatedClue : c
            })
            updated.set(clue.parentId, {
              ...parent,
              clues: updatedParentClues
            })
          }
        }
      }
      return updated
    })
  }

  const deleteClue = (clueId: string) => {
    setClues(prev => {
      const updated = new Map(prev)
      const clue = updated.get(clueId)
      
      if (!clue) return updated

      if (clue.parentId) {
        const parent = updated.get(clue.parentId)
        if (parent) {
          updated.set(clue.parentId, {
            ...parent,
            clues: (parent.clues || []).filter(c => (c as ClueNode).id !== clueId)
          })
        }
      }

      const deleteNested = (id: string) => {
        const c = updated.get(id)
        if (c?.clues) {
          c.clues.forEach(nested => {
            deleteNested((nested as ClueNode).id)
          })
        }
        updated.delete(id)
      }

      deleteNested(clueId)
      return updated
    })

    setSelections(prev => {
      const updated = new Map(prev)
      Array.from(prev.entries()).forEach(([selectionId, selection]) => {
        if (selection.sourceId === clueId) {
          updated.delete(selectionId)
        }
      })
      return updated
    })
  }

  return {
    handleSubmitSentence,
    handleReset,
    handleSelection,
    updateSelectionClueText,
    handleCreateClue,
    updateClue,
    deleteClue
  }
}

