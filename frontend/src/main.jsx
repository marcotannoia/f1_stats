import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/barlow-condensed/latin-400.css'
import '@fontsource/barlow-condensed/latin-600.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
