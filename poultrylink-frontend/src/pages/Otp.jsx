import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

export default function Otp() {
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await verifyOtp(code.trim())
    if (!result.ok) return setError(result.error)
    navigate('/verification')
  }

  return (
    <div className="auth-page">
      <h1>Verify your phone</h1>
      <p className="muted">
        Enter the 6-digit code we sent you. Check the configured OTP delivery channel for your verification code.
      </p>
      {error && <p className="error" style={{ marginBottom: '.75rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="stack">
        <label>
          Verification code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            aria-invalid={!!error}
          />
        </label>
        <button className="btn" type="submit">Verify</button>
      </form>
      <p className="muted small" style={{ marginTop: '1.5rem' }}>
        Wrong details? <Link to="/register">Start over</Link>
      </p>
    </div>
  )
}