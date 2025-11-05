// Game version - increment this to force all users to reset their localStorage
export const GAME_VERSION = '1.0.1'

// Helper function to clear all game-related localStorage
export const clearGameStorage = () => {
  localStorage.removeItem('gameSolvedClues')
  localStorage.removeItem('gameRevealedFirstLetters')
  localStorage.removeItem('gameWrongAnswers')
  localStorage.removeItem('gameFullClueReveals')
  localStorage.removeItem('gameJsonInput')
  localStorage.removeItem('hasSeenHelp')
}

// Check version and reset if version changed
export const checkGameVersion = () => {
  const currentStoredVersion = localStorage.getItem('gameVersion')
  if (currentStoredVersion !== GAME_VERSION) {
    clearGameStorage()
    localStorage.setItem('gameVersion', GAME_VERSION)
  }
}

// LocalStorage helpers for game state
export const getStoredSet = (key: string): Set<string> => {
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return new Set(JSON.parse(saved))
    } catch {
      return new Set()
    }
  }
  return new Set()
}

export const saveSet = (key: string, value: Set<string>) => {
  localStorage.setItem(key, JSON.stringify(Array.from(value)))
}

export const getStoredNumber = (key: string, defaultValue: number = 0): number => {
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return parseInt(saved, 10) || defaultValue
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

export const saveNumber = (key: string, value: number) => {
  localStorage.setItem(key, value.toString())
}

