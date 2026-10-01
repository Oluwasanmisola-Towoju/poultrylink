import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useListings } from '../context/listings'
import { useOrders } from '../context/orders'
import { formatPrice } from '../utils/format'

export default function PlaceOrder() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { listings } = useListings()
  const { createOrder } = useOrders()

  const listing = listings.find((l) => String(l.id) === listingId)

  const [quantity, setQuantity] = useState(listing ? listing.minOrder : 1)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  if (!listing) {
    return (
      <>
        <h1>Listing not found</h1>
        <p className="empty"><Link to="/marketplace">Back to marketplace</Link></p>
      </>
    )
  }

  const totalAmount = quantity * listing.price

  const handleSubmit = (e) => {
    e.preventDefault()
    if (quantity < listing.minOrder) {
      setError(`Minimum order quantity is ${listing.minOrder}`)
      return
    }
    if (quantity > listing.quantity) {
      setError(`Only ${listing.quantity} available`)
      return
    }
    if (!address.trim()) {
      setError('Please provide a delivery address')
      return
    }

    const orderId = createOrder({
      listingId: listing.id,
      product: listing.product,
      quantity,
      unit: listing.unit,
      unitPrice: listing.price,
      totalAmount,
      seller: listing.seller,
      buyer: user.name,
      deliveryAddress: address.trim(),
    })

    navigate(`/orders/${orderId}`)
  }

  return (
    <article className="stack form">
      <Link to={`/marketplace/${listing.id}`} className="back">Back to item</Link>
      <h1>Order Confirmation</h1>

      <div className="card">
        <h3>{listing.product}</h3>
        <p className="muted">Seller: {listing.seller} | Location: {listing.location}</p>
        <p className="price">{formatPrice(listing.price)} <span>per {listing.unit}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        {error && <p className="error">{error}</p>}

        <label>
          Quantity ({listing.unit}s)
          <input
            type="number"
            min={listing.minOrder}
            max={listing.quantity}
            value={quantity}
            onChange={(e) => {
              setError('')
              setQuantity(Number(e.target.value))
            }}
          />
          <span className="muted small">Min order: {listing.minOrder} | Max available: {listing.quantity}</span>
        </label>

        <label>
          Delivery Address
          <textarea
            rows={3}
            placeholder="Enter destination address..."
            value={address}
            onChange={(e) => {
              setError('')
              setAddress(e.target.value)
            }}
          />
        </label>

        <div className="card" style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}>
          <p><strong>Total Amount:</strong> {formatPrice(totalAmount)}</p>
          <p className="muted small">Payment will be held safely in PoultryLink Escrow until you confirm delivery.</p>
        </div>

        <button type="submit" className="btn">Pay & Place in Escrow</button>
      </form>
    </article>
  )
}