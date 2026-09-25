import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Blocks from '../components/Blocks'
import { fetchPortfolioBySlug, imageUrl, type Portfolio } from '../lib/strapi'

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [member, setMember] = useState<Portfolio | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const loading = member === null || loadedSlug !== slug

  useEffect(() => {
    if (!slug) return
    fetchPortfolioBySlug(slug)
      .then((data) => {
        setMember(data)
        setLoadedSlug(slug)
        setError(data ? null : 'Member not found')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [slug])

  if (loading) {
    return (
      <section className="portfolio-detail-page">
        <div className="container mt-4">
          <p className="py-16 text-center text-gray-500">Loading…</p>
        </div>
      </section>
    )
  }

  if (error || !member) {
    return (
      <section className="portfolio-detail-page">
        <div className="container mt-4">
          <p className="py-16 text-center text-red-600">
            {error ?? 'Member not found'}
          </p>
          <p className="pb-16 text-center">
            <Link to="/team" className="text-ugrid-green underline">
              ← Back to team
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const photo = imageUrl(member.photo)

  return (
    <section className="portfolio-detail-page">
      <div className="container mt-4">
        <div className="lg:flex lg:space-x-10">
          <div className="lg:flex-1">
            <div className="layout-twocol-33-67">
              <div className="layout-region-first">
                <div className="portfolio-detail-profile">
                  <p className="mb-4">
                    <Link to="/team" className="text-ugrid-green underline">
                      ← Back to team
                    </Link>
                  </p>
                  {photo ? (
                    <img
                      src={photo}
                      alt={member.photo?.alternativeText ?? member.name}
                    />
                  ) : null}
                  <div className="portfolio-detail-designation">
                    {member.designation}
                  </div>
                  <div className="portfolio-detail-email">
                    <svg
                      style={{ width: 18, height: 18, float: 'left' }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                    </svg>
                    &nbsp;
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </div>
                </div>
              </div>
              <div className="layout-region-second">
                <h1 className="portfolio-detail-title">{member.name}</h1>
                <div className="portfolio-detail-body">
                  <Blocks blocks={member.body} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}