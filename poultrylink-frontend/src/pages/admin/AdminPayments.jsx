import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { STATUS, orderTotals } from '../../utils/orders'

const PAID = [STATUS.IN_ESCROW, STATUS.IN_DELIVERY, STATUS.COMPLETED, STATUS.DISPUTED, STATUS.REFUNDED]

export default function AdminPayments() {
  const { orders } = useOrders()
  const paid = orders.filter((o) => PAID.includes(o.status))
  const completed = paid.filter((o) => o.status === STATUS.COMPLETED)

  const sum = (list, key) => list.reduce((total, o) => total + orderTotals(o)[key], 0)

  return (
    <>
      <h1>Payments</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="muted small">Total payment volume</span>
          <strong>{formatPrice(sum(paid, 'total'))}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Commission earned</span>
          <strong>{formatPrice(sum(completed, 'commission'))}</strong>
        </div>
        <div className="stat-card">
          <span className="muted small">Paid out to sellers</span>
          <strong>{formatPrice(sum(completed, 'payout'))}</strong>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Commission</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paid.map((o) => {
              const { total, commission } = orderTotals(o)
              return (
                <tr key={o.id}>
                  <td><Link to={`/orders/${o.id}`}>{o.product}</Link></td>
                  <td>{o.buyer}</td>
                  <td>{o.seller}</td>
                  <td>{formatPrice(total)}</td>
                  <td>{formatPrice(commission)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {paid.length === 0 && <p className="empty">No payments yet.</p>}
      </div>

      <p className="muted small" style={{ marginTop: '1rem' }}>
        Commission counts as earned once funds are released to the seller.
      </p>
    </>
  )
}