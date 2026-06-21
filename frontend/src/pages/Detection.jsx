import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Disclaimer from '../components/Disclaimer'
import LoadingSpinner from '../components/LoadingSpinner'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function Detection() {
  const [mode, setMode] = useState('upload')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload a JPG, PNG, or WebP image.')
      e.target.value = ''
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const handlePredict = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    const prevResult = result
    try {
      const formData = new FormData()
      formData.append('image', image)
      
      let res;
      try {
        res = await axios.post('/api/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        })
      } catch (firstErr) {
        console.warn('First prediction attempt failed, retrying...', firstErr)
        res = await axios.post('/api/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        })
      }
      setResult(res.data)
    } catch (err) {
      console.error('Prediction failed after retries:', err)
      setError('We could not complete the prediction. Please check your network and try again.')
      if (prevResult) setResult(prevResult)
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      // First try to get the back camera (environment)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: 640, height: 480 }
        })
      } catch (err) {
        // Fallback to any available camera if back camera is not found
        console.warn('Environment camera not found, falling back to any camera', err)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
      }
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Important: we need to wait for loadedmetadata before playing in some browsers
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }
      setCameraActive(true)
      setResult(null)
      setError(null)
    } catch (err) {
      console.error('Camera access error:', err)
      setError(`Could not access camera: ${err.message || 'Please allow camera permissions.'}`)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)

    setLoading(true)
    setError(null)
    const prevResult = result
    try {
      let res;
      try {
        res = await axios.post('/api/predict-camera', { image: dataUrl }, { timeout: 15000 })
      } catch (firstErr) {
        console.warn('First camera prediction attempt failed, retrying...', firstErr)
        res = await axios.post('/api/predict-camera', { image: dataUrl }, { timeout: 15000 })
      }
      setResult(res.data)
    } catch (err) {
      console.error('Camera prediction failed after retries:', err)
      setError('We could not complete the analysis. Please check your network and try again.')
      if (prevResult) setResult(prevResult)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-8">
      <div>
        <h1 className="page-title">🩺 Ulcer Detection</h1>
        <p className="page-subtitle">Upload a foot image for instant AI-powered DFU screening</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="glass-card-xl p-8 flex flex-col justify-center">
          {/* Mode Toggle */}
          <div className="flex gap-3 mb-7">
            <button
              id="mode-upload"
              onClick={() => { setMode('upload'); stopCamera() }}
              className={mode === 'upload' ? 'btn-primary' : 'btn-glass'}
            >
              📁 Upload Image
            </button>
            <button
              id="mode-camera"
              onClick={() => { setMode('camera'); startCamera() }}
              className={mode === 'camera' ? 'btn-primary' : 'btn-glass'}
            >
              📸 Camera
            </button>
          </div>
          <h3
            className="text-base font-semibold mb-5 flex items-center gap-2"
            style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
          >
            {mode === 'upload' ? '📤 Upload Foot Image' : '📹 Camera Capture'}
          </h3>

          {mode === 'upload' ? (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300"
                style={{
                  borderColor: dragOver ? '#39ff14' : 'rgba(255,255,255,0.15)',
                  background: dragOver ? 'rgba(57,255,20,0.04)' : 'rgba(255,255,255,0.02)',
                  boxShadow: dragOver ? '0 0 30px rgba(57,255,20,0.08)' : 'none',
                }}
              >
                <div className="text-5xl mb-4" style={{ filter: dragOver ? 'drop-shadow(0 0 10px #39ff14)' : 'none' }}>
                  🖼️
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Drag & drop an image or click to browse
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Supports JPG, PNG, WEBP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
              </div>

              {preview && (
                <div className="mt-5">
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(57,255,20,0.15)' }}
                  >
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
                  </div>
                  <button
                    id="predict-btn"
                    onClick={handlePredict}
                    className="btn-primary w-full mt-4"
                    disabled={loading}
                    style={{ display: 'block' }}
                  >
                    {loading ? '⏳ Analyzing...' : '🔍 Analyze Image'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  minHeight: '300px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-2xl"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                {!cameraActive && (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <div className="text-4xl mb-3 animate-float">📷</div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Camera initializing...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              {cameraActive && (
                <div className="flex gap-3 mt-5">
                  <button id="capture-btn" onClick={captureAndPredict} className="btn-primary flex-1" disabled={loading}>
                    {loading ? '⏳ Analyzing...' : '📸 Capture & Analyze'}
                  </button>
                  <button onClick={stopCamera} className="btn-danger">Stop</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Result Section */}
        <div>
          {loading && <LoadingSpinner text="Analyzing foot image with AI..." />}

          {error && (
            <div className="glass-card p-6 glow-red">
              <div className="text-center">
                <div className="text-4xl mb-3">❌</div>
                <p className="text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Result Card */}
              <div
                className={`glass-card p-8 text-center mb-5 ${result.is_ulcer ? 'glow-red animate-pulse-red' : 'glow-green animate-pulse-green'}`}
              >
                <div className="text-6xl mb-4">{result.is_ulcer ? '🚨' : '✅'}</div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: result.is_ulcer ? '#ff5555' : '#39ff14',
                    letterSpacing: '0.04em',
                  }}
                >
                  {result.is_ulcer ? 'ULCER DETECTED' : 'NORMAL FOOT'}
                </h2>
                <p className="text-sm mb-6 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {result.is_ulcer ? 'Consult a Doctor Immediately' : 'Healthy Skin Detected'}
                </p>

                {/* Confidence Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>Confidence Score</span>
                    <span style={{ color: result.is_ulcer ? '#ff5555' : '#39ff14' }}>{result.confidence}%</span>
                  </div>
                  <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: result.is_ulcer
                          ? 'linear-gradient(90deg, #ff4444, #ff7777)'
                          : 'linear-gradient(90deg, #39ff14, #7fff00)',
                        boxShadow: result.is_ulcer
                          ? '0 0 10px rgba(255,68,68,0.5)'
                          : '0 0 10px rgba(57,255,20,0.5)',
                      }}
                    />
                  </div>
                </div>

                <span
                  className="text-xs px-4 py-2 rounded-xl inline-block"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Raw Score: {result.raw_score}
                </span>
              </div>

              {/* Grad-CAM */}
              {result.gradcam && (
                <div className="glass-card p-6 mb-5">
                  <h3
                    className="text-base font-semibold mb-2 flex items-center gap-2"
                    style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
                  >
                    🔥 Grad-CAM Heatmap
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Highlighted areas show where the AI focused its attention
                  </p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={result.gradcam} alt="Grad-CAM Heatmap" className="w-full max-h-64 object-contain" />
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div
                className="p-4 rounded-2xl text-center text-sm font-medium"
                style={{
                  background: 'rgba(255,165,0,0.07)',
                  border: '1px solid rgba(255,165,0,0.18)',
                  color: '#fbbf24',
                  lineHeight: '1.6',
                }}
              >
                ⚠️ {result.disclaimer}
              </div>
            </motion.div>
          )}

          {!result && !loading && !error && (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-7xl mb-5 animate-float">🦶</div>
              <p className="text-base font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Ready for Analysis
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upload or capture a foot image to begin AI analysis
              </p>
            </div>
          )}
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
