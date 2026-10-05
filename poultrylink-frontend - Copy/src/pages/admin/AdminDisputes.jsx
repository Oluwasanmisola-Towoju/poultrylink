import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { STATUS, orderTotals } from '../../utils/orders'

export default function AdminDisputes() {
  const { orders, setStatus } = useOrders()

  const open = orders.filter((o) => o.status === STATUS.DISPUTED)
  const resolved = orders.filter(
    (o) =>
      [STATUS.COMPLETED, STATUS.REFUNDED].includes(o.status) &&
      o.history.some((h) => h.status === STATUS.DISPUTED),
  )

  const resolve = (order, to, message) => {
    if (window.confirm(message)) setStatus(order.id, to)
  }

  return (
    <>
      <h1>Disputes</h1>

      <h2 style={{ fontSize: '1.1rem' }}>Open</h2>
      {open.length === 0 ? (
        <p className="empty">No open disputes.</p>
      ) : (
        <ul className="orders">
          {open.map((o) => (
            <li key={o.id} className="order-row">
              <div>
                <strong>
                  <Link to={`/orders/${o.id}`}>{o.product}</Link>
                </strong>
                <span className="small muted">Buyer: {o.buyer} · Seller: {o.seller}</span>
                <span className="small muted">Amount held: {formatPrice(orderTotals(o).total)}</span>
              </div>
              <div className="actions" style={{ marginTop: 0 }}>
                <button
                  className="btn"
                  onClick={() =>
                    resolve(o, STATUS.COMPLETED, `Release the funds to ${o.seller}? This closes the dispute.`)
                  }
                >
                  Release to seller
                </button>
                <button
                  className="btn-quiet"
                  onClick={() =>
                    resolve(o, STATUS.REFUNDED, `Refund ${formatPrice(orderTotals(o).total)} to ${o.buyer}? This closes the dispute.`)
                  }
                >
                  Refund buyer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Resolved</h2>
      {resolved.length === 0 ? (
        <p className="empty">No resolved disputes yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/orders/${o.id}`}>{o.product}</Link></td>
                  <td>{o.buyer}</td>
                  <td>{o.seller}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}