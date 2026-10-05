import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { ROLES, useAuth } from '../context/auth'
import { useOrders } from '../context/orders'
import { formatPrice } from '../utils/format'
import { STATUS, orderTotals } from '../utils/orders'

const PAID_STATUSES = [STATUS.IN_ESCROW, STATUS.IN_DELIVERY, STATUS.COMPLETED, STATUS.DISPUTED]

export default function Payments() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const isBuyer = user.role === ROLES.BUYER

  const mine = orders.filter((o) => (isBuyer ? o.buyer === user.name : o.seller === user.name))
  const transactions = mine.filter((o) => PAID_STATUSES.includes(o.status))

  const paidTotal = transactions.reduce((sum, o) => sum + orderTotals(o).total, 0)
  const releasedTotal = transactions
    .filter((o) => o.status === STATUS.COMPLETED)
    .reduce((sum, o) => sum + orderTotals(o).payout, 0)
  const inEscrowTotal = transactions
    .filter((o) => o.status === STATUS.IN_ESCROW || o.status === STATUS.IN_DELIVERY)
    .reduce((sum, o) => sum + orderTotals(o).total, 0)

  return (
    <>
      <h1>Payments</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="muted small">{isBuyer ? 'Total paid' : 'Total order value'}</span>
          <strong>{formatPrice(paidTotal)}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Currently in escrow</span>
          <strong>{formatPrice(inEscrowTotal)}</strong>
        </div>
        {!isBuyer && (
          <div className="stat-card">
            <span className="muted small">Released to you</span>
            <strong>{formatPrice(releasedTotal)}</strong>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Transaction history</h2>
      {transactions.length === 0 ? (
        <p className="empty">No payments yet. They appear here once an order reaches escrow.</p>
      ) : (
        <ul className="orders">
          {transactions.map((o) => {
            const { total, payout } = orderTotals(o)
            return (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="order-row">
                  <div>
                    <strong>{o.product}</strong>
                    <span className="small muted">{isBuyer ? `Paid to ${o.seller}` : `From ${o.buyer}`}</span>
                  </div>
                  <div className="order-side">
                    <span>{formatPrice(isBuyer ? total : payout)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="muted small" style={{ marginTop: '1.5rem' }}>
        Demo data only. Real payments will be processed by a payment provider once the backend is connected.
      </p>
    </>
  )
}