import React from 'react'
import { Check, Instagram, Eye, Heart, MessageCircle } from 'lucide-react'

export default function AdVariantCard({ ad, selected, onSelect }) {
  const platformIcon = ad.platform === 'instagram' ? Instagram : Instagram

  return (
    <div 
      className={`glass rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-white bg-white/20 scale-105' 
          : 'hover:bg-white/15 hover:scale-102'
      }`}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      <div className="relative">
        <div className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected 
            ? 'bg-white border-white' 
            : 'border-white/50 bg-white/10'
        }`}>
          {selected && <Check className="w-3 h-3 text-gray-800" />}
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <platformIcon className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-medium capitalize">{ad.platform}</span>
        </div>

        {/* Ad Image */}
        <div className="aspect-[9/16] bg-gradient-to-br from-purple-500 to-blue-600 relative overflow-hidden">
          <img 
            src={ad.imageUrl} 
            alt="Ad creative"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Text */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white font-semibold text-sm leading-tight">
              {ad.text}
            </p>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-sm font-medium capitalize">
            {ad.style} Style
          </span>
          <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-full">
            {ad.background}
          </span>
        </div>

        {/* Mock Engagement Stats */}
        <div className="flex items-center space-x-4 text-white/60 text-xs">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>2.4k</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>187</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>23</span>
          </div>
        </div>
      </div>
    </div>
  )
}