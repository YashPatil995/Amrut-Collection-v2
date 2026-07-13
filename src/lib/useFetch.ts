'use client'

import { useCallback, useEffect, useState } from 'react'

export function useFetch<T>(url: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let active = true
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error('Request failed: ' + r.status)
        const json = await r.json()
        if (active) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [url, nonce, ...deps])

  return { data, loading, error, reload, mutate: reload }
}
