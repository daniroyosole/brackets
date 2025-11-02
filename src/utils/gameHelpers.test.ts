import { describe, it, expect } from 'vitest'
import { findMatchingClue } from './gameHelpers'
import type { Sentence } from '../models/sentence'

describe('findMatchingClue', () => {
  it('should return undefined for empty input', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), '')
    expect(result).toBeUndefined()
  })

  it('should return undefined for whitespace-only input', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), '   ')
    expect(result).toBeUndefined()
  })

  it('should find a matching clue by exact value', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
        {
          text: 'planet',
          value: 'world',
          startIndex: 6,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'Hello')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue case-insensitively', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'hello')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with uppercase input', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'HELLO')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('hello')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue accent-insensitively', () => {
    const sentence: Sentence = {
      text: 'Prime example',
      clues: [
        {
          text: 'quality',
          value: 'Prímé',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'prime')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prímé')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with accented input', () => {
    const sentence: Sentence = {
      text: 'Prime example',
      clues: [
        {
          text: 'quality',
          value: 'Prime',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'prímé')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prime')
    expect(result?.path).toBe('0')
  })

  it('should find a matching clue with trimmed whitespace', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), '  Hello  ')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Hello')
    expect(result?.path).toBe('0')
  })

  it('should only match eligible clues', () => {
    const sentence: Sentence = {
      text: 'Prime example',
      clues: [
        {
          text: 'quality',
          value: 'Prime',
          startIndex: 0,
          clues: [
            {
              text: 'first letter',
              value: 'P',
              startIndex: 0,
            },
          ],
        },
      ],
    }
    // Prime is not eligible because it has unsolved inner clues
    const result1 = findMatchingClue(sentence, new Set(), 'Prime')
    expect(result1).toBeUndefined()

    // P is eligible (no inner clues)
    const result2 = findMatchingClue(sentence, new Set(), 'P')
    expect(result2).toBeDefined()
    expect(result2?.clue.value).toBe('P')
    expect(result2?.path).toBe('0-0')
  })

  it('should not match already solved clues', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
        {
          text: 'planet',
          value: 'world',
          startIndex: 6,
        },
      ],
    }
    const solvedClues = new Set(['0'])
    // Should not match Hello (already solved)
    const result1 = findMatchingClue(sentence, solvedClues, 'Hello')
    expect(result1).toBeUndefined()

    // Should match world (not solved)
    const result2 = findMatchingClue(sentence, solvedClues, 'world')
    expect(result2).toBeDefined()
    expect(result2?.clue.value).toBe('world')
    expect(result2?.path).toBe('1')
  })

  it('should match parent clue when all inner clues are solved', () => {
    const sentence: Sentence = {
      text: 'Prime example',
      clues: [
        {
          text: 'quality',
          value: 'Prime',
          startIndex: 0,
          clues: [
            {
              text: 'first letter',
              value: 'P',
              startIndex: 0,
            },
            {
              text: 'remainder',
              value: 'rime',
              startIndex: 1,
            },
          ],
        },
      ],
    }
    // Solve all inner clues
    const solvedClues = new Set(['0-0', '0-1'])
    // Now Prime should be eligible
    const result = findMatchingClue(sentence, solvedClues, 'Prime')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('Prime')
    expect(result?.path).toBe('0')
  })

  it('should return undefined when no match is found', () => {
    const sentence: Sentence = {
      text: 'Hello world',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'Goodbye')
    expect(result).toBeUndefined()
  })

  it('should handle nested clues correctly', () => {
    const sentence: Sentence = {
      text: 'ABCD',
      clues: [
        {
          text: 'level1',
          value: 'ABCD',
          startIndex: 0,
          clues: [
            {
              text: 'level2',
              value: 'BC',
              startIndex: 1,
              clues: [
                {
                  text: 'level3',
                  value: 'C',
                  startIndex: 1,
                },
              ],
            },
          ],
        },
      ],
    }
    // Should find the deepest eligible clue
    const result = findMatchingClue(sentence, new Set(), 'C')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('C')
    expect(result?.path).toBe('0-0-0')
  })

  it('should match with Spanish/Catalan accents', () => {
    const sentence: Sentence = {
      text: 'valencià',
      clues: [
        {
          text: 'city',
          value: 'valencià',
          startIndex: 0,
        },
      ],
    }
    const result = findMatchingClue(sentence, new Set(), 'valencia')
    expect(result).toBeDefined()
    expect(result?.clue.value).toBe('valencià')
    expect(result?.path).toBe('0')
  })
})

