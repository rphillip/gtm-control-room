import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/newsreader/wght.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'
import './features/signal-convergence/signal-convergence.css'
import { SignalConvergencePage } from './features/signal-convergence/SignalConvergencePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignalConvergencePage />
  </StrictMode>,
)
