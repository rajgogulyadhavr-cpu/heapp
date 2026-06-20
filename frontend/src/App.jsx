import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Detection from './pages/Detection'
import KuraiAI from './pages/KuraiAI'
import UraiAI from './pages/UraiAI'
import Hospitals from './pages/Hospitals'
import Diet from './pages/Diet'
import DFUInfo from './pages/DFUInfo'
import About from './pages/About'

function App() {
  const [lang, setLang] = useState(localStorage.getItem('language') || 'english')
  
  const toggleLang = (newLang) => {
    localStorage.setItem('language', newLang)
    setLang(newLang)
    window.location.reload()
  }

  return (
    <div className="app-layout relative">
      {/* Global Language Toggle */}
      <div 
        className="fixed top-6 right-8 z-[100] flex items-center gap-1 px-1.5 py-1.5 rounded-full"
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(57,255,20,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
         <button 
           onClick={() => toggleLang('english')} 
           className="px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
           style={{
             background: lang === 'english' ? 'linear-gradient(135deg, #39ff14, #22c55e)' : 'transparent',
             color: lang === 'english' ? '#0b1612' : 'rgba(255,255,255,0.5)'
           }}
         >
           EN
         </button>
         <button 
           onClick={() => toggleLang('tamil')} 
           className="px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
           style={{
             background: lang === 'tamil' ? 'linear-gradient(135deg, #39ff14, #22c55e)' : 'transparent',
             color: lang === 'tamil' ? '#0b1612' : 'rgba(255,255,255,0.5)'
           }}
         >
           தமிழ்
         </button>
      </div>

      <Sidebar />
      <main className="main-content pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Detection />} />
            <Route path="/kurai" element={<KuraiAI />} />
            <Route path="/urai" element={<UraiAI />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/dfu-info" element={<DFUInfo />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
