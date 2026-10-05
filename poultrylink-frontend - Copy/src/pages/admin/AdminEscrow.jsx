import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { HELD_STATUSES, STATUS, orderTotals } from '../../utils/orders'

export default function AdminEscrow() {
  const { orders } = useOrders()

  const held = orders.filter((o) => HELD_STATUSES.includes(o.status))
  const released = orders.filter((o) => o.status === STATUS.COMPLETED)
  const refunded = orders.filter((o) => o.status === STATUS.REFUNDED)

  const sum = (list, key) => list.reduce((total, o) => total + orderTotals(o)[key], 0)

  return (
    <>
      <h1>Escrow</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="muted small">Held in escrow now</span>
          <strong>{formatPrice(sum(held, 'total'))}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Released to sellers</span>
          <strong>{formatPrice(sum(released, 'payout'))}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Refunded to buyers</span>
          <strong>{formatPrice(sum(refunded, 'total'))}</strong>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Funds currently held</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Amount held</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {held.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}>{o.product}</Link></td>
                <td>{o.buyer}</td>
                <td>{o.seller}</td>
                <td>{formatPrice(orderTotals(o).total)}</td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {held.length === 0 && <p className="empty">Nothing is held in escrow right now.</p>}
      </div>
    </>
  )
}