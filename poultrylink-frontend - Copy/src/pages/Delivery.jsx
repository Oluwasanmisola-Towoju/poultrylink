import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/auth'
import { useOrders } from '../context/orders'
import { formatQuantity } from '../utils/format'
import { STATUS } from '../utils/orders'

const TRACKED = [STATUS.IN_ESCROW, STATUS.IN_DELIVERY, STATUS.COMPLETED]

export default function Delivery() {
  const { user } = useAuth()
  const { orders } = useOrders()

  const mine = orders
    .filter((o) => o.buyer === user.name && TRACKED.includes(o.status))
    .sort((a, b) => (a.status === STATUS.IN_DELIVERY ? -1 : 1))

  return (
    <>
      <h1>Delivery</h1>
      {mine.length === 0 ? (
        <p className="empty">
          Nothing to deliver yet. Orders appear here once they're paid for and moving toward you.
        </p>
      ) : (
        <ul className="orders">
          {mine.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="order-row">
                <div>
                  <strong>{o.product}</strong>
                  <span className="small muted">{formatQuantity(o.quantity, o.unit)}</span>
                  <span className="small muted">Deliver to: {o.deliveryLocation}</span>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}