import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useProject } from '../contexts/ProjectContext'
import { Upload, Image, Sparkles } from 'lucide-react'

export default function UploadZone({ onUpload }) {
  const { createProject, generateAds } = useProject()

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file)
    
    // Create project
    const project = createProject({
      name: `Project ${Date.now()}`,
      productImage: imageUrl,
      originalFile: file
    })

    // Start AI generation
    await generateAds(imageUrl)
    onUpload()
  }, [createProject, generateAds, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'bg-white/20 border-white/40 scale-105' 
            : 'hover:bg-white/15 hover:border-white/30'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            {isDragActive ? (
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          <h3 className="text-2xl font-semibold text-white mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload Product Image'}
          </h3>
          
          <p className="text-white/70 text-lg">
            Drag & drop your product image or click to browse
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>PNG, JPG, WebP</span>
            </div>
            <span>•</span>
            <span>Max 10MB</span>
          </div>

          <button className="btn-secondary">
            Choose File
          </button>
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="glass rounded-lg p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-300" />
          </div>
          <h4 className="text-white font-medium mb-1">AI Variations</h4>
          <p className="text-white/60 text-sm">3-5 unique ad creatives</p>
        </div>
        
        <div className="glass rounded-lg p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-green-500/20 rounded-full flex items-center justify-center">
            <Upload className="w-4 h-4 text-green-300" />
          </div>
          <h4 className="text-white font-medium mb-1">Auto-Deploy</h4>
          <p className="text-white/60 text-sm">Instant social posting</p>
        </div>
        
        <div className="glass rounded-lg p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Image className="w-4 h-4 text-purple-300" />
          </div>
          <h4 className="text-white font-medium mb-1">Platform Ready</h4>
          <p className="text-white/60 text-sm">Instagram & TikTok optimized</p>
        </div>
      </div>
    </div>
  )
}