import { useState, useCallback, useMemo } from 'react'
import type { Sentence, Clue } from '../models/sentence'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { SentencePill } from '../components/generate/SentencePill'
import { CluePill } from '../components/generate/CluePill'
import { SelectionCard } from '../components/generate/SelectionCard'
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
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)

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
    alert('JSON de la frase copiat al porta-retalls!')
  }

  return (
    <div className="generate-container">
      <div className="generate-header">
        <h1>Generar Frase Personalitzada</h1>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            Reiniciar
          </button>
          <button onClick={exportSentence} className="export-btn">
            Copiar JSON
          </button>
        </div>
      </div>

      <div className="generate-content">
        {!isSentenceLocked ? (
          <form onSubmit={handleSubmitSentence} className="sentence-form">
            <input
              type="text"
              value={sentenceText}
              onChange={(e) => setSentenceText(e.target.value)}
              placeholder="Introdueix la teva frase..."
              className="sentence-input"
              autoFocus
            />
            <button type="submit" className="submit-btn">
              Enviar
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
            
            {getRootClues().length > 0 && (
              <div className="root-clues-container">
                {[...getRootClues()].sort((a, b) => a.startIndex - b.startIndex).map(clue => (
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
          </div>
        )}

        {selections.size > 0 && (() => {
          const [selectionId, selection] = Array.from(selections.entries())[0]
          return (
            <SelectionCard
              selection={selection}
              selectionId={selectionId}
              onClueTextChange={updateSelectionClueText}
              onCreateClue={handleCreateClue}
              onCancel={() => setSelections(new Map())}
            />
          )
        })()}
      </div>

      <div className="preview-section">
        <div className="preview-section-header">
          <h2>Vista prèvia</h2>
          <button
            onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
            className="collapse-toggle-btn"
            type="button"
          >
            {isPreviewExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isPreviewExpanded && (
          <div className="preview-content">
            <SentenceComponent 
              sentence={sentence}
              solvedClues={new Set()}
              eligibleCluePaths={new Set()}
            />
          </div>
        )}
      </div>

      <div className="json-preview-section">
        <div className="json-preview-section-header">
          <h2>Resultat JSON</h2>
          <button
            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
            className="collapse-toggle-btn"
            type="button"
          >
            {isJsonExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isJsonExpanded && (
          <div className="json-preview-container">
            <pre className="json-preview-content">
              {JSON.stringify(sentence, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default Generate
