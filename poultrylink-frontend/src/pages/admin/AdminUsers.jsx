import { useState } from 'react'
import { ROLE_LABEL } from '../../context/auth'
import { useAuth } from '../../context/auth'

export default function AdminUsers() {
  const { users } = useAuth()
  const [role, setRole] = useState('All')
  const [query, setQuery] = useState('')

  const roles = [...new Set(users.map((u) => u.role))]
  const q = query.trim().toLowerCase()

  const rows = users.filter(
    (u) =>
      (role === 'All' || u.role === role) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  )

  return (
    <>
      <h1>Users</h1>
      <div className="filters">
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or email" />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="All">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABEL[u.role]}</td>
                <td>{u.phone}</td>
                <td>
                  <span className={`badge badge-${u.verification === 'verified' ? 'go' : 'wait'}`}>
                    {u.verification === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No users match.</p>}
      </div>
    </>
  )
}
