import { useEffect, useMemo, useRef, useState } from 'react'

interface CountrySelect2Props {
  id?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  value: string
  disabled?: boolean
  error?: string | null
  onSelect: (value: string) => void
}

function norm(s: string): string {
  return s.toLocaleLowerCase().trim()
}

export default function CountrySelect2({
  id = 'country-dropdown',
  placeholder = 'Select Country',
  options,
  value,
  disabled = false,
  error = null,
  onSelect,
}: CountrySelect2Props) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLSpanElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const q = norm(query)
    if (!q) return options
    return options.filter((o) => norm(o.label).includes(q))
  }, [options, query])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const choose = (o: { value: string; label: string }) => {
    onSelect(o.value)
    setOpen(false)
    setQuery('')
  }

  const onSelectionKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setHighlighted(0)
        return
      }
      setHighlighted((h) => {
        const delta = e.key === 'ArrowDown' ? 1 : -1
        return Math.min(Math.max(h + delta, 0), filteredOptions.length - 1)
      })
      return
    }
    if (e.key === 'Enter' && open && highlighted >= 0 && filteredOptions[highlighted]) {
      choose(filteredOptions[highlighted])
    }
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0 && filteredOptions[highlighted]) {
        choose(filteredOptions[highlighted])
      }
    }
  }

  const isSelectable = !disabled && options.length > 0

  return (
    <span
      ref={rootRef}
      className={`countries-select2 select2 select2-container select2-container--default${
        open ? ' select2-container--open' : ''
      }`}
      dir="ltr"
    >
      <span className="selection">
        <span
          className="select2-selection select2-selection--single"
          role="combobox"
          aria-expanded={open}
          aria-controls={`select2-${id}-results`}
          tabIndex={disabled ? -1 : 0}
          onClick={() => isSelectable && setOpen((o) => !o)}
          onKeyDown={onSelectionKeyDown}
        >
          <span
            className={`select2-selection__rendered${selectedLabel ? '' : ' select2-selection__placeholder'}`}
            id={`select2-${id}-container`}
            title={selectedLabel}
          >
            {selectedLabel || placeholder}
          </span>
          <span className="select2-selection__arrow" role="presentation">
            <b role="presentation" />
          </span>
        </span>
      </span>
      {open && (
        <span className="select2-dropdown select2-dropdown--below" dir="ltr">
          <span className="select2-search select2-search--dropdown">
            <input
              ref={searchRef}
              className="select2-search__field"
              type="search"
              role="searchbox"
              aria-label="Search countries"
              autoComplete="off"
              value={query}
              placeholder="Search country..."
              onChange={(e) => {
                setQuery(e.target.value)
                setHighlighted(-1)
              }}
              onKeyDown={onSearchKeyDown}
            />
          </span>
          <span className="select2-results">
            <ul
              className="select2-results__options"
              id={`select2-${id}-results`}
              role="listbox"
            >
              {error && (
                <li className="select2-results__option select2-results__option--disabled" role="option">
                  {`Failed to load countries: ${error}`}
                </li>
              )}
              {!error && filteredOptions.length === 0 && (
                <li className="select2-results__option select2-results__option--disabled" role="option">
                  No countries found
                </li>
              )}
              {filteredOptions.map((o, i) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  className={`select2-results__option select2-results__option--selectable${
                    o.value === value ? ' select2-results__option--selected' : ''
                  }${i === highlighted ? ' select2-results__option--highlighted' : ''}`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => choose(o)}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </span>
        </span>
      )}
    </span>
  )
}