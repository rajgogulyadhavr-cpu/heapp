import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function UraiAI() {
  const language = localStorage.getItem('language') || 'english'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await axios.post('/api/urai/chat', { message: userMsg, language }, { timeout: 12000 })
      setMessages(prev => [...prev, {
        role: 'ai',
        text: res.data.response,
        disclaimer: res.data.disclaimer
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: language === 'english'
          ? 'Sorry, something went wrong. Please try again.'
          : 'மன்னிக்கவும், ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const quickQuestions = language === 'english'
    ? ['What is DFU?', 'Symptoms', 'Prevention', 'Diet Tips', 'Foot Care', 'When to see doctor?']
    : ['DFU என்றால் என்ன?', 'அறிகுறிகள்', 'தடுப்பு', 'உணவு குறிப்புகள்', 'கால் பராமரிப்பு']

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <h1 className="page-title" style={{ marginBottom: '4px', fontSize: '1.7rem' }}>
        {language === 'english' ? '💬 Urai AI' : '💬 உரை AI'}
      </h1>
      <p className="page-subtitle" style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
        {language === 'english' ? 'Text-based DFU Awareness Chatbot' : 'உரை சார்ந்த நீரிழிவு நோய் விழிப்புணர்வு சாட்போட்'}
      </p>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="text-xs px-4 py-2 rounded-full transition-all duration-300"
            style={{
              background: 'rgba(57,255,20,0.06)',
              border: '1px solid rgba(57,255,20,0.16)',
              color: 'var(--color-accent)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57,255,20,0.12)'
              e.currentTarget.style.boxShadow = '0 0 12px rgba(57,255,20,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(57,255,20,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 glass-card-xl p-8 mb-6 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-[5rem] mb-6 animate-float">🤖</div>
            <p
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-primary)' }}
            >
              {language === 'english' ? 'Hello! I am Urai AI' : 'வணக்கம்! நான் உரை AI'}
            </p>
            <p className="text-[1rem] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {language === 'english'
                ? 'Type your question about diabetic foot ulcers below.'
                : 'நீரிழிவு கால் புண்கள் பற்றிய உங்கள் கேள்வியை கீழே தட்டச்சு செய்யவும்.'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}
          >
            {msg.role === 'ai' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 shrink-0 mt-1"
                style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
              >
                🤖
              </div>
            )}
            <div className="max-w-[78%] p-6 text-[0.95rem] leading-relaxed" style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(57,255,20,0.18), rgba(57,255,20,0.08))'
                  : 'rgba(255,255,255,0.08)',
                border: msg.role === 'user'
                  ? '1px solid rgba(57,255,20,0.3)'
                  : '1px solid rgba(255,255,255,0.12)',
                borderRadius: msg.role === 'user' ? '28px 28px 8px 28px' : '28px 28px 28px 8px',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-primary)',
                fontWeight: 500,
                backdropFilter: 'blur(16px)',
                boxShadow: msg.role === 'user' ? '0 8px 24px rgba(57,255,20,0.1)' : '0 8px 24px rgba(0,0,0,0.2)',
              }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{msg.text}</p>
                {msg.role === 'ai' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="text-[11px] px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
                {msg.role === 'ai' && (
                <p
                  className="text-[10px] mt-2"
                  style={{ color: '#fca5a5', fontFamily: 'Poppins, sans-serif' }}
                >
                  ⚠️ {msg.disclaimer || 'Please consult a doctor for proper diagnosis.'}
                </p>
              )}
            </div>
            {msg.role === 'user' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm ml-3 shrink-0 mt-1"
                style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}
              >
                👤
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 shrink-0"
              style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
            >
              🤖
            </div>
            <div
              className="px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((delay, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#39ff14] animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card-xl p-5 mb-4">
        <div className="flex gap-4 items-center">
          <input
            id="urai-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language === 'english' ? 'Type your question here...' : 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்...'}
            className="neon-input flex-1 hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-shadow duration-300"
          />
          <button
            id="urai-send-btn"
            onClick={sendMessage}
            className="btn-primary px-6 hover:scale-105 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300"
            disabled={loading}
            style={{ whiteSpace: 'nowrap' }}
          >
            {language === 'english' ? '➤ Send' : '➤ அனுப்பு'}
          </button>
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
