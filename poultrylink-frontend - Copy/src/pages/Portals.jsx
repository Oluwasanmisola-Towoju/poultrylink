// Placeholder dashboards. Each becomes its own file/folder as it grows.
function Placeholder({ title, message }) {
  return (
    <>
      <h1>{title}</h1>
      <p className="empty">{message}</p>
    </>
  )
}

export const FarmerHome = () => (
  <Placeholder title="Farmer dashboard" message="You haven't posted any listings yet." />
)

export const BuyerHome = () => (
  <Placeholder title="Buyer dashboard" message="You have no orders yet. Browse the marketplace to place one." />
)

export const AdminHome = () => (
  <Placeholder title="Admin dashboard" message="Nothing to review right now." />
)