import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROLES, useAuth } from '../context/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLoginSuccess = (user) => {
    // Admins skip the verification screen entirely
    if (user.role === ROLES.ADMIN) {
      return navigate('/admin')
    }
    // Everyone else always passes through Verification first;
    // that page decides what to show based on user.verification
    navigate('/verification')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await login(email.trim(), password)
    if (!result.ok) {
      return setError(result.error || 'Invalid credentials')
    }

    handleLoginSuccess(result.user)
  }

  // Quick fill helper for demo testing
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('password')
  }

  return (
    <div className="auth-page">
      <h1>PoultryLink</h1>
      <p className="muted">Buy and sell birds, eggs, chicks, feed and equipment.</p>

      {error && <p className="error" style={{ marginBottom: '.75rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="stack">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn" type="submit">Log in</button>
      </form>

      <p className="muted small" style={{ marginTop: '1rem' }}>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p className="muted small">
        No account? <Link to="/register">Register</Link>
      </p>

      {/* Interactive Demo Logins */}
      <div className="muted small" style={{ marginTop: '1.5rem', lineHeight: '1.6' }}>
        <p style={{ margin: 0 }}><strong>Demo Logins</strong> (password: <code>password</code>):</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('hatchery@example.com')}>
            Farmer
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('chidi@example.com')}>
            Buyer
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('admin@example.com')}>
            Admin
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('supplier@example.com')}>
            Supplier
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('vet@example.com')}>
            Vet
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('transporter@example.com')}>
            Transporter
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('coop@example.com')}>
            Co-op
          </button>
          <button type="button" className="btn-quiet" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => fillDemo('financier@example.com')}>
            Financier
          </button>
        </div>
      </div>
    </div>
  )
}