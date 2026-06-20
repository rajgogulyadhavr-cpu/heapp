import { motion } from 'framer-motion'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function About() {
  const techStack = [
    { name: 'React 18', category: 'Frontend', icon: '⚛️' },
    { name: 'Vite', category: 'Bundler', icon: '⚡' },
    { name: 'Tailwind CSS', category: 'Styling', icon: '🎨' },
    { name: 'Framer Motion', category: 'Animations', icon: '✨' },
    { name: 'Flask', category: 'Backend', icon: '🐍' },
    { name: 'TensorFlow / Keras', category: 'AI Engine', icon: '🧠' },
    { name: 'EfficientNetB0', category: 'Neural Base', icon: '🔬' },
    { name: 'OpenCV', category: 'Image Processing', icon: '👁️' },
    { name: 'SpeechRecognition', category: 'Voice Input', icon: '🎤' },
    { name: 'gTTS', category: 'Voice Synthesis', icon: '🔊' },
    { name: 'Leaflet.js', category: 'Mapping', icon: '🗺️' },
  ]

  const stats = [
    { label: 'Early Detection', value: '85%', sub: 'amputation reduction potential', color: '#39ff14' },
    { label: 'DFU Prevalence', value: '15%', sub: 'of diabetic patients', color: '#fbbf24' },
    { label: 'Risk Factor', value: '25×', sub: 'higher amputation risk', color: '#ff6b6b' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto">
      <h1 className="page-title">ℹ️ About Foot Guard AI</h1>
      <p className="page-subtitle">Learn more about the technology and mission behind this early screening system</p>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 text-center"
            style={{
              borderColor: `${stat.color}22`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${stat.color}0a`,
            }}
          >
            <div
              className="text-4xl font-bold mb-1"
              style={{ color: stat.color, fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
            >
              {stat.value}
            </div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{stat.label}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Mission Card */}
      <div className="glass-card p-8 mb-6">
        <h2
          className="text-xl font-bold mb-4 flex items-center gap-3"
          style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
        >
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
            style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
          >
            🎯
          </span>
          Our Mission
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text)' }}>
          Diabetic Foot Ulcers (DFUs) are one of the most severe complications of diabetes, often leading to lower-limb amputations if left untreated. Research shows that early screening, regular monitoring, and proper foot care can prevent up to <strong style={{ color: '#39ff14' }}>85%</strong> of DFU-related amputations.
        </p>
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text)' }}>
          <strong style={{ color: '#39ff14' }}>Foot Guard AI</strong> was developed as a state-of-the-art early detection tool to help diabetic patients and healthcare providers monitor foot health. Using advanced computer vision and machine learning (EfficientNetB0 fine-tuned on clinical patches), the application detects patterns associated with diabetic ulcers.
        </p>
        <div
          className="p-5 rounded-2xl text-sm"
          style={{
            background: 'rgba(255,68,68,0.06)',
            border: '1px solid rgba(255,68,68,0.15)',
            color: '#fca5a5',
            lineHeight: '1.7',
          }}
        >
          <strong>⚠️ Important Clinical Notice:</strong> This software is an experimental screening tool. It is NOT certified for clinical diagnostic use. It does not replace visual and physical inspection by a podiatrist or physician. Always consult a medical professional for actual diagnosis and treatment plans.
        </div>
      </div>

      {/* Tech Stack Card */}
      <div className="glass-card p-8 mb-6">
        <h2
          className="text-xl font-bold mb-2 flex items-center gap-3"
          style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
        >
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
            style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
          >
            🛠️
          </span>
          Technology Stack
        </h2>
        <p className="text-xs mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Modern, performant web technologies powering the Foot Guard AI environment:
        </p>
        <div className="flex flex-wrap gap-3">
          {techStack.map((tech, i) => (
            <div key={i} className="tech-pill">
              <span className="text-base">{tech.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                {tech.name}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="glass-card p-8 mb-6">
        <h2
          className="text-xl font-bold mb-4 flex items-center gap-3"
          style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
        >
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
            style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}
          >
            📬
          </span>
          Support & Contact
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text)' }}>
          If you have questions, feedback, or would like to contribute to this open-source DFU awareness initiative, please get in touch.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(57,255,20,0.04)',
              border: '1px solid rgba(57,255,20,0.12)',
            }}
          >
            <h4 className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              📧 Email Support
            </h4>
            <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              support@footguard.ai
            </p>
          </div>
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(57,255,20,0.04)',
              border: '1px solid rgba(57,255,20,0.12)',
            }}
          >
            <h4 className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              💻 Project Code
            </h4>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              github.com/footguardai/screening
            </p>
          </div>
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
