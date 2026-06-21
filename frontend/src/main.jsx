import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import axios from 'axios'

// Normalize: strip trailing slash so '/api/predict' paths don't produce double-slash URLs
const rawBase = import.meta.env.VITE_API_URL || ''
axios.defaults.baseURL = rawBase.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
