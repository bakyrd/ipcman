import { initializeIcons } from '@fluentui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.scss'

createRoot(document.getElementById('ipcman')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

initializeIcons()
