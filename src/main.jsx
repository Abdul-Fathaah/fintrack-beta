import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
=======
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
>>>>>>> 46dd4fa5493e1895faa577a64d6dff04256e16f2
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
<<<<<<< HEAD
=======
    <Analytics />
    <SpeedInsights />
>>>>>>> 46dd4fa5493e1895faa577a64d6dff04256e16f2
  </StrictMode>,
)
