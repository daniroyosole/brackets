export interface Range {
  start: number
  end: number
}

export interface NormalizedSelection {
  start: number
  end: number
  text: string
}

export interface SelectionAdjustmentResult {
  selection: NormalizedSelection | null
  overlaps: boolean
}

/**
 * Normalizes a text selection within a string, trimming whitespace and checking overlap.
 * Returns the adjusted selection (start/end/text) or null if invalid.
 * Indicates when the selection overlaps with existing ranges so callers can clear the browser selection.
 */
export const adjustSelectionRange = (
  text: string,
  rawStart: number,
  rawEnd: number,
  usedRanges: Range[]
): SelectionAdjustmentResult => {
  if (rawStart === rawEnd) {
    return { selection: null, overlaps: false }
  }

  const selectionTextFull = text.substring(rawStart, rawEnd)
  const trimmed = selectionTextFull.trim()

  if (!trimmed) {
    return { selection: null, overlaps: false }
  }

  const trimOffset = selectionTextFull.indexOf(trimmed)
  const adjustedStart = rawStart + (trimOffset >= 0 ? trimOffset : 0)
  const adjustedEnd = adjustedStart + trimmed.length

  if (adjustedStart < 0 || adjustedEnd > text.length || adjustedStart >= adjustedEnd) {
    return { selection: null, overlaps: false }
  }

  const overlaps = usedRanges.some(range => !(adjustedEnd <= range.start || adjustedStart >= range.end))

  if (overlaps) {
    return { selection: null, overlaps: true }
  }

  return {
    selection: {
      start: adjustedStart,
      end: adjustedEnd,
      text: trimmed
    },
    overlaps: false
  }
}

