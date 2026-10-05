import { Link } from 'react-router-dom'
import { formatAvailability, formatPrice, formatQuantity } from '../utils/format'

export default function ListingCard({ item }) {
  return (
    <article className="card">
            <div className="thumb">
        {item.images[0] && <img src={item.images[0]} alt="" />}
        <span className="thumb-badge">{item.category}</span>
        {item.verification === 'verified' && <span className="thumb-verified">✓</span>}
      </div>
      <h3>
        <Link to={`/marketplace/${item.id}`}>{item.product}</Link>
      </h3>
      <p className="price">
        {formatPrice(item.price)} <span>per {item.unit}</span>
      </p>
      <p className="muted small">
        {formatQuantity(item.quantity, item.unit)} available in {item.location}
      </p>
      <p className="muted small">{formatAvailability(item.availableFrom)}</p>
            <div className="tags">
        <span className="tag">{item.category}</span>
        {item.verification === 'verified' && <span className="tag tag-ok">Verified</span>}
      </div>
    </article>
  )
}