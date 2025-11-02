import { useRef, useCallback, useEffect } from 'react'
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

export const SentencePill = ({ text, sourceId, rootClues, onSelection }: SentencePillProps) => {
  const pillRef = useRef<HTMLDivElement>(null)

  // Sort clues by startIndex
  const sortedClues = [...rootClues].sort((a, b) => a.startIndex - b.startIndex)
  
  // Build segments of the sentence: normal text and used (grayed-out) text
  const renderSentenceWithSegments = () => {
    const segments: Array<{ text: string; isUsed: boolean; start: number; end: number }> = []
    
    if (sortedClues.length === 0) {
      // No clues, return the full text as one segment with data attributes
      return (
        <span className="pill-text">
          <span className="pill-text-normal" data-start={0} data-end={text.length}>
            {text}
          </span>
        </span>
      )
    }

    let lastIndex = 0
    
    for (const clue of sortedClues) {
      // Add text before this clue
      if (clue.startIndex > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, clue.startIndex),
          isUsed: false,
          start: lastIndex,
          end: clue.startIndex
        })
      }
      
      // Add the clue's covered text (grayed out)
      const clueEnd = clue.startIndex + clue.value.length
      segments.push({
        text: text.substring(clue.startIndex, clueEnd),
        isUsed: true,
        start: clue.startIndex,
        end: clueEnd
      })
      
      lastIndex = clueEnd
    }
    
    // Add remaining text after all clues
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
            data-start={segment.start}
            data-end={segment.end}
          >
            {segment.text}
          </span>
        ))}
      </span>
    )
  }

  const handleSelect = useCallback(() => {
    // Use setTimeout to ensure selection is finalized (longer timeout for mobile)
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!pillRef.current?.contains(range.commonAncestorContainer)) {
        return
      }

      // Get selected text from the pill
      const selectedTextRaw = selection.toString().trim()
      if (!selectedTextRaw || selectedTextRaw.length === 0) {
        return
      }

      // Calculate start position
      const textNode = pillRef.current.querySelector('.pill-text')
      if (!textNode) {
        return
      }

      // Simple approach: count characters from start of textNode to selection start
      const startRange = range.cloneRange()
      startRange.selectNodeContents(textNode)
      startRange.setEnd(range.startContainer, range.startOffset)
      const start = startRange.toString().length

      // Calculate end position
      const endRange = range.cloneRange()
      endRange.selectNodeContents(textNode)
      endRange.setEnd(range.endContainer, range.endOffset)
      const end = endRange.toString().length

      // Check if selection overlaps with any used clue
      const overlapsWithUsed = sortedClues.some(clue => {
        const clueEnd = clue.startIndex + clue.value.length
        return !(end <= clue.startIndex || start >= clueEnd)
      })

      if (overlapsWithUsed) {
        // Don't allow selection of used parts
        selection.removeAllRanges()
        return
      }

      // Get the actual selected text from the original text (using start/end indices)
      const actualSelectedText = text.substring(start, end).trim()
      
      if (start >= 0 && end > start && end <= text.length && actualSelectedText.length > 0) {
        onSelection(sourceId, start, end, actualSelectedText)
      }
    }, 200) // Increased timeout for mobile to ensure selection is finalized
  }, [text, sourceId, onSelection, sortedClues])

  // Use selectionchange event for mobile support with debouncing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    
    const handleSelectionChange = () => {
      // Debounce to avoid firing too frequently during selection
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0 && pillRef.current) {
          const range = selection.getRangeAt(0)
          if (pillRef.current.contains(range.commonAncestorContainer)) {
            // Selection is in our pill, trigger handleSelect
            handleSelect()
          }
        }
      }, 150) // Debounce delay
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [handleSelect])

  const handleTouchEnd = useCallback(() => {
    // On mobile, selection happens after touch, wait for selection to complete
    setTimeout(() => handleSelect(), 300)
  }, [handleSelect])

  return (
    <div 
      ref={pillRef}
      className="pill sentence-pill"
      onMouseUp={handleSelect}
      onTouchEnd={handleTouchEnd}
    >
      {renderSentenceWithSegments()}
    </div>
  )
}

