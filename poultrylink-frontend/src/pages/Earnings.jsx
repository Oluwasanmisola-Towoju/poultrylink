import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/auth'
import { useOrders } from '../context/orders'
import { formatPrice } from '../utils/format'
import { STATUS, orderTotals } from '../utils/orders'

export default function Earnings() {
  const { user } = useAuth()
  const { orders } = useOrders()

  const mine = orders.filter((o) => o.seller === user.name)
  const completed = mine.filter((o) => o.status === STATUS.COMPLETED)
  const pending = mine.filter((o) => o.status === STATUS.IN_ESCROW || o.status === STATUS.IN_DELIVERY)

  const sum = (list, key) => list.reduce((total, o) => total + orderTotals(o)[key], 0)
  const totalEarned = sum(completed, 'payout')
  const totalPending = sum(pending, 'payout')
  const totalCommission = sum(completed, 'commission')

  return (
    <>
      <h1>Earnings</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="muted small">Total earned</span>
          <strong>{formatPrice(totalEarned)}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Pending in escrow</span>
          <strong>{formatPrice(totalPending)}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Commission paid</span>
          <strong>{formatPrice(totalCommission)}</strong>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Completed orders</h2>
      {completed.length === 0 ? (
        <p className="empty">No completed orders yet.</p>
      ) : (
        <ul className="orders">
          {completed.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="order-row">
                <div>
                  <strong>{o.product}</strong>
                  <span className="small muted">For {o.buyer}</span>
                </div>
                <div className="order-side">
                  <span>{formatPrice(orderTotals(o).payout)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}