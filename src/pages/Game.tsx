import { useState, useMemo, useCallback } from 'react'
import { initialSentence } from '../mockData'
import type { Sentence } from '../models/sentence'
import { Sentence as SentenceComponent } from '../components/game/Sentence'
import { findMatchingClue } from '../utils/gameHelpers'
import { findEligibleClues } from '../utils/sentenceTransform'
import './Game.css'

const Game = () => {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(initialSentence, null, 2))
  const [solvedClues, setSolvedClues] = useState<Set<string>>(new Set())
  const [inputValue, setInputValue] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)

  const sentence = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput) as Sentence
      setJsonError(null)
      return parsed
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'JSON invàlid')
      return initialSentence
    }
  }, [jsonInput])

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value)
    // Clear solved clues when JSON changes
    setSolvedClues(new Set())
  }, [])

  const eligibleCluePaths = useMemo(() => {
    const eligible = findEligibleClues(sentence, solvedClues)
    return new Set(eligible.map(({ path }) => path))
  }, [sentence, solvedClues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const matchingClue = findMatchingClue(sentence, solvedClues, inputValue)
    
    if (matchingClue) {
      setSolvedClues(prev => new Set(prev).add(matchingClue.path))
      setInputValue('')
    }
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Jugar</h1>
        {solvedClues.size > 0 && (
          <button 
            onClick={() => {
              setSolvedClues(new Set())
              setInputValue('')
            }} 
            className="reset-game-btn"
          >
            Reiniciar
          </button>
        )}
      </div>
      
      <div className="json-input-section">
        <div className="json-input-header">
          <label htmlFor="sentence-json">Entrada JSON de la frase:</label>
          <button
            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
            className="collapse-toggle-btn"
            type="button"
          >
            {isJsonExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isJsonExpanded && (
          <>
            {jsonError && (
              <div className="json-error">
                Error JSON: {jsonError}
              </div>
            )}
            <textarea
              id="sentence-json"
              value={jsonInput}
              onChange={handleJsonChange}
              className="sentence-json-input"
              rows={10}
              readOnly={solvedClues.size > 0}
            />
            {solvedClues.size > 0 && (
              <div className="json-locked-message">
                El JSON està bloquejat mentre jugues. Reinicia per editar.
              </div>
            )}
          </>
        )}
      </div>

      <div className="game-content">
        <SentenceComponent 
          sentence={sentence} 
          solvedClues={solvedClues}
          eligibleCluePaths={eligibleCluePaths}
        />
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
              placeholder="Introdueix la resposta..."
            className="answer-input"
          />
          <button type="submit" className="submit-btn">Enviar</button>
        </form>
      </div>
    </div>
  )
}

export default Game

