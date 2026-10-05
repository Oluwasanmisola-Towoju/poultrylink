import { Link } from 'react-router-dom'
import { useOrders } from '../../context/orders'

export default function AdminReviews() {
  const { orders, removeRating } = useOrders()
  const rated = orders.filter((o) => o.rating)

  const handleRemove = (o) => {
    if (window.confirm(`Remove this review of ${o.seller}?`)) removeRating(o.id)
  }

  return (
    <>
      <h1>Reviews</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rated.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}>{o.product}</Link></td>
                <td>{o.seller}</td>
                <td>{o.buyer}</td>
                <td>{o.rating.stars} / 5</td>
                <td style={{ whiteSpace: 'normal', minWidth: '200px' }}>{o.rating.comment || '-'}</td>
                <td>
                  <button className="btn-quiet" onClick={() => handleRemove(o)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rated.length === 0 && <p className="empty">No reviews yet.</p>}
      </div>
      <p className="muted small" style={{ marginTop: '1rem' }}>
        In this demo, a removed review lets the buyer rate that order again.
      </p>
    </>
  )
}