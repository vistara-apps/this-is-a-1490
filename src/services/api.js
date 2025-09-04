import supabaseService from './supabase'
import openaiService from './openai'
import pinataService from './pinata'
import farcasterService from './farcaster'
import stripeService from './stripe'

/**
 * Main API service that orchestrates all external services
 * This is the primary interface for the application to interact with external APIs
 */
export const apiService = {
  // Authentication
  auth: {
    async signUp(email, password) {
      const result = await supabaseService.signUp(email, password)
      
      // Create user profile
      if (result.user) {
        await supabaseService.updateUserProfile(result.user.id, {
          subscriptionStatus: 'free',
          socialAccountTokens: {},
          usageStats: {
            adGenerations: 0,
            autoPosts: 0,
            periodStart: new Date().toISOString()
          }
        })
      }
      
      return result
    },

    async signIn(email, password) {
      return await supabaseService.signIn(email, password)
    },

    async signOut() {
      return await supabaseService.signOut()
    },

    async getCurrentUser() {
      return await supabaseService.getUser()
    }
  },

  // Project Management
  projects: {
    async create(projectData, productImageFile) {
      try {
        // Upload product image to IPFS
        const imageUpload = await pinataService.uploadFile(productImageFile, {
          name: `product-${Date.now()}.${productImageFile.name.split('.').pop()}`,
          type: 'product-image'
        })

        // Create project in database
        const project = await supabaseService.createProject({
          userId: projectData.userId,
          name: projectData.name,
          productImageRef: imageUpload.ipfsHash
        })

        return {
          ...project,
          productImageUrl: imageUpload.url
        }
      } catch (error) {
        console.error('Error creating project:', error)
        throw new Error('Failed to create project')
      }
    },

    async getAll(userId) {
      return await supabaseService.getProjects(userId)
    },

    async getById(projectId) {
      return await supabaseService.getProject(projectId)
    }
  },

  // AI Ad Generation
  ads: {
    async generateFromImage(productImageFile, platforms = ['instagram', 'tiktok']) {
      try {
        // Upload image to get URL for analysis
        const imageUpload = await pinataService.uploadFile(productImageFile, {
          type: 'temp-analysis'
        })

        // Analyze product image
        const productAnalysis = await openaiService.analyzeProductImage(imageUpload.url)

        // Generate platform-specific ads
        const adVariations = await openaiService.generatePlatformAds(productAnalysis, platforms)

        // Upload generated images to IPFS
        const processedAds = []
        for (const ad of adVariations) {
          if (ad.backgroundUrl) {
            const backgroundUpload = await pinataService.uploadImageFromUrl(ad.backgroundUrl, {
              name: `background-${ad.id}.png`,
              type: 'generated-background'
            })
            
            processedAds.push({
              ...ad,
              backgroundUrl: backgroundUpload.url,
              backgroundRef: backgroundUpload.ipfsHash
            })
          } else {
            processedAds.push(ad)
          }
        }

        return {
          productAnalysis,
          adVariations: processedAds,
          originalImageRef: imageUpload.ipfsHash
        }
      } catch (error) {
        console.error('Error generating ads:', error)
        throw new Error('Failed to generate ad variations')
      }
    },

    async saveVariations(projectId, adVariations) {
      const savedVariations = []
      
      for (const ad of adVariations) {
        const variation = await supabaseService.createAdVariation({
          projectId,
          generatedImageRef: ad.backgroundRef,
          generatedText: ad.text,
          platformSpecificFormat: JSON.stringify(ad.format),
          postedToPlatformStatus: 'pending'
        })
        
        savedVariations.push(variation)
      }
      
      return savedVariations
    },

    async optimizePerformance(adVariationId, performanceData) {
      try {
        const variation = await supabaseService.getAdVariations(adVariationId)
        const optimizedCopy = await openaiService.optimizeAdCopy(
          variation.generated_text,
          performanceData
        )
        
        return optimizedCopy
      } catch (error) {
        console.error('Error optimizing ad:', error)
        throw new Error('Failed to optimize ad performance')
      }
    }
  },

  // Social Media Posting
  social: {
    async connectFarcaster(userId) {
      try {
        const signer = await farcasterService.createSigner()
        
        // Save signer to user profile
        await supabaseService.updateUserProfile(userId, {
          socialAccountTokens: {
            farcaster: {
              signerUuid: signer.signerUuid,
              publicKey: signer.publicKey,
              status: signer.status,
              approvalUrl: signer.signerApprovalUrl
            }
          }
        })
        
        return signer
      } catch (error) {
        console.error('Error connecting Farcaster:', error)
        throw new Error('Failed to connect Farcaster account')
      }
    },

    async postToFarcaster(adVariations, userSigner) {
      try {
        const results = await farcasterService.batchPostAds(adVariations, userSigner)
        
        // Update ad variations with posting status
        for (const result of results) {
          if (result.success) {
            await supabaseService.updateAdVariation(result.adVariationId, {
              posted_to_platform_status: 'posted',
              performance_metrics: {
                castHash: result.castHash,
                castUrl: result.castUrl,
                postedAt: result.postedAt
              }
            })
          } else {
            await supabaseService.updateAdVariation(result.adVariationId, {
              posted_to_platform_status: 'failed',
              performance_metrics: {
                error: result.error
              }
            })
          }
        }
        
        return results
      } catch (error) {
        console.error('Error posting to Farcaster:', error)
        throw new Error('Failed to post ads to Farcaster')
      }
    },

    async getPerformanceMetrics(castHashes) {
      try {
        const metrics = []
        
        for (const hash of castHashes) {
          const castMetrics = await farcasterService.getCastMetrics(hash)
          metrics.push(castMetrics)
        }
        
        return metrics
      } catch (error) {
        console.error('Error getting performance metrics:', error)
        throw new Error('Failed to get performance metrics')
      }
    }
  },

  // Subscription Management
  subscription: {
    async subscribe(planId, userId) {
      try {
        // Check if user already has a subscription
        const userProfile = await supabaseService.getUserProfile(userId)
        
        if (userProfile?.subscription_status === 'active') {
          throw new Error('User already has an active subscription')
        }
        
        // Create Stripe checkout session
        const session = await stripeService.subscribeToplan(planId, userId)
        
        return session
      } catch (error) {
        console.error('Error subscribing:', error)
        throw new Error('Failed to create subscription')
      }
    },

    async getStatus(userId) {
      try {
        const userProfile = await supabaseService.getUserProfile(userId)
        
        if (!userProfile?.stripe_customer_id) {
          return { status: 'free', plan: null }
        }
        
        const status = await stripeService.getSubscriptionStatus(userProfile.stripe_customer_id)
        return status
      } catch (error) {
        console.error('Error getting subscription status:', error)
        throw new Error('Failed to get subscription status')
      }
    },

    async checkUsageLimit(userId, usageType) {
      try {
        const userProfile = await supabaseService.getUserProfile(userId)
        
        if (!userProfile?.stripe_customer_id) {
          // Free tier limits
          const freeLimit = usageType === 'adGenerations' ? 3 : 1
          const currentUsage = userProfile?.usage_stats?.[usageType] || 0
          
          return {
            canProceed: currentUsage < freeLimit,
            currentUsage,
            limit: freeLimit,
            remaining: Math.max(0, freeLimit - currentUsage)
          }
        }
        
        return await stripeService.checkUsageLimit(userProfile.stripe_customer_id, usageType)
      } catch (error) {
        console.error('Error checking usage limit:', error)
        throw new Error('Failed to check usage limit')
      }
    },

    async recordUsage(userId, usageType, quantity = 1) {
      try {
        const userProfile = await supabaseService.getUserProfile(userId)
        
        // Update local usage stats
        const currentStats = userProfile?.usage_stats || {}
        const updatedStats = {
          ...currentStats,
          [usageType]: (currentStats[usageType] || 0) + quantity
        }
        
        await supabaseService.updateUserProfile(userId, {
          usageStats: updatedStats
        })
        
        // Record in Stripe if customer exists
        if (userProfile?.stripe_customer_id) {
          await stripeService.recordUsage(userProfile.stripe_customer_id, usageType, quantity)
        }
        
        return updatedStats
      } catch (error) {
        console.error('Error recording usage:', error)
        throw new Error('Failed to record usage')
      }
    }
  },

  // Analytics and Insights
  analytics: {
    async getProjectAnalytics(projectId) {
      try {
        const project = await supabaseService.getProject(projectId)
        const adVariations = project.ad_variations || []
        
        // Get performance metrics for posted ads
        const performanceData = []
        for (const variation of adVariations) {
          if (variation.performance_metrics?.castHash) {
            try {
              const metrics = await farcasterService.getCastMetrics(variation.performance_metrics.castHash)
              performanceData.push({
                adVariationId: variation.ad_variation_id,
                ...metrics
              })
            } catch (error) {
              console.warn(`Failed to get metrics for ${variation.ad_variation_id}:`, error)
            }
          }
        }
        
        // Calculate aggregate metrics
        const totalEngagement = performanceData.reduce((sum, data) => sum + data.engagement, 0)
        const totalImpressions = performanceData.reduce((sum, data) => sum + data.impressions, 0)
        const avgEngagementRate = totalImpressions > 0 ? totalEngagement / totalImpressions : 0
        
        return {
          projectId,
          totalAds: adVariations.length,
          postedAds: adVariations.filter(ad => ad.posted_to_platform_status === 'posted').length,
          totalEngagement,
          totalImpressions,
          avgEngagementRate,
          performanceData,
          topPerforming: performanceData.sort((a, b) => b.engagement - a.engagement).slice(0, 3)
        }
      } catch (error) {
        console.error('Error getting project analytics:', error)
        throw new Error('Failed to get project analytics')
      }
    },

    async getUserAnalytics(userId) {
      try {
        const projects = await supabaseService.getProjects(userId)
        const userProfile = await supabaseService.getUserProfile(userId)
        
        let totalAds = 0
        let totalPosted = 0
        let totalEngagement = 0
        
        for (const project of projects) {
          const analytics = await this.getProjectAnalytics(project.project_id)
          totalAds += analytics.totalAds
          totalPosted += analytics.postedAds
          totalEngagement += analytics.totalEngagement
        }
        
        return {
          userId,
          totalProjects: projects.length,
          totalAds,
          totalPosted,
          totalEngagement,
          subscriptionStatus: userProfile?.subscription_status || 'free',
          usageStats: userProfile?.usage_stats || {}
        }
      } catch (error) {
        console.error('Error getting user analytics:', error)
        throw new Error('Failed to get user analytics')
      }
    }
  },

  // Utility functions
  utils: {
    async testConnections() {
      const results = {}
      
      try {
        await supabaseService.getUser()
        results.supabase = 'connected'
      } catch (error) {
        results.supabase = 'error'
      }
      
      try {
        await pinataService.testAuthentication()
        results.pinata = 'connected'
      } catch (error) {
        results.pinata = 'error'
      }
      
      // OpenAI and Farcaster would need actual API calls to test
      results.openai = 'not_tested'
      results.farcaster = 'not_tested'
      results.stripe = 'not_tested'
      
      return results
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    validateImageFile(file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      }
      
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image smaller than 10MB.')
      }
      
      return true
    }
  }
}

export default apiService
