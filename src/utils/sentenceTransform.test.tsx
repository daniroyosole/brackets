import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { findEligibleClues, normalizeString, renderSentenceWithHighlighting } from './sentenceTransform'
import type { Sentence, Clue } from '../models/sentence'

// Helper functions to reduce repetition
const createSentence = (text: string, clues?: Clue[]): Sentence => ({
  date: '2025-11-06',
  text,
  clues
})

const createClue = (text: string, value: string, startIndex: number, clues?: Clue[]): Clue => ({
  date: '2025-11-06',
  text,
  value,
  startIndex,
  clues
})

const renderAndGetText = (
  sentence: Sentence,
  solvedClues: Set<string> = new Set(),
  eligibleCluePaths: Set<string> = new Set(),
  revealedFirstLetters: Set<string> = new Set()
) => {
  const { container } = render(
    <>{renderSentenceWithHighlighting(sentence, solvedClues, eligibleCluePaths, revealedFirstLetters, () => {})}</>
  )
  return container
}

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
    const sentence = createSentence('Hello world')
    const result = findEligibleClues(sentence, new Set())
    expect(result).toEqual([])
  })

  it('should find clues with no inner clues', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const result = findEligibleClues(sentence, new Set())
    expect(result).toHaveLength(2)
    expect(result[0].clue.value).toBe('Hello')
    expect(result[0].path).toBe('0')
    expect(result[1].clue.value).toBe('world')
    expect(result[1].path).toBe('1')
  })

  it('should not include clues with unsolved inner clues', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'P', 0),
        createClue('remainder', 'rime', 1),
      ]),
    ])
    const result = findEligibleClues(sentence, new Set())
    expect(result).toHaveLength(2)
    expect(result.some(clue => clue.clue.value === 'P')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'rime')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'Prime')).toBe(false)
  })

  it('should include parent clue when all inner clues are solved', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'P', 0),
        createClue('remainder', 'rime', 1),
      ]),
    ])
    const solvedClues = new Set(['0-0', '0-1'])
    const result = findEligibleClues(sentence, solvedClues)
    expect(result.some(clue => clue.clue.value === 'Prime')).toBe(true)
    expect(result.some(clue => clue.path === '0')).toBe(true)
  })

  it('should skip already solved clues', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const solvedClues = new Set(['0'])
    const result = findEligibleClues(sentence, solvedClues)
    expect(result).toHaveLength(1)
    expect(result[0].clue.value).toBe('world')
    expect(result[0].path).toBe('1')
  })

  it('should recursively find eligible clues in nested structures', () => {
    const sentence = createSentence('ABCD', [
      createClue('level1', 'ABCD', 0, [
        createClue('level2', 'BC', 1, [
          createClue('level3', 'C', 1),
        ]),
      ]),
    ])
    const result = findEligibleClues(sentence, new Set())
    expect(result.some(clue => clue.clue.value === 'C' && clue.path === '0-0-0')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'ABCD')).toBe(false)
    expect(result.some(clue => clue.clue.value === 'BC')).toBe(false)
  })

  it('should find eligible clues at all levels when inner ones are solved', () => {
    const sentence = createSentence('ABCD', [
      createClue('level1', 'ABCD', 0, [
        createClue('level2', 'BC', 1, [
          createClue('level3', 'C', 1),
        ]),
      ]),
    ])
    const solvedClues = new Set(['0-0-0'])
    const result = findEligibleClues(sentence, solvedClues)
    expect(result.some(clue => clue.clue.value === 'BC' && clue.path === '0-0')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'ABCD' && clue.path === '0')).toBe(false)
    
    const solvedClues2 = new Set(['0-0-0', '0-0'])
    const result2 = findEligibleClues(sentence, solvedClues2)
    expect(result2.some(clue => clue.clue.value === 'ABCD' && clue.path === '0')).toBe(true)
  })

  it('should handle multiple top-level clues with nested structures', () => {
    const sentence = createSentence('Hello world test', [
      createClue('greeting', 'Hello', 0, [
        createClue('first letter', 'H', 0),
      ]),
      createClue('planet', 'world', 6),
    ])
    const result = findEligibleClues(sentence, new Set())
    expect(result).toHaveLength(2)
    expect(result.some(clue => clue.clue.value === 'H' && clue.path === '0-0')).toBe(true)
    expect(result.some(clue => clue.clue.value === 'world' && clue.path === '1')).toBe(true)
  })
})

