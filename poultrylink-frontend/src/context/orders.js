import { createContext, useContext } from 'react'

export const OrdersContext = createContext(null)

export const useOrders = () => useContext(OrdersContext)
