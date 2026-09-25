/** React custom hooks */

import { useEffect, useState } from 'react'

const originalPushState = window.history.pushState.bind(window.history)
const originalReplaceState = window.history.replaceState.bind(window.history)

function emitPopState() {
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Keep `history.pushState`/`history.replaceState` reactive by mirroring them
 * with a synthetic `popstate` event (replaces react-use `useLocation`).
 */
window.history.pushState = function (...args: Parameters<typeof originalPushState>) {
  const result = originalPushState(...args)
  emitPopState()
  return result
}
window.history.replaceState = function (...args: Parameters<typeof originalReplaceState>) {
  const result = originalReplaceState(...args)
  emitPopState()
  return result
}

/**
 * Current `window.location.search`, updated on push/replace/pop/hash changes.
 */
function useLocationSearch(): string {
  const [search, setSearch] = useState(() => window.location.search)
  useEffect(() => {
    const onChange = () => setSearch(window.location.search)
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onChange)
    }
  }, [])
  return search
}

/**
 * Use url parameters to store app state; recomputed on every URL change.
 *
 * @param $callback map a `URLSearchParams` into the value you need
 */
function useUrlSearchParams<T>($callback: (urlSearchParams: URLSearchParams) => T): {
  value: T
  urlSearchParams: URLSearchParams
} {
  const locationSearch = useLocationSearch()
  const urlSearchParams = new URLSearchParams(locationSearch)
  const value = $callback(urlSearchParams)
  return {
    value: value,
    urlSearchParams: urlSearchParams,
  }
}

export { useUrlSearchParams }