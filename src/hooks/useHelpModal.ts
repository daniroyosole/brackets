import { useState, useEffect } from 'react'

/**
 * Hook to manage help modal state with localStorage persistence
 */
export const useHelpModal = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('hasSeenHelp')
    if (!hasSeenHelp) {
      setIsHelpModalOpen(true)
      localStorage.setItem('hasSeenHelp', 'true')
    }
  }, [])

  return {
    isHelpModalOpen,
    setIsHelpModalOpen
  }
}

