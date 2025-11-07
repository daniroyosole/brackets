// Game version - increment this to force all users to reset their localStorage
export const GAME_VERSION = '1.0.3'

// Keys used in localStorage
const GAME_STATE_KEYS = {
  SOLVED_CLUES: 'gameSolvedClues',
  REVEALED_FIRST_LETTERS: 'gameRevealedFirstLetters',
  WRONG_ANSWERS: 'gameWrongAnswers',
  FULL_CLUE_REVEALS: 'gameFullClueReveals',
  JSON_INPUT: 'gameJsonInput',
  DATE: 'gameDate',
  VERSION: 'gameVersion',
  HAS_SEEN_HELP: 'hasSeenHelp',
  GAME_RESULTS: 'gameResults' // Statistics
} as const

// Helper function to clear only game state (not core settings like hasSeenHelp)
// Used when date changes
export const clearGameState = () => {
  localStorage.removeItem(GAME_STATE_KEYS.SOLVED_CLUES)
  localStorage.removeItem(GAME_STATE_KEYS.REVEALED_FIRST_LETTERS)
  localStorage.removeItem(GAME_STATE_KEYS.WRONG_ANSWERS)
  localStorage.removeItem(GAME_STATE_KEYS.FULL_CLUE_REVEALS)
  localStorage.removeItem(GAME_STATE_KEYS.JSON_INPUT)
  localStorage.removeItem(GAME_STATE_KEYS.DATE)
}

// Helper function to clear ALL localStorage except hasSeenHelp (for version changes)
export const clearAllStorageExceptTutorial = () => {
  // Save hasSeenHelp before clearing
  const hasSeenHelp = localStorage.getItem(GAME_STATE_KEYS.HAS_SEEN_HELP)
  
  // Clear all localStorage
  localStorage.clear()
  
  // Restore hasSeenHelp if it existed
  if (hasSeenHelp) {
    localStorage.setItem(GAME_STATE_KEYS.HAS_SEEN_HELP, hasSeenHelp)
  }
}

// Check if date changed and clear game state if needed
// Returns true if date changed (and state was cleared), false otherwise
export const checkAndClearIfDateChanged = (today: string): boolean => {
  const storedDate = localStorage.getItem(GAME_STATE_KEYS.DATE)
  
  if (storedDate && storedDate !== today) {
    clearGameState()
    return true
  }
  
  return false
}

// Check version and reset if version changed
export const checkGameVersion = () => {
  const currentStoredVersion = localStorage.getItem(GAME_STATE_KEYS.VERSION)
  if (currentStoredVersion !== GAME_VERSION) {
    clearAllStorageExceptTutorial()
    localStorage.setItem(GAME_STATE_KEYS.VERSION, GAME_VERSION)
  }
}

// Get default game state values (used after clearing)
export const getDefaultGameState = () => ({
  solvedClues: new Set<string>(),
  revealedFirstLetters: new Set<string>(),
  wrongAnswers: 0,
  fullClueReveals: 0
})

// Helper to check if stored date is valid for today
export const isStoredDateValid = (today: string): boolean => {
  const storedDate = localStorage.getItem(GAME_STATE_KEYS.DATE)
  return storedDate === today
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

