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
  const handleKeyClick = (key: string) => {
    if (!disabled) onKeyPress(key)
  }

  const handleBackspace = () => {
    if (!disabled && onBackspace) onBackspace()
  }

  const handleSubmit = () => {
    if (!disabled && onSubmit) onSubmit()
  }

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
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
        </div>
      ))}
      <div className="keyboard-row keyboard-row-actions">
        <button
          className="keyboard-key keyboard-key-backspace"
          onClick={handleBackspace}
          disabled={disabled || !onBackspace}
          type="button"
        >
          ⌫ Esborrar
        </button>
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

