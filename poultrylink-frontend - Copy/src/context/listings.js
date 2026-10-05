import { createContext, useContext } from 'react'

export const ListingsContext = createContext(null)

export const useListings = () => useContext(ListingsContext)