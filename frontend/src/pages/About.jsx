import { motion } from 'framer-motion'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function About() {
  const stats = [
    { label: 'Model Accuracy', value: '91.8%', sub: 'Validated on clinical test set', color: '#39ff14' },
    { label: 'Screening Time', value: '< 2s', sub: 'Instant preliminary results', color: '#39ff14' },
    { label: 'Focus Areas', value: '4+', sub: 'DFU, Ischemia, Infection, Normal', color: '#39ff14' },
  ]

  const techStack = [
    { name: 'React', category: 'Frontend UI', icon: '⚛️' },
    { name: 'Vite', category: 'Build Tool', icon: '⚡' },
    { name: 'TailwindCSS', category: 'Styling', icon: '🎨' },
    { name: 'Python', category: 'Backend logic', icon: '🐍' },
    { name: 'Flask', category: 'API Server', icon: '🌶️' },
    { name: 'TensorFlow', category: 'Deep Learning', icon: '🧠' },
    { name: 'OpenCV', category: 'Image Processing', icon: '👁️' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="page-title">ℹ️ About FootGuard AI</h1>
        <p className="page-subtitle">Pioneering early detection of Diabetic Foot Ulcers using Artificial Intelligence</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card-xl p-8 flex flex-col items-center text-center"
            style={{
              borderColor: `${stat.color}22`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${stat.color}0a`,
            }}
          >
            <div
              className="text-5xl font-bold mb-3"
              style={{ color: stat.color, fontFamily: 'var(--font-primary)', letterSpacing: '-0.02em' }}
            >
              {stat.value}
            </div>
            <div className="text-[1rem] font-bold mb-1" style={{ color: 'var(--color-text)' }}>{stat.label}</div>
            <div className="text-[0.85rem] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Mission Card */}
      <div className="glass-card-xl p-10">
        <h2
          className="section-title mb-6"
        >
          Our Mission
        </h2>
        <p className="text-[0.95rem] leading-relaxed mb-5" style={{ color: 'var(--color-text)' }}>
          Diabetic Foot Ulcers (DFUs) are one of the most severe complications of diabetes, often leading to lower-limb amputations if left untreated. Research shows that early screening, regular monitoring, and proper foot care can prevent up to <strong style={{ color: '#39ff14' }}>85%</strong> of DFU-related amputations.
        </p>
        <p className="text-[0.95rem] leading-relaxed mb-6" style={{ color: 'var(--color-text)' }}>
          <strong style={{ color: '#39ff14' }}>Foot Guard AI</strong> was developed as a state-of-the-art early detection tool to help diabetic patients and healthcare providers monitor foot health. Using advanced computer vision and machine learning (EfficientNetB0 fine-tuned on clinical patches), the application detects patterns associated with diabetic ulcers.
        </p>
        <div
          className="p-6 rounded-2xl text-[0.9rem]"
          style={{
            background: 'rgba(255,68,68,0.06)',
            border: '1px solid rgba(255,68,68,0.15)',
            color: '#fca5a5',
            lineHeight: '1.8',
          }}
        >
          <strong>⚠️ Important Clinical Notice:</strong> This software is an experimental screening tool. It is NOT certified for clinical diagnostic use. It does not replace visual and physical inspection by a podiatrist or physician. Always consult a medical professional for actual diagnosis and treatment plans.
        </div>
      </div>

      {/* Tech Stack Card */}
      <div className="glass-card-xl p-10">
        <h2
          className="section-title mb-6"
        >
          Technology Stack
        </h2>
        <p className="text-[0.9rem] mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Modern, performant web technologies powering the Foot Guard AI environment:
        </p>
        <div className="flex flex-wrap gap-4">
          {techStack.map((tech, i) => (
            <div key={i} className="tech-pill">
              <span className="text-xl mb-1">{tech.icon}</span>
              <span className="text-[0.95rem] font-bold" style={{ color: 'var(--color-accent)' }}>
                {tech.name}
              </span>
              <span className="text-[0.8rem] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="glass-card-xl p-10">
        <h2
          className="section-title mb-6"
        >
          Support & Contact
        </h2>
        <p className="text-[0.95rem] leading-relaxed mb-6" style={{ color: 'var(--color-text)' }}>
          If you have questions, feedback, or would like to contribute to this open-source DFU awareness initiative, please get in touch.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3 className="text-[0.95rem] font-bold mb-2" style={{ color: 'var(--color-accent)' }}>Bug Reports</h3>
            <p className="text-[0.85rem] leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>Found an issue with the AI prediction or UI? Let us know.</p>
            <a href="#" className="text-[0.85rem] font-bold underline" style={{ color: '#39ff14' }}>Open Issue →</a>
          </div>
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3 className="text-[0.95rem] font-bold mb-2" style={{ color: 'var(--color-accent)' }}>Medical Inquiries</h3>
            <p className="text-[0.85rem] leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>For hospital partnerships or medical validation.</p>
            <a href="mailto:support@footguard.ai" className="text-[0.85rem] font-bold underline" style={{ color: '#39ff14' }}>Contact Team →</a>
          </div>
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
