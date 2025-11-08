import { sentences } from '../mockData'
import type { Sentence } from '../models/sentence'

/**
 * Fake API call to GET /daily
 * Returns the sentence matching the provided date (YYYY-MM-DD)
 * Date must be today or in the past, never in the future
 */
export const getDailySentence = async (date: string): Promise<Sentence> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD')
  }

  // Parse the date
  const requestedDate = new Date(date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if date is in the future
  if (requestedDate > today) {
    throw new Error('Date cannot be in the future')
  }

  // Find sentence matching the date
  const sentence = sentences.find(s => s.date === date)

  if (!sentence) {
    throw new Error(`No sentence found for date: ${date}`)
  }

  // Return sentence with date field included
  return sentence
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export const getTomorrowDate = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

