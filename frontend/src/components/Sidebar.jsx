import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/', icon: '🏠', label: 'Detection' },
  { path: '/kurai', icon: '🎤', label: 'Kurai AI' },
  { path: '/urai', icon: '💬', label: 'Urai AI' },
  { path: '/hospitals', icon: '🏥', label: 'Hospitals' },
  { path: '/diet', icon: '🥗', label: 'Diet & Healthcare' },
  { path: '/dfu-info', icon: '📚', label: 'DFU Information' },
  { path: '/about', icon: 'ℹ️', label: 'About' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        id="sidebar-toggle"
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-[60] p-2.5 rounded-xl md:hidden"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex flex-col gap-[5px]">
          <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${open ? 'rotate-45 translate-y-1.5 bg-[#39ff14]' : 'bg-[#39ff14]'}`} />
          <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 bg-[#39ff14] ${open ? 'opacity-0 w-0' : ''}`} />
          <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${open ? '-rotate-45 -translate-y-1.5 bg-[#39ff14]' : 'bg-[#39ff14]'}`} />
        </div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 z-[45] md:hidden"
            style={{ backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] z-[50] flex flex-col transition-transform duration-400 ease-out md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(170deg, rgba(4,26,16,0.98) 0%, rgba(6,33,24,0.96) 60%, rgba(8,20,14,0.98) 100%)',
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(57,255,20,0.1)',
          boxShadow: '4px 0 50px rgba(0,0,0,0.5), inset -1px 0 0 rgba(57,255,20,0.08)',
        }}
      >
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39ff14 0%, #22c55e 100%)',
                boxShadow: '0 0 20px rgba(57,255,20,0.35), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              🦶
            </div>
            <div className="min-w-0">
              <h1
                className="text-base font-bold tracking-tight leading-none truncate"
                style={{ fontFamily: 'Poppins, sans-serif', color: '#39ff14' }}
              >
                FOOT GUARD
              </h1>
              <span
                className="text-[10px] font-semibold tracking-[0.2em]"
                style={{ color: 'rgba(57,255,20,0.55)' }}
              >
                AI SCREENING
              </span>
            </div>
          </div>
          <p
            className="text-[10px] leading-relaxed px-1 opacity-60"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
          >
            DFU Early Detection Tool
          </p>
        </div>

        <div
          className="mx-6 my-4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.25), transparent)' }}
        />

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth: 'thin' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                id={`nav-${item.path.replace('/', '') || 'home'}`}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[0.95rem] font-medium transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(57,255,20,0.15) 0%, rgba(57,255,20,0.05) 100%)'
                    : 'transparent',
                  color: isActive ? '#39ff14' : 'rgba(226, 232, 240, 0.75)',
                  border: isActive ? '1px solid rgba(57,255,20,0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 24px rgba(57,255,20,0.12), inset 0 1px 0 rgba(57,255,20,0.15)' : 'none',
                  textDecoration: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {/* Active left accent */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[70%] rounded-r-full"
                    style={{ background: '#39ff14', boxShadow: '0 0 12px #39ff14' }}
                  />
                )}
                
                {/* Hover state styling via inline styles is tricky with pseudo, using group-hover in Tailwind */}
                <span
                  className="text-xl w-7 text-center shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(57,255,20,0.6))' : 'grayscale(30%)' }}
                >
                  {item.icon}
                </span>
                <span className="flex-1 transition-colors duration-300 group-hover:text-white">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: '#39ff14', boxShadow: '0 0 8px #39ff14' }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer Disclaimer */}
        <div className="px-4 pb-5 pt-3">
          <div
            className="px-4 py-3 rounded-2xl text-center"
            style={{
              background: 'rgba(255,68,68,0.06)',
              border: '1px solid rgba(255,68,68,0.14)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: '#fca5a5', fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}
            >
              ⚠️ Not a substitute for professional medical diagnosis. Always consult a doctor.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
