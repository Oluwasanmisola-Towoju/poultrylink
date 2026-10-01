import { useListings } from '../../context/listings'
import { useOrders } from '../../context/orders'
import { formatPrice } from '../../utils/format'
import { STATUS, STATUS_LABEL, orderTotals } from '../../utils/orders'

const groupBy = (list, keyFn) =>
  list.reduce((groups, o) => {
    const key = keyFn(o)
    const group = groups[key] ?? { count: 0, value: 0 }
    group.count += 1
    group.value += orderTotals(o).total
    groups[key] = group
    return groups
  }, {})

function Breakdown({ title, heading, groups }) {
  const rows = Object.entries(groups).sort((a, b) => b[1].value - a[1].value)

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>{title}</h2>
      {rows.length === 0 ? (
        <p className="empty">No data yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{heading}</th>
                <th>Orders</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, g]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{g.count}</td>
                  <td>{formatPrice(g.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default function AdminReports() {
  const { orders } = useOrders()
  const { listings } = useListings()

  const categoryOf = (o) => listings.find((l) => l.id === o.listingId)?.category ?? 'Unknown'
  const completed = orders.filter((o) => o.status === STATUS.COMPLETED)

  return (
    <>
      <h1>Reports</h1>
      <p className="muted">Summary figures across all orders on the platform.</p>

      <Breakdown
        title="Orders by status"
        heading="Status"
        groups={groupBy(orders, (o) => STATUS_LABEL[o.status])}
      />
      <Breakdown title="Orders by category" heading="Category" groups={groupBy(orders, categoryOf)} />
      <Breakdown
        title="Top sellers (completed orders)"
        heading="Seller"
        groups={groupBy(completed, (o) => o.seller)}
      />
    </>
  )
}