import { useState, useEffect } from 'react'

/**
 * Hook to manage help modal state with localStorage persistence
 * The tutorial is always shown until the user completes the mini tutorial
 */
export const useHelpModal = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('hasSeenHelp')
    if (!hasCompletedTutorial) {
      setIsHelpModalOpen(true)
    }
  }, [])

  return {
    isHelpModalOpen,
    setIsHelpModalOpen
  }
}

