/**
 * @file main.jsx
 * @description Main React entry point. Bootstraps the application and renders the root component.
 */
import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1050042859377-eobm778lluni21vopnhpe9n1r2t67c0p.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>

  </StrictMode>,
)