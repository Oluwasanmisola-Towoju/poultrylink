import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/auth'

// No `allow`: any logged-in user gets in.
// With `allow`: only those roles; everyone else is sent to their own portal.
export default function ProtectedRoute({ allow }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }
  return <Outlet />
}