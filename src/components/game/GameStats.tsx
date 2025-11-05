interface GameStatsProps {
  solvedClues: number
  totalClues: number
  revealedFirstLetters: number
  fullClueReveals: number
  wrongAnswers: number
}

export const GameStats = ({
  solvedClues,
  totalClues,
  revealedFirstLetters,
  fullClueReveals,
  wrongAnswers
}: GameStatsProps) => {
  return (
    <div className="game-stats">
      <span className="stat-item">
        <span className="stat-emoji">✅</span>
        <span className="stat-value">{solvedClues} / {totalClues}</span>
      </span>
      <span className="stat-item">
        <span className="stat-emoji">🔍</span>
        <span className="stat-value">{revealedFirstLetters}</span>
      </span>
      <span className="stat-item">
        <span className="stat-emoji">💡</span>
        <span className="stat-value">{fullClueReveals}</span>
      </span>
      <span className="stat-item">
        <span className="stat-emoji">❌</span>
        <span className="stat-value">{wrongAnswers}</span>
      </span>
    </div>
  )
}

