import { createContext, useContext, useState } from 'react'

const OrdersContext = createContext(null)

const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    listingId: 1,
    product: 'Day-old broiler chicks',
    quantity: 100,
    unit: 'bird',
    unitPrice: 1.5,
    totalAmount: 150,
    seller: 'Demo Hatchery',
    buyer: 'Demo Buyer',
    status: 'escrow_held', // 'pending' | 'accepted' | 'escrow_held' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
    deliveryAddress: '12 Commercial Ave, Yaba, Lagos',
    createdAt: '2026-09-20',
  },
]

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)

  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'escrow_held',
      ...orderData,
    }
    setOrders((prev) => [newOrder, ...prev])
    return newOrder.id
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    )
  }

  return (
    <OrdersContext.Provider value={{ orders, createOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => useContext(OrdersContext)