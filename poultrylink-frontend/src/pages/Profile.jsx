import { useState } from 'react'
import { ROLES, useAuth } from '../context/auth'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    farmName: user.farm?.name ?? '',
    farmLocation: user.farm?.location ?? '',
  })
  const [saved, setSaved] = useState(false)

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setSaved(false)
  }

  const isFarmer = user.role === ROLES.FARMER

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile(user.id, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      farm: isFarmer ? { name: form.farmName.trim(), location: form.farmLocation.trim() } : user.farm,
    })
    setSaved(true)
  }

  return (
    <>
      <div className="page-head">
        <h1>Profile</h1>
        <span className={`badge badge-${user.verification === 'verified' ? 'go' : 'wait'}`}>
          {user.verification === 'verified' ? 'Verified' : 'Not yet verified'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="stack form">
        <label>
          Full name
          <input value={form.name} onChange={set('name')} />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Phone number
          <input value={form.phone} onChange={set('phone')} />
        </label>

        {isFarmer && (
          <>
            <label>
              Farm name
              <input value={form.farmName} onChange={set('farmName')} />
            </label>
            <label>
              Farm location
              <input value={form.farmLocation} onChange={set('farmLocation')} />
            </label>
          </>
        )}

        <div className="actions">
          <button className="btn" type="submit">Save changes</button>
          {saved && <span className="muted small">Saved.</span>}
        </div>
      </form>
    </>
  )
}