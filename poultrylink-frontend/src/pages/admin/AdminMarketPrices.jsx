import { useState } from 'react'
import { usePrices } from '../../context/prices'
import { formatPrice } from '../../utils/format'

export default function AdminMarketPrices() {
  const { prices, setPrice } = usePrices()
  const [productId, setProductId] = useState(prices[0].id)
  const [location, setLocation] = useState('')
  const [price, setPriceValue] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const product = prices.find((p) => p.id === productId)
  const knownLocations = Object.keys(product.locations)

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = Number(price)
    if (!location.trim()) return setError('Enter a location.')
    if (!(value > 0)) return setError('Enter a price above 0.')

    // Reuse an existing location if it matches ignoring capital letters
    const match = knownLocations.find((l) => l.toLowerCase() === location.trim().toLowerCase())
    setPrice(productId, match ?? location.trim(), value)
    setError('')
    setSaved(true)
    setPriceValue('')
  }

  const rows = prices.flatMap((p) =>
    Object.entries(p.locations).map(([loc, series]) => ({
      key: `${p.id}-${loc}`,
      product: p.product,
      unit: p.unit,
      location: loc,
      last: series[series.length - 1],
    })),
  )

  return (
    <>
      <h1>Market prices</h1>

      <form onSubmit={handleSubmit} className="stack form" noValidate>
        <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Update a price</h2>
        {error && <p className="error">{error}</p>}

        <label>
          Product
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value)
              setSaved(false)
            }}
          >
            {prices.map((p) => (
              <option key={p.id} value={p.id}>{p.product}</option>
            ))}
          </select>
        </label>

        <div className="row">
          <label>
            Location
            <input
              list="known-locations"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setSaved(false)
              }}
              placeholder="e.g. Ibadan"
            />
            <datalist id="known-locations">
              {knownLocations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>
          <label>
            New price per {product.unit}
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => {
                setPriceValue(e.target.value)
                setSaved(false)
              }}
            />
          </label>
        </div>

        <div className="actions">
          <button className="btn" type="submit">Save price</button>
          {saved && <span className="muted small">Saved. It now shows on the Market prices page.</span>}
        </div>
      </form>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Current prices</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Latest price</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.product}</td>
                <td>{r.location}</td>
                <td>{formatPrice(r.last.price)} per {r.unit}</td>
                <td>{r.last.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}