import React from 'react'
import { TrendingUp, Eye, Heart, Share, DollarSign } from 'lucide-react'

export default function PerformanceMetrics() {
  const metrics = [
    {
      label: 'Total Impressions',
      value: '24,567',
      change: '+12%',
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Engagement Rate',
      value: '8.4%',
      change: '+3.2%',
      icon: Heart,
      color: 'red'
    },
    {
      label: 'Shares',
      value: '1,243',
      change: '+18%',
      icon: Share,
      color: 'green'
    },
    {
      label: 'Est. Revenue',
      value: '$2,847',
      change: '+24%',
      icon: DollarSign,
      color: 'yellow'
    }
  ]

  const adPerformance = [
    { id: 1, title: 'Modern Style Ad', platform: 'Instagram', impressions: '12.3k', ctr: '3.4%', engagement: '8.2%' },
    { id: 2, title: 'Dynamic Style Ad', platform: 'TikTok', impressions: '8.7k', ctr: '4.1%', engagement: '12.1%' },
    { id: 3, title: 'Elegant Style Ad', platform: 'Instagram', impressions: '3.5k', ctr: '2.8%', engagement: '6.3%' }
  ]

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 bg-${metric.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                </div>
                <span className="text-green-400 text-sm font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-white/60 text-sm">{metric.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Individual Ad Performance */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Ad Performance Breakdown</h3>
        
        <div className="space-y-4">
          {adPerformance.map((ad) => (
            <div key={ad.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h4 className="text-white font-medium">{ad.title}</h4>
                <p className="text-white/60 text-sm">{ad.platform}</p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="text-white font-medium">{ad.impressions}</p>
                  <p className="text-white/60">Impressions</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{ad.ctr}</p>
                  <p className="text-white/60">CTR</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{ad.engagement}</p>
                  <p className="text-white/60">Engagement</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Performance Over Time</h3>
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  )
}