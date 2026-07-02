/* eslint-env jest */
import { RIPENESS } from '../constants/ripeness'
import { getRipeness } from './ripenessGuide'

// A known entry to build test types around.
const [SAMPLE_ID, SAMPLE_ENTRY] = Object.entries(RIPENESS)[0]
const id = Number(SAMPLE_ID)

describe('getRipeness', () => {
  it('returns null for a missing type or unknown id', () => {
    expect(getRipeness(null)).toBeNull()
    expect(getRipeness({ id: -1, scientificName: 'Nope nope' })).toBeNull()
  })

  it('shows the guide for (sub)specific taxa', () => {
    expect(getRipeness({ id, scientificName: 'Malus domestica' })).toBe(
      SAMPLE_ENTRY,
    )
    expect(getRipeness({ id, scientificName: 'Prunus × domestica' })).toBe(
      SAMPLE_ENTRY,
    )
  })

  it('gates out genus-level taxa and cultivars, even with an entry', () => {
    expect(getRipeness({ id, scientificName: 'Malus' })).toBeNull()
    expect(getRipeness({ id, scientificName: "Malus 'Gala'" })).toBeNull()
    expect(getRipeness({ id, scientificName: '' })).toBeNull()
  })

  it('falls back to the entry scientificName when the type lacks one', () => {
    // Pick an entry whose own scientificName is species-level (genus + epithet).
    const found = Object.entries(RIPENESS).find(([, e]) =>
      /^\S+\s+[a-z×]/.test((e.scientificName || '').trim()),
    )
    const [fid, fentry] = found
    expect(getRipeness({ id: Number(fid) })).toBe(fentry)
  })
})

// Injection safety (issue #1128): the guide is rendered as plain JSX children,
// which React escapes — so the data must never carry anything but strings.
describe('RIPENESS data integrity', () => {
  it('every entry exposes string-only whenRipe / offTree', () => {
    Object.values(RIPENESS).forEach((e) => {
      expect(typeof e.whenRipe).toBe('string')
      expect(typeof e.offTree).toBe('string')
    })
  })
})
