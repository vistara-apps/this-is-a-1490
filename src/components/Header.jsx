import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Search, Crown, LogOut, Menu } from 'lucide-react'

export default function Header({ onUpgrade }) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onUpgrade}
            className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </button>

          <button className="p-2 text-white hover:bg-white/10 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={signOut}
              className="hidden sm:block p-2 text-white hover:bg-white/10 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}