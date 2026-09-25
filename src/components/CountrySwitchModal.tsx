import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CountrySelect2 from './CountrySelect2'
import { fetchCountries, type Country } from '../lib/strapi'

interface CountrySwitchModalProps {
  open: boolean
  currentSlug: string
  onClose: () => void
}

export default function CountrySwitchModal({
  open,
  currentSlug,
  onClose,
}: CountrySwitchModalProps) {
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Country[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetchCountries()
      .then((data) => {
        if (!cancelled) setCountries(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const options = useMemo(
    () =>
      countries.map((c) => ({
        value: c.slug,
        label: c.name,
      })),
    [countries],
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const onSelect = (slug: string) => {
    navigate(`/country/${slug}`)
    onClose()
  }

  return (
    <div className="country-list modal modal-open">
      <div className="modal-mask" onClick={onClose} />
      <div className="modal-content">
        <button className="modal-btn-close" onClick={onClose}>
          <i className="material-icons">close</i>
        </button>
        <div>
          <CountrySelect2
            id="country-switch"
            placeholder="Search a country to view its profile..."
            options={options}
            value={currentSlug}
            error={error}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  )
}