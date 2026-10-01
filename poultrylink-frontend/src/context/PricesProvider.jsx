import { useState } from 'react'
import { PricesContext } from './prices'
import { MARKET_PRICES } from '../data/marketPrices'
import { todayISO } from '../utils/format'

// In-memory for now: real prices will come from the database later
export default function PricesProvider({ children }) {
  const [prices, setPrices] = useState(MARKET_PRICES)

  // Adds a new data point for a product in a location (creates the location if new)
  const setPrice = (productId, location, price) => {
    const point = { date: todayISO(), price }
    setPrices((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              locations: {
                ...p.locations,
                [location]: [...(p.locations[location] ?? []), point],
              },
            }
          : p,
      ),
    )
  }

  return (
    <PricesContext.Provider value={{ prices, setPrice }}>
      {children}
    </PricesContext.Provider>
  )
}