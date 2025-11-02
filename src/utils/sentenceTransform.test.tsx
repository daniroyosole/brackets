import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { findEligibleClues, normalizeString, renderSentenceWithHighlighting } from './sentenceTransform'
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

describe('renderSentenceWithHighlighting', () => {
  it('should return text as-is when there are no clues', () => {
    const sentence: Sentence = {
      text: 'Hello world',
    }
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('Hello world')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('[greeting] world')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('[greeting] [planet]')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('[[first letter][remainder]] example')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, solvedClues, new Set())}</>)
    expect(container.textContent).toBe('Hello world')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, solvedClues, new Set())}</>)
    expect(container.textContent).toBe('[q[remainder]] example')
  })

  it('should highlight eligible clues with clue-eligible class', () => {
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
    const eligibleCluePaths = new Set(['0'])
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), eligibleCluePaths)}</>)
    const eligibleSpan = container.querySelector('.clue-eligible')
    expect(eligibleSpan).toBeTruthy()
    expect(eligibleSpan?.textContent).toBe('[greeting]')
    
    // Second clue should not be highlighted
    const allSpans = container.querySelectorAll('span')
    expect(allSpans).toHaveLength(2)
    expect(allSpans[0].className).toBe('clue-eligible')
    expect(allSpans[1].className).toBe('')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('[first][second]f')
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
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('[l[l[level3]vel2]el1]')
  })

  it('should highlight nested eligible clues', () => {
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
    // Make the inner clue eligible
    const eligibleCluePaths = new Set(['0-0'])
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), eligibleCluePaths)}</>)
    
    // Should find eligible span for the inner clue
    const eligibleSpans = container.querySelectorAll('.clue-eligible')
    expect(eligibleSpans.length).toBeGreaterThan(0)
    
    // The inner clue should be highlighted
    const innerEligible = Array.from(eligibleSpans).find(span => span.textContent?.includes('[first letter]'))
    expect(innerEligible).toBeTruthy()
  })

  it('should not highlight solved clues even if eligible', () => {
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
    const eligibleCluePaths = new Set(['0'])
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, solvedClues, eligibleCluePaths)}</>)
    
    // Solved clues should show their value, not be wrapped in spans
    expect(container.textContent).toBe('Hello world')
    const eligibleSpans = container.querySelectorAll('.clue-eligible')
    expect(eligibleSpans.length).toBe(0)
  })

  it('should handle text before and after clues', () => {
    const sentence: Sentence = {
      text: 'Start Hello End',
      clues: [
        {
          text: 'greeting',
          value: 'Hello',
          startIndex: 6,
        },
      ],
    }
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    expect(container.textContent).toBe('Start [greeting] End')
  })

  it('should handle overlapping text segments correctly', () => {
    const sentence: Sentence = {
      text: 'abcdef',
      clues: [
        {
          text: 'first',
          value: 'ab',
          startIndex: 0,
        },
        {
          text: 'second',
          value: 'bc',
          startIndex: 1,
        },
        {
          text: 'third',
          value: 'cd',
          startIndex: 2,
        },
      ],
    }
    const { container } = render(<>{renderSentenceWithHighlighting(sentence, new Set(), new Set())}</>)
    // Should render clues in order
    expect(container.textContent).toContain('[first]')
    expect(container.textContent).toContain('[second]')
    expect(container.textContent).toContain('[third]')
  })
})

