import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/toast'
import { WalletProvider } from './lib/wallet'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ToastProvider>
  </StrictMode>,
)
