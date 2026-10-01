import { useState } from 'react'
import { AuthContext, ROLES } from './auth'

// Mock user "database". Replace with real auth once the backend exists.
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Demo Hatchery',
    email: 'hatchery@example.com',
    phone: '08010000001',
    password: 'password',
    role: ROLES.FARMER,
    farm: { name: 'Demo Hatchery', location: 'Lagos' },
    verification: 'verified',
  },
  {
    id: 'u2',
    name: 'Demo Feed Mill',
    email: 'feedmill@example.com',
    phone: '08010000002',
    password: 'password',
    role: ROLES.FARMER,
    farm: { name: 'Demo Feed Mill', location: 'Ibadan' },
    verification: 'verified',
  },
  {
    id: 'u3',
    name: 'Chidi',
    email: 'chidi@example.com',
    phone: '08010000003',
    password: 'password',
    role: ROLES.BUYER,
    verification: 'verified',
  },
  {
    id: 'u4',
    name: 'Admin',
    email: 'admin@example.com',
    phone: '08010000004',
    password: 'password',
    role: ROLES.ADMIN,
    verification: 'verified',
  },
  {
    id: 'u5',
    name: 'Demo Supplies Co',
    email: 'supplier@example.com',
    phone: '08010000005',
    password: 'password',
    role: ROLES.SUPPLIER,
    verification: 'verified',
  },
  {
    id: 'u6',
    name: 'Dr. Amaka',
    email: 'vet@example.com',
    phone: '08010000006',
    password: 'password',
    role: ROLES.VET,
    verification: 'verified',
  },
  {
    id: 'u7',
    name: 'Fast Haul Logistics',
    email: 'transporter@example.com',
    phone: '08010000007',
    password: 'password',
    role: ROLES.TRANSPORTER,
    verification: 'verified',
  },
  {
    id: 'u8',
    name: 'Ogun Farmers Co-op',
    email: 'coop@example.com',
    phone: '08010000008',
    password: 'password',
    role: ROLES.COOPERATIVE,
    verification: 'verified',
  },
  {
    id: 'u9',
    name: 'TrustFund Finance',
    email: 'financier@example.com',
    phone: '08010000009',
    password: 'password',
    role: ROLES.FINANCIER,
    verification: 'verified',
  },
]

export default function AuthProvider({ children }) {
  const [users, setUsers] = useState(SEED_USERS)
  const [user, setUser] = useState(null)
  const [pendingUserId, setPendingUserId] = useState(null) // set during registration, before OTP is confirmed

  const findByEmail = (email) => users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

  const login = (email, password) => {
    const found = findByEmail(email)
    if (!found) return { ok: false, error: 'No account found with that email.' }
    if (found.password !== password) return { ok: false, error: 'Incorrect password.' }
    setUser(found)
    return { ok: true, user: found }
  }

  const logout = () => setUser(null)

  const register = (data) => {
    if (findByEmail(data.email)) {
      return { ok: false, error: 'An account with that email already exists.' }
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      farm: data.farm ?? null,
      verification: 'unverified',
    }
    setUsers((prev) => [...prev, newUser])
    setPendingUserId(newUser.id)
    return { ok: true, user: newUser }
  }

  // Demo OTP: always "1234"
  const verifyOtp = (code) => {
    if (code !== '1234') return { ok: false, error: 'Incorrect code. Try 1234 for this demo.' }
    const pending = users.find((u) => u.id === pendingUserId)
    if (!pending) return { ok: false, error: 'Nothing to verify. Please register again.' }
    setUser(pending)
    setPendingUserId(null)
    return { ok: true, user: pending }
  }

  const resetPassword = (email, newPassword) => {
    const found = findByEmail(email)
    if (!found) return { ok: false, error: 'No account found with that email.' }
    setUsers((prev) => prev.map((u) => (u.id === found.id ? { ...u, password: newPassword } : u)))
    return { ok: true }
  }

  const setVerification = (userId, status) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verification: status } : u)))
    setUser((cur) => (cur?.id === userId ? { ...cur, verification: status } : cur))
  }

  const updateProfile = (userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)))
    setUser((cur) => (cur?.id === userId ? { ...cur, ...updates } : cur))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        register,
        verifyOtp,
        resetPassword,
        setVerification,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}