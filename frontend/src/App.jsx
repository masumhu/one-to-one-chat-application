import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

const API_URL = 'http://localhost:8080'

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'))
  const [email, setEmail] = useState(sessionStorage.getItem('email'))
  const [mode, setMode] = useState('login')

  function handleLogin(newToken, userEmail) {
    sessionStorage.setItem('token', newToken)
    sessionStorage.setItem('email', userEmail)
    setToken(newToken)
    setEmail(userEmail)
  }

  function logout() {
    sessionStorage.clear()
    setToken(null)
    setEmail(null)
  }

  if (!token) {
    return (
      <AuthPage
        mode={mode}
        setMode={setMode}
        onLogin={handleLogin}
      />
    )
  }

  return <ChatPage token={token} email={email} onLogout={logout} />
}

function AuthPage({ mode, setMode, onLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(formatError(data))
        }

        setMode('login')
        setPassword('')
        setError('Registration successful. Please login.')
        return
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.text()

      if (!response.ok) {
        throw new Error(formatError(data))
      }

      const jwt = typeof data === 'string' ? data : data?.token

      if (!jwt) {
        throw new Error('Login succeeded but no token was returned.')
      }

      onLogin(jwt, email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>One to One Chat</h1>
        <p className="subtitle">
          {mode === 'login' ? 'Login to continue' : 'Create your account'}
        </p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {error && <div className="message-box">{error}</div>}

          <button className="primary-button" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          className="link-button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
        >
          {mode === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}

function ChatPage({ token, email, onLogout }) {
  const stompClient = useRef(null)
  const activeConversationRef = useRef(null)

  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  useEffect(() => {
    loadUsers()
    loadConversations()

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/messages', (frame) => {
          const message = JSON.parse(frame.body)
          setMessages((current) => {
            const currentConversation = activeConversationRef.current

            if (
                !currentConversation ||
                message.conversationId !== currentConversation.id
            ) {
              return current
            }

            return [...current, message]
          })
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        setError(frame.headers.message || 'WebSocket connection error')
      },
      onWebSocketError: () => {
        setError('Could not connect to the chat server.')
      },
    })

    client.activate()
    stompClient.current = client

    return () => {
      client.deactivate()
    }
  }, [token])

  async function loadUsers() {
    try {
      const data = await apiRequest('/api/auth/users', token)
      setUsers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadConversations() {
    try {
      const data = await apiRequest('/conversations', token)
      setConversations(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function openConversation(userEmail) {
    try {
      const conversation = await apiRequest('/conversations', token, {
        method: 'POST',
        body: JSON.stringify({ user2: userEmail }),
      })

      setActiveConversation(conversation)
      setConversations((current) => {
        const exists = current.some((item) => item.id === conversation.id)
        return exists ? current : [...current, conversation]
      })
      await loadMessages(conversation.id)
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadMessages(conversationId) {
    try {
      const data = await apiRequest(
        `/conversations/${conversationId}/messages`,
        token,
      )
      setMessages(data)
    } catch (err) {
      setError(err.message)
    }
  }

  function selectConversation(conversation) {
    setActiveConversation(conversation)
    loadMessages(conversation.id)
  }

  function sendMessage(event) {
    event.preventDefault()

    if (!messageText.trim() || !activeConversation) {
      return
    }

    const receiver = getOtherUser(activeConversation, email)

    if (!stompClient.current || !connected) {
      setError('Chat connection is not ready yet.')
      return
    }

    const message = {
      receiver,
      content: messageText.trim(),
      conversationId: activeConversation.id,
    }

    stompClient.current.publish({
      destination: '/app/chat',
      body: JSON.stringify(message),
    })

    setMessages((current) => [
      ...current,
      {
        ...message,
        sender: email,
        timestamp: new Date().toISOString(),
      },
    ])

    setMessageText('')
  }

  const otherUsers = users.filter((user) => user.email !== email)

  return (
    <div className="chat-page">
      <header className="topbar">
        <div>
          <h1>One to One Chat</h1>
          <span className={connected ? 'status online' : 'status'}>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="account-area">
          <span>{email}</span>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="global-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <main className="chat-layout">
        <aside className="sidebar">
          <section>
            <h2>Users</h2>
            <div className="list">
              {otherUsers.length === 0 && <p className="empty">No other users.</p>}
              {otherUsers.map((user) => (
                <button
                  className="user-item"
                  key={user.id}
                  onClick={() => openConversation(user.email)}
                >
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2>Conversations</h2>
            <div className="list">
              {conversations.length === 0 && (
                <p className="empty">No conversations yet.</p>
              )}
              {conversations.map((conversation) => {
                const otherEmail = getOtherUser(conversation, email)
                return (
                  <button
                    className={`conversation-item ${
                      activeConversation?.id === conversation.id ? 'active' : ''
                    }`}
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                  >
                    {otherEmail}
                  </button>
                )
              })}
            </div>
          </section>
        </aside>

        <section className="chat-window">
          {!activeConversation ? (
            <div className="welcome">
              <h2>Select a user to start chatting</h2>
              <p>Your previous conversations will appear on the left.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h2>{getOtherUser(activeConversation, email)}</h2>
              </div>

              <div className="messages">
                {messages.length === 0 && (
                  <p className="empty">No messages yet. Say hello!</p>
                )}
                {messages.map((message, index) => {
                  const mine = message.sender === email
                  return (
                    <div
                      className={`message-row ${mine ? 'mine' : 'theirs'}`}
                      key={`${message.id || 'local'}-${index}`}
                    >
                      <div className="message-bubble">
                        <p>{message.content}</p>
                        <small>
                          {message.timestamp
                            ? new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form className="message-form" onSubmit={sendMessage}>
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Type a message..."
                />
                <button className="primary-button">Send</button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(formatError(data))
  }

  return data
}

function formatError(data) {
  if (!data) {
    return 'Something went wrong.'
  }

  if (typeof data === 'string') {
    return data
  }

  if (typeof data === 'object') {
    return Object.values(data).join(', ')
  }

  return 'Something went wrong.'
}

function getOtherUser(conversation, currentEmail) {
  return conversation.user1 === currentEmail
    ? conversation.user2
    : conversation.user1
}

export default App
