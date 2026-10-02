import { ROLE_LABEL, useAuth } from '../../context/auth'

export default function AdminVerification() {
  const { users, setVerification } = useAuth()

  // Only accounts that haven't been reviewed yet.
  // Change to `u.verification !== 'verified'` if you want rejected ones listed too.
  const pending = users.filter((u) => u.verification === 'pending')

  return (
    <>
      <h1>Verification</h1>
      {pending.length === 0 ? (
        <p className="empty">No accounts waiting on review.</p>
      ) : (
        <ul className="orders">
          {pending.map((u) => (
            <li key={u.id} className="order-row" style={{ textDecoration: 'none' }}>
              <div>
                <strong>{u.name}</strong>
                <span className="small muted">
                  {ROLE_LABEL[u.role] ?? u.role} &middot; {u.email}
                </span>
                {u.farm && (
                  <span className="small muted">
                    {u.farm.name}, {u.farm.location}
                  </span>
                )}
              </div>
              <div className="actions" style={{ marginTop: 0 }}>
                <button className="btn" onClick={() => setVerification(u.id, 'verified')}>
                  Approve
                </button>
                <button className="btn-quiet" onClick={() => setVerification(u.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
