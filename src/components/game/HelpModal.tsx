import './HelpModal.css'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="help-modal-overlay" onClick={handleOverlayClick}>
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>[Com Jugar]</h2>
          <button onClick={onClose} className="help-modal-close-btn" title="Tancar">
            ×
          </button>
        </div>
        <div className="help-modal-content">
          <div className="help-section">
            <h3>Objectiu</h3>
            <p>Resol les pistes per descobrir el text complet de la frase.</p>
          </div>
          <div className="help-section">
            <h3>Com funciona</h3>
            <ul>
              <li>Les pistes amb fons blau clar són resolubles</li>
              <li>Introdueix la resposta en el camp de text</li>
              <li>Si la resposta és correcta, la pista es revelarà</li>
              <li>Algunes pistes tenen pistes internes que cal resoldre primer</li>
            </ul>
          </div>
          <div className="help-section">
            <h3>Exemple</h3>
            <p>Si veus <span className="help-example-clue">[pista]</span> amb fons blau, significa que pots intentar resoldre-la.</p>
            <p>Quan la resolguis, es mostrarà el seu valor.</p>
          </div>
        </div>
        <div className="help-modal-footer">
          <button onClick={onClose} className="help-modal-ok-btn">
            Entesos
          </button>
        </div>
      </div>
    </div>
  )
}

