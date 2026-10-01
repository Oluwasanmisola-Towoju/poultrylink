import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useListings } from '../../context/listings'
import { formatPrice } from '../../utils/format'

export default function AdminListings() {
  const { listings, removeListing } = useListings()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = listings.filter(
    (l) => l.product.toLowerCase().includes(q) || l.seller.toLowerCase().includes(q),
  )

  const handleRemove = (l) => {
    if (window.confirm(`Remove "${l.product}" by ${l.seller}?`)) removeListing(l.id)
  }

  return (
    <>
      <h1>Listings</h1>
      <div className="filters">
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Product or seller" />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Seller</th>
              <th>Verification</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td><Link to={`/marketplace/${l.id}`}>{l.product}</Link></td>
                <td>{l.category}</td>
                <td>{formatPrice(l.price)} / {l.unit}</td>
                <td>{l.seller}</td>
                <td>
                  <span className={`badge badge-${l.verification === 'verified' ? 'go' : 'wait'}`}>
                    {l.verification === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>
                  <button className="btn-quiet" onClick={() => handleRemove(l)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No listings match.</p>}
      </div>
    </>
  )
}