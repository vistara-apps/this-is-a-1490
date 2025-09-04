import React from 'react'
import { 
  Home, 
  Sparkles, 
  BarChart3, 
  Settings, 
  CreditCard,
  HelpCircle 
} from 'lucide-react'

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Sparkles, label: 'Generate', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: CreditCard, label: 'Billing', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: HelpCircle, label: 'Help', active: false },
  ]

  return (
    <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 hidden lg:flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-lg p-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">AdSpark AI</span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <div className="glass rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-white/70 text-sm mb-3">
            Get unlimited generations and advanced analytics
          </p>
          <button className="w-full btn-primary text-sm py-2">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}