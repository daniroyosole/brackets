/**
 * Get time remaining until next game (00:00 user's local time)
 * Returns hours, minutes, and seconds remaining
 */
export const getTimeUntilNextGame = () => {
  const now = new Date()
  
  // Get next midnight in user's local timezone
  const nextMidnight = new Date(now)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)
  
  // Calculate difference
  const diff = nextMidnight.getTime() - now.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds, totalMs: diff }
}

/**
 * Format time remaining as a string (hours and minutes, or "menys d'1h")
 */
export const formatTimeRemaining = (hours: number, minutes: number): string => {
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${hours}h`
  } else {
    if (minutes > 0) {
      return `${minutes}m`
    }
    return ""
  }
}

