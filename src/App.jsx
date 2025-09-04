import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'

// Initialize Supabase (use your actual keys in production)
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
export const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  return (
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
  )
}

export default App