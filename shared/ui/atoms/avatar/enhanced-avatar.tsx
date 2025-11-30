'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

interface EnhancedAvatarProps {
  src?: string | null
  alt?: string
  fallback: string
  className?: string
  onImageLoad?: () => void
  onImageError?: () => void
}

/**
 * Enhanced Avatar with error handling and loading states
 * Extends the base Avatar atom with additional functionality for image loading/error states
 */
export function EnhancedAvatar({ 
  src, 
  alt, 
  fallback, 
  className, 
  onImageLoad,
  onImageError 
}: EnhancedAvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // Don't show image if there was an error or no src
  const shouldShowImage = src && !imageError

  const handleImageError = () => {
    console.log('❌ Avatar failed to load:', src)
    setImageError(true)
    onImageError?.()
  }

  const handleImageLoad = () => {
    console.log('✅ Avatar loaded:', src)
    onImageLoad?.()
  }

  return (
    <Avatar className={className}>
      {shouldShowImage && (
        <AvatarImage 
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <AvatarFallback className="bg-primary text-white text-sm font-medium border-0 outline-0">
        {fallback}
      </AvatarFallback>
    </Avatar>
  )
}