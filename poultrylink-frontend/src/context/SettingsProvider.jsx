import { useState } from 'react'
import { SettingsContext } from './settings'
import { COMMISSION_RATE } from '../utils/orders'

// In-memory for now: this will live in the database later
export default function SettingsProvider({ children }) {
  const [commissionRate, setCommissionRate] = useState(COMMISSION_RATE)

  return (
    <SettingsContext.Provider value={{ commissionRate, setCommissionRate }}>
      {children}
    </SettingsContext.Provider>
  )
}