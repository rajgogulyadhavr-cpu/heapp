import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Disclaimer from '../components/Disclaimer'
import LoadingSpinner from '../components/LoadingSpinner'
import 'leaflet/dist/leaflet.css'

// Custom SVG Icons
const greenMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="%2339ff14" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const redMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="%23ff4444" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true, duration: 0.8 })
  }, [center, zoom, map])
  return null
}

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20 },
}

const FALLBACK_HOSPITALS = [
  { id: 1, name: 'Government Rajaji Hospital', city: 'Madurai', district: 'Madurai', type: 'Government', contact: '0452-2532535', address: 'Panagal Road, Goripalayam, Madurai - 625020', lat: 9.9252, lng: 78.1198, specialization: 'Diabetic Foot Care Unit' },
  { id: 2, name: 'Madras Medical College & RGGGH', city: 'Chennai', district: 'Chennai', type: 'Government', contact: '044-25305000', address: 'Park Town, Chennai - 600003', lat: 13.0827, lng: 80.2775, specialization: 'Diabetology & Wound Care' },
  { id: 3, name: 'Coimbatore Medical College Hospital', city: 'Coimbatore', district: 'Coimbatore', type: 'Government', contact: '0422-2301393', address: 'Avanashi Road, Coimbatore - 641014', lat: 11.0168, lng: 76.9558, specialization: 'Diabetes & Wound Management' },
  { id: 4, name: 'Apollo Hospitals', city: 'Chennai', district: 'Chennai', type: 'Private', contact: '044-28290200', address: '21 Greams Lane, Off Greams Road, Chennai - 600006', lat: 13.0604, lng: 80.2536, specialization: 'Diabetic Foot Clinic' },
  { id: 5, name: 'Christian Medical College Hospital', city: 'Vellore', district: 'Vellore', type: 'Private', contact: '0416-2281000', address: 'Ida Scudder Road, Vellore - 632004', lat: 12.9249, lng: 79.1353, specialization: 'Diabetic Foot Clinic & Research' },
]

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569])
  const [mapZoom, setMapZoom] = useState(7)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get('/api/hospitals')
        setHospitals(res.data.tamil_nadu_hospitals || [])
      } catch {
        setHospitals(FALLBACK_HOSPITALS)
      } finally {
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [])

  const filteredHospitals = hospitals.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch && (filterType === 'All' || h.type === filterType)
  })

  const focusHospital = (hosp) => {
    setSelected(hosp.id)
    setMapCenter([hosp.lat, hosp.lng])
    setMapZoom(14)
  }

  if (loading) return <LoadingSpinner text="Locating specialized hospitals..." />

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full">
      <h1 className="page-title">🗺️ Hospital Locator</h1>
      <p className="page-subtitle">Find hospitals and clinics specializing in Diabetic Foot Ulcer care across Tamil Nadu</p>

      {/* Filter and Search Bar */}
      <div
        className="glass-card p-5 mb-7"
        style={{ borderRadius: '20px' }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              🔍
            </span>
            <input
              id="hospital-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital name, district, or city..."
              className="neon-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {['All', 'Government', 'Private'].map((type) => (
              <button
                key={type}
                id={`filter-${type.toLowerCase()}`}
                onClick={() => setFilterType(type)}
                className={filterType === type ? 'btn-primary' : 'btn-glass'}
                style={{ padding: '10px 18px', fontSize: '0.82rem', borderRadius: '12px' }}
              >
                {type === 'Government' ? '🏛️ Govt' : type === 'Private' ? '🏥 Private' : '🗺️ All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Hospital List Panel */}
        <div
          className="glass-card-xl overflow-y-auto flex flex-col gap-4 lg:col-span-1"
          style={{ maxHeight: '600px', padding: '24px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-[1.05rem] font-bold"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-primary)' }}
            >
              🏥 Speciality Clinics
            </h3>
            <span
              className="text-xs px-3 py-1.5 rounded-full font-bold"
              style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(57,255,20,0.3)' }}
            >
              {filteredHospitals.length} found
            </span>
          </div>

          {filteredHospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No hospitals match your criteria</p>
            </div>
          ) : (
            filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                onClick={() => focusHospital(hosp)}
                className="hospital-card"
                style={{
                  borderColor: selected === hosp.id ? 'rgba(57,255,20,0.3)' : 'rgba(255,255,255,0.07)',
                  background: selected === hosp.id
                    ? 'rgba(57,255,20,0.06)'
                    : 'rgba(255,255,255,0.035)',
                  boxShadow: selected === hosp.id ? '0 0 20px rgba(57,255,20,0.08)' : 'none',
                }}
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h4
                    className="text-[0.95rem] font-bold leading-snug"
                    style={{ fontFamily: 'var(--font-primary)', color: 'var(--color-text)' }}
                  >
                    {hosp.name}
                  </h4>
                  <span
                    className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold shrink-0 mt-1"
                    style={{
                      background: hosp.type === 'Government' ? 'rgba(57,255,20,0.1)' : 'rgba(255,68,68,0.1)',
                      color: hosp.type === 'Government' ? 'var(--color-accent)' : '#ff7777',
                      border: hosp.type === 'Government' ? '1px solid rgba(57,255,20,0.3)' : '1px solid rgba(255,68,68,0.3)',
                      boxShadow: hosp.type === 'Government' ? '0 0 10px rgba(57,255,20,0.1)' : '0 0 10px rgba(255,68,68,0.1)'
                    }}
                  >
                    {hosp.type}
                  </span>
                </div>
                <p
                  className="text-[0.85rem] font-semibold mb-2"
                  style={{ color: 'var(--color-accent)' }}
                >
                  ✦ {hosp.specialization}
                </p>
                <div className="space-y-1.5">
                  <p className="text-[0.8rem] leading-relaxed flex gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="shrink-0 mt-0.5">📍</span>
                    <span>{hosp.address}</span>
                  </p>
                  <p className="text-[0.8rem] font-medium flex gap-2" style={{ color: 'var(--color-text)' }}>
                    <span className="shrink-0">📞</span>
                    <span>{hosp.contact}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="lg:col-span-2 relative glass-card-xl overflow-hidden p-0"
          style={{
            height: '600px',
            border: '1px solid rgba(57,255,20,0.2)',
          }}
        >
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%', background: 'transparent' }}>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            {filteredHospitals.map((hosp) => (
              <Marker
                key={hosp.id}
                position={[hosp.lat, hosp.lng]}
                icon={hosp.type === 'Government' ? greenMarkerIcon : redMarkerIcon}
              >
                <Popup>
                  <div>
                    <h4 style={{ color: '#39ff14', fontWeight: 700, marginBottom: '4px', fontFamily: 'Poppins, sans-serif' }}>{hosp.name}</h4>
                    <p style={{ fontWeight: 600, marginBottom: '3px' }}>{hosp.specialization}</p>
                    <p style={{ color: '#94a3b8', marginBottom: '3px' }}>{hosp.address}</p>
                    <p style={{ fontWeight: 600 }}>📞 {hosp.contact}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}
