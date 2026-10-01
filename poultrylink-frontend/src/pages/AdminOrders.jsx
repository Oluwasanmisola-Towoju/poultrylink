import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { STATUS_LABEL, orderTotals } from '../../utils/orders'

export default function AdminOrders() {
  const { orders } = useOrders()
  const [status, setStatus] = useState('All')

  const rows = status === 'All' ? orders : orders.filter((o) => o.status === status)

  return (
    <>
      <h1>Orders</h1>
      <div className="filters">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
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
        {rows.length === 0 && <p className="empty">No orders match.</p>}
      </div>
    </>
  )
}