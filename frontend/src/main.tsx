import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css' //JUST COMMENTED OUT FOR NOW 
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
