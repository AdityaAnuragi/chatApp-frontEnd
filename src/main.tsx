import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './global.scss'

createRoot(document.getElementById('root')!).render(
  // TODO: make it work with the damm strict mode!!!!!!!!!!!!!!!!
  <StrictMode>
    <App />
  </StrictMode>,
)
