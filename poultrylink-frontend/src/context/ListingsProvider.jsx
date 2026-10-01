import { useState } from 'react'
import { ListingsContext } from './listings'
import { MOCK_LISTINGS } from '../data/listings'

// In-memory for now: swap this for real API/database calls later
export default function ListingsProvider({ children }) {
  const [listings, setListings] = useState(MOCK_LISTINGS)

  const addListing = (data) => {
    const listing = { ...data, id: Date.now() }
    setListings((prev) => [listing, ...prev])
    return listing.id
  }

  const removeListing = (id) => setListings((prev) => prev.filter((l) => l.id !== id))

  return (
    <ListingsContext.Provider value={{ listings, addListing, removeListing }}>
      {children}
    </ListingsContext.Provider>
  )
}