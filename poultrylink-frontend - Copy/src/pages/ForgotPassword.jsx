import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0: email, 1: new password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleEmail = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    setError('')
    setStep(1) // Demo skips a real emailed link/OTP step
  }

  const handleReset = (e) => {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    const result = resetPassword(email, password)
    if (!result.ok) return setError(result.error)
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <h1>Reset your password</h1>

      {step === 0 ? (
        <form onSubmit={handleEmail} className="stack">
          <p className="muted">Enter the email on your account.</p>
          {error && <p className="error">{error}</p>}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn" type="submit">Continue</button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="stack">
          <p className="muted small">Demo: skipping the emailed reset link.</p>
          {error && <p className="error">{error}</p>}
          <label>
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="btn" type="submit">Set new password</button>
        </form>
      )}

      <p className="muted small" style={{ marginTop: '1.5rem' }}>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  )
}