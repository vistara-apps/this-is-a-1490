import React, { useState } from 'react'
import { X, Check, Crown, Zap } from 'lucide-react'

export default function PricingModal({ onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        '50 AI ad generations',
        '10 auto-posts per month',
        'Instagram & TikTok support',
        'Basic analytics',
        'Email support'
      ],
      buttonText: 'Start Free Trial',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$79',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited AI generations',
        '50 auto-posts per month',
        'All social platforms',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Team collaboration'
      ],
      buttonText: 'Upgrade to Pro',
      popular: true
    }
  ]

  const handleSubscribe = (planId) => {
    // Here you would integrate with Stripe
    console.log('Subscribing to plan:', planId)
    alert(`Subscribing to ${planId} plan - Stripe integration would happen here`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Upgrade Your Plan</h2>
            <p className="text-white/70">Choose the perfect plan for your business needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative glass rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-white bg-white/20' 
                  : 'hover:bg-white/15'
              } ${plan.popular ? 'scale-105' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubscribe(plan.id)
                }}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Why Upgrade to Pro?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Unlimited Generation</h4>
              <p className="text-white/60 text-sm">Create as many ad variations as you need</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Advanced Analytics</h4>
              <p className="text-white/60 text-sm">Deep insights into ad performance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Priority Support</h4>
              <p className="text-white/60 text-sm">Get help when you need it most</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>All plans include a 14-day free trial. Cancel anytime.</p>
        </div>
      </div>
    </div>
  )
}