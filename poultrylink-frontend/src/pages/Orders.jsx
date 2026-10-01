import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { ROLES, useAuth } from '../context/auth'
import { useOrders } from '../context/orders'
import { formatPrice, formatQuantity } from '../utils/format'
import { orderTotals } from '../utils/orders'

export default function Orders() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const isBuyer = user.role === ROLES.BUYER
  const mine = orders.filter((o) => (isBuyer ? o.buyer === user.name : o.seller === user.name))

  return (
    <>
      <h1>{isBuyer ? 'My orders' : 'Orders received'}</h1>

      {mine.length === 0 ? (
        <p className="empty">
          {isBuyer ? (
            <>
              You haven't placed any orders yet. <Link to="/marketplace">Browse the marketplace</Link> to
              find something.
            </>
          ) : (
            'No orders yet. When a buyer orders one of your listings, it will show up here.'
          )}
        </p>
      ) : (
        <ul className="orders">
          {mine.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="order-row">
                <div>
                  <strong>{o.product}</strong>
                  <span className="small muted">{formatQuantity(o.quantity, o.unit)}</span>
                  <span className="small muted">{isBuyer ? `From ${o.seller}` : `For ${o.buyer}`}</span>
                </div>
                <div className="order-side">
                  <span>{formatPrice(orderTotals(o).total)}</span>
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