import { initializeIcons } from '@fluentui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'

createRoot(document.getElementById('qdvc')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

initializeIcons()
