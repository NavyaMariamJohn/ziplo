/**
 * @file vite.config.js
 * @description Vite configuration file for the React application.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
