/**
 * Fake API for user statistics
 * Simulates server calls but uses localStorage
 */

export interface GameStats {
  totalGames: number
  averageScore: number
  currentStreak: number
  scoreDistribution: number[] // Array of 6 elements: 🥔(0-20), 🥦(21-40), 🍋(41-60), 🍑(61-80), 🍉(81-99), 🍓(100)
}

export interface GameResult {
  score: number
  date: string // YYYY-MM-DD
}

const STORAGE_KEY = 'gameResults'
const MAX_RESULTS = 1000
const SIMULATED_DELAY_SAVE = 200
const SIMULATED_DELAY_GET = 300

/**
 * Get all stored game results from localStorage
 */
const getStoredResults = (): GameResult[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Save results to localStorage
 */
const saveResults = (results: GameResult[]): void => {
  const recentResults = results.slice(-MAX_RESULTS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentResults))
}

/**
 * Save a game result to localStorage
 * Only saves if a result for this date doesn't already exist
 */
export const saveGameResult = async (score: number, date: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_SAVE))

  const results = getStoredResults()
  
  // Check if a result for this date already exists
  const existingResult = results.find(r => r.date === date)
  
  if (!existingResult) {
    // Only save if no result exists for this date
    results.push({ score, date })
    saveResults(results)
  }
}

/**
 * Calculate average score from results
 */
const calculateAverageScore = (results: GameResult[]): number => {
  if (results.length === 0) return 0
  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  return Math.round((totalScore / results.length) * 10) / 10
}

/**
 * Get unique dates from results, sorted by most recent first
 */
const getUniqueDates = (results: GameResult[]): string[] => {
  const uniqueDates = [...new Set(results.map(r => r.date))]
  return uniqueDates.sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )
}

/**
 * Check if a specific date has a game
 */
const hasGameOnDate = (uniqueDates: string[], targetDate: Date): boolean => {
  return uniqueDates.some(date => {
    const resultDate = new Date(date + 'T00:00:00')
    return resultDate.getTime() === targetDate.getTime()
  })
}

/**
 * Count consecutive days with games starting from a specific date
 * Dates are already sorted in reverse order (most recent first)
 * Iterates until a gap is found - optimized to stop early
 */
const countConsecutiveDays = (uniqueDates: string[], startDate: Date): number => {
  let streak = 0
  
  // Iterate backwards from startDate (today/yesterday) until we find a gap
  // Since uniqueDates is sorted in reverse order (most recent first),
  // we can iterate sequentially and stop as soon as we find a gap
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(startDate)
    expectedDate.setDate(startDate.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)
    
    const resultDate = new Date(uniqueDates[i] + 'T00:00:00')
    
    // If dates match, continue counting
    if (resultDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      // Found a gap - stop iterating immediately (early exit)
      break
    }
  }
  
  return streak
}

/**
 * Calculate current streak (consecutive days with games)
 * If today has a game, streak includes today
 * If today has no game, streak is based on yesterday's streak (maintains until a day is missed)
 */
const calculateCurrentStreak = (results: GameResult[]): number => {
  const uniqueDates = getUniqueDates(results)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayHasGame = hasGameOnDate(uniqueDates, today)
  
  if (todayHasGame) {
    return countConsecutiveDays(uniqueDates, today)
  }
  
  // If today doesn't have a game, check yesterday
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const yesterdayHasGame = hasGameOnDate(uniqueDates, yesterday)
  
  if (yesterdayHasGame) {
    return countConsecutiveDays(uniqueDates, yesterday)
  }
  
  return 0
}

/**
 * Get emoji range index for distribution (🥔: 0-20, 🥦: 21-40, 🍋: 41-60, 🍑: 61-80, 🍉: 81-99, 🍓: 100)
 */
const getEmojiRangeIndex = (score: number): number => {
  if (score === 100) return 5 // 🍓
  if (score >= 81) return 4 // 🍉
  if (score >= 61) return 3 // 🍑
  if (score >= 41) return 2 // 🍋
  if (score >= 21) return 1 // 🥦
  return 0 // 🥔
}

/**
 * Calculate score distribution across emoji ranges
 */
const calculateScoreDistribution = (results: GameResult[]): number[] => {
  const distribution = new Array(6).fill(0)
  
  results.forEach(result => {
    const rangeIndex = getEmojiRangeIndex(result.score)
    distribution[rangeIndex]++
  })
  
  return distribution
}

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<GameStats> => {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_GET))

  const results = getStoredResults()
  
  if (results.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      currentStreak: 0,
      scoreDistribution: new Array(6).fill(0)
    }
  }

  return {
    totalGames: results.length,
    averageScore: calculateAverageScore(results),
    currentStreak: calculateCurrentStreak(results),
    scoreDistribution: calculateScoreDistribution(results)
  }
}

