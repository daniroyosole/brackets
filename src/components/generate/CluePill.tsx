import { useRef, useCallback, useState, useEffect } from 'react'
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

interface SelectionInfo {
  start: number
  end: number
  text: string
}

export const CluePill = ({ clue, clues, onSelection, onUpdate, onDelete }: CluePillProps) => {
  const pillRef = useRef<HTMLDivElement>(null)
  const [currentSelection, setCurrentSelection] = useState<SelectionInfo | null>(null)
  
  const latestClue = clues.get(clue.id) || clue
  const nestedClues = (latestClue.clues || []).filter(c => (c as ClueNode).id) as ClueNode[]
  const sortedNestedClues = [...nestedClues].sort((a, b) => a.startIndex - b.startIndex)
  const displayClue = latestClue

  const renderClueWithSegments = () => {
    const segments: Array<{ text: string; isUsed: boolean; start: number; end: number }> = []
    
    if (sortedNestedClues.length === 0) {
      return (
        <span className="pill-text">
          <span className="pill-text-normal">
            {displayClue.text || '(no text)'}
          </span>
        </span>
      )
    }

    let lastIndex = 0
    
    for (const nestedClue of sortedNestedClues) {
      if (nestedClue.startIndex > lastIndex) {
        segments.push({
          text: displayClue.text.substring(lastIndex, nestedClue.startIndex),
          isUsed: false,
          start: lastIndex,
          end: nestedClue.startIndex
        })
      }
      const nestedClueEnd = nestedClue.startIndex + nestedClue.value.length
      segments.push({
        text: displayClue.text.substring(nestedClue.startIndex, nestedClueEnd),
        isUsed: true,
        start: nestedClue.startIndex,
        end: nestedClueEnd
      })

      lastIndex = nestedClueEnd
    }

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

    const selectedText = selection.toString().trim()
    if (!selectedText) {
      return
    }

    const textNode = pillRef.current.querySelector('.pill-text')
    if (!textNode) {
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

    const overlapsWithUsed = sortedNestedClues.some(nestedClue => {
      const nestedClueEnd = nestedClue.startIndex + nestedClue.value.length
      return !(end <= nestedClue.startIndex || start >= nestedClueEnd)
    })

    if (overlapsWithUsed) {
      selection.removeAllRanges()
      return
    }

    const actualSelectedText = displayClue.text.substring(start, end).trim()

    if (start >= 0 && end > start && end <= displayClue.text.length && actualSelectedText.length > 0) {
      setCurrentSelection({
        start,
        end,
        text: actualSelectedText
      })
    }
  }, [displayClue.text, sortedNestedClues])

  const handleCreateClue = useCallback(() => {
    if (currentSelection) {
      onSelection(displayClue.id, currentSelection.start, currentSelection.end, currentSelection.text)
      setCurrentSelection(null)
      window.getSelection()?.removeAllRanges()
    }
  }, [currentSelection, displayClue.id, onSelection])

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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(displayClue.id, { text: e.target.value })
  }

  return (
    <div className="clue-pill-wrapper" style={{ marginLeft: `${displayClue.level * 30}px` }}>
      <div 
        ref={pillRef}
        className="pill clue-pill"
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
      {currentSelection && (
        <div className="selection-button-container">
          <button
            className="create-clue-button"
            onClick={handleCreateClue}
            type="button"
          >
            Create Clue
          </button>
        </div>
      )}
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

