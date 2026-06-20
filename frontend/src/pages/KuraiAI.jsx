import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function KuraiAI() {
  const language = localStorage.getItem('language') || 'english'
  const [messages, setMessages] = useState([])
  const [textInput, setTextInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const handleTextSubmit = async () => {
    if (!textInput.trim() || loading) return
    const userMsg = textInput.trim()
    setTextInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await axios.post('/api/kurai/text', { message: userMsg, language })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response, audio: res.data.audio }])
      if (res.data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`)
        audio.play().catch(() => {})
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setMessages(prev => [...prev, { role: 'user', text: '🎤 Voice message sent...' }])
        setLoading(true)

        try {
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          formData.append('language', language)
          const res = await axios.post('/api/kurai/voice', formData)
          const transcript = res.data.transcript ? `🎤 "${res.data.transcript}"` : '🎤 Voice message'
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'user', text: transcript }
            return [...updated, { role: 'ai', text: res.data.response, audio: res.data.audio }]
          })
          if (res.data.audio) {
            const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`)
            audio.play().catch(() => {})
          }
        } catch {
          setMessages(prev => [...prev, { role: 'ai', text: 'Could not process voice. Try text input instead.' }])
        } finally {
          setLoading(false)
        }
      }

      mediaRecorder.start()
      setRecording(true)
    } catch {
      alert('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const replayAudio = (audioBase64) => {
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`)
      audio.play().catch(() => {})
    }
  }

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
        {language === 'english' ? '🎤 Kurai AI' : '🎤 குரை AI'}
      </h1>
      <p className="page-subtitle" style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
        {language === 'english' ? 'Voice-powered DFU Awareness Assistant' : 'குரல் மூலம் இயங்கும் நீரிழிவு நோய் விழிப்புணர்வு உதவியாளர்'}
      </p>

      {/* Chat Area */}
      <div
        className="flex-1 glass-card p-5 mb-4 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-7xl mb-5 animate-float">🎤</div>
            <p
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
            >
              {language === 'english' ? 'Hello! I am Kurai AI' : 'வணக்கம்! நான் குரை AI'}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {language === 'english'
                ? 'Ask me about diabetic foot ulcers using voice or text'
                : 'நீரிழிவு கால் புண்கள் பற்றி குரல் அல்லது உரை மூலம் கேளுங்கள்'}
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
            <div
              className="max-w-[78%] p-5 text-base leading-relaxed"
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(57,255,20,0.18), rgba(57,255,20,0.08))'
                  : 'rgba(255,255,255,0.08)',
                border: msg.role === 'user'
                  ? '1px solid rgba(57,255,20,0.3)'
                  : '1px solid rgba(255,255,255,0.12)',
                borderRadius: msg.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                color: 'var(--color-text)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              {msg.text}
              {msg.audio && msg.role === 'ai' && (
                <button
                  onClick={() => replayAudio(msg.audio)}
                  className="ml-2 text-[11px] px-3 py-1 rounded-lg mt-2 inline-flex items-center gap-1"
                  style={{
                    background: 'rgba(57,255,20,0.1)',
                    color: '#39ff14',
                    border: '1px solid rgba(57,255,20,0.25)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  🔊 Replay
                </button>
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
          <div className="flex justify-start mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 shrink-0"
              style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
            >
              🤖
            </div>
            <div
              className="px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
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
      </div>

      {/* Input Area */}
      <div className="glass-card p-4">
        <div className="flex gap-3 items-center">
          <button
            id="voice-btn"
            onClick={recording ? stopRecording : startRecording}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 shrink-0 hover:scale-105"
            style={{
              background: recording
                ? 'linear-gradient(135deg, #ff4444, #cc2200)'
                : 'linear-gradient(135deg, #39ff14, #22c55e)',
              boxShadow: recording
                ? '0 0 24px rgba(255,68,68,0.6)'
                : '0 0 24px rgba(57,255,20,0.5)',
              animation: recording ? 'pulse-red 1s ease-in-out infinite' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {recording ? '⏹️' : '🎤'}
          </button>

          <input
            id="kurai-input"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            placeholder={language === 'english' ? 'Type your question...' : 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...'}
            className="neon-input flex-1 hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-shadow duration-300"
          />

          <button
            id="send-text-btn"
            onClick={handleTextSubmit}
            className="btn-primary px-5 hover:scale-105 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300"
            disabled={loading}
            style={{ height: '46px', minWidth: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ➤
          </button>
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
