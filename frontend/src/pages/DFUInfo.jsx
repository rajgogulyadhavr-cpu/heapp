import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Disclaimer from '../components/Disclaimer'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

export default function DFUInfo() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const infoSections = [
    {
      title: 'What is a Diabetic Foot Ulcer (DFU)?',
      icon: '🦶',
      content: 'A diabetic foot ulcer is an open sore or wound that occurs in approximately 15% of patients with diabetes, commonly located on the bottom of the foot. Of those who develop a foot ulcer, 6% will be hospitalized due to infection or other ulcer-related complications. Early detection is vital to prevent severe bone and soft tissue infections.',
    },
    {
      title: 'Common Symptoms of DFU',
      icon: '🚨',
      content: 'Key symptoms to watch out for include redness, swelling, unusual odors coming from the foot, drainage or staining on socks, localized warmth, and scaling or callused skin around a potential wound. In patients with severe neuropathy (nerve damage), pain may be entirely absent, making regular visual inspections extremely important.',
    },
    {
      title: 'Primary Causes and Risk Factors',
      icon: '🧪',
      content: 'The primary causes are poor blood circulation (peripheral vascular disease), nerve damage (neuropathy) causing loss of sensation, high blood sugar (hyperglycemia) which impairs healing, foot deformities, and wearing ill-fitting footwear that causes friction or pressure spots.',
    },
    {
      title: 'Prevention Best Practices',
      icon: '🛡️',
      content: 'Preventive measures include daily self-inspection of the feet, washing feet in lukewarm water and drying them completely, keeping skin moisturized (avoiding between the toes), wearing properly fitted diabetic socks and shoes, cutting toenails straight across, and keeping blood glucose levels strictly controlled under doctor supervision.',
    },
    {
      title: 'Importance of Early Detection',
      icon: '⏱️',
      content: 'Early detection of pre-ulcerative lesions and prompt treatment can reduce amputation rates by up to 85%. Since ulcers can progress rapidly from a minor scratch to a deep-tissue infection, digital screening and regular foot checks act as the first line of defense.',
    },
  ]

  const references = [
    { name: 'World Health Organization (WHO)', url: 'https://www.who.int' },
    { name: 'American Diabetes Association (ADA)', url: 'https://www.diabetes.org' },
    { name: 'National Institutes of Health (NIH)', url: 'https://www.nih.gov' },
    { name: 'International Diabetes Federation (IDF)', url: 'https://idf.org' },
    { name: 'CDC Diabetes Prevention', url: 'https://www.cdc.gov/diabetes' },
  ]

  const datasets = [
    { name: 'DFU Patch Dataset (Kaggle)', url: 'https://www.kaggle.com/datasets/laurensia/diabetic-foot-ulcer-dfu-patches' },
    { name: 'DFU2020 Challenge Dataset', url: 'https://www.kaggle.com' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="page-title">📚 DFU Education</h1>
        <p className="page-subtitle">Essential knowledge for prevention and early detection</p>
      </div>

      {/* Accordion Sections */}
      <div className="flex flex-col gap-5">
        {infoSections.map((section, i) => {
          const isExpanded = expandedIndex === i
          return (
            <div
              key={i}
              className="glass-card-xl overflow-hidden"
              style={{ borderLeft: isExpanded ? '4px solid #39ff14' : '4px solid transparent' }}
            >
              <button
                onClick={() => toggleExpand(i)}
                className="w-full text-left p-6 flex justify-between items-center bg-transparent border-none cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{section.icon}</span>
                  <span
                    className="font-bold text-[1.05rem]"
                    style={{ color: isExpanded ? 'var(--color-accent)' : 'var(--color-text)', fontFamily: 'var(--font-primary)' }}
                  >
                    {section.title}
                  </span>
                </div>
                <div
                  className="text-xl transition-transform duration-300"
                  style={{
                    color: isExpanded ? '#39ff14' : 'var(--color-text-secondary)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 pt-2">
                      <p className="text-[0.95rem] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {/* Risk Level Card */}
        <div className="glass-card-xl p-8" style={{ borderTop: '4px solid #ff4444' }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3" style={{ color: '#ff7777' }}>
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.2)' }}>
              ⚠️
            </span>
            Clinical Risk Levels
          </h3>
          <ul className="flex flex-col gap-5">
            <li className="flex gap-4">
              <span className="shrink-0 mt-0.5 text-lg">🦶</span>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Mild Risk:</strong>
                <p className="text-sm mt-1 leading-relaxed text-gray-400">Loss of sensation (neuropathy), but no deformity or peripheral arterial disease.</p>
              </div>
            </li>
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <li className="flex gap-4">
              <span className="shrink-0 mt-0.5 text-lg">⚠️</span>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Moderate Risk:</strong>
                <p className="text-sm mt-1 leading-relaxed text-gray-400">Neuropathy combined with foot deformity or peripheral arterial disease.</p>
              </div>
            </li>
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <li className="flex gap-4">
              <span className="shrink-0 mt-0.5 text-lg">🚨</span>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>High Risk:</strong>
                <p className="text-sm mt-1 leading-relaxed text-gray-400">Previous history of a foot ulcer or amputation.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Medical References Card */}
        <div className="glass-card-xl p-8" style={{ borderTop: '4px solid #39ff14' }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-accent)' }}>
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.2)' }}>
              🩺
            </span>
            Clinical Reference Links
          </h3>
          <ul className="flex flex-col gap-3">
            {references.map((ref, idx) => (
              <li key={idx}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-300"
                  style={{
                    color: 'var(--color-text)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(57,255,20,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(57,255,20,0.2)'
                    e.currentTarget.style.color = '#39ff14'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'var(--color-text)'
                  }}
                >
                  <span style={{ color: 'var(--color-accent)' }}>🔗</span>
                  <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>{ref.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card-xl p-8 mb-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
          📊 DFU Patch Datasets
        </h3>
        <ul className="flex flex-col gap-3">
          {datasets.map((ds, idx) => (
            <li key={idx}>
              <a
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-300"
                style={{
                  color: 'var(--color-text)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(57,255,20,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(57,255,20,0.2)'
                  e.currentTarget.style.color = '#39ff14'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'var(--color-text)'
                }}
              >
                <span style={{ color: 'var(--color-accent)' }}>📁</span>
                <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>{ds.name}</span>
              </a>
            </li>
          ))}
        </ul>

        <div
          className="mt-5 p-4 rounded-xl text-[0.85rem]"
          style={{
            background: 'rgba(57,255,20,0.05)',
            border: '1px solid rgba(57,255,20,0.12)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.7',
          }}
        >
          💡 The Foot Guard AI model was trained on publicly available DFU patch datasets to provide early-screening capability for clinical support.
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
