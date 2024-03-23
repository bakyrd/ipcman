import { initializeIcons } from '@fluentui/react'
import { setAutoFreeze } from 'immer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.scss'

setAutoFreeze(false)

createRoot(document.getElementById('ipcman')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

initializeIcons()
