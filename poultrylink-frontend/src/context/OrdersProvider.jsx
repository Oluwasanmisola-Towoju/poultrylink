import { useState } from 'react'
import { OrdersContext } from './orders'
import { useSettings } from './settings'
import { STATUS } from '../utils/orders'

// In-memory for now: the backend will enforce valid status changes later
export default function OrdersProvider({ children }) {
  const { commissionRate } = useSettings()
  const [orders, setOrders] = useState([])

  const placeOrder = ({ listing, quantity, buyer, deliveryLocation, note }) => {
    const at = new Date().toISOString()
    const order = {
      id: Date.now(),
      listingId: listing.id,
      product: listing.product,
      unit: listing.unit,
      price: listing.price,
      quantity,
      seller: listing.seller,
      buyer,
      deliveryLocation,
      note,
      commissionRate, // the rate at the time the order was placed
      status: STATUS.PLACED,
      history: [{ status: STATUS.PLACED, at }],
      rating: null,
    }
    setOrders((prev) => [order, ...prev])
    return order.id
  }

  const setStatus = (id, status) => {
    const at = new Date().toISOString()
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, history: [...o.history, { status, at }] } : o,
      ),
    )
  }

  const rateOrder = (id, stars, comment) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, rating: { stars, comment } } : o)))

  const removeRating = (id) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, rating: null } : o)))

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, setStatus, rateOrder, removeRating }}>
      {children}
    </OrdersContext.Provider>
  )
}