import { useState, useEffect } from 'react'
import { getTimeUntilNextGame, formatTimeRemaining } from '../utils/timeUtils'

/**
 * Hook to track time until next game (00:00 Barcelona time)
 * Updates every second
 */
export const useNextGameTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const { hours, minutes } = getTimeUntilNextGame()
    return formatTimeRemaining(hours, minutes)
  })

  useEffect(() => {
    const updateTimer = () => {
      const { hours, minutes } = getTimeUntilNextGame()
      setTimeRemaining(formatTimeRemaining(hours, minutes))
    }

    // Update immediately
    updateTimer()

    // Update every minute
    const interval = setInterval(updateTimer, 60*1000)

    return () => clearInterval(interval)
  }, [])

  return timeRemaining
}

