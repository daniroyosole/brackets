import { useRef, useCallback } from 'react'
import type { Clue } from '../../models/sentence'
import './GenerateComponents.css'

interface ClueNode extends Clue {
  id: string
  parentId?: string
  level: number
}

interface CluePillProps {
  clue: ClueNode
  clues: Map<string, ClueNode>
  onSelection: (sourceId: string | null, start: number, end: number, text: string) => void
  onUpdate: (clueId: string, updates: Partial<ClueNode>) => void
  onDelete: (clueId: string) => void
}

export const CluePill = ({ clue, clues, onSelection, onUpdate, onDelete }: CluePillProps) => {
  const pillRef = useRef<HTMLDivElement>(null)
  
  // Get the latest clue from the Map to ensure we have the updated clues array
  const latestClue = clues.get(clue.id) || clue
  const nestedClues = (latestClue.clues || []).filter(c => (c as ClueNode).id) as ClueNode[]
  
  // Sort nested clues by startIndex
  const sortedNestedClues = [...nestedClues].sort((a, b) => a.startIndex - b.startIndex)
  
  // Use latestClue for rendering to ensure we have the most up-to-date data
  const displayClue = latestClue

  // Build segments of the clue text: normal text and used (grayed-out) text
  const renderClueWithSegments = () => {
    const segments: Array<{ text: string; isUsed: boolean; start: number; end: number }> = []
    
    if (sortedNestedClues.length === 0) {
      // No nested clues, return the full text as one segment with data attributes
      return (
        <span className="pill-text">
          <span className="pill-text-normal" data-start={0} data-end={displayClue.text.length}>
            {displayClue.text || '(no text)'}
          </span>
        </span>
      )
    }

    let lastIndex = 0
    
    for (const nestedClue of sortedNestedClues) {
      // Add text before this nested clue
      if (nestedClue.startIndex > lastIndex) {
        segments.push({
          text: displayClue.text.substring(lastIndex, nestedClue.startIndex),
          isUsed: false,
          start: lastIndex,
          end: nestedClue.startIndex
        })
      }
      
      // Add the nested clue's covered text (grayed out)
      const nestedClueEnd = nestedClue.startIndex + nestedClue.value.length
      segments.push({
        text: displayClue.text.substring(nestedClue.startIndex, nestedClueEnd),
        isUsed: true,
        start: nestedClue.startIndex,
        end: nestedClueEnd
      })
      
      lastIndex = nestedClueEnd
    }
    
    // Add remaining text after all nested clues
    if (lastIndex < displayClue.text.length) {
      segments.push({
        text: displayClue.text.substring(lastIndex),
        isUsed: false,
        start: lastIndex,
        end: displayClue.text.length
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
    // Use setTimeout to ensure selection is finalized
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!pillRef.current?.contains(range.commonAncestorContainer)) {
        return
      }

      // Get selected text from the clue's text (not value)
      const selectedText = selection.toString().trim()
      if (!selectedText) {
        return
      }

      // Calculate start position
      const textNode = pillRef.current.querySelector('.pill-text')
      if (!textNode) return

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

      // Check if selection overlaps with any used nested clue
      const overlapsWithUsed = sortedNestedClues.some(nestedClue => {
        const nestedClueEnd = nestedClue.startIndex + nestedClue.value.length
        return !(end <= nestedClue.startIndex || start >= nestedClueEnd)
      })

      if (overlapsWithUsed) {
        // Don't allow selection of used parts
        selection.removeAllRanges()
        return
      }

      // Get the actual selected text from the original clue text (using start/end indices)
      const actualSelectedText = displayClue.text.substring(start, end).trim()
      
      if (start >= 0 && end > start && end <= displayClue.text.length && actualSelectedText.length > 0) {
        onSelection(displayClue.id, start, end, actualSelectedText)
      }
    }, 10)
  }, [displayClue.text, displayClue.id, onSelection, sortedNestedClues])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(displayClue.id, { text: e.target.value })
  }

  return (
    <div className="clue-pill-wrapper" style={{ marginLeft: `${displayClue.level * 30}px` }}>
      <div 
        ref={pillRef}
        className="pill clue-pill"
        onMouseUp={handleSelect}
      >
        {renderClueWithSegments()}
        <button 
          onClick={() => onDelete(displayClue.id)} 
          className="pill-delete-btn"
          title="Delete clue"
        >
          ×
        </button>
      </div>
      <div className="pill-edit">
        <input
          type="text"
          value={displayClue.text}
          onChange={handleTextChange}
          placeholder="Edit clue text..."
          className="pill-edit-input"
        />
      </div>
      {nestedClues.length > 0 && (
        <div className="nested-pills">
          {nestedClues.map(nestedClue => {
            // Get the latest nested clue from the Map
            const latestNestedClue = clues.get(nestedClue.id) || nestedClue
            return (
              <CluePill
                key={latestNestedClue.id}
                clue={latestNestedClue}
                clues={clues}
                onSelection={onSelection}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

