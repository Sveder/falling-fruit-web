/* eslint-env jest */
import ripenessData from '../../public/ripeness/en.json'
import { getRipeness } from './ripenessGuide'

// A minimal stub map — getRipeness is pure over whatever map it's handed.
const MAP = {
  10: {
    name: 'Sample',
    scientificName: 'Genus specifica',
    whenRipe: 'x',
    offTree: 'y',
  },
}

describe('getRipeness', () => {
  it('returns null without a type, map, or matching entry', () => {
    expect(getRipeness(null, MAP)).toBeNull()
    expect(getRipeness({ id: 10 }, null)).toBeNull()
    expect(getRipeness({ id: 999, scientificName: 'Foo bar' }, MAP)).toBeNull()
  })

  it('shows the guide for (sub)specific taxa', () => {
    expect(
      getRipeness({ id: 10, scientificName: 'Malus domestica' }, MAP),
    ).toBe(MAP[10])
    expect(
      getRipeness({ id: 10, scientificName: 'Prunus × domestica' }, MAP),
    ).toBe(MAP[10])
  })

  it('gates out genus-level taxa and cultivars', () => {
    expect(getRipeness({ id: 10, scientificName: 'Malus' }, MAP)).toBeNull()
    expect(
      getRipeness({ id: 10, scientificName: "Malus 'Gala'" }, MAP),
    ).toBeNull()
  })

  it("falls back to the entry's own scientificName when the type lacks one", () => {
    expect(getRipeness({ id: 10 }, MAP)).toBe(MAP[10])
  })
})

// The served JSON is the data source (issue #1128). It renders as plain JSX
// children (React-escaped), so every field must be a plain string.
describe('served ripeness JSON', () => {
  it('every entry exposes string-only whenRipe / offTree / scientificName', () => {
    const entries = Object.values(ripenessData)
    expect(entries.length).toBeGreaterThan(0)
    entries.forEach((e) => {
      expect(typeof e.whenRipe).toBe('string')
      expect(typeof e.offTree).toBe('string')
      expect(typeof e.scientificName).toBe('string')
    })
  })
})
