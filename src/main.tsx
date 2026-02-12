import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx'
import './globals.css'
import { NodeProvider } from './context/NodeContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NodeProvider>
      <App />
    </NodeProvider>
  </React.StrictMode>,
)
