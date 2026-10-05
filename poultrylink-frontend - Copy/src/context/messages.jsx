import { createContext, useContext, useState } from 'react'

const MessagesContext = createContext(null)

export function MessagesProvider({ children }) {
  const [threads, setThreads] = useState({})

  const startOrGetThread = (listingId, product, buyerName, sellerName) => {
    const key = `${listingId}_${buyerName}_${sellerName}`
    
    if (!threads[key]) {
      setThreads((prev) => ({
        ...prev,
        [key]: {
          key,
          listingId,
          product,
          buyer: buyerName,
          seller: sellerName,
          messages: [
            {
              id: 1,
              sender: buyerName,
              text: `Hi ${sellerName}, I am interested in your listing for ${product}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        },
      }))
    }
    return key
  }

  const sendMessage = (threadKey, sender, text) => {
    setThreads((prev) => {
      const thread = prev[threadKey]
      if (!thread) return prev

      const newMessage = {
        id: Date.now(),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      return {
        ...prev,
        [threadKey]: {
          ...thread,
          messages: [...thread.messages, newMessage],
        },
      }
    })
  }

  return (
    <MessagesContext.Provider value={{ threads, startOrGetThread, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}

export const useMessages = () => useContext(MessagesContext)