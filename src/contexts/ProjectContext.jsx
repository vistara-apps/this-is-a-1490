import React, { createContext, useContext, useState } from 'react'
import apiService from '../services/api'
import { useAuth } from './AuthContext'

const ProjectContext = createContext()

export function useProject() {
  return useContext(ProjectContext)
}

export function ProjectProvider({ children }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [generatedAds, setGeneratedAds] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const createProject = async (projectData, productImageFile) => {
    try {
      setError(null)
      
      // Validate file
      apiService.utils.validateImageFile(productImageFile)
      
      // Create project with image upload
      const project = await apiService.projects.create({
        userId: user.id,
        name: projectData.name || `Project ${Date.now()}`
      }, productImageFile)
      
      setProjects(prev => [...prev, project])
      setCurrentProject(project)
      return project
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const generateAds = async (productImageFile, platforms = ['instagram', 'tiktok']) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Check usage limits
      const usageCheck = await apiService.subscription.checkUsageLimit(user.id, 'adGenerations')
      if (!usageCheck.canProceed) {
        throw new Error(`You've reached your ad generation limit. ${usageCheck.remaining} generations remaining.`)
      }
      
      // Generate ads using AI
      const result = await apiService.ads.generateFromImage(productImageFile, platforms)
      
      // Save variations to database if we have a current project
      if (currentProject) {
        await apiService.ads.saveVariations(currentProject.project_id, result.adVariations)
      }
      
      // Record usage
      await apiService.subscription.recordUsage(user.id, 'adGenerations', result.adVariations.length)
      
      setGeneratedAds(result.adVariations)
      return result
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const postAdsToSocial = async (selectedAds, platform = 'farcaster') => {
    try {
      setError(null)
      
      // Check usage limits
      const usageCheck = await apiService.subscription.checkUsageLimit(user.id, 'autoPosts')
      if (!usageCheck.canProceed) {
        throw new Error(`You've reached your auto-post limit. ${usageCheck.remaining} posts remaining.`)
      }
      
      if (platform === 'farcaster') {
        // Get user's Farcaster signer
        const userProfile = await apiService.subscription.getStatus(user.id)
        const farcasterSigner = userProfile.socialAccountTokens?.farcaster
        
        if (!farcasterSigner || farcasterSigner.status !== 'approved') {
          throw new Error('Please connect and approve your Farcaster account first.')
        }
        
        // Post to Farcaster
        const results = await apiService.social.postToFarcaster(selectedAds, farcasterSigner)
        
        // Record usage
        const successfulPosts = results.filter(r => r.success).length
        await apiService.subscription.recordUsage(user.id, 'autoPosts', successfulPosts)
        
        return results
      }
      
      throw new Error(`Platform ${platform} not supported yet`)
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const loadProjects = async () => {
    try {
      setError(null)
      const userProjects = await apiService.projects.getAll(user.id)
      setProjects(userProjects)
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const connectFarcaster = async () => {
    try {
      setError(null)
      const signer = await apiService.social.connectFarcaster(user.id)
      return signer
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const getProjectAnalytics = async (projectId) => {
    try {
      setError(null)
      return await apiService.analytics.getProjectAnalytics(projectId)
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const value = {
    projects,
    currentProject,
    generatedAds,
    isGenerating,
    error,
    createProject,
    generateAds,
    postAdsToSocial,
    loadProjects,
    connectFarcaster,
    getProjectAnalytics,
    setCurrentProject,
    setGeneratedAds,
    clearError: () => setError(null)
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}
