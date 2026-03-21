/**
 * @file main.jsx
 * @description Main React entry point. Bootstraps the application and renders the root component.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <App />
  </StrictMode>, 
)