import axios from 'axios'
import { config } from '../config'

// Neynar API client for Farcaster
const neynarApi = axios.create({
  baseURL: config.neynar.baseUrl,
  headers: {
    'api_key': config.neynar.apiKey,
    'Content-Type': 'application/json'
  }
})

export const farcasterService = {
  /**
   * Post a cast (message) to Farcaster
   */
  async createCast(castData) {
    try {
      const payload = {
        text: castData.text,
        embeds: castData.embeds || [],
        parent: castData.parent || null,
        signer_uuid: castData.signerUuid
      }

      const response = await neynarApi.post('/posts', payload)
      
      return {
        hash: response.data.hash,
        author: response.data.author,
        text: response.data.text,
        timestamp: response.data.timestamp,
        reactions: response.data.reactions,
        replies: response.data.replies,
        recasts: response.data.recasts,
        embeds: response.data.embeds
      }
    } catch (error) {
      console.error('Error creating cast:', error)
      throw new Error('Failed to create cast on Farcaster')
    }
  },

  /**
   * Post ad variation to Farcaster
   */
  async postAdVariation(adVariation, userSigner) {
    try {
      // Prepare cast content
      const castText = `🚀 ${adVariation.text}\n\n#AdSparkAI #${adVariation.platform} #SocialAds`
      
      // Prepare embeds (images)
      const embeds = []
      if (adVariation.imageUrl) {
        embeds.push({
          url: adVariation.imageUrl
        })
      }

      const castData = {
        text: castText,
        embeds,
        signerUuid: userSigner.uuid
      }

      const cast = await this.createCast(castData)
      
      return {
        success: true,
        castHash: cast.hash,
        castUrl: `https://warpcast.com/${cast.author.username}/${cast.hash}`,
        platform: 'farcaster',
        postedAt: cast.timestamp
      }
    } catch (error) {
      console.error('Error posting ad to Farcaster:', error)
      throw new Error('Failed to post ad to Farcaster')
    }
  },

  /**
   * Get cast performance metrics
   */
  async getCastMetrics(castHash) {
    try {
      const response = await neynarApi.get(`/casts/${castHash}`)
      const cast = response.data.cast

      return {
        hash: cast.hash,
        likes: cast.reactions.likes_count,
        recasts: cast.reactions.recasts_count,
        replies: cast.replies.count,
        engagement: cast.reactions.likes_count + cast.reactions.recasts_count + cast.replies.count,
        impressions: cast.reactions.likes_count * 10, // Estimated impressions
        timestamp: cast.timestamp
      }
    } catch (error) {
      console.error('Error getting cast metrics:', error)
      throw new Error('Failed to get cast metrics')
    }
  },

  /**
   * Get user's casts
   */
  async getUserCasts(fid, limit = 25) {
    try {
      const response = await neynarApi.get(`/casts?fid=${fid}&limit=${limit}`)
      
      return response.data.casts.map(cast => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        author: cast.author,
        reactions: cast.reactions,
        replies: cast.replies,
        embeds: cast.embeds
      }))
    } catch (error) {
      console.error('Error getting user casts:', error)
      throw new Error('Failed to get user casts')
    }
  },

  /**
   * Search casts by text
   */
  async searchCasts(query, limit = 25) {
    try {
      const response = await neynarApi.get(`/casts/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      
      return response.data.casts.map(cast => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        author: cast.author,
        reactions: cast.reactions,
        replies: cast.replies,
        embeds: cast.embeds
      }))
    } catch (error) {
      console.error('Error searching casts:', error)
      throw new Error('Failed to search casts')
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(fid) {
    try {
      const response = await neynarApi.get(`/user?fid=${fid}`)
      const user = response.data.user

      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        bio: user.profile.bio.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        pfpUrl: user.pfp_url,
        verifications: user.verifications
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw new Error('Failed to get user profile')
    }
  },

  /**
   * Create a signer for posting
   */
  async createSigner() {
    try {
      const response = await neynarApi.post('/signers', {})
      
      return {
        signerUuid: response.data.signer_uuid,
        publicKey: response.data.public_key,
        status: response.data.status,
        signerApprovalUrl: response.data.signer_approval_url
      }
    } catch (error) {
      console.error('Error creating signer:', error)
      throw new Error('Failed to create signer')
    }
  },

  /**
   * Get signer status
   */
  async getSignerStatus(signerUuid) {
    try {
      const response = await neynarApi.get(`/signers/${signerUuid}`)
      
      return {
        signerUuid: response.data.signer_uuid,
        publicKey: response.data.public_key,
        status: response.data.status,
        fid: response.data.fid
      }
    } catch (error) {
      console.error('Error getting signer status:', error)
      throw new Error('Failed to get signer status')
    }
  },

  /**
   * Batch post multiple ad variations
   */
  async batchPostAds(adVariations, userSigner, delay = 5000) {
    const results = []
    
    for (const [index, adVariation] of adVariations.entries()) {
      try {
        // Add delay between posts to avoid rate limiting
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const result = await this.postAdVariation(adVariation, userSigner)
        results.push({
          adVariationId: adVariation.id,
          success: true,
          ...result
        })
      } catch (error) {
        results.push({
          adVariationId: adVariation.id,
          success: false,
          error: error.message
        })
      }
    }

    return results
  },

  /**
   * Get trending topics for ad optimization
   */
  async getTrendingTopics() {
    try {
      // This would require a custom endpoint or analysis
      // For now, return mock trending topics
      return [
        { topic: 'AI', count: 1250 },
        { topic: 'Web3', count: 980 },
        { topic: 'DeFi', count: 750 },
        { topic: 'NFT', count: 650 },
        { topic: 'Base', count: 500 }
      ]
    } catch (error) {
      console.error('Error getting trending topics:', error)
      throw new Error('Failed to get trending topics')
    }
  },

  /**
   * Analyze cast performance for optimization
   */
  async analyzeCastPerformance(castHashes) {
    try {
      const analyses = []
      
      for (const hash of castHashes) {
        const metrics = await this.getCastMetrics(hash)
        const cast = await neynarApi.get(`/casts/${hash}`)
        
        analyses.push({
          hash,
          text: cast.data.cast.text,
          metrics,
          engagementRate: metrics.engagement / Math.max(metrics.impressions, 1),
          performance: metrics.engagement > 10 ? 'high' : metrics.engagement > 5 ? 'medium' : 'low'
        })
      }

      return analyses
    } catch (error) {
      console.error('Error analyzing cast performance:', error)
      throw new Error('Failed to analyze cast performance')
    }
  },

  /**
   * Get optimal posting times based on user's audience
   */
  async getOptimalPostingTimes(fid) {
    try {
      // This would require audience analysis
      // For now, return general optimal times
      return {
        weekdays: ['09:00', '12:00', '17:00', '20:00'],
        weekends: ['10:00', '14:00', '19:00'],
        timezone: 'UTC'
      }
    } catch (error) {
      console.error('Error getting optimal posting times:', error)
      throw new Error('Failed to get optimal posting times')
    }
  }
}

export default farcasterService
