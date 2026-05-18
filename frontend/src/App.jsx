import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/.netlify/functions/api'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const llm_Response = await response.text()

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`

        try {
          const parsedError = JSON.parse(llm_Response)
          const detail = parsedError.detail || parsedError.error
          if (detail) {
            errorMessage = detail
          }
        } catch {
          if (llm_Response) {
            errorMessage = llm_Response
          }
        }

        throw new Error(errorMessage)
      }

      if (llm_Response.trim().startsWith('<!DOCTYPE html')) {
        throw new Error('Received HTML instead of model output')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: llm_Response }])
    } catch (error) {
      const errorMessage = error?.message || 'Connection failed. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: `Request failed: ${errorMessage}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  }

  return (
    <div className="app-container">
      <div className="background-layers">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="noise-overlay" />
      </div>

      <header className="app-header">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="header-content"
        >
          <div className="brand-mark">
            <span className="brand-dot" />
            <span className="brand-line" />
          </div>
          <h1 className="app-title">
            <span className="title-text">ULTA-GPT</span>
            <span className="title-accent">Assistant Maybe?</span>
          </h1>
        </motion.div>
      </header>

      <main className="app-main">
        <div className="messages-container">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state"
              >
                <div className="empty-icon">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12C8 8.68629 10.6863 6 14 6H34C37.3137 6 40 8.68629 40 12V36C40 39.3137 37.3137 42 34 42H14C10.6863 42 8 39.3137 8 36V12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 22H32M16 28H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="empty-text">Begin a conversation</p>
                <p className="empty-subtext">Ask anything, explore ideas</p>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="messages-list"
              >
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-avatar">
                        {msg.role === 'user' ? (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="message-content">
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="typing-indicator"
                  >
                    <div className="typing-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="input-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
          <p className="input-hint">Press Enter to send</p>
        </motion.form>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg-primary: #0a0a0b;
          --bg-secondary: #111113;
          --bg-tertiary: #18181b;
          --text-primary: #fafafa;
          --text-secondary: #a1a1aa;
          --text-muted: #71717a;
          --accent-gold: #d4a853;
          --accent-gold-dim: #a68242;
          --accent-copper: #c9784a;
          --border-subtle: rgba(255, 255, 255, 0.06);
          --border-accent: rgba(212, 168, 83, 0.3);
          --shadow-glow: rgba(212, 168, 83, 0.15);
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .background-layers {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%);
          top: -200px;
          right: -100px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(201, 120, 74, 0.1) 0%, transparent 70%);
          bottom: -150px;
          left: -100px;
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        .app-header {
          padding: 2rem 1.5rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-gold);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--accent-gold);
        }

        .brand-line {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, var(--accent-gold), transparent);
        }

        .app-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.75rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .title-text {
          color: var(--text-primary);
        }

        .title-accent {
          color: var(--accent-gold);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem 2rem;
          position: relative;
          z-index: 10;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
          scrollbar-width: thin;
          scrollbar-color: var(--border-subtle) transparent;
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 2px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-text {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-subtext {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 300;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .message-wrapper {
          display: flex;
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-wrapper.assistant {
          justify-content: flex-start;
        }

        .message-bubble {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-wrapper.user .message-bubble {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .message-wrapper.assistant .message-avatar {
          background: linear-gradient(135deg, var(--accent-gold-dim), var(--accent-copper));
          color: var(--bg-primary);
        }

        .message-avatar svg {
          width: 16px;
          height: 16px;
        }

        .message-content {
          padding: 1rem 1.25rem;
          border-radius: 16px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.9375rem;
          line-height: 1.6;
          font-weight: 400;
        }

        .message-wrapper.user .message-content {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
        }

        .message-wrapper.assistant .message-content {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        }

        .message-content p {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .typing-indicator {
          display: flex;
          justify-content: flex-start;
        }

        .typing-bubble {
          display: flex;
          gap: 4px;
          padding: 1rem 1.25rem;
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-gold);
          border-radius: 50%;
          animation: typing 1.4s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .input-form {
          padding-top: 1rem;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          padding: 0.5rem;
          transition: all 0.3s ease;
        }

        .input-wrapper.focused {
          border-color: var(--border-accent);
          box-shadow: 0 0 20px var(--shadow-glow);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.875rem 1rem;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.9375rem;
          color: var(--text-primary);
          outline: none;
        }

        .chat-input::placeholder {
          color: var(--text-muted);
        }

        .send-button {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent-gold), var(--accent-copper));
          border: none;
          border-radius: 12px;
          color: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .send-button:not(:disabled):hover {
          box-shadow: 0 4px 16px var(--shadow-glow);
        }

        .send-button svg {
          width: 18px;
          height: 18px;
        }

        .input-hint {
          text-align: center;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          font-weight: 300;
        }

        @media (max-width: 640px) {
          .app-header {
            padding: 1.5rem 1rem 1rem;
          }

          .app-title {
            font-size: 1.375rem;
          }

          .title-accent {
            font-size: 0.75rem;
          }

          .app-main {
            padding: 0 1rem 1.5rem;
          }

          .message-bubble {
            max-width: 90%;
          }

          .message-content {
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}

export default App