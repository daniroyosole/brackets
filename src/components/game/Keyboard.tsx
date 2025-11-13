import { useRef, useEffect } from 'react'
import './Keyboard.css'

interface KeyboardProps {
  onKeyPress: (key: string) => void
  onBackspace?: () => void
  onSubmit?: () => void
  disabled?: boolean
}

const ROWS = [
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

export const Keyboard = ({ onKeyPress, onBackspace, onSubmit, disabled = false }: KeyboardProps) => {
  const backspaceIntervalRef = useRef<number | null>(null)
  const backspaceTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (backspaceIntervalRef.current) {
        clearInterval(backspaceIntervalRef.current)
      }
      if (backspaceTimeoutRef.current) {
        clearTimeout(backspaceTimeoutRef.current)
      }
    }
  }, [])

  const handleKeyClick = (key: string) => {
    if (!disabled) onKeyPress(key)
  }

  const handleBackspace = () => {
    if (!disabled && onBackspace) onBackspace()
  }

  const startBackspaceRepeat = () => {
    if (disabled || !onBackspace) return
    
    // Esperar abans de començar a repetir (només si es manté apretat)
    backspaceTimeoutRef.current = setTimeout(() => {
      // Començar a repetir cada 100ms
      backspaceIntervalRef.current = setInterval(() => {
        if (!disabled && onBackspace) {
          onBackspace()
        }
      }, 100)
    }, 500)
  }

  const stopBackspaceRepeat = () => {
    if (backspaceTimeoutRef.current) {
      clearTimeout(backspaceTimeoutRef.current)
      backspaceTimeoutRef.current = null
    }
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current)
      backspaceIntervalRef.current = null
    }
  }

  const handleSubmit = () => {
    if (!disabled && onSubmit) onSubmit()
  }

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={`keyboard-row ${rowIndex === 3 ? 'keyboard-row-with-backspace' : ''}`}>
          {rowIndex === 3 && onBackspace && (
            <button
              className="keyboard-key keyboard-key-spacer"
              disabled
              type="button"
              aria-hidden="true"
            >
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              className={`keyboard-key ${rowIndex === 0 ? 'keyboard-key-number' : ''}`}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
              type="button"
            >
              {rowIndex === 0 ? key : key.toUpperCase()}
            </button>
          ))}
          {rowIndex === 3 && onBackspace && (
            <button
              className="keyboard-key keyboard-key-backspace"
              onClick={handleBackspace}
              onMouseDown={startBackspaceRepeat}
              onMouseUp={stopBackspaceRepeat}
              onMouseLeave={stopBackspaceRepeat}
              onTouchStart={startBackspaceRepeat}
              onTouchEnd={stopBackspaceRepeat}
              disabled={disabled || !onBackspace}
              type="button"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
      <div className="keyboard-row keyboard-row-actions">
        {onSubmit && (
          <button
            className="keyboard-key keyboard-key-submit"
            onClick={handleSubmit}
            disabled={disabled}
            type="button"
          >
            Enviar
          </button>
        )}
      </div>
    </div>
  )
}

