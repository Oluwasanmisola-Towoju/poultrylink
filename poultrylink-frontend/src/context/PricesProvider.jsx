import { useCallback, useEffect, useState } from 'react'
import { PricesContext } from './prices'
import { api } from '../lib/api'

function groupPrices(rows) {
  const map = new Map()
  for (const row of rows || []) {
    const key = row.categoryId
    if (!map.has(key)) map.set(key, { id: key, product: row.category?.name || 'Product', locations: {} })
    const item = map.get(key); const loc = row.state || 'National'
    if (!item.locations[loc]) item.locations[loc] = []
    item.locations[loc].push({ date: row.recordedAt?.slice(0, 10), price: Number(row.price) })
  }
  return [...map.values()]
}

export default function PricesProvider({ children }) {
  const [prices, setPrices] = useState([])
  const refresh = useCallback(async () => { setPrices(groupPrices(await api.get('/market-prices?limit=100'))) }, [])
  useEffect(() => { refresh().catch(console.error) }, [refresh])
  const setPrice = async (categoryId, state, price) => {
    await api.post('/market-prices', { categoryId, state, price: Number(price), unit: 'unit', source: 'ADMIN' })
    await refresh()
  }
  return <PricesContext.Provider value={{ prices, setPrice, refresh }}>{children}</PricesContext.Provider>
}
