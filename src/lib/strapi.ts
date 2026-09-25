export const STRAPI_URL =
  import.meta.env.VITE_STRAPI_URL ?? 'http://localhost:1337'

export type StrapiImage = {
  id: number
  url: string
  name: string
  alternativeText: string | null
  formats: Record<string, { url: string; width: number; height: number }> | null
}

export type StrapiBlock = {
  type: string
  text?: string
  level?: number
  format?: string
  url?: string
  children?: StrapiBlock[]
}

export type Portfolio = {
  id: number
  documentId: string
  name: string
  slug: string
  designation: string
  email: string
  summary: string
  body: StrapiBlock[]
  photo: StrapiImage | null
}

export function imageUrl(image: StrapiImage | null | undefined): string | null {
  if (!image?.url) return null
  return image.url.startsWith('http') ? image.url : `${STRAPI_URL}${image.url}`
}

export function countryWidget(
  data: Record<string, unknown> | null,
  slot: string,
): CountryWidget | null {
  const widgets = (data?.['widgets'] ?? {}) as Record<string, CountryWidget | null>
  return widgets[slot] ?? null
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`)
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export async function fetchPortfolios(): Promise<Portfolio[]> {
  const data = await getJson<{ data: Portfolio[] }>(
    '/api/portfolios?populate=*&sort=name',
  )
  return data.data
}

export async function fetchPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  const data = await getJson<{ data: Portfolio[] }>(
    `/api/portfolios?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`,
  )
  return data.data[0] ?? null
}

export type ContactSubmission = {
  organisation: string
  email: string
  message: string
}

export async function submitContactSubmission(
  submission: ContactSubmission,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/contact-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: submission }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`,
    )
  }
}

export type CountryRegion = 'Africa' | 'Asia' | 'Europe' | 'Americas' | 'Oceania'

export type CountryWidget =
  | { type: 'iframe'; name: string; url: string }
  | { type: 'code'; name: string; code: string }

export type CountryData = {
  iso3?: string
  widgets?: Record<string, CountryWidget | null>
}

export type Country = {
  id: number
  documentId: string
  name: string
  slug: string
  iso3: string | null
  region: CountryRegion
  overview: StrapiBlock[] | null
  summary: string | null
  flag: StrapiImage | null
  profilePdf: StrapiImage | null
  data: Record<string, unknown> | null
  mapCountryOverview: StrapiImage | null
  cpOverview: string | null
  currentStateLandStatus: StrapiImage | null
  currentStateSocioEconomics: StrapiImage | null
  threatsFires: StrapiImage | null
  threatsClimateHazards: StrapiImage | null
  threatsSocioEconomics: StrapiImage | null
  impactsFoodHealth: StrapiImage | null
  impactsLandStatus: StrapiImage | null
  impactsClimateRelated: StrapiImage | null
  trendsClimateRelated: StrapiImage | null
  trendsLandStatus: StrapiImage | null
  trendsSocioEconomics: StrapiImage | null
  solutionsLandManagement: StrapiImage | null
  solutionsSocioEconomics: StrapiImage | null
  solutionsCommitments: StrapiImage | null
  slmPractices: string | null
  treaties: StrapiImage | null
  currentStateChart: StrapiImage | null
  currentStateChart2: StrapiImage | null
  threatsChart1: StrapiImage | null
  threatsChart2: StrapiImage | null
  trendsChart1: StrapiImage | null
  trendsChart2: StrapiImage | null
  trendsChart3: StrapiImage | null
  impactsChart1: StrapiImage | null
  impactsChart2: StrapiImage | null
  solutionsChart1: StrapiImage | null
  solutionsChart2: StrapiImage | null
  commitmentsLdn: string | null
  commitmentsNbsap: string | null
  commitmentsNdc: string | null
  commitmentsBonnChallenge: string | null
}

const PAGE_SIZE = 100

export async function fetchCountries(): Promise<Country[]> {
  const first = await getJson<{
    data: Country[]
    meta: { pagination: { page: number; pageCount: number; total: number } }
  }>(`/api/countries?populate=*&sort=name&pagination[page]=1&pagination[pageSize]=${PAGE_SIZE}`)
  const pages = first.meta.pagination.pageCount
  if (pages <= 1) return first.data

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      getJson<{ data: Country[] }>(
        `/api/countries?populate=*&sort=name&pagination[page]=${i + 2}&pagination[pageSize]=${PAGE_SIZE}`,
      ),
    ),
  )
  return [...first.data, ...rest.flatMap((p) => p.data)]
}

export async function fetchCountryBySlug(slug: string): Promise<Country | null> {
  const data = await getJson<{ data: Country[] }>(
    `/api/countries?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`,
  )
  return data.data[0] ?? null
}