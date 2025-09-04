import React, { createContext, useContext, useState } from 'react'

const ProjectContext = createContext()

export function useProject() {
  return useContext(ProjectContext)
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [generatedAds, setGeneratedAds] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString()
    }
    setProjects(prev => [...prev, newProject])
    setCurrentProject(newProject)
    return newProject
  }

  const generateAds = async (productImage) => {
    setIsGenerating(true)
    try {
      // Simulate AI generation with mock data
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockAds = [
        {
          id: '1',
          imageUrl: productImage,
          text: 'Transform your style with premium quality',
          platform: 'instagram',
          background: 'gradient',
          style: 'modern'
        },
        {
          id: '2',
          imageUrl: productImage,
          text: 'Discover the difference quality makes',
          platform: 'tiktok',
          background: 'abstract',
          style: 'dynamic'
        },
        {
          id: '3',
          imageUrl: productImage,
          text: 'Elevate your everyday experience',
          platform: 'instagram',
          background: 'minimal',
          style: 'elegant'
        }
      ]
      
      setGeneratedAds(mockAds)
    } finally {
      setIsGenerating(false)
    }
  }

  const value = {
    projects,
    currentProject,
    generatedAds,
    isGenerating,
    createProject,
    generateAds,
    setCurrentProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}