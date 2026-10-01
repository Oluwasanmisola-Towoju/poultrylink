import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { ROLES, useAuth } from '../context/auth'
import { useOrders } from '../context/orders'
import { formatPrice, formatQuantity } from '../utils/format'
import { STATUS, STATUS_LABEL, STEPS, orderTotals } from '../utils/orders'

const formatWhen = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

const CLOSED_NOTE = {
  [STATUS.COMPLETED]: 'Delivery confirmed. The funds were released to the seller.',
  [STATUS.REJECTED]: 'The seller declined this order.',
  [STATUS.CANCELLED]: 'This order was cancelled.',
  [STATUS.DISPUTED]: 'A problem was reported. An administrator will review this order.',
  [STATUS.REFUNDED]: 'This order was refunded to the buyer.',
}

// What each side can do at each stage
function nextActions(status, isBuyer) {
  const act = (label, to, primary = false) => ({ label, to, primary })
  const none = { note: CLOSED_NOTE[status] ?? null, buttons: [] }

  if (isBuyer) {
    switch (status) {
      case STATUS.PLACED:
        return {
          note: 'Waiting for the seller to accept your order.',
          buttons: [act('Cancel order', STATUS.CANCELLED)],
        }
      case STATUS.ACCEPTED:
        return {
          note: 'The seller accepted. Pay now and your money is held in escrow until you confirm delivery.',
          buttons: [act('Pay now (demo)', STATUS.IN_ESCROW, true), act('Cancel order', STATUS.CANCELLED)],
        }
      case STATUS.IN_ESCROW:
        return {
          note: 'Your payment is held in escrow. The seller will dispatch your order.',
          buttons: [act('Report a problem', STATUS.DISPUTED)],
        }
      case STATUS.IN_DELIVERY:
        return {
          note: 'Your order is on the way. Confirm only after it arrives and you have checked it.',
          buttons: [
            act('Confirm delivery', STATUS.COMPLETED, true),
            act('Report a problem', STATUS.DISPUTED),
          ],
        }
      default:
        return none
    }
  }

  switch (status) {
    case STATUS.PLACED:
      return {
        note: 'Accept this order so the buyer can pay, or decline it.',
        buttons: [act('Accept order', STATUS.ACCEPTED, true), act('Decline order', STATUS.REJECTED)],
      }
    case STATUS.ACCEPTED:
      return { note: 'Waiting for the buyer to pay.', buttons: [] }
    case STATUS.IN_ESCROW:
      return {
        note: 'The buyer has paid and the money is held in escrow. Send the order out, then mark it as dispatched.',
        buttons: [act('Mark as dispatched', STATUS.IN_DELIVERY, true)],
      }
    case STATUS.IN_DELIVERY:
      return {
        note: 'Waiting for the buyer to confirm delivery. Your payout is released when they do.',
        buttons: [],
      }
    default:
      return none
  }
}

function RatingBox({ order, canRate }) {
  const { rateOrder } = useOrders()
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')

  if (order.rating) {
    return (
      <section className="panel">
        <h2>Review</h2>
        <p>{order.rating.stars} out of 5 stars</p>
        {order.rating.comment && <p>{order.rating.comment}</p>}
      </section>
    )
  }
  if (!canRate) return null

  return (
    <section className="panel">
      <h2>Rate this order</h2>
      <div className="stars" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="star"
            aria-pressed={stars >= n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
            onClick={() => setStars(n)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        style={{ width: '100%' }}
        placeholder="How did it go? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="actions">
        <button
          className="btn"
          disabled={stars === 0}
          onClick={() => rateOrder(order.id, stars, comment.trim())}
        >
          Submit review
        </button>
      </div>
    </section>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { orders, setStatus } = useOrders()
  const order = orders.find((o) => String(o.id) === id)

  const isBuyer = user.role === ROLES.BUYER
  const isMine = order && (isBuyer ? order.buyer === user.name : order.seller === user.name)

  if (!order || !isMine) {
    return (
      <>
        <h1>Order not found</h1>
        <p className="empty">
          This order doesn't exist, or it belongs to someone else. <Link to="/orders">Back to orders</Link>
        </p>
      </>
    )
  }

  const { total, commission, payout, rate } = orderTotals(order)
  const { note, buttons } = nextActions(order.status, isBuyer)
  const when = (status) => order.history.find((h) => h.status === status)?.at
  const onHappyPath = STEPS.some((s) => s.status === order.status)

  return (
    <>
      <Link to="/orders" className="back">Back to orders</Link>
      <div className="page-head" style={{ marginTop: '.5rem' }}>
        <h1>{order.product}</h1>
        <StatusBadge status={order.status} />
      </div>

      <section className="panel">
        <h2>Progress</h2>
        <ol className="timeline">
          {STEPS.map((step) => {
            const at = when(step.status)
            return (
              <li
                key={step.status}
                className={at ? 'done' : ''}
                aria-current={step.status === order.status ? 'step' : undefined}
              >
                {step.label}
                {at && <span className="when">{formatWhen(at)}</span>}
              </li>
            )
          })}
          {!onHappyPath && (
            <li className="done stop" aria-current="step">
              {STATUS_LABEL[order.status]}
              <span className="when">{formatWhen(when(order.status))}</span>
            </li>
          )}
        </ol>
      </section>

      {(note || buttons.length > 0) && (
        <section className="panel">
          <h2>What's next</h2>
          {note && <p>{note}</p>}
          {buttons.length > 0 && (
            <div className="actions">
              {buttons.map((b) => (
                <button
                  key={b.to}
                  className={b.primary ? 'btn' : 'btn-quiet'}
                  onClick={() => setStatus(order.id, b.to)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
          {isBuyer && order.status === STATUS.ACCEPTED && (
            <p className="muted small">Demo only: no real money moves.</p>
          )}
        </section>
      )}

      <RatingBox order={order} canRate={isBuyer && order.status === STATUS.COMPLETED} />

      <dl className="facts">
        <div><dt>Quantity</dt><dd>{formatQuantity(order.quantity, order.unit)}</dd></div>
        <div><dt>Unit price</dt><dd>{formatPrice(order.price)} per {order.unit}</dd></div>
        <div><dt>Order total</dt><dd>{formatPrice(total)}</dd></div>
        {!isBuyer && (
          <>
            <div>
              <dt>Commission ({Math.round(rate * 100)}%)</dt>
              <dd>{formatPrice(commission)}</dd>
            </div>
            <div><dt>You receive</dt><dd>{formatPrice(payout)}</dd></div>
          </>
        )}
        <div><dt>{isBuyer ? 'Seller' : 'Buyer'}</dt><dd>{isBuyer ? order.seller : order.buyer}</dd></div>
        <div><dt>Deliver to</dt><dd>{order.deliveryLocation}</dd></div>
      </dl>

      {order.note && (
        <p>
          <strong>Note from the buyer:</strong> {order.note}
        </p>
      )}
      <p>
        <Link to={`/marketplace/${order.listingId}`}>View the listing</Link>
      </p>
    </>
  )
}