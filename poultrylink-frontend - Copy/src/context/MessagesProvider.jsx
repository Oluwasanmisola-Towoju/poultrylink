import { useState } from 'react'
import { MessagesContext } from './messages'

// A thread is keyed by listing + the two participants, so the same
// buyer and seller get one conversation per listing.
const threadKey = (listingId, a, b) => [listingId, ...[a, b].sort()].join('::')

export default function MessagesProvider({ children }) {
  const [threads, setThreads] = useState({}) // key -> { listingId, listingTitle, buyer, seller, messages: [] }

  const startOrGetThread = (listingId, listingTitle, buyer, seller) => {
    const key = threadKey(listingId, buyer, seller)
    setThreads((prev) =>
      prev[key] ? prev : { ...prev, [key]: { listingId, listingTitle, buyer, seller, messages: [] } },
    )
    return key
  }

  const sendMessage = (key, from, text) => {
    setThreads((prev) => {
      const thread = prev[key]
      if (!thread) return prev
      const message = { from, text, at: new Date().toISOString() }
      return { ...prev, [key]: { ...thread, messages: [...thread.messages, message] } }
    })
  }

  const threadsFor = (name) => Object.entries(threads).filter(
    ([, t]) => t.buyer === name || t.seller === name,
  )

  return (
    <MessagesContext.Provider value={{ threads, startOrGetThread, sendMessage, threadsFor }}>
      {children}
    </MessagesContext.Provider>
  )
}