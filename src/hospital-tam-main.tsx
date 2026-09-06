import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/newsreader/wght.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'
import './features/hospital-tam/hospital-tam.css'
import { HospitalTamPage } from './features/hospital-tam/HospitalTamPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode><HospitalTamPage /></StrictMode>,
)
