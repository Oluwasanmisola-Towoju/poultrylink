import { useNavigate } from 'react-router-dom'
import { ROLES, useAuth } from '../context/auth'

export default function Verification() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const goToPortal = () => {
    if (user.role === ROLES.ADMIN) navigate('/admin')
    else if (user.role === ROLES.FARMER) navigate('/farmer')
    else navigate('/marketplace')
  }

  return (
    <div className="auth-page">
      <h1>Verify your account</h1>
      {user?.verification === 'verified' ? (
        <>
          <p>Your account is verified. You have full access.</p>
          <button className="btn" onClick={goToPortal}>Continue</button>
        </>
      ) : (
        <>
          <p className="muted">
            Your account is under review. An administrator checks new accounts before they can post
            listings or place orders that involve escrow payments. This usually happens within 24 hours.
          </p>
          <p className="muted small">
            You can still browse the marketplace while you wait.
          </p>
          <button className="btn" onClick={goToPortal}>Continue to the app</button>
        </>
      )}
    </div>
  )
}