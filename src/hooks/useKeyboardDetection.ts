import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { applyKeyboardOpenLayout, applyKeyboardCloseLayout, cleanupKeyboardLayout } from '../utils/keyboardLayout'

/**
 * Detects if keyboard is open using VisualViewport API
 */
const detectKeyboard = (): boolean => {
  if (!window.visualViewport) return false
  const heightDiff = window.innerHeight - window.visualViewport.height
  return heightDiff > 100
}

/**
 * Hook to detect keyboard open/close on mobile devices
 * Uses VisualViewport API with focus/blur fallback
 */
export const useKeyboardDetection = (inputRef: RefObject<HTMLInputElement | null>) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const gameContainer = document.querySelector('.game-container') as HTMLElement
    if (!gameContainer) return

    let scrollPosition = 0
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null

    const applyKeyboardLayout = (isOpen: boolean) => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      
      resizeTimeout = setTimeout(() => {
        setIsKeyboardOpen(isOpen)

        if (isOpen) {
          const vh = window.visualViewport?.height || window.innerHeight
          scrollPosition = applyKeyboardOpenLayout(gameContainer, vh)
        } else {
          applyKeyboardCloseLayout(gameContainer, scrollPosition)
        }
      }, 150)
    }

    const handleResize = () => applyKeyboardLayout(detectKeyboard())
    const handleFocus = () => setTimeout(() => applyKeyboardLayout(true), 300)
    const handleBlur = () => setTimeout(() => applyKeyboardLayout(false), 200)

    // Listen to viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }

    // Listen to input focus/blur
    const input = inputRef.current || document.querySelector('.answer-input') as HTMLInputElement
    if (input) {
      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)
    }

    // Initial check
    applyKeyboardLayout(detectKeyboard())

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
      if (input) {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
      }
      if (resizeTimeout) clearTimeout(resizeTimeout)
      cleanupKeyboardLayout()
    }
  }, [inputRef])

  return isKeyboardOpen
}

