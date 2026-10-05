import { createContext, useContext } from 'react'

export const ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  SUPPLIER: 'supplier',
  TRANSPORTER: 'transporter',
  VET: 'vet',
  COOPERATIVE: 'cooperative',
  FINANCIER: 'financier',
  ADMIN: 'admin',
}

export const ROLE_LABEL = {
  farmer: 'Farmer',
  buyer: 'Buyer',
  supplier: 'Supplier',
  transporter: 'Transporter',
  vet: 'Veterinarian',
  cooperative: 'Cooperative',
  financier: 'Financier / Insurance provider',
  admin: 'Administrator',
}

export const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)