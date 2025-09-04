import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AdSpark AI</h1>
          <p className="text-white/80 text-lg">Generate & Deploy High-Performing Social Ads in Minutes</p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
            <div className="glass rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">AI-Powered Generation</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-green-300 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Auto-Deploy</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-300 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Performance Tracking</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <Sparkles className="w-6 h-6 text-purple-300 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Multi-Platform</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Sign In' : 'Get Started'}
            </h2>
            <p className="text-white/70 mt-2">
              {isLogin ? 'Welcome back!' : 'Create your account to start generating ads'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}