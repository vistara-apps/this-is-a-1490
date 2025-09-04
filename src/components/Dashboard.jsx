import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import UploadZone from './UploadZone'
import AdVariantCard from './AdVariantCard'
import ProgressTabs from './ProgressTabs'
import PerformanceMetrics from './PerformanceMetrics'
import PricingModal from './PricingModal'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const { currentProject, generatedAds, isGenerating } = useProject()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState('upload')
  const [selectedAds, setSelectedAds] = useState([])
  const [showPricing, setShowPricing] = useState(false)

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleAdSelect = (adId) => {
    setSelectedAds(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    )
  }

  const handleDeploy = async () => {
    if (selectedAds.length === 0) return
    
    setCurrentStep('posting')
    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCurrentStep('analytics')
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header onUpgrade={() => setShowPricing(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Progress Tabs */}
            <ProgressTabs currentStep={currentStep} />
            
            {/* Main Content */}
            <div className="mt-8">
              {currentStep === 'upload' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Create Your Next Viral Ad
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto">
                      Upload a product image and let our AI generate multiple high-performing ad variations for social media
                    </p>
                  </div>
                  
                  <UploadZone 
                    onUpload={() => setCurrentStep('generation')}
                  />
                </div>
              )}

              {currentStep === 'generation' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {isGenerating ? 'Generating Your Ads...' : 'Your Generated Ads'}
                    </h2>
                    <p className="text-white/70">
                      {isGenerating 
                        ? 'Our AI is creating multiple variations optimized for different platforms'
                        : 'Select the ads you want to deploy to your social channels'
                      }
                    </p>
                  </div>

                  {isGenerating ? (
                    <div className="glass rounded-2xl p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/80">Generating ad variations...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedAds.map((ad) => (
                          <AdVariantCard
                            key={ad.id}
                            ad={ad}
                            selected={selectedAds.includes(ad.id)}
                            onSelect={() => handleAdSelect(ad.id)}
                          />
                        ))}
                      </div>
                      
                      {selectedAds.length > 0 && (
                        <div className="text-center">
                          <button
                            onClick={handleDeploy}
                            className="btn-primary"
                          >
                            Deploy {selectedAds.length} Selected Ads
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {currentStep === 'posting' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Deploying Your Ads
                    </h2>
                    <p className="text-white/70">
                      Publishing your selected ads to social media platforms
                    </p>
                  </div>

                  <div className="glass rounded-2xl p-12 text-center">
                    <div className="animate-pulse flex justify-center mb-4">
                      <div className="rounded-full h-12 w-12 bg-white/20"></div>
                    </div>
                    <p className="text-white/80">Posting to social channels...</p>
                  </div>
                </div>
              )}

              {currentStep === 'analytics' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Performance Analytics
                    </h2>
                    <p className="text-white/70">
                      Track how your ads are performing across platforms
                    </p>
                  </div>

                  <PerformanceMetrics />
                  
                  <div className="text-center">
                    <button
                      onClick={() => setCurrentStep('upload')}
                      className="btn-primary"
                    >
                      Create New Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showPricing && (
        <PricingModal onClose={() => setShowPricing(false)} />
      )}
    </div>
  )
}