import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { perf } from './utils/performanceMode'

if (perf.isWallpaper) {
  document.documentElement.classList.add('wallpaper-mode')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
