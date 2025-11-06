import { useState, useEffect } from 'react'
import { getTimeUntilNextGame, formatTimeRemaining } from '../utils/timeUtils'

/**
 * Hook to track time until next game (00:00 Barcelona time)
 * Updates every second
 */
export const useNextGameTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const { hours } = getTimeUntilNextGame()
    return formatTimeRemaining(hours)
  })

  useEffect(() => {
    const updateTimer = () => {
      const { hours } = getTimeUntilNextGame()
      setTimeRemaining(formatTimeRemaining(hours))
    }

    // Update immediately
    updateTimer()

    // Update every minute
    const interval = setInterval(updateTimer, 60*1000)

    return () => clearInterval(interval)
  }, [])

  return timeRemaining
}

