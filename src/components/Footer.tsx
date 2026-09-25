import { Link } from 'react-router-dom'
import logo from '../assets/ugridit-logo.svg'
import linkedinIcon from '../assets/social/linkedin.svg'
import instagramIcon from '../assets/social/instagram.svg'
import facebookIcon from '../assets/social/facebook.svg'
import xIcon from '../assets/social/x.svg'
import youtubeIcon from '../assets/social/youtube.svg'

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/g20-global-land-initiative/about/?viewAsMember=true',
    icon: linkedinIcon,
  },
  { name: 'Instagram', href: 'https://www.instagram.com/g20landinitiative/', icon: instagramIcon },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/people/G20-Global-Land-Initiative/100086908881983/',
    icon: facebookIcon,
  },
  { name: 'Twitter', href: 'https://x.com/G20GLI_AR', icon: xIcon },
  { name: 'YouTube', href: 'https://www.youtube.com/@g20landinitiative', icon: youtubeIcon },
]

export default function Footer() {
  return (
    <footer className="gd-footer py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-around items-center website-footer">
          <div className="md:py-4 w-full lg:w-5/12 md:w-6/12 sm:w-full mb-3">
            <div className="flex flex-col self-center items-center">
              <div className="mt-5">
                <Link to="/">
                  <img
                    className="l-size"
                    src={logo}
                    alt="Geospatial Data Platform for Land"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-5/12 md:w-6/12 sm:w-full mb-0 text-right">
            <div className="flex flex-col self-center items-center mt-5">
              <div className="social-icons">
                <p>
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="social-icon"
                    >
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="gli-icon"
                      />
                    </a>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}