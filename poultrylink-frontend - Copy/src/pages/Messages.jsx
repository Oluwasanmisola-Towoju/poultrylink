import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useMessages } from '../context/messages'

const formatWhen = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Messages() {
  const { user } = useAuth()
  const { threads, threadsFor, sendMessage } = useMessages()
  const [searchParams] = useSearchParams()
  const [activeKey, setActiveKey] = useState(searchParams.get('thread'))
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const mine = threadsFor(user.name)
  const active = activeKey ? threads[activeKey] : null

  useEffect(() => {
    if (searchParams.get('thread')) setActiveKey(searchParams.get('thread'))
  }, [searchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' })
  }, [active?.messages.length])

  const otherParty = (thread) => (thread.buyer === user.name ? thread.seller : thread.buyer)

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || !activeKey) return
    sendMessage(activeKey, user.name, text.trim())
    setText('')
  }

  return (
    <>
      <h1>Messages</h1>
      {mine.length === 0 ? (
        <p className="empty">No conversations yet. Message a seller from a listing to start one.</p>
      ) : (
        <div className="messages-layout">
          <ul className="thread-list">
            {mine.map(([key, thread]) => (
              <li key={key}>
                <button
                  className={`thread-item${key === activeKey ? ' active' : ''}`}
                  onClick={() => setActiveKey(key)}
                >
                  <strong>{otherParty(thread)}</strong>
                  <span className="muted small">{thread.listingTitle}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="thread-view">
            {!active ? (
              <p className="empty">Select a conversation.</p>
            ) : (
              <>
                <div className="thread-head">
                  <strong>{otherParty(active)}</strong>
                  <span className="muted small">{active.listingTitle}</span>
                </div>
                <div className="thread-body">
                  {active.messages.length === 0 && (
                    <p className="muted small">No messages yet. Say hello.</p>
                  )}
                  {active.messages.map((m, i) => (
                    <div key={i} className={`bubble${m.from === user.name ? ' mine' : ''}`}>
                      <p>{m.text}</p>
                      <span className="muted small">{formatWhen(m.at)}</span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={handleSend} className="thread-form">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a message"
                    aria-label="Message"
                  />
                  <button className="btn" type="submit">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}