import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CountrySwitchModal from '../components/CountrySwitchModal'
import { fetchCountryBySlug, imageUrl, countryWidget, type Country, type CountryWidget, type StrapiImage } from '../lib/strapi'
import chartFallback from '../assets/chart.png'
import logoPrint from '../assets/ugridit-logo.svg'

type NavSub = { id: string; label: string }
type NavItem = { id: string; label: string; icon: string; anchor?: string; subs?: NavSub[] }

const NAV: NavItem[] = [
  { id: 'summary', label: 'Summary', icon: 'summary', anchor: 'summary' },
  {
    id: 'current-state',
    label: 'Current State',
    icon: 'current-state',
    subs: [
      { id: 'current-state-land-status', label: 'Land Status' },
      { id: 'current-state-socio-economics', label: 'Socio-economics' },
    ],
  },
  {
    id: 'threats',
    label: 'Stressors',
    icon: 'threats',
    subs: [
      { id: 'threats-fires', label: 'Near Real-time Fires' },
      { id: 'threats-climate-hazards', label: 'Climate hazards' },
      { id: 'threats-socio-economics', label: 'Socio-economics' },
    ],
  },
  {
    id: 'trends',
    label: 'Trends',
    icon: 'trends',
    subs: [
      { id: 'trends-climate-related', label: 'Climate related' },
      { id: 'trends-land-status', label: 'Land status' },
      { id: 'trends-socio-economics', label: 'Socio-economics' },
    ],
  },
  {
    id: 'impacts',
    label: 'Impacts',
    icon: 'impacts',
    subs: [
      { id: 'impacts-food-and-health', label: 'Food and health' },
      { id: 'impacts-land-status', label: 'Land status' },
      { id: 'impacts-climate-related', label: 'Climate related' },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    icon: 'solutions',
    subs: [
      { id: 'solutions-land-management', label: 'Land management' },
      { id: 'solutions-socio-economics', label: 'Socio-economics' },
      { id: 'solutions-commitments', label: 'Commitments' },
      { id: 'solutions-slm-practices', label: 'Restore' },
    ],
  },
]

const SECTION_IDS = NAV.flatMap((item) =>
  item.anchor ? [item.anchor] : item.subs ? item.subs.map((s) => s.id) : [item.id],
)

const SECTION_SLOTS: { id: string; slot: keyof Country }[] = [
  { id: 'current-state-land-status', slot: 'currentStateLandStatus' },
  { id: 'current-state-socio-economics', slot: 'currentStateSocioEconomics' },
  { id: 'threats-fires', slot: 'threatsFires' },
  { id: 'threats-climate-hazards', slot: 'threatsClimateHazards' },
  { id: 'threats-socio-economics', slot: 'threatsSocioEconomics' },
  { id: 'impacts-food-and-health', slot: 'impactsFoodHealth' },
  { id: 'impacts-land-status', slot: 'impactsLandStatus' },
  { id: 'impacts-climate-related', slot: 'impactsClimateRelated' },
  { id: 'trends-climate-related', slot: 'trendsClimateRelated' },
  { id: 'trends-land-status', slot: 'trendsLandStatus' },
  { id: 'trends-socio-economics', slot: 'trendsSocioEconomics' },
  { id: 'solutions-land-management', slot: 'solutionsLandManagement' },
  { id: 'solutions-socio-economics', slot: 'solutionsSocioEconomics' },
  { id: 'solutions-commitments', slot: 'solutionsCommitments' },
  { id: 'solutions-slm-practices', slot: 'slmPractices' },
]

function hashSectionId(): string {
  const h = window.location.hash.replace(/^#/, '')
  return SECTION_IDS.includes(h) ? h : 'summary'
}

function parentOf(sectionId: string): string | null {
  return NAV.find((item) => item.subs?.some((s) => s.id === sectionId))?.id ?? null
}

function sanitizeHtml(html?: string | null): string {
  if (!html) return ''
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}

function MediaImage({ image, className, alt }: { image: StrapiImage | null | undefined; className?: string; alt: string }) {
  const src = imageUrl(image)
  if (!src) return null
  return <img src={src} alt={image?.alternativeText ?? alt} className={className} />
}

function WidgetIframe({ widget }: { widget: Extract<CountryWidget, { type: 'iframe' }> }) {
  return (
    <iframe
      src={widget.url}
      title={widget.name}
      loading="lazy"
      style={{ width: '100%', minHeight: 520, border: 0, display: 'block' }}
    />
  )
}

const TREATY_PARTY_STATUSES = new Set(['Ratification', 'Acceptance', 'Accession', 'Approval'])
const TREATY_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTreatyDate(raw: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw)
  if (!m) return raw
  const month = Number(m[2])
  if (month < 1 || month > 12) return raw
  return `${Number(m[3])} ${TREATY_MONTHS[month - 1]} ${m[1]}`
}

function decorateTreatiesTable(host: HTMLElement): void {
  const table = host.querySelector<HTMLTableElement>('#cik-party-status table')
  if (!table) return
  table.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach((row) => {
    const cells = row.querySelectorAll('td')
    const signature = cells[1]
    if (signature) signature.textContent = formatTreatyDate(signature.textContent ?? '')
    const ratification = cells[2]
    if (ratification) ratification.textContent = formatTreatyDate(ratification.textContent ?? '')
    const statusCell = cells[3]
    if (!statusCell || statusCell.querySelector('.treaty-status')) return
    const status = (statusCell.textContent ?? '').trim()
    const kind = TREATY_PARTY_STATUSES.has(status)
      ? 'party'
      : status === 'Signatory'
        ? 'signatory'
        : 'none'
    const badge = document.createElement('span')
    badge.className = `treaty-status treaty-status--${kind}`
    badge.textContent = status || '—'
    statusCell.textContent = ''
    statusCell.appendChild(badge)
  })
}

function DatavizCode({ code, iso3 }: { code: string; iso3: string | null }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const win = window as unknown as { $?: unknown; Highcharts?: unknown }
    if (!win.$ || !win.Highcharts) return

    host.innerHTML = ''
    const body = code
      .replace(/''/g, "'")
      .replace(/https:\/\/dash\.unccd\.unepgrid\.ch\/api/g, '/api/dataviz')
      .replace(/https:\/\/www\.geogli\.com\/sites\/default\/files\/json_data/g, '/api/geogli/json_data')
      .replace(/\[grid-dataviz:iso3cc\]/g, iso3 ? iso3.toUpperCase() : 'XXX')

    try {
      const fn = new Function(body)
      Promise.resolve(fn.call(host))
        .then(() => decorateTreatiesTable(host))
        .catch((err: unknown) => {
          console.error('dataviz custom-code failed:', err)
        })
    } catch (err) {
      console.error('dataviz custom-code failed:', err)
    }

    return () => {
      const hc = window as unknown as {
        Highcharts?: { charts?: { container?: HTMLElement | null; destroy?: () => void }[] }
      }
      const charts = hc.Highcharts?.charts
      if (charts) {
        for (const chart of charts) {
          if (chart && chart.container && host.contains(chart.container)) chart.destroy?.()
        }
      }
      host.innerHTML = ''
    }
  }, [code, iso3])

  return (
    <div
      ref={hostRef}
      className="dataviz-code-host"
      style={{ width: '100%', minHeight: 320, position: 'relative' }}
    />
  )
}

function SectionContent({
  country,
  slot,
  image,
  text,
}: {
  country: Country
  slot: string
  image?: StrapiImage | null
  text?: string | null
}) {
  const widget = countryWidget(country.data, slot)
  if (widget?.type === 'iframe') return <WidgetIframe widget={widget} />
  if (text) return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
  return <MediaImage image={image} alt="" />
}

export default function CountryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string>(() => hashSectionId())
  const [expandedId, setExpandedId] = useState<string | null>(() => parentOf(hashSectionId()))
  const [modalOpen, setModalOpen] = useState(false)
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const loading = country === null || loadedSlug !== slug

  useEffect(() => {
    if (!slug) return
    fetchCountryBySlug(slug)
      .then((data) => {
        setCountry(data)
        setLoadedSlug(slug)
        setError(data ? null : 'Country not found')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [slug])

  const navigateTo = (id: string) => {
    setActiveId(id)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo({ top: 0 })
  }

  if (loading) {
    return (
      <section>
        <div className="container mt-4">
          <p className="py-16 text-center text-gray-500">Loading…</p>
        </div>
      </section>
    )
  }

  if (error || !country) {
    return (
      <section>
        <div className="container mt-4">
          <p className="py-16 text-center text-red-600">
            {error ?? 'Country not found'}
          </p>
          <p className="pb-16 text-center">
            <Link to="/countries-profile" className="text-ugrid-green underline">
              ← Back to countries
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const pdfUrl = imageUrl(country.profilePdf)

  const overviewMapWidget = countryWidget(country.data, 'mapCountryOverview')
  const treatiesWidget = countryWidget(country.data, 'treaties')

  const currentParent = NAV.find(
    (item) =>
      (item.anchor && activeId === item.anchor) ||
      (item.subs && item.subs.some((s) => s.id === activeId)),
  )

  const renderNav = () => (
    <div className="country-profile-content-main-desktop">
      <div className="website-layout">
        <div id="left-panel" className="sidebar-menu">
          <div className="country-sidebar-head">
            <strong>{country.name}</strong>
            <span>Profile sections</span>
          </div>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ marginTop: 10, marginLeft: 5 }}>
              <div className="print-country-profile desktop">Download Country Profile</div>
            </a>
          )}
          <div className="tabs-country-profile">
            <ul className="tabs">
              {NAV.map((item) => {
                const isParentActive = currentParent?.id === item.id
                const expanded = expandedId === item.id
                return (
                  <li
                    key={item.id}
                    className={
                      item.subs
                        ? `main-tab-with-sub-tab${isParentActive ? ' active' : ''}${expanded ? ' active-tab-parent-menu' : ''}`
                        : `main-tab${isParentActive ? ' active' : ''}`
                    }
                  >
                    <a
                      href={item.anchor ? `#${item.anchor}` : undefined}
                      className={`text-gray-2 font-medium ${item.icon}`}
                      style={item.subs ? { paddingBottom: 14 } : undefined}
                      onClick={(e) => {
                        if (item.anchor) {
                          e.preventDefault()
                          navigateTo(item.anchor)
                        } else if (item.subs) {
                          e.preventDefault()
                          setExpandedId(expanded ? null : item.id)
                        }
                      }}
                    >
                      <span className="label">{item.label}</span>
                    </a>
                    {item.subs && (
                      <ul>
                        <li className="sub-tab-label flex flex-row">
                          <span className="sub-label">{item.label}</span>
                          <span className="close-sub-tab" onClick={() => setExpandedId(null)}>
                            X
                          </span>
                        </li>
                        {item.subs.map((sub) => (
                          <li
                            key={sub.id}
                            className={`sub-tab${activeId === sub.id ? ' active' : ''}`}
                          >
                            <a
                              href={`#${sub.id}`}
                              className={`sub-tab font-medium ${item.icon}`}
                              onClick={(e) => {
                                e.preventDefault()
                                navigateTo(sub.id)
                                setExpandedId(item.id)
                              }}
                            >
                              {sub.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div id="main-panel" className="relative website-content-area">
          <div className="country-profile-content country-profile-panel-card">
            <div className="country-profile-panel-head">
              <div>
                <h1>{activeId === 'summary' ? 'Overview' : currentParent?.label ?? 'Country profile'}</h1>
                <p>Country profile for {country.name}</p>
              </div>
              <span className="country-detail-region">{country.region}</span>
            </div>
            {activeId === 'summary' && (
            <div id="summary" className="tab-content">
              <div className="select-country">
                <div onClick={() => setModalOpen(true)}>Select a country</div>
              </div>
              <div className="country-summary-map">
                <div id="map_overview">
                  {overviewMapWidget?.type === 'code' ? (
                    <DatavizCode key="mapCountryOverview" code={overviewMapWidget.code} iso3={country.iso3} />
                  ) : overviewMapWidget?.type === 'iframe' ? (
                    <WidgetIframe widget={overviewMapWidget} />
                  ) : (
                    <MediaImage image={country.mapCountryOverview} alt={`${country.name} overview map`} />
                  )}
                </div>
              </div>
              <div className="section">
                <div id="overview_section_title" className="title_section">
                  Overview
                </div>
                <div className="content_section">
                  {country.cpOverview && (
                    <>
                      <div className={overviewExpanded ? 'read-less-content expanded' : 'read-more-content'}>
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(country.cpOverview) }} />
                      </div>
                      <a
                        href="#overview"
                        className="read-more"
                        onClick={(e) => {
                          e.preventDefault()
                          setOverviewExpanded(!overviewExpanded)
                        }}
                      >
                        {overviewExpanded ? 'Read Less' : 'Read More'}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            )}
            {SECTION_SLOTS.map(({ id, slot }) =>
              activeId === id ? (
                <div id={id} className="tab-content" key={id}>
                  <div className="select-country bg-white-2">
                    <div onClick={() => setModalOpen(true)}>Select a country</div>
                  </div>
                  <div className="section bg-white-2">
                    <div className="content_section">
                      {slot === 'slmPractices' ? (
                        <SectionContent country={country} slot={slot} text={country.slmPractices} image={country.slmPractices as unknown as StrapiImage} />
                      ) : (
                        <SectionContent country={country} slot={slot} image={country[slot] as unknown as StrapiImage} />
                      )}
                    </div>
                  </div>
                </div>
              ) : null,
            )}
            {activeId === 'summary' && renderSecondary()}
          </div>
        </div>
      </div>
    </div>
  )

  const ChartSlot = ({
    widget,
    image,
    name,
  }: {
    widget: CountryWidget | null
    image: StrapiImage | null | undefined
    name: string
  }) => {
    if (widget?.type === 'iframe') return <WidgetIframe widget={widget} />
    if (widget?.type === 'code')
      return <DatavizCode key={widget.name} code={widget.code} iso3={country.iso3} />
    return imageUrl(image) ? (
      <img src={imageUrl(image)!} alt={name} className="dataviz-chart-image" />
    ) : (
      <img src={chartFallback} alt="chart example" />
    )
  }

  const renderSecondary = () => (
    <div className="country-profile-content-secondary">
      <div className="charts-area">
        <div className="w-full">
          <div className="relative section bg-white">
            <div id="chart_section_title" className="title_section">
              Summary Chart
            </div>
            <div id="current_state_chart">
              <div className="flex flex-col">
                <h3>Current State</h3>
                <div className="summary-charts">
                  <div className="chart-1">
                    <ChartSlot name="Current State" widget={countryWidget(country.data, 'currentStateChart')} image={country.currentStateChart} />
                  </div>
                  <div className="chart-2">
                    <ChartSlot name="Current State" widget={countryWidget(country.data, 'currentStateChart2')} image={country.currentStateChart2} />
                  </div>
                </div>
              </div>
            </div>
            <div id="threats_chart">
              <div className="flex flex-col">
                <h3>Stressors</h3>
                <div className="summary-charts">
                  <div className="chart-1">
                    <ChartSlot name="Stressors" widget={countryWidget(country.data, 'threatsChart1')} image={country.threatsChart1} />
                  </div>
                  <div className="chart-2">
                    <ChartSlot name="Stressors" widget={countryWidget(country.data, 'threatsChart2')} image={country.threatsChart2} />
                  </div>
                </div>
              </div>
            </div>
            <div id="trends_chart">
              <div className="flex flex-col">
                <h3>Trends</h3>
                <div className="summary-charts">
                  <div className="chart-1">
                    <div>
                      <ChartSlot name="Trends" widget={countryWidget(country.data, 'trendsChart1')} image={country.trendsChart1} />
                    </div>
                    <div>
                      <ChartSlot name="Trends" widget={countryWidget(country.data, 'trendsChart2')} image={country.trendsChart2} />
                    </div>
                  </div>
                  <div className="chart-2">
                    <div>
                      <ChartSlot name="Trends" widget={countryWidget(country.data, 'trendsChart3')} image={country.trendsChart3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="impacts_chart">
              <div className="flex flex-col">
                <h3>Impacts</h3>
                <div className="summary-charts">
                  <div className="chart-1">
                    <ChartSlot name="Impacts" widget={countryWidget(country.data, 'impactsChart1')} image={country.impactsChart1} />
                  </div>
                  <div className="chart-2">
                    <ChartSlot name="Impacts" widget={countryWidget(country.data, 'impactsChart2')} image={country.impactsChart2} />
                  </div>
                </div>
              </div>
            </div>
            <div id="solutions_chart">
              <div className="flex flex-col">
                <h3>Solutions</h3>
                <div className="summary-charts">
                  <div className="chart-1">
                    <ChartSlot name="Solutions" widget={countryWidget(country.data, 'solutionsChart1')} image={country.solutionsChart1} />
                  </div>
                  <div className="chart-2">
                    <ChartSlot name="Solutions" widget={countryWidget(country.data, 'solutionsChart2')} image={country.solutionsChart2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative section bg-white">
            <div id="commitment_section_title" className="title_section">
              Commitments
            </div>
            <div id="all-commitment">
              <div className="commitment">
                <div className="commitment-details">
                  {country.commitmentsLdn ? (
                    <div className="number">
                      {country.commitmentsLdn}
                      <span>hectares</span>
                    </div>
                  ) : (
                    <div className="number">No data available</div>
                  )}
                  <div className="text-commitment">
                    <div className="title-commitment">LDN</div>
                    <div className="description-commitment">Land Degradation Neutrality</div>
                  </div>
                </div>
                <div className="commitment-details">
                  {country.commitmentsNbsap ? (
                    <div className="number">
                      {country.commitmentsNbsap}
                      <span>hectares</span>
                    </div>
                  ) : (
                    <div className="number">No data available</div>
                  )}
                  <div className="text-commitment">
                    <div className="title-commitment">NBSAP</div>
                    <div className="description-commitment">
                      National Biodiversity Strategies and Action Plans under the Convention on Biological Diversity
                    </div>
                  </div>
                </div>
              </div>
              <div className="commitment">
                <div className="commitment-details">
                  {country.commitmentsNdc ? (
                    <div className="number">
                      {country.commitmentsNdc}
                      <span>hectares</span>
                    </div>
                  ) : (
                    <div className="number">No data available</div>
                  )}
                  <div className="text-commitment">
                    <div className="title-commitment">NDC</div>
                    <div className="description-commitment">
                      Nationally Determined Contributions embody efforts by each country to reduce national
                      emissions and adapt to the impacts of climate change.
                    </div>
                  </div>
                </div>
                <div className="commitment-details">
                  {country.commitmentsBonnChallenge ? (
                    <div className="number">
                      {country.commitmentsBonnChallenge}
                      <span>hectares</span>
                    </div>
                  ) : (
                    <div className="number">No data available</div>
                  )}
                  <div className="text-commitment">
                    <div className="title-commitment">Bonn Challenge</div>
                    <div className="description-commitment">
                      Bring 150 million hectares of degraded and deforested landscapes into restoration by
                      2020 and 350 million hectares by 2030
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative section bg-white">
            {(treatiesWidget !== null || imageUrl(country.treaties)) && (
              <>
                <div id="treaties_section_title" className="title_section">
                  Treaties
                </div>
                <div id="treaties_section_content" className="content_section">
                  {treatiesWidget ? (
                    treatiesWidget.type === 'iframe' ? (
                      <WidgetIframe widget={treatiesWidget} />
                    ) : (
                      <DatavizCode
                        key="treaties"
                        code={treatiesWidget.code}
                        iso3={country.iso3}
                      />
                    )
                  ) : (
                    <MediaImage image={country.treaties} alt={`${country.name} treaties`} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="page-node-type-country-profile">
      <div id="logo-print">
        <a href="/" rel="home" className="site-logo" title="Geospatial Data Platform for Land">
          <img src={logoPrint} alt="Geospatial Data Platform for Land" />
        </a>
      </div>
      <div className="country-title-print">
        <div>{country.name}</div>
      </div>
      <div className="dashboard-toggle" />
      <article>
        {renderNav()}
      </article>
      <CountrySwitchModal
        open={modalOpen}
        currentSlug={country.slug}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}