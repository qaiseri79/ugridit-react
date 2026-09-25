import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CountrySelect2 from '../components/CountrySelect2'
import {
  fetchCountries,
  type Country,
  type CountryRegion,
} from '../lib/strapi'

const REGIONS: Array<'All' | CountryRegion> = [
  'All',
  'Africa',
  'Asia',
  'Europe',
  'Americas',
  'Oceania',
]

export default function CountriesProfile() {
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Country[]>([])
  const [region, setRegion] = useState<'All' | CountryRegion>('All')
  const [selected, setSelected] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCountries()
      .then((data) => {
        setCountries(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  const visibleCountries = useMemo(
    () => (region === 'All' ? countries : countries.filter((c) => c.region === region)),
    [countries, region],
  )

  return (
    <section className="country-profile-page">
      <div className="country-profile-banner">
        <div className="container country-profile-hero">
          <div className="country-profile-banner-text">
            <h1>
              Discover and analyze a <span>country</span> through its specific
              key indicators
            </h1>
          </div>
          <div className="country-profile-intro">
            <p>
              The purpose of the country profiles is to provide detailed
              information on the land status, threats, trends, impacts,
              efforts and progress in combating desertification and improving
              land conditions. These profiles serve as a resource for better
              understanding the specific sectors in each country where
              efforts should be focused to achieve land degradation
              neutrality.
            </p>
            <p>
              The country profiles contribute to promoting sustainable land
              management practices globally. Additionally, these profiles help
              in showcasing the collaborative efforts of the 197 parties
              (countries) under the Convention to enhance living conditions
              in drylands and preserve land and soil.
            </p>
          </div>
          <div className="country-profile-glossary">
            <h2 className="country-profile-finder-title">Find Country Profile</h2>
            <ul className="bef-links" role="list">
              {REGIONS.map((r) => (
                <li
                  key={r}
                  className={region === r ? 'selected' : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setRegion(r)}
                    className={region === r ? 'bef-link bef-link--selected' : 'bef-link'}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
            <div className="countries-search">
              <div className="search-country-tabs">
                <CountrySelect2
                  id="country-dropdown"
                  options={visibleCountries.map((c) => ({ value: c.slug, label: c.name }))}
                  value={selected}
                  placeholder="Select Country"
                  disabled={loading}
                  error={error}
                  onSelect={setSelected}
                />
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => {
                    if (selected) navigate(`/country/${selected}`)
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}