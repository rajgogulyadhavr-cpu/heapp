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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto">
      <h1 className="page-title">📚 DFU Education</h1>
      <p className="page-subtitle">Understand symptoms, prevention guidelines, and clinical references for Diabetic Foot Ulcers</p>

      {/* Accordion Sections */}
      <div className="mb-9 flex flex-col gap-4">
        {infoSections.map((section, idx) => {
          const isExpanded = expandedIndex === idx
          return (
            <div
              key={idx}
              className="glass-card overflow-hidden"
              style={{
                borderColor: isExpanded ? 'rgba(57,255,20,0.28)' : 'var(--color-glass-border)',
                background: isExpanded ? 'rgba(57,255,20,0.04)' : 'var(--color-glass)',
                boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(57,255,20,0.06)' : 'var(--shadow-glass)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between p-5 text-left"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                <div
                  className="flex items-center gap-4 font-semibold text-base"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: isExpanded ? 'rgba(57,255,20,0.12)' : 'rgba(255,255,255,0.05)',
                      border: isExpanded ? '1px solid rgba(57,255,20,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {section.icon}
                  </div>
                  <span style={{ color: isExpanded ? 'var(--color-accent)' : 'var(--color-text)', fontWeight: isExpanded ? 600 : 500 }}>
                    {section.title}
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-4"
                  style={{
                    background: isExpanded ? 'rgba(57,255,20,0.12)' : 'rgba(255,255,255,0.05)',
                    border: isExpanded ? '1px solid rgba(57,255,20,0.2)' : '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--color-accent)',
                    fontSize: '0.75rem',
                    transition: 'all 0.3s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className="px-5 pb-5"
                      style={{
                        borderTop: '1px solid rgba(57,255,20,0.12)',
                        paddingTop: '16px',
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text)', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
                      >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Medical References Card */}
        <div className="glass-card p-6">
          <h3
            className="text-base font-bold mb-5 flex items-center gap-2"
            style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
          >
            🌐 Clinical Reference Links
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
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{ref.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Dataset Information Card */}
        <div className="glass-card p-6">
          <h3
            className="text-base font-bold mb-5 flex items-center gap-2"
            style={{ color: 'var(--color-accent)', fontFamily: 'Poppins, sans-serif' }}
          >
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
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{ds.name}</span>
                </a>
              </li>
            ))}
          </ul>

          <div
            className="mt-5 p-4 rounded-xl text-xs"
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
      </div>

      <Disclaimer />
    </motion.div>
  )
}