describe('renderSentenceWithHighlighting', () => {
  it('should return text as-is when there are no clues', () => {
    const sentence = createSentence('Hello world')
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('Hello world')
  })

  it('should wrap single clue in brackets', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('[greeting] world')
  })

  it('should handle multiple clues without nesting', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('[greeting] [planet]')
  })

  it('should handle nested clues recursively', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'q', 0),
        createClue('remainder', 'uality', 1),
      ]),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('[[first letter][remainder]] example')
  })

  it('should replace solved clues with their value instead of brackets', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const container = renderAndGetText(sentence, new Set(['0']))
    expect(container.textContent).toBe('Hello world')
  })

  it('should handle partial solving of nested clues', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'q', 0),
        createClue('remainder', 'uality', 1),
      ]),
    ])
    const container = renderAndGetText(sentence, new Set(['0-0']))
    expect(container.textContent).toBe('[q[remainder]] example')
  })

  it('should highlight eligible clues with clue-eligible class', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
      createClue('planet', 'world', 6),
    ])
    const container = renderAndGetText(sentence, new Set(), new Set(['0']))
    const eligibleSpan = container.querySelector('.clue-eligible')
    expect(eligibleSpan).toBeTruthy()
    expect(eligibleSpan?.textContent).toBe('[greeting]')
    
    const allSpans = container.querySelectorAll('span')
    expect(allSpans).toHaveLength(2)
    expect(allSpans[0].className).toBe('clue-eligible')
    expect(allSpans[1].className).toBe('')
  })

  it('should handle clues that appear in reverse order by startIndex', () => {
    const sentence = createSentence('abcdef', [
      createClue('second', 'cde', 2),
      createClue('first', 'ab', 0),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('[first][second]f')
  })

  it('should handle deeply nested clues', () => {
    const sentence = createSentence('ABCD', [
      createClue('level1', 'ABCD', 0, [
        createClue('level2', 'ev', 1, [
          createClue('level3', 'e', 1),
        ]),
      ]),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('[l[l[level3]vel2]el1]')
  })

  it('should highlight nested eligible clues', () => {
    const sentence = createSentence('Prime example', [
      createClue('quality', 'Prime', 0, [
        createClue('first letter', 'P', 0),
        createClue('remainder', 'rime', 1),
      ]),
    ])
    const container = renderAndGetText(sentence, new Set(), new Set(['0-0']))
    const eligibleSpans = container.querySelectorAll('.clue-eligible')
    expect(eligibleSpans.length).toBeGreaterThan(0)
    const innerEligible = Array.from(eligibleSpans).find(span => span.textContent?.includes('[first letter]'))
    expect(innerEligible).toBeTruthy()
  })

  it('should not highlight solved clues even if eligible', () => {
    const sentence = createSentence('Hello world', [
      createClue('greeting', 'Hello', 0),
    ])
    const container = renderAndGetText(sentence, new Set(['0']), new Set(['0']))
    expect(container.textContent).toBe('Hello world')
    const eligibleSpans = container.querySelectorAll('.clue-eligible')
    expect(eligibleSpans.length).toBe(0)
  })

  it('should handle text before and after clues', () => {
    const sentence = createSentence('Start Hello End', [
      createClue('greeting', 'Hello', 6),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toBe('Start [greeting] End')
  })

  it('should handle overlapping text segments correctly', () => {
    const sentence = createSentence('abcdef', [
      createClue('first', 'ab', 0),
      createClue('second', 'bc', 1),
      createClue('third', 'cd', 2),
    ])
    const container = renderAndGetText(sentence)
    expect(container.textContent).toContain('[first]')
    expect(container.textContent).toContain('[second]')
    expect(container.textContent).toContain('[third]')
  })
})
