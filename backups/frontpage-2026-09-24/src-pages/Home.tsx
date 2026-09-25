import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import MapApp from '../map/MapApp'

export default function Home() {
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (location.pathname !== '/' || params.has('view')) return
    params.set('view', 'MX-3MJRU-8XY14-3LPVC')
    setSearchParams(params, { replace: true })
  }, [location.pathname, location.search, setSearchParams])

  return <MapApp />
}