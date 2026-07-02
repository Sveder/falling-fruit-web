import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Ripeness guides are served as static JSON (mirroring how locales load from
// `/locales/{{lng}}.json`) rather than bundled into the app, so the data can be
// updated — and eventually moved behind a proper API — without a rebuild
// (issue #1128). Fetch the current language, falling back to English.
const LOAD_PATH = (lng) => `${process.env.PUBLIC_URL}/ripeness/${lng}.json`

// Cache one in-flight/settled promise per language.
const cache = {}

const loadRipeness = (lng) => {
  if (!cache[lng]) {
    cache[lng] = fetch(LOAD_PATH(lng))
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}))
  }
  return cache[lng]
}

// React hook: returns the ripeness map for the active language ({} until it
// resolves), falling back to English when a translation isn't available yet.
export const useRipeness = () => {
  const { i18n } = useTranslation()
  const lng = (i18n.language || 'en').split('-')[0]
  const [ripeness, setRipeness] = useState({})

  useEffect(() => {
    let active = true
    ;(async () => {
      let data = await loadRipeness(lng)
      if ((!data || Object.keys(data).length === 0) && lng !== 'en') {
        data = await loadRipeness('en')
      }
      if (active) {
        setRipeness(data || {})
      }
    })()
    return () => {
      active = false
    }
  }, [lng])

  return ripeness
}

// Ethan's guidance on #1128: ripeness text is far more reliable for
// (sub)specific taxa than for genus-level ones — e.g. "Pyrus" mostly describes
// Pyrus communis, which is misleading on a Pyrus calleryana. So a guide is only
// surfaced once the type is resolved to at least the species level.
const isSubspecificTaxon = (scientificName) => {
  if (!scientificName) {
    return false
  }
  // A species/subspecies has a lowercase (or hybrid ×) epithet after the
  // capitalised genus, e.g. "Prunus cerasifera", "Prunus × domestica". A bare
  // genus ("Pyrus") or a genus + cultivar ("Malus 'Gala'") is treated as generic.
  const tokens = scientificName.trim().split(/\s+/).filter(Boolean)
  if (tokens.length < 2) {
    return false
  }
  return tokens.slice(1).some((token) => /^[a-z×]/.test(token))
}

// Returns the ripeness guide for a type from a loaded ripeness map, or null when
// it should not be shown (no entry, or a genus-level taxon).
export const getRipeness = (type, ripeness) => {
  if (!type || !ripeness) {
    return null
  }
  const entry = ripeness[type.id]
  if (!entry) {
    return null
  }
  if (!isSubspecificTaxon(type.scientificName || entry.scientificName)) {
    return null
  }
  return entry
}
