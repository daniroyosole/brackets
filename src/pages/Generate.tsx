import { useState, useRef, useCallback, useMemo } from 'react'
import type { Sentence, Clue } from '../models/sentence'
import { Sentence as SentenceComponent } from '../components/Sentence'
import './Generate.css'

interface ClueNode extends Clue {
  id: string
  parentId?: string
  level: number
}

interface SelectionState {
  sourceId: string | null // null for sentence, clue ID for clues
  start: number
  end: number
  text: string
}

const Generate = () => {
  const [sentenceText, setSentenceText] = useState('')
  const [isSentenceLocked, setIsSentenceLocked] = useState(false)
  const [clues, setClues] = useState<Map<string, ClueNode>>(new Map())
  const [selections, setSelections] = useState<Map<string, SelectionState & { clueText: string }>>(new Map())

  const handleSubmitSentence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sentenceText.trim()) {
      alert('Please enter a sentence first')
      return
    }
    setIsSentenceLocked(true)
    setSelections(new Map())
  }

  const handleReset = () => {
    if (clues.size > 0 || selections.size > 0) {
      if (!confirm('Resetting will clear all existing clues and selections. Continue?')) {
        return
      }
    }
    setSentenceText('')
    setIsSentenceLocked(false)
    setClues(new Map())
    setSelections(new Map())
  }

  const handleSelection = useCallback((sourceId: string | null, start: number, end: number, text: string) => {
    // Validate based on source: for sentence (null), use sentenceText length; for clues, validate when creating
    let maxLength: number
    if (sourceId === null) {
      maxLength = sentenceText.length
    } else {
      // For nested clues, we'll validate when creating the clue
      // Just do basic validation here: start < end and both positive
      maxLength = Infinity // Will be validated when creating clue
    }
    
    if (start >= 0 && end > start && end <= maxLength && text.trim().length > 0) {
      // Only allow one selection at a time - replace any existing selection
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
  }, [sentenceText])

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
      // For nested clues, selection is from parent clue's text
      // The selected text from parent's text becomes the value of the nested clue
      selectedValue = parentClue.text.substring(startIndex, endIndex)
      relativeStartIndex = startIndex
    } else {
      // For root clues, selection is from locked sentence
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
      
      // Add to parent's clues array if parent exists
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
      alert('Selection not found')
      return
    }
    
    if (!selection.clueText.trim()) {
      alert('Please enter a clue text')
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
        
        // If this is a nested clue, also update it in the parent's clues array
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

      // Remove from parent's clues array
      if (clue.parentId) {
        const parent = updated.get(clue.parentId)
        if (parent) {
          updated.set(clue.parentId, {
            ...parent,
            clues: (parent.clues || []).filter(c => (c as ClueNode).id !== clueId)
          })
        }
      }

      // Recursively delete nested clues
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

    // Remove any selections that were selecting from this clue
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

  const getRootClues = useCallback(() => {
    return Array.from(clues.values()).filter(c => !c.parentId)
  }, [clues])

  const buildSentence = useCallback((): Sentence => {
    const rootClues = getRootClues()
    
    const convertClueNode = (clueNode: ClueNode): Clue => {
      // Get the latest clue from the Map to ensure we have updated nested clues
      const latestClue = clues.get(clueNode.id) || clueNode
      const nestedClues = (latestClue.clues || []).filter(c => (c as ClueNode).id) as ClueNode[]
      
      // Get the latest version of each nested clue from the Map
      const latestNestedClues = nestedClues.map(nested => clues.get(nested.id) || nested)
      
      return {
        text: latestClue.text,
        value: latestClue.value,
        startIndex: latestClue.startIndex,
        clues: latestNestedClues.length > 0 ? latestNestedClues.map(convertClueNode) : undefined
      }
    }
    
    return {
      text: sentenceText,
      clues: rootClues.length > 0 ? rootClues.map(convertClueNode) : undefined
    }
  }, [sentenceText, clues, getRootClues])

  const sentence = useMemo(() => buildSentence(), [buildSentence])

  const exportSentence = () => {
    navigator.clipboard.writeText(JSON.stringify(sentence, null, 2))
    alert('Sentence JSON copied to clipboard!')
  }

  return (
    <div className="generate-container">
      <div className="generate-header">
        <h1>Generate Custom Sentence</h1>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
          <button onClick={exportSentence} className="export-btn">
            Copy JSON
          </button>
        </div>
      </div>

      <div className="preview-section">
        <h2>Preview</h2>
        <div className="preview-content">
          <SentenceComponent 
            sentence={sentence}
            solvedClues={new Set()}
            eligibleCluePaths={new Set()}
          />
        </div>
      </div>

      <div className="generate-content">
        {!isSentenceLocked ? (
          <form onSubmit={handleSubmitSentence} className="sentence-form">
            <input
              type="text"
              value={sentenceText}
              onChange={(e) => setSentenceText(e.target.value)}
              placeholder="Enter your sentence..."
              className="sentence-input"
              autoFocus
            />
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        ) : (
          <div className="pills-container">
            <SentencePill
              text={sentenceText}
              sourceId={null}
              rootClues={getRootClues()}
              onSelection={handleSelection}
            />
            
            {getRootClues().map(clue => (
              <CluePill
                key={clue.id}
                clue={clue}
                clues={clues}
                onSelection={handleSelection}
                onUpdate={updateClue}
                onDelete={deleteClue}
              />
            ))}
          </div>
        )}

        {selections.size > 0 && (() => {
          const [selectionId, selection] = Array.from(selections.entries())[0]
          return (
            <div className="selection-card">
              <div className="card-header">
                <h3>Create Clue</h3>
                <button onClick={() => setSelections(new Map())} className="close-card-btn" title="Close">
                  ×
                </button>
              </div>
              <div className="card-content">
                <div className="card-field">
                  <label>Selected Value:</label>
                  <div className="selected-value">{selection.text}</div>
                </div>
                <div className="card-field">
                  <label>Clue Text (what the user will see):</label>
                  <input
                    type="text"
                    value={selection.clueText}
                    onChange={(e) => updateSelectionClueText(selectionId, e.target.value)}
                    placeholder="Enter clue description..."
                    className="clue-text-input"
                    autoFocus
                  />
                </div>
                <div className="card-actions">
                  <button 
                    onClick={() => handleCreateClue(selectionId)} 
                    className="create-btn"
                  >
                    Create Clue
                  </button>
                  <button 
                    onClick={() => setSelections(new Map())} 
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="json-preview-section">
        <h2>JSON Result</h2>
        <div className="json-preview-container">
          <pre className="json-preview-content">
            {JSON.stringify(sentence, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default Generate

interface SentencePillProps {
  text: string
  sourceId: string | null
  rootClues: ClueNode[]
  onSelection: (sourceId: string | null, start: number, end: number, text: string) => void
}

const SentencePill = ({ text, sourceId, rootClues, onSelection }: SentencePillProps) => {
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
    }, 10)
  }, [text, sourceId, onSelection, sortedClues])

  return (
    <div 
      ref={pillRef}
      className="pill sentence-pill"
      onMouseUp={handleSelect}
    >
      {renderSentenceWithSegments()}
    </div>
  )
}

interface CluePillProps {
  clue: ClueNode
  clues: Map<string, ClueNode>
  onSelection: (sourceId: string | null, start: number, end: number, text: string) => void
  onUpdate: (clueId: string, updates: Partial<ClueNode>) => void
  onDelete: (clueId: string) => void
}

const CluePill = ({ clue, clues, onSelection, onUpdate, onDelete }: CluePillProps) => {
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
