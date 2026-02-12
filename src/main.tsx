import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx'
import './globals.css'
import { NodeProvider } from './context/NodeContext.tsx'
import { BackgroundProvider } from './context/BackgroundContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NodeProvider>
      <BackgroundProvider>
        <App />
      </BackgroundProvider>
    </NodeProvider>
  </React.StrictMode>,
)
