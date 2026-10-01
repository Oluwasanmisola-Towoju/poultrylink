import { Link } from 'react-router-dom'
import { useAuth } from '../../context/auth'
import { useListings } from '../../context/listings'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { STATUS, orderTotals } from '../../utils/orders'

export default function AdminDashboard() {
  const { users } = useAuth()
  const { listings } = useListings()
  const { orders } = useOrders()

  const pendingVerification = users.filter((u) => u.verification !== 'verified').length
  const activeOrders = orders.filter(
    (o) => ![STATUS.COMPLETED, STATUS.REJECTED, STATUS.CANCELLED].includes(o.status),
  ).length
  const inEscrow = orders
    .filter((o) => o.status === STATUS.IN_ESCROW || o.status === STATUS.IN_DELIVERY)
    .reduce((sum, o) => sum + orderTotals(o).total, 0)
  const disputes = orders.filter((o) => o.status === STATUS.DISPUTED).length

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="muted small">Total users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Pending verification</span>
          <strong>{pendingVerification}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Active listings</span>
          <strong>{listings.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Active orders</span>
          <strong>{activeOrders}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Held in escrow</span>
          <strong>{formatPrice(inEscrow)}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Open disputes</span>
          <strong>{disputes}</strong>
        </div>
      </div>

      {pendingVerification > 0 && (
        <p style={{ marginTop: '1rem' }}>
          <Link to="/admin/verification">{pendingVerification} account(s) waiting on verification →</Link>
        </p>
      )}
    </>
  )
}