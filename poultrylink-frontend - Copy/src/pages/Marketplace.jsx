import { useState } from 'react'
import ListingCard from '../components/ListingCard'
import { useListings } from '../context/listings'
import { CATEGORIES } from '../data/listings'

const NO_FILTERS = {
  product: '',
  category: 'All',
  location: '',
  seller: '',
  minQty: '',
  maxPrice: '',
}

export default function Marketplace() {
  const { listings = [] } = useListings()
  const [filters, setFilters] = useState(NO_FILTERS)

  const set = (field) => (e) => setFilters({ ...filters, [field]: e.target.value })

  // Fixed helper: converts both text and term safely to string first
  const has = (text, term) =>
    String(text ?? '')
      .toLowerCase()
      .includes(String(term ?? '').trim().toLowerCase())

  const active = Object.keys(NO_FILTERS).some((k) => filters[k] !== NO_FILTERS[k])

  const results = listings.filter(
    (item) =>
      item &&
      has(item.product, filters.product) &&
      (filters.category === 'All' || item.category === filters.category) &&
      has(item.location, filters.location) &&
      has(item.seller, filters.seller) &&
      (filters.minQty === '' || item.quantity >= Number(filters.minQty)) &&
      (filters.maxPrice === '' || item.price <= Number(filters.maxPrice)),
  )

  return (
    <>
      <h1>Marketplace</h1>

      <div className="filters">
        <label>
          Product
          <input value={filters.product} onChange={set('product')} placeholder="e.g. broilers" />
        </label>
        <label>
          Category
          <select value={filters.category} onChange={set('category')}>
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input value={filters.location} onChange={set('location')} placeholder="e.g. Ibadan" />
        </label>
        <label>
          Seller
          <input value={filters.seller} onChange={set('seller')} />
        </label>
        <label>
          Minimum quantity
          <input type="number" min="0" value={filters.minQty} onChange={set('minQty')} />
        </label>
        <label>
          Maximum price
          <input type="number" min="0" step="any" value={filters.maxPrice} onChange={set('maxPrice')} />
        </label>
      </div>

      <p className="muted small" aria-live="polite">
        {results.length} {results.length === 1 ? 'listing' : 'listings'}
        {active && (
          <>
            {' '}
            <button className="link-btn" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          </>
        )}
      </p>

      {results.length === 0 ? (
        <p className="empty">No listings match. Try loosening your filters.</p>
      ) : (
        <div className="grid">
          {results.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}