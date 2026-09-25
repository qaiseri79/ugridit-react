import { useState } from 'react'
import aboutBanner from '../assets/about-banner.jpg'
import unccdContact from '../assets/unccd-contact.jpg'
import { submitContactSubmission } from '../lib/strapi'

export default function Contact() {
  const [organisation, setOrganisation] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  return (
    <section>
      <div className="contact-banner">
        <div className="contact-banner-img">
          <img src={aboutBanner} alt="Contact banner" />
          <h1 className="contact-banner-title">Contact</h1>
        </div>
      </div>

      <div className="container">
        <div className="contact-intro">
          <h3>The G20 Global Land Initiative</h3>
          <p>
            The G20 Global Land Initiative was launched during the Saudi
            Presidency of the G20 in 2020. The G20 leaders, in their
            declaration, shared a collective ambition to achieve 50% reduction
            in land degradation by 2040. The Initiative strives to achieve this
            by collective action of G20 Members as well as non G20 Members. The
            Initiative Coordination Office was established in April 2022 in UN
            Convention to Combat Desertification Secretariat in Bonn, Germany.
            The Geospatial Platform is one of the products which is one of the
            information management products from the Global land Initiative.
            More details can be seen on the G20 Global Land Initiative Website.
          </p>
          <h3>The Geospatial Platform for Land Restoration</h3>
          <p>
            The geospatial platform serves as a data explorer system to track
            countries&rsquo; commitments to land restoration, offering access to
            maps and trends of specific indicators to help identify areas where
            conservation or restoration efforts are most needed. This requires
            reliable and relevant data accessible to decision-makers concerned
            with the Global Initiative for Reducing Land Degradation.
          </p>
        </div>
      </div>

      <div className="container mt-4">
        <div className="contact-page">
          <div className="lg:flex-1">
            {submitted ? (
              <div className="contact-success" role="status">
                <h2 className="feedback-title">Thank you</h2>
                <p>
                  Your feedback has been received. We will get back to you
                  shortly.
                </p>
              </div>
            ) : (
              <form
                className="webform-submission-contact-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setError(null)
                  setSubmitting(true)
                  submitContactSubmission({ organisation, email, message })
                    .then(() => setSubmitted(true))
                    .catch((err: unknown) => {
                      setError(
                        err instanceof Error
                          ? err.message
                          : 'Failed to send your message.',
                      )
                    })
                    .finally(() => setSubmitting(false))
                }}
              >
                <div className="form-item">
                  <h2 className="feedback-title">Give us Feedback</h2>
                </div>
                <div className="form-item form-no-label">
                  <input
                    type="text"
                    name="organisation"
                    maxLength={255}
                    placeholder="Organisation"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-item form-no-label">
                  <input
                    type="email"
                    name="email"
                    maxLength={254}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-item form-no-label">
                  <div className="form-textarea-wrapper">
                    <textarea
                      name="your_message"
                      rows={5}
                      cols={60}
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error ? (
                  <p className="contact-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="form-actions">
                  <input
                    type="submit"
                    id="edit-actions-submit"
                    value={submitting ? 'Sending…' : 'Submit'}
                    disabled={submitting}
                  />
                </div>
              </form>
            )}
          </div>
          <div className="contact-banner-well">
            <div className="banner">
              <img src={unccdContact} alt="Right side block for contact page" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}