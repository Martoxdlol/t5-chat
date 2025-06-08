import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { ApiProvider } from './lib/api-provider.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApiProvider>
            <App />
        </ApiProvider>
    </StrictMode>,
)
