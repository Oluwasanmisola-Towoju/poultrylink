import { createContext, useContext } from 'react'

export const PricesContext = createContext(null)

export const usePrices = () => useContext(PricesContext)