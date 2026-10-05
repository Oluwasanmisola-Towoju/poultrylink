import { NavLink, Outlet } from 'react-router-dom'

const SECTIONS = [
  ['/admin', 'Dashboard', true],
  ['/admin/users', 'Users'],
  ['/admin/verification', 'Verification'],
  ['/admin/listings', 'Listings'],
  ['/admin/orders', 'Orders'],
  ['/admin/payments', 'Payments'],
  ['/admin/escrow', 'Escrow'],
  ['/admin/disputes', 'Disputes'],
  ['/admin/reviews', 'Reviews'],
  ['/admin/market-prices', 'Market prices'],
  ['/admin/reports', 'Reports'],
  ['/admin/settings', 'Settings'],
]

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        {SECTIONS.map(([to, label, end]) => (
          <NavLink key={to} to={to} end={!!end}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}