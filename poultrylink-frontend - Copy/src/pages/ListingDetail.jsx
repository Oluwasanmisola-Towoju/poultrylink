import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ROLES, useAuth } from '../context/auth'
import { useListings } from '../context/listings'
import { useMessages } from '../context/messages'
import { useOrders } from '../context/orders'
import { formatAvailability, formatPrice, formatQuantity } from '../utils/format'

function OrderForm({ listing, buyerName }) {
  const { placeOrder } = useOrders()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(String(listing.minOrder))
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})

  const qty = Number(quantity)
  const total = qty > 0 ? qty * listing.price : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!Number.isInteger(qty) || qty < listing.minOrder || qty > listing.quantity) {
      errs.quantity = `Enter a whole number from ${listing.minOrder} to ${listing.quantity}.`
    }
    if (!deliveryLocation.trim()) errs.deliveryLocation = 'Enter where it should be delivered.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const id = await placeOrder({
      listing,
      quantity: qty,
      buyer: buyerName,
      deliveryLocation: deliveryLocation.trim(),
      note: note.trim(),
    })
    navigate(`/orders/${id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="stack order-form" noValidate>
      <h2>Place an order</h2>

      <label>
        Quantity (minimum {listing.minOrder}, up to {listing.quantity})
        <input
          type="number"
          min={listing.minOrder}
          max={listing.quantity}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-invalid={!!errors.quantity}
        />
        {errors.quantity && <span className="error">{errors.quantity}</span>}
      </label>

      <label>
        Delivery location
        <input
          value={deliveryLocation}
          onChange={(e) => setDeliveryLocation(e.target.value)}
          aria-invalid={!!errors.deliveryLocation}
          placeholder="e.g. Ikeja, Lagos"
        />
        {errors.deliveryLocation && <span className="error">{errors.deliveryLocation}</span>}
      </label>

      <label>
        Note to the seller (optional)
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {total > 0 && <p className="total">Total: {formatPrice(total)}</p>}
      <p className="muted small">
        Your payment is held in escrow and released to the seller only after you confirm delivery.
      </p>
      <button className="btn" type="submit">Place order</button>
    </form>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { listings } = useListings()
  const { startOrGetThread } = useMessages()
  const navigate = useNavigate()
  const listing = listings.find((l) => String(l.id) === id)

  if (!listing) {
    return (
      <>
        <h1>Listing not found</h1>
        <p className="empty">
          This listing may have been removed. <Link to="/marketplace">Back to the marketplace</Link>
        </p>
      </>
    )
  }

  const isOwner = user.role === ROLES.FARMER && listing.seller === user.name

  const handleMessage = () => {
    const key = startOrGetThread(listing.id, listing.product, user.name, listing.seller)
    navigate(`/messages?thread=${encodeURIComponent(key)}`)
  }

  return (
    <article className="detail">
      <Link to="/marketplace" className="back">Back to marketplace</Link>
      <h1>{listing.product}</h1>
      <p className="price big">
        {formatPrice(listing.price)} <span>per {listing.unit}</span>
      </p>

      {listing.images && listing.images.length > 0 && (
        <div className="gallery">
          {listing.images.map((src) => (
            <img key={src} src={src} alt={listing.product} />
          ))}
        </div>
      )}

      <dl className="facts">
        <div><dt>Category</dt><dd>{listing.category}</dd></div>
        <div><dt>Available</dt><dd>{formatQuantity(listing.quantity, listing.unit)}</dd></div>
        <div><dt>Minimum order</dt><dd>{formatQuantity(listing.minOrder, listing.unit)}</dd></div>
        <div><dt>Availability</dt><dd>{formatAvailability(listing.availableFrom)}</dd></div>
        <div><dt>Location</dt><dd>{listing.location}</dd></div>
        {listing.farm && <div><dt>Farm</dt><dd>{listing.farm}</dd></div>}
        <div>
          <dt>Seller</dt>
          <dd><Link to={`/sellers/${encodeURIComponent(listing.seller)}`}>{listing.seller}</Link></dd>
        </div>
        <div>
          <dt>Verification</dt>
          <dd>{listing.verification === 'verified' ? 'Verified' : 'Not yet verified'}</dd>
        </div>
      </dl>

      {listing.description && <p>{listing.description}</p>}

      {user.role === ROLES.BUYER && (
        <>
          <button className="btn-quiet" onClick={handleMessage} style={{ marginBottom: '1rem' }}>
            Message seller
          </button>
          <OrderForm listing={listing} buyerName={user.name} />
        </>
      )}
      {isOwner && <p className="muted">This is your listing.</p>}
    </article>
  )
}