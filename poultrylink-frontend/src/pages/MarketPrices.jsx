import { useMemo, useState } from 'react'
import { usePrices } from '../context/prices'
import { CATEGORIES } from '../data/listings'
import { formatPrice } from '../utils/format'
import { allLocations, change, latest } from '../utils/prices'

function Trend({ pct }) {
  if (pct == null) return <span className="muted small">No trend yet</span>
  const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—'
  return (
    <span className={`trend trend-${dir}`}>
      {arrow} {Math.abs(pct).toFixed(1)}% <span className="muted small">vs last update</span>
    </span>
  )
}

// Small inline sparkline, no charting library needed
function Sparkline({ series }) {
  const values = series.map((p) => p.price)
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 30 - ((v - min) / span) * 28 - 1
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 30" className="sparkline" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function MarketPrices() {
  const { prices } = usePrices()
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All')

  const categories = useMemo(
    () => CATEGORIES.filter((c) => prices.some((p) => p.category === c)),
    [prices],
  )
  const locations = useMemo(
    () => [...new Set(prices.flatMap(allLocations))].sort(),
    [prices],
  )

  const rows = prices
    .filter((p) => category === 'All' || p.category === category)
    .flatMap((p) =>
      Object.entries(p.locations)
        .filter(([loc]) => location === 'All' || loc === location)
        .map(([loc, series]) => ({ ...p, location: loc, series })),
    )

  return (
    <>
      <h1>Market prices</h1>
      <p className="muted">
        Recent average prices by product and location, maintained by the PoultryLink team.
      </p>

      <div className="filters">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="All">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="empty">No prices for that combination yet.</p>
      ) : (
        <div className="price-grid">
          {rows.map((row) => (
            <article key={`${row.id}-${row.location}`} className="price-card">
              <h3>{row.product}</h3>
              <p className="muted small" style={{ margin: '0 0 .5rem' }}>{row.location}</p>
              <p className="price big">
                {formatPrice(latest(row.series))} <span>per {row.unit}</span>
              </p>
              <Trend pct={change(row.series)} />
              <Sparkline series={row.series} />
            </article>
          ))}
        </div>
      )}

      <p className="muted small" style={{ marginTop: '1.5rem' }}>
        These are indicative averages from sample data, not live transaction prices.
      </p>
    </>
  )
}