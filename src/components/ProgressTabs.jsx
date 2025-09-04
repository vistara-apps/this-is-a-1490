import React from 'react'
import { Upload, Sparkles, Share, BarChart3 } from 'lucide-react'

export default function ProgressTabs({ currentStep }) {
  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'generation', label: 'Generate', icon: Sparkles },
    { id: 'posting', label: 'Deploy', icon: Share },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const getStepIndex = (stepId) => steps.findIndex(step => step.id === stepId)
  const currentIndex = getStepIndex(currentStep)

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isActive 
                    ? 'bg-white text-purple-600 shadow-lg scale-110' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/20 text-white/60'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  isActive || isCompleted ? 'text-white' : 'text-white/60'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all ${
                  index < currentIndex ? 'bg-green-500' : 'bg-white/20'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}