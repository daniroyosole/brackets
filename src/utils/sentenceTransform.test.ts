import { describe, it, expect } from 'vitest'
import { transformSentence, findEligibleClues, normalizeString } from './sentenceTransform'
import type { Sentence } from '../models/sentence'

describe('normalizeString', () => {
  it('should convert to lowercase', () => {
    expect(normalizeString('Hello')).toBe('hello')
    expect(normalizeString('WORLD')).toBe('world')
  })

  it('should remove accents from characters', () => {
    expect(normalizeString('café')).toBe('cafe')
    expect(normalizeString('José')).toBe('jose')
    expect(normalizeString('naïve')).toBe('naive')
    expect(normalizeString('résumé')).toBe('resume')
  })

  it('should handle accented uppercase letters', () => {
    expect(normalizeString('ÉLÉPHANT')).toBe('elephant')
    expect(normalizeString('ÀÁÂÃÄÅ')).toBe('aaaaaa')
  })

  it('should trim whitespace', () => {
    expect(normalizeString('  hello  ')).toBe('hello')
    expect(normalizeString('\n\tworld\r')).toBe('world')
  })

  it('should handle combined case and accent changes', () => {
    expect(normalizeString('  PrímÉ  ')).toBe('prime')
    expect(normalizeString('PISTÀ')).toBe('pista')
  })

  it('should handle Spanish and Catalan accents', () => {
    expect(normalizeString('valencià')).toBe('valencia')
    expect(normalizeString('mañana')).toBe('manana')
    expect(normalizeString('británica')).toBe('britanica')
  })

  it('should return empty string for empty input', () => {
    expect(normalizeString('')).toBe('')
    expect(normalizeString('   ')).toBe('')
  })

  it('should handle strings without accents', () => {
    expect(normalizeString('Prime')).toBe('prime')
    expect(normalizeString('pista')).toBe('pista')
    expect(normalizeString('ant')).toBe('ant')
  })
})

describe('transformSentence', () => {
  it('should return text as-is when there are no clues', () => {
    const sentence: Sentence = {
      text: 'Hello world',
    }
    const result = transformSentence(sentence, new Set())
    expect(result).toBe('Hello world')
  })

  it('should wrap single clue in brackets', () => {
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
    const result = transformSentence(sentence, new Set())
    expect(result).toBe('[greeting] world')
  })

  it('should handle multiple clues without nesting', () => {
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
    const result = transformSentence(sentence, new Set())
    expect(result).toBe('[greeting] [planet]')
  })

  it('should handle nested clues recursively', () => {
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
              value: 'q',
              startIndex: 0,
            },
            {
              text: 'remainder',
              value: 'uality',
              startIndex: 1,
            },
          ],
        },
      ],
    }
    const result = transformSentence(sentence, new Set())
    expect(result).toBe('[[first letter][remainder]] example')
    
    // The nested clues should also be transformed
    const nestedResult = transformSentence(sentence.clues![0], new Set())
    expect(nestedResult).toBe('[first letter][remainder]')
  })

  it('should replace solved clues with their value instead of brackets', () => {
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
    const solvedClues = new Set(['0'])
    const result = transformSentence(sentence, solvedClues)
    expect(result).toBe('Hello world')
  })

  it('should handle partial solving of nested clues', () => {
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
              value: 'q',
              startIndex: 0,
            },
            {
              text: 'remainder',
              value: 'uality',
              startIndex: 1,
            },
          ],
        },
      ],
    }
    // Solve only the inner first clue
    const solvedClues = new Set(['0-0'])
    const result = transformSentence(sentence, solvedClues)
    expect(result).toBe('[q[remainder]] example')
    
    // Check nested clue transformation
    const nestedResult = transformSentence(sentence.clues![0], solvedClues, '0')
    expect(nestedResult).toBe('q[remainder]')
  })

  it('should handle clues that appear in reverse order by startIndex', () => {
    const sentence: Sentence = {
      text: 'abcdef',
      clues: [
        {
          text: 'second',
          value: 'cde',
          startIndex: 2,
        },
        {
          text: 'first',
          value: 'ab',
          startIndex: 0,
        },
      ],
    }
    const result = transformSentence(sentence, new Set())
    // Should handle reverse processing correctly
    expect(result).toBe('[first][second]f')
  })

  it('should handle deeply nested clues', () => {
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
              value: 'ev',
              startIndex: 1,
              clues: [
                {
                  text: 'level3',
                  value: 'e',
                  startIndex: 1,
                },
              ],
            },
          ],
        },
      ],
    }
    const result = transformSentence(sentence, new Set())
    expect(result).toBe('[l[l[level3]vel2]el1]')
    
    // Verify nested transformation
    const level1Result = transformSentence(sentence.clues![0], new Set(), '0')
    expect(level1Result).toBe('l[l[level3]vel2]el1')
    
    const level2Result = transformSentence(sentence.clues![0].clues![0], new Set(), '0-0')
    expect(level2Result).toBe('l[level3]vel2')
  })
})

describe('findEligibleClues', () => {
  it('should return empty array when there are no clues', () => {
    const sentence: Sentence = {
      text: 'Hello world',
    }
    const result = findEligibleClues(sentence, new Set())
    expect(result).toEqual([])
  })

  it('should find clues with no inner clues', () => {
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
    const result = findEligibleClues(sentence, new Set())
    expect(result).toHaveLength(2)
    expect(result[0].clue.value).toBe('Hello')
    expect(result[0].path).toBe('0')
    expect(result[1].clue.value).toBe('world')
    expect(result[1].path).toBe('1')
  })

  it('should not include clues with unsolved inner clues', () => {
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
    const result = findEligibleClues(sentence, new Set())
    // Should only find the inner clues, not the parent
    expect(result).toHaveLength(2)
    expect(result.some(clue => clue.clue.value === 'P')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'rime')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'Prime')).toBe(false)
  })

  it('should include parent clue when all inner clues are solved', () => {
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
    const result = findEligibleClues(sentence, solvedClues)
    // Should include the parent clue now
    expect(result.some(clue => clue.clue.value === 'Prime')).toBe(true)
    expect(result.some(clue => clue.path === '0')).toBe(true)
  })

  it('should skip already solved clues', () => {
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
    const result = findEligibleClues(sentence, solvedClues)
    // Should only find the unsolved clue
    expect(result).toHaveLength(1)
    expect(result[0].clue.value).toBe('world')
    expect(result[0].path).toBe('1')
  })

  it('should recursively find eligible clues in nested structures', () => {
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
    const result = findEligibleClues(sentence, new Set())
    // Should find the deepest clue first
    expect(result.some(clue => clue.clue.value === 'C' && clue.path === '0-0-0')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'ABCD')).toBe(false)
    expect(result.some(clue => clue.clue.value === 'BC')).toBe(false)
  })

  it('should find eligible clues at all levels when inner ones are solved', () => {
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
    // Solve the deepest clue
    const solvedClues = new Set(['0-0-0'])
    const result = findEligibleClues(sentence, solvedClues)
    // Should now find level2 clue eligible
    expect(result.some(clue => clue.clue.value === 'BC' && clue.path === '0-0')).toBe(true)
    // But not level1 yet
    expect(result.some(clue => clue.clue.value === 'ABCD' && clue.path === '0')).toBe(false)
    
    // Solve level2 as well
    const solvedClues2 = new Set(['0-0-0', '0-0'])
    const result2 = findEligibleClues(sentence, solvedClues2)
    // Now level1 should be eligible
    expect(result2.some(clue => clue.clue.value === 'ABCD' && clue.path === '0')).toBe(true)
  })

  it('should handle multiple top-level clues with nested structures', () => {
    const sentence: Sentence = {
      text: 'Hello world test',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 0,
          clues: [
            {
              text: 'first letter',
              value: 'H',
              startIndex: 0,
            },
          ],
        },
        {
          text: 'planet',
          value: 'world',
          startIndex: 6,
        },
      ],
    }
    const result = findEligibleClues(sentence, new Set())
    // Should find: H (inner), world (no inner clues), but not Hello (has unsolved inner)
    expect(result).toHaveLength(2)
    expect(result.some(clue => clue.clue.value === 'H' && clue.path === '0-0')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'world' && clue.path === '1')).toBe(true)
  })
})

