import { useCallback, useEffect, useState } from 'react'
import { OrdersContext } from './orders'
import { useAuth } from './auth'
import { api } from '../lib/api'

const normalize = (o) => ({
  ...o,
  id: o.id,
  product: o.items?.[0]?.listing?.productName || 'Order',
  quantity: Number(o.items?.[0]?.quantity || 0),
  price: Number(o.items?.[0]?.unitPrice || 0),
  totalAmount: Number(o.totalAmount || 0),
  status: o.status,
  deliveryLocation: o.deliveryAddress,
})

export default function OrdersProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const refresh = useCallback(async () => {
    if (!user) return setOrders([])
    try {
      const path = user.role === 'farmer' ? '/orders/mine/selling?limit=100' : '/orders/mine/buying?limit=100'
      if (!['farmer','buyer'].includes(user.role)) return setOrders([])
      const rows = await api.get(path); setOrders((rows || []).map(normalize))
    } catch (e) { console.error(e) }
  }, [user])
  useEffect(() => { refresh() }, [refresh])

  const placeOrder = async ({ listing, quantity, deliveryLocation, note }) => {
    const { order } = await api.post('/orders', { items: [{ listingId: listing.id, quantity: Number(quantity) }], deliveryAddress: deliveryLocation, notes: note || undefined })
    await refresh(); return order.id
  }
  const setStatus = async (id, status) => {
    const actions = { ACCEPTED: 'accept', REJECTED: 'reject', OUT_FOR_DELIVERY: 'dispatch', CONFIRMED: 'confirm-delivery' }
    if (!actions[status]) throw new Error(`Unsupported status transition: ${status}`)
    await api.post(`/orders/${id}/${actions[status]}`, {}); await refresh()
  }
  const rateOrder = async (id, stars, comment) => { await api.post(`/reviews/orders/${id}`, { rating: Number(stars), comment }); await refresh() }
  const removeRating = async () => { throw new Error('Review deletion is not supported by the API.') }

  return <OrdersContext.Provider value={{ orders, placeOrder, setStatus, rateOrder, removeRating, refresh }}>{children}</OrdersContext.Provider>
}
