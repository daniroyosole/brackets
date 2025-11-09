import { useRef, useCallback, useState, useEffect } from 'react'
import type { Clue } from '../../models/sentence'
import './GenerateComponents.css'

interface ClueNode extends Clue {
  id: string
  parentId?: string
  level: number
}

interface SentencePillProps {
  text: string
  sourceId: string | null
  rootClues: ClueNode[]
  onSelection: (sourceId: string | null, start: number, end: number, text: string) => void
}

interface SelectionInfo {
  start: number
  end: number
  text: string
}

export const SentencePill = ({ text, sourceId, rootClues, onSelection }: SentencePillProps) => {
  const pillRef = useRef<HTMLDivElement>(null)
  const [currentSelection, setCurrentSelection] = useState<SelectionInfo | null>(null)

  const sortedClues = [...rootClues].sort((a, b) => a.startIndex - b.startIndex)

  const renderSentenceWithSegments = () => {
    const segments: Array<{ text: string; isUsed: boolean; start: number; end: number }> = []
    
    if (sortedClues.length === 0) {
      return (
        <span className="pill-text">
          <span className="pill-text-normal">
            {text}
          </span>
        </span>
      )
    }

    let lastIndex = 0
    
    for (const clue of sortedClues) {
      if (clue.startIndex > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, clue.startIndex),
          isUsed: false,
          start: lastIndex,
          end: clue.startIndex
        })
      }

      const clueEnd = clue.startIndex + clue.value.length
      segments.push({
        text: text.substring(clue.startIndex, clueEnd),
        isUsed: true,
        start: clue.startIndex,
        end: clueEnd
      })

      lastIndex = clueEnd
    }

    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isUsed: false,
        start: lastIndex,
        end: text.length
      })
    }

    return (
      <span className="pill-text">
        {segments.map((segment, idx) => (
          <span
            key={idx}
            className={segment.isUsed ? 'pill-text-used' : 'pill-text-normal'}
          >
            {segment.text}
          </span>
        ))}
      </span>
    )
  }

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return
    }

    const range = selection.getRangeAt(0)
    if (!pillRef.current?.contains(range.commonAncestorContainer)) {
      return
    }

    const selectedTextRaw = selection.toString().trim()
    if (!selectedTextRaw || selectedTextRaw.length === 0) {
      return
    }

    const textNode = pillRef.current.querySelector('.pill-text')
    if (!textNode) {
      return
    }

    if (range.commonAncestorContainer === pillRef.current || 
        pillRef.current.querySelector('.pill-metadata')?.contains(range.commonAncestorContainer)) {
      return
    }

    const startRange = range.cloneRange()
    startRange.selectNodeContents(textNode)
    startRange.setEnd(range.startContainer, range.startOffset)
    const start = startRange.toString().length

    const endRange = range.cloneRange()
    endRange.selectNodeContents(textNode)
    endRange.setEnd(range.endContainer, range.endOffset)
    const end = endRange.toString().length

    const rawSelected = text.substring(start, end)
    if (!rawSelected) {
      return
    }

    const trimmed = rawSelected.trim()
    if (!trimmed) {
      return
    }

    const trimOffset = rawSelected.indexOf(trimmed)
    const adjustedStart = start + (trimOffset >= 0 ? trimOffset : 0)
    const adjustedEnd = adjustedStart + trimmed.length

    const overlappingClue = sortedClues.find(clue => {
      const clueEnd = clue.startIndex + clue.value.length
      return !(adjustedEnd <= clue.startIndex || adjustedStart >= clueEnd)
    })

    if (overlappingClue) {
      const clueStart = overlappingClue.startIndex
      const clueEnd = clueStart + overlappingClue.value.length

      if (adjustedStart >= clueStart && adjustedEnd <= clueEnd) {
        // Completely inside existing clue – block
        selection.removeAllRanges()
        return
      }

      if (adjustedStart < clueStart && adjustedEnd > clueStart && adjustedEnd <= clueEnd) {
        const segmentStart = adjustedStart
        const segmentEnd = clueStart
        const segmentText = text.substring(segmentStart, segmentEnd).trim()

        if (!segmentText) {
          selection.removeAllRanges()
          return
        }

        setCurrentSelection({
          start: segmentStart,
          end: segmentEnd,
          text: segmentText
        })
        return
      }

      if (adjustedEnd > clueEnd && adjustedStart >= clueStart && adjustedStart < clueEnd) {
        const segmentStart = clueEnd
        const segmentEnd = adjustedEnd
        const segmentText = text.substring(segmentStart, segmentEnd).trim()

        if (!segmentText) {
          selection.removeAllRanges()
          return
        }

        setCurrentSelection({
          start: segmentStart,
          end: segmentEnd,
          text: segmentText
        })
        return
      }

      if (adjustedStart < clueStart && adjustedEnd > clueEnd) {
        const segmentTextBefore = text.substring(adjustedStart, clueStart).trim()
        const segmentTextAfter = text.substring(clueEnd, adjustedEnd).trim()

        if (segmentTextBefore) {
          setCurrentSelection({
            start: adjustedStart,
            end: clueStart,
            text: segmentTextBefore
          })
          return
        }

        if (segmentTextAfter) {
          setCurrentSelection({
            start: clueEnd,
            end: adjustedEnd,
            text: segmentTextAfter
          })
          return
        }

        selection.removeAllRanges()
        return
      }
    }

    if (adjustedStart >= 0 && adjustedEnd > adjustedStart && adjustedEnd <= text.length) {
      setCurrentSelection({
        start: adjustedStart,
        end: adjustedEnd,
        text: trimmed
      })
    }
  }, [text, sortedClues])

  const handleCreateClue = useCallback(() => {
    if (currentSelection) {
      onSelection(sourceId, currentSelection.start, currentSelection.end, currentSelection.text)
      setCurrentSelection(null)
      window.getSelection()?.removeAllRanges()
    }
  }, [currentSelection, sourceId, onSelection])

  useEffect(() => {
    const handleSelectionChangeEvent = () => {
      handleSelectionChange()
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        currentSelection &&
        pillRef.current &&
        !pillRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement
        if (target.closest('.create-clue-button')) {
          return
        }
        setCurrentSelection(null)
        window.getSelection()?.removeAllRanges()
      }
    }

    document.addEventListener('selectionchange', handleSelectionChangeEvent)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChangeEvent)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [currentSelection, handleSelectionChange])

  return (
    <div className="sentence-pill-wrapper">
      <div 
        ref={pillRef}
        className="pill sentence-pill"
      >
        {renderSentenceWithSegments()}
      </div>
      {currentSelection && (
        <div className="selection-button-container">
          <button
            className="create-clue-button"
            onClick={handleCreateClue}
            type="button"
          >
            Crear Pista
          </button>
        </div>
      )}
    </div>
  )
}

