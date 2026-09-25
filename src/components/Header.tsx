import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/ugridit-logo.svg'

type MenuItem = {
  label: string
  to: string
}

const menuItems: MenuItem[] = [
  { label: 'Geospatial Data', to: '/geospatial-data?list=explore' },
  { label: 'Country Profile', to: '/countries-profile' },
  { label: 'Team', to: '/team' },
  { label: 'Contact us', to: '/form/contact' },
]

function MenuLinks({
  onNavigate,
  ariaLabel,
}: {
  onNavigate?: () => void
  ariaLabel: string
}) {
  return (
    <nav className="main-menu" role="navigation" aria-label={ariaLabel}>
      <ul className="menu">
        {menuItems.map((item) => (
          <li key={item.to} className="menu-item">
            <NavLink
              to={item.to}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isCountryDetail = location.pathname.startsWith('/country/')

  return (
    <header className={`gd-header${isCountryDetail ? ' gd-header--country-detail' : ''}`} role="banner">
      <div className="container h-header">
        <div className="relative flex h-header items-center">
          <div className="region region-header">
            <div className="site-logo">
              <Link to="/" rel="home" title="Geospatial Data Platform for Land">
                <img
                  src={logo}
                  alt="Geospatial Data Platform for Land"
                  width={400}
                  height={64}
                />
              </Link>
            </div>
          </div>

          <div className="desktop-menu">
            <div className="primary-menu">
              <MenuLinks ariaLabel="Main navigation - level 1" />
            </div>
          </div>

          <button
            type="button"
            className="btn-open-menu-mobile"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className={`menu-mobile${menuOpen ? ' open' : ''}`}>
            <div className="primary-menu">
              <MenuLinks
                ariaLabel="Main navigation - level 1"
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
            <button
              type="button"
              className="btn-close-menu-mobile"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}