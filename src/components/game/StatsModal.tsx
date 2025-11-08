import './StatsModal.css'
import { useEffect, useState } from 'react'
import { getUserStats, type GameStats } from '../../utils/statsApi'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const StatsModal = ({ isOpen, onClose }: StatsModalProps) => {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getUserStats()
        .then(setStats)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getMaxDistribution = (): number => {
    if (!stats) return 1
    return Math.max(...stats.scoreDistribution, 1)
  }

  const maxDist = getMaxDistribution()

  const getScoreEmoji = (index: number): string => {
    const emojis = ['🥔', '🥦', '🍋', '🍑', '🍉', '🍓']
    return emojis[index] || '🥔'
  }

  const getEmojiRange = (index: number): string => {
    const ranges = ['0-20', '21-40', '41-60', '61-80', '81-99', '100']
    return ranges[index] || ''
  }

  const getEmojiColor = (index: number): string => {
    const colors = [
      '#8B7355', // 🥔 Brown/gray (potato)
      '#6B8E23', // 🥦 Green (broccoli)
      '#FFD700', // 🍋 Yellow (lemon)
      '#FFB347', // 🍑 Orange/peach (peach)
      '#7CB342', // 🍉 Softer green (watermelon)
      '#FF6B6B'  // 🍓 Red/pink (strawberry)
    ]
    return colors[index] || '#8B7355'
  }

  const generateShareText = () => {
    if (!stats) return ''
    
    // Create a visual representation of the distribution using emojis
    const distributionBars = stats.scoreDistribution.map((count, index) => {
      const emoji = getScoreEmoji(index)
      const maxCount = Math.max(...stats.scoreDistribution, 1)
      const barLength = maxCount > 0 ? Math.ceil((count / maxCount) * 10) : 0
      const bar = '█'.repeat(barLength) || '░'
      return `${emoji} ${bar} ${count}`
    }).join('\n')
    
    return `[Claudàtors] - Estadístiques

📊 Partides: ${stats.totalGames}
🔥 Ratxa: ${stats.currentStreak}
⭐ Mitjana: ${stats.averageScore.toFixed(1)}/100

📈 Puntuacions:
${distributionBars}

Juga a: https://brackets-delta.vercel.app/`
  }

  const handleShare = async () => {
    if (!stats) return
    
    const shareText = generateShareText()
    console.log(shareText)
    
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '[Claudàtors] - Estadístiques',
          text: shareText,
        })
        return
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="stats-modal-overlay" onClick={handleOverlayClick}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="stats-modal-close" onClick={onClose} aria-label="Tancar">
          ×
        </button>
        
        <h2 className="stats-modal-title">Estadístiques</h2>

        {isLoading ? (
          <div className="stats-modal-loading">
            <div className="loading-spinner"></div>
            <p>Carregant estadístiques...</p>
          </div>
        ) : stats ? (
          <>
            <div className="stats-summary">
              <div className="stat-item-large">
                <div className="stat-value-large">{stats.totalGames}</div>
              <div className="stat-label">Partides</div>
              </div>
              
              <div className="stat-item-large">
              <div className="stat-value-large">{stats.currentStreak}</div>
              <div className="stat-label">Ratxa</div>
              </div>
              
              <div className="stat-item-large">
              <div className="stat-value-large">{stats.averageScore.toFixed(1)}</div>
              <div className="stat-label">Mitjana</div>
              </div>
            </div>

            <div className="stats-distribution">
              <h3 className="stats-distribution-title">Puntuacions</h3>
              <div className="stats-chart">
                {stats.scoreDistribution.map((count, index) => {
                  const height = maxDist > 0 ? (count / maxDist) * 100 : 0
                  const emoji = getScoreEmoji(index)
                  const range = getEmojiRange(index)
                  const color = getEmojiColor(index)
                  
                  return (
                    <div key={index} className="stats-bar-container">
                      <div className="stats-bar-wrapper">
                        <div 
                          className="stats-bar" 
                          style={{ 
                            height: `${height}%`,
                            backgroundColor: color
                          }}
                          title={`${range}: ${count} partides`}
                        >
                          {count > 0 && (
                            <span className="stats-bar-value">{count}</span>
                          )}
                        </div>
                      </div>
                      <div className="stats-bar-label">
                        {emoji}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="stats-modal-footer">
              <button onClick={handleShare} className="stats-modal-share-btn">
                {copied ? '✓ Copiat!' : '📤 Compartir estadístiques'}
              </button>
            </div>
          </>
        ) : (
          <div className="stats-modal-error">
            <p>No s'han pogut carregar les estadístiques</p>
          </div>
        )}
      </div>
    </div>
  )
}

