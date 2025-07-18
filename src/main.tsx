import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import router from './router'
import './index.css'

// Debug: ponto de entrada
console.log('🚀 BetForbes App: ponto de entrada atingido')

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Failed to find the root element')
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  )
}
