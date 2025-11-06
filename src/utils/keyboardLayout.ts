/**
 * Utility functions for managing keyboard layout adjustments
 */

/**
 * Applies layout adjustments when keyboard is open
 */
export const applyKeyboardOpenLayout = (gameContainer: HTMLElement, viewportHeight: number): number => {
  const scrollPosition = window.scrollY || document.documentElement.scrollTop

  gameContainer.style.height = `${viewportHeight}px`
  gameContainer.style.maxHeight = `${viewportHeight}px`
  
  document.body.classList.add('keyboard-open')
  document.documentElement.classList.add('keyboard-open')
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollPosition}px`
  document.body.style.width = '100%'
  document.body.style.height = `${viewportHeight}px`

  return scrollPosition
}

/**
 * Removes layout adjustments when keyboard is closed
 */
export const applyKeyboardCloseLayout = (gameContainer: HTMLElement, scrollPosition: number): void => {
  gameContainer.style.height = ''
  gameContainer.style.maxHeight = ''
  
  document.body.classList.remove('keyboard-open')
  document.documentElement.classList.remove('keyboard-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.height = ''
  
  window.scrollTo(0, scrollPosition)
}

/**
 * Cleans up keyboard layout adjustments
 */
export const cleanupKeyboardLayout = (): void => {
  document.body.classList.remove('keyboard-open')
  document.documentElement.classList.remove('keyboard-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.height = ''
}

