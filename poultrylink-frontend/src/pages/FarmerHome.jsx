import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import { useAuth } from '../context/auth'
import { useListings } from '../context/listings'

export default function FarmerHome() {
  const { user } = useAuth()
  const { listings } = useListings()
  const mine = listings.filter((l) => l.seller === user.name)

  return (
    <>
      <div className="page-head">
        <h1>My listings</h1>
        <Link to="/farmer/new" className="btn">Post a listing</Link>
      </div>

      {mine.length === 0 ? (
        <p className="empty">
          You haven't posted any listings yet. Post your first one and buyers will see it in the marketplace.
        </p>
      ) : (
        <div className="grid">
          {mine.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}
