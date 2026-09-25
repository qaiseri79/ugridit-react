import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPortfolios, imageUrl, type Portfolio } from '../lib/strapi'

function trimToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return `${words.slice(0, maxWords).join(' ')}…`
}

export default function Team() {
  const [members, setMembers] = useState<Portfolio[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolios()
      .then((data) => {
        setMembers(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="team-page">
        <div className="container mt-4">
          <p className="py-16 text-center text-gray-500">Loading team…</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="team-page">
        <div className="container mt-4">
          <p className="py-16 text-center text-red-600">
            Failed to load team: {error}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="team-page">
      <div className="container mt-4">
        <div className="view-header">
          <p>
            The team behind the Geospatial Platform for Land Restoration is
            dedicated to advancing global efforts to combat land degradation.
            They work tirelessly to provide a robust data explorer system that
            tracks countries&rsquo; commitments to land restoration, offering
            access to maps and trends for critical indicators. Their mission
            goes beyond simply building a platform&mdash;it is about ensuring
            decision-makers have access to reliable and relevant data to
            identify areas in urgent need of conservation or restoration. By
            combining technical expertise with a commitment to sustainable land
            management, the team plays a vital role in supporting the Global
            Initiative for Reducing Land Degradation.
          </p>
          <br />
          <br />
        </div>
        <div className="portfolio-grid">
          {members.map((member) => {
            const photo = imageUrl(member.photo)
            return (
              <Link
                key={member.documentId}
                to={`/team/${member.slug}`}
                className="portfolio-item"
              >
                <div className="portfolio-photo">
                  {photo ? (
                    <img src={photo} alt={member.photo?.alternativeText ?? ''} />
                  ) : null}
                  <div className="summary-over-lay">
                    <p>{trimToWords(member.summary, 30)}</p>
                  </div>
                </div>
                <div className="portfolio-title">{member.name}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}