import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROLES, useAuth } from '../context/auth'

const NAV = {
  [ROLES.FARMER]: [
    ['/farmer', 'My listings'],
    ['/orders', 'Orders'],
    ['/farmer/earnings', 'Earnings'],
    ['/payments', 'Payments'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.BUYER]: [
    ['/orders', 'My orders'],
    ['/delivery', 'Delivery'],
    ['/payments', 'Payments'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.SUPPLIER]: [
    ['/supplier', 'Storefront'],
    ['/orders', 'Orders'],
    ['/payments', 'Payments'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.VET]: [
    ['/vet', 'Consultations'],
    ['/orders', 'Service Requests'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.TRANSPORTER]: [
    ['/transporter', 'Logistics Hub'],
    ['/transporter/delivery', 'Active Deliveries'],
    ['/orders', 'Orders'],
    ['/marketplace', 'Marketplace'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.COOPERATIVE]: [
    ['/cooperative', 'Co-op Hub'],
    ['/orders', 'Group Orders'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.FINANCIER]: [
    ['/financier', 'Finance Hub'],
    ['/payments', 'Disbursements'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/messages', 'Messages'],
    ['/profile', 'Profile'],
  ],
  [ROLES.ADMIN]: [
    ['/admin', 'Dashboard'],
    ['/marketplace', 'Marketplace'],
    ['/prices', 'Market prices'],
    ['/profile', 'Profile'],
  ],
}

const DEFAULT_NAV = [
  ['/marketplace', 'Marketplace'],
  ['/prices', 'Market prices'],
  ['/messages', 'Messages'],
  ['/profile', 'Profile'],
]

// Paths whose link should only be "active" on an exact match,
// not for every nested route beneath it
const EXACT_PATHS = new Set([
  '/farmer', '/supplier', '/vet', '/transporter', '/cooperative', '/financier', '/admin',
])

// Short glyphs for the mobile tab bar, keyed by the link label
const ICONS = {
  'My listings': '📦', 'Orders': '🧾', 'My orders': '🧾', 'Earnings': '💰',
  'Payments': '💳', 'Marketplace': '🛒', 'Market prices': '📈', 'Messages': '💬',
  'Profile': '👤', 'Delivery': '🚚', 'Dashboard': '📊', 'Storefront': '🏬',
  'Consultations': '🩺', 'Service Requests': '📋', 'Logistics Hub': '🗺️',
  'Active Deliveries': '🚛', 'Co-op Hub': '🤝', 'Group Orders': '📦',
  'Finance Hub': '🏦', 'Disbursements': '💵',
}
const icon = (label) => ICONS[label] ?? '•'

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = NAV[user?.role] ?? DEFAULT_NAV
  const tabLinks = links.slice(0, 4)
  const moreLinks = links.slice(4)
  const isExact = (to) => EXACT_PATHS.has(to)

  const closeSheets = () => {
    setMoreOpen(false)
    setAccountOpen(false)
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">PoultryLink</span>

        <nav className="nav">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={isExact(to)}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="who">
          <span>{user?.name} ({user?.role})</span>
          <button className="btn-quiet" onClick={handleLogout}>Log out</button>
        </div>

        <button className="account-chip" onClick={() => setAccountOpen(true)} aria-label="Account menu">
          {user?.name?.charAt(0).toUpperCase()}
        </button>
      </header>

      <main className="page">
        <Outlet />
      </main>

      {/* Mobile-only bottom tab bar */}
      <nav className="tabbar">
        {tabLinks.map(([to, label]) => (
          <NavLink key={to} to={to} className="tabbar-item" end={isExact(to)}>
            <span className="tabbar-icon">{icon(label)}</span>
            <span className="tabbar-label">{label}</span>
          </NavLink>
        ))}
        {moreLinks.length > 0 && (
          <button className="tabbar-item tabbar-more" onClick={() => setMoreOpen(true)}>
            <span className="tabbar-icon">⋯</span>
            <span className="tabbar-label">More</span>
          </button>
        )}
      </nav>

      {/* Slide-up sheet: remaining links + account info, mobile only */}
      {(moreOpen || accountOpen) && (
        <div className="sheet-backdrop" onClick={closeSheets}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            {accountOpen && (
              <>
                <p className="sheet-title">{user?.name}</p>
                <p className="muted small" style={{ marginTop: '-.5rem' }}>{user?.role}</p>
              </>
            )}
            {moreOpen &&
              moreLinks.map(([to, label]) => (
                <NavLink key={to} to={to} className="sheet-link" onClick={closeSheets} end={isExact(to)}>
                  <span className="tabbar-icon">{icon(label)}</span> {label}
                </NavLink>
              ))}
            <button className="btn" style={{ marginTop: '.75rem' }} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}