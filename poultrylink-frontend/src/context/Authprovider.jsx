import { useEffect, useState } from 'react'
import { AuthContext } from './auth'
import { api, session } from '../lib/api'

const normalizeUser = (u) => u ? ({
  ...u,
  role: String(u.role || '').toLowerCase(),
  name: u.profile ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim() || u.profile.businessName : u.email,
  verification: String(u.verificationStatus || 'UNVERIFIED').toLowerCase(),
}) : null

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users] = useState([])
  const [pendingUserId, setPendingUserId] = useState(() => sessionStorage.getItem('poultrylink_pending_user'))
  const [loading, setLoading] = useState(Boolean(session.accessToken))

  useEffect(() => {
    if (!session.accessToken) return setLoading(false)
    api.get('/auth/me')
      .then(({ user: u }) => setUser(normalizeUser(u)))
      .catch(() => session.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const result = await api.post('/auth/login', { email, password })
      session.set(result)
      const normalized = normalizeUser(result.user)
      setUser(normalized)
      return { ok: true, user: normalized }
    } catch (e) { return { ok: false, error: e.message } }
  }

  const logout = async () => {
    try { if (session.refreshToken) await api.post('/auth/logout', { refreshToken: session.refreshToken }) } catch { /* local logout still succeeds */ }
    session.clear(); setUser(null)
  }

  const register = async (data) => {
    try {
      const parts = data.name.trim().split(/\s+/)
      const firstName = parts.shift() || data.name
      const lastName = parts.join(' ') || '-'
      const result = await api.post('/auth/register', {
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role: data.role.toUpperCase(),
        firstName,
        lastName,
        businessName: data.profileDetails?.farmName || data.profileDetails?.companyName || undefined,
      })
      setPendingUserId(result.user.id)
      sessionStorage.setItem('poultrylink_pending_user', result.user.id)
      return { ok: true, user: normalizeUser(result.user) }
    } catch (e) { return { ok: false, error: e.message } }
  }

  const verifyOtp = async (code) => {
    try {
      if (!pendingUserId) throw new Error('Nothing to verify. Please register again.')
      const result = await api.post('/auth/verify-otp', { userId: pendingUserId, code, purpose: 'REGISTRATION' })
      session.set(result)
      const normalized = normalizeUser(result.user)
      setUser(normalized)
      setPendingUserId(null)
      sessionStorage.removeItem('poultrylink_pending_user')
      return { ok: true, user: normalized }
    } catch (e) { return { ok: false, error: e.message } }
  }

  const resetPassword = async () => ({ ok: false, error: 'Use the password reset flow.' })
  const setVerification = () => {}
  const updateProfile = async (_id, updates) => {
    try {
      const { profile } = await api.patch('/users/me', updates)
      setUser((cur) => normalizeUser({ ...cur, profile }))
      return { ok: true }
    } catch (e) { return { ok: false, error: e.message } }
  }

  return <AuthContext.Provider value={{ user, users, loading, login, logout, register, verifyOtp, resetPassword, setVerification, updateProfile }}>{children}</AuthContext.Provider>
}
