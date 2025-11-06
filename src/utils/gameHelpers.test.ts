import { describe, it, expect } from 'vitest'
import { findMatchingClue } from './gameHelpers'
import type { Sentence, Clue } from '../models/sentence'

// Helper functions to reduce repetition
const createSentence = (text: string, clues?: Clue[]): Sentence => ({
  date: '2025-11-06',
  text,
  clues
})

const createClue = (text: string, value: string, startIndex: number, clues?: Clue[]): Clue => ({
  text,
  value,
  startIndex,
  clues
})

describe('findMatchingClue', () => {
  it('should return undefined for empty input', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), '')
    expect(result).toBeUndefined()
  })

  it('should return undefined for whitespace-only input', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), '   ')
    expect(result).toBeUndefined()
  })

  it('should find a matching clue by exact value', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const result = findMatchingClue(sentence, new Set(), 'Hello')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue case-insensitively', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'hello')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with uppercase input', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'HELLO')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue accent-insensitively', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prímé', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'prime')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prímé')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with accented input', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'prímé')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prime')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with trimmed whitespace', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), '  Hello  ')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should only match eligible clues', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'P', 0),
      ]),
    ])
    const result1 = findMatchingClue(sentence, new Set(), 'Prime')
    expect(result1).toBeUndefined()

    const result2 = findMatchingClue(sentence, new Set(), 'P')
    expect(result2).toBeDefined()
    expect(result2?.clue.value).toBe('P')
    expect(result2?.path).toBe('0-0')
  })

  it('should not match already solved clues', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const solvedClues = new Set(['0'])
    const result1 = findMatchingClue(sentence, solvedClues, 'Hello')
    expect(result1).toBeUndefined()

    const result2 = findMatchingClue(sentence, solvedClues, 'world')
    expect(result2).toBeDefined()
    expect(result2?.clue.value).toBe('world')
    expect(result2?.path).toBe('1')
  })

  it('should match parent clue when all inner clues are solved', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'P', 0),
        createClue('remainder', 'rime', 1),
      ]),
    ])
    const solvedClues = new Set(['0-0', '0-1'])
    const result = findMatchingClue(sentence, solvedClues, 'Prime')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prime')
    expect(result?.path).toBe('0')
  })

  it('should return undefined when no match is found', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'Goodbye')
    expect(result).toBeUndefined()
  })

  it('should handle nested clues correctly', () => {
    const sentence = createSentence('ABCD', [
      createClue('level1', 'ABCD', 0, [
        createClue('level2', 'BC', 1, [
          createClue('level3', 'C', 1),
        ]),
      ]),
    ])
    const result = findMatchingClue(sentence, new Set(), 'C')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('C')
    expect(result?.path).toBe('0-0-0')
  })

  it('should match with Spanish/Catalan accents', () => {
    const sentence = createSentence('valencià', [
      createClue('city', 'valencià', 0),
    ])
    const result = findMatchingClue(sentence, new Set(), 'valencia')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('valencià')
    expect(result?.path).toBe('0')
  })
})

