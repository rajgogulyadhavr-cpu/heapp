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
  const [micError, setMicError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const blobRef = useRef(null) // store blob for retry

  const handleTextSubmit = async () => {
    if (!textInput.trim() || loading) return
    const userMsg = textInput.trim()
    setTextInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      let res
      try {
        res = await axios.post('/api/kurai/text', { message: userMsg, language }, { timeout: 15000 })
      } catch (firstErr) {
        console.warn('First text attempt failed, retrying...', firstErr)
        // Fresh call — no shared state issue with text requests
        res = await axios.post('/api/kurai/text', { message: userMsg, language }, { timeout: 15000 })
      }
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response, audio: res.data.audio }])
      if (res.data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`)
        audio.play().catch(e => console.warn('Audio playback failed:', e))
      }
    } catch (err) {
      console.error('Text submission error:', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: language === 'english'
            ? 'We could not reach the server right now. Please check your network and try again.'
            : 'சேவையகத்தை அணுக முடியவில்லை. நெட்வொர்க்கை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendVoiceBlob = async (blob) => {
    setMessages(prev => [...prev, { role: 'user', text: '🎤 Voice message sent...' }])
    setLoading(true)

    const makeRequest = () => {
      // Create a FRESH FormData each time — blobs must not be reused across requests
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('language', language)
      return axios.post('/api/kurai/voice', formData, { timeout: 20000 })
    }

    try {
      let res
      try {
        res = await makeRequest()
      } catch (firstErr) {
        console.warn('First voice attempt failed, retrying...', firstErr)
        // Build a fresh FormData with the same blob for the retry
        res = await makeRequest()
      }

      const transcript = res.data.transcript ? `🎤 "${res.data.transcript}"` : '🎤 Voice message'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'user', text: transcript }
        return [...updated, { role: 'ai', text: res.data.response, audio: res.data.audio }]
      })
      if (res.data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`)
        audio.play().catch(e => console.warn('Audio playback failed:', e))
      }
    } catch (err) {
      console.error('Voice processing error:', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: language === 'english'
            ? 'Could not process voice due to a network issue. Please try typing your question instead.'
            : 'நெட்வொர்க் பிழையால் குரலை செயலாக்க முடியவில்லை. உரையில் கேளுங்கள்.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        blobRef.current = blob
        sendVoiceBlob(blob)
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access error:', err)
      setMicError(
        language === 'english'
          ? 'Microphone access denied. Please allow microphone permissions in your browser settings.'
          : 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதி வழங்கவும்.'
      )
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

      {/* Inline mic error banner */}
      {micError && (
        <div
          className="mb-3 px-4 py-3 rounded-2xl text-sm"
          style={{
            background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.25)',
            color: '#fca5a5',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          🎙️ {micError}
        </div>
      )}

      {/* Chat Area */}
      <div
        className="flex-1 glass-card-xl p-8 mb-6 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-[5rem] mb-6 animate-float">🎤</div>
            <p
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-primary)' }}
            >
              {language === 'english' ? 'Hello! I am Kurai AI' : 'வணக்கம்! நான் குரை AI'}
            </p>
            <p className="text-[1rem] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
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
              className="max-w-[78%] p-6 text-[0.95rem] leading-relaxed"
              style={{
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
      <div className="glass-card-xl p-5 mb-4">
        <div className="flex gap-4 items-center">
          <button
            id="voice-btn"
            onClick={recording ? stopRecording : startRecording}
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shrink-0 hover:scale-105"
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
