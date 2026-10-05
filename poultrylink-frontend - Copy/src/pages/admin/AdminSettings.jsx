import { useState } from 'react'
import { useSettings } from '../../context/settings'

export default function AdminSettings() {
  const { commissionRate, setCommissionRate } = useSettings()
  const [pct, setPct] = useState(String(+(commissionRate * 100).toFixed(2)))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = Number(pct)
    if (pct.trim() === '' || Number.isNaN(value) || value < 0 || value > 50) {
      return setError('Enter a percentage between 0 and 50.')
    }
    setCommissionRate(value / 100)
    setError('')
    setSaved(true)
  }

  return (
    <>
      <h1>Settings</h1>

      <form onSubmit={handleSubmit} className="stack form" noValidate>
        <label>
          Commission rate (%)
          <input
            type="number"
            min="0"
            max="50"
            step="any"
            value={pct}
            onChange={(e) => {
              setPct(e.target.value)
              setSaved(false)
            }}
            aria-invalid={!!error}
          />
          {error && <span className="error">{error}</span>}
        </label>
        <p className="muted small">
          The platform keeps this share of each order when funds are released to the seller. A new rate
          applies to orders placed after you save it; existing orders keep the rate they were placed with.
        </p>
        <div className="actions">
          <button className="btn" type="submit">Save settings</button>
          {saved && <span className="muted small">Saved.</span>}
        </div>
      </form>
    </>
  )
}