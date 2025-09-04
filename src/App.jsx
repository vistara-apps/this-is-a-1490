import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { config } from './config'

// Initialize Stripe
const stripePromise = loadStripe(config.stripe.publishableKey)

function App() {
  return (
    <Elements stripe={stripePromise}>
      <AuthProvider>
        <ProjectProvider>
          <div className="min-h-screen gradient-bg">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </div>
        </ProjectProvider>
      </AuthProvider>
    </Elements>
  )
}

export default App
