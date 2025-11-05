import { useState, useEffect } from 'react'

/**
 * Hook to track viewport height, accounting for mobile keyboard and browser UI
 */
export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  useEffect(() => {
    // Handle viewport changes when keyboard or browser UI appears/disappears
    const handleResize = () => {
      // Use visual viewport if available (better for mobile keyboard)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        setViewportHeight(window.innerHeight)
      }
    }

    // Listen to visual viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return viewportHeight
}

