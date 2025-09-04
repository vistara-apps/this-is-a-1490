import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import apiService from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const profile = await apiService.subscription.getStatus(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email, password) => {
    const data = await apiService.auth.signUp(email, password)
    if (data.user) {
      await loadUserProfile(data.user.id)
    }
    return data
  }

  const signIn = async (email, password) => {
    const data = await apiService.auth.signIn(email, password)
    if (data.user) {
      await loadUserProfile(data.user.id)
    }
    return data
  }

  const signOut = async () => {
    await apiService.auth.signOut()
    setUserProfile(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && loadUserProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
