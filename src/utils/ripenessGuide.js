import { RIPENESS } from '../constants/ripeness'

// Single access point for ripeness guides. Today the data is bundled in
// constants/ripeness.js; keeping every lookup behind getRipeness() means the
// source can later move to a backend endpoint (issue #1128) without touching
// any UI component.

// Ethan's guidance on #1128: ripeness text is far more reliable for
// (sub)specific taxa than for genus-level ones — e.g. "Pyrus" mostly describes
// Pyrus communis, which is misleading on a Pyrus calleryana. So a guide is only
// surfaced once the type is resolved to at least the species level.
const isSubspecificTaxon = (scientificName) => {
  if (!scientificName) {
    return false
  }
  // A species/subspecies has a lowercase (or hybrid ×) epithet after the
  // capitalised genus, e.g. "Prunus cerasifera", "Malus domestica",
  // "Prunus × domestica". A bare genus ("Pyrus") or a genus + cultivar
  // ("Malus 'Gala'") is treated as generic.
  const tokens = scientificName.trim().split(/\s+/).filter(Boolean)
  if (tokens.length < 2) {
    return false
  }
  return tokens.slice(1).some((token) => /^[a-z×]/.test(token))
}

// Returns the ripeness guide for a type, or null when it should not be shown
// (no entry, or a genus-level taxon).
export const getRipeness = (type) => {
  if (!type) {
    return null
  }
  const entry = RIPENESS[type.id]
  if (!entry) {
    return null
  }
  if (!isSubspecificTaxon(type.scientificName || entry.scientificName)) {
    return null
  }
  return entry
}
