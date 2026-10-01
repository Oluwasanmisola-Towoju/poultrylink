import { createContext, useContext } from 'react'

export const MessagesContext = createContext(null)

export const useMessages = () => useContext(MessagesContext)