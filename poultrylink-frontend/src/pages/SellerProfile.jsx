import { Link, useParams } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import { useListings } from '../context/listings'
import { useOrders } from '../context/orders'

export default function SellerProfile() {
  const { name } = useParams()
  const { listings } = useListings()
  const { orders } = useOrders()

  const sellerName = decodeURIComponent(name)
  const sellerListings = listings.filter((l) => l.seller === sellerName)
  const reviews = orders.filter((o) => o.seller === sellerName && o.rating)

  const avg = reviews.length
    ? (reviews.reduce((sum, o) => sum + o.rating.stars, 0) / reviews.length).toFixed(1)
    : null

  return (
    <>
      <Link to="/marketplace" className="back">Back to marketplace</Link>
      <div className="page-head" style={{ marginTop: '.5rem' }}>
        <h1>{sellerName}</h1>
        {avg && (
          <span className="muted">
            ★ {avg} average ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem' }}>Listings</h2>
      {sellerListings.length === 0 ? (
        <p className="empty">No listings from this seller right now.</p>
      ) : (
        <div className="grid">
          {sellerListings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Reviews</h2>
      {reviews.length === 0 ? (
        <p className="empty">No reviews yet.</p>
      ) : (
        <ul className="reviews">
          {reviews.map((o) => (
            <li key={o.id} className="panel">
              <strong>{'★'.repeat(o.rating.stars)}{'☆'.repeat(5 - o.rating.stars)}</strong>
              {o.rating.comment && <p style={{ margin: '.35rem 0 0' }}>{o.rating.comment}</p>}
              <p className="muted small" style={{ margin: '.35rem 0 0' }}>
                {o.product}, by {o.buyer}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}