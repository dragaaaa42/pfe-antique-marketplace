import { useState } from 'react'

export type MarketplaceImageProps = {
  image_url?: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export function resolveMarketplaceImage(image_url?: string): string {
  if (!image_url) return '/placeholder.png'
  if (image_url.startsWith('http')) return image_url
  return `${API_BASE_URL}/uploads/${image_url}`
}

export function MarketplaceImage({ image_url, alt, className = '', size = 'md' }: MarketplaceImageProps) {
  const src = resolveMarketplaceImage(image_url)
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-48 h-48'
  }

  if (error) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 flex items-center justify-center rounded ${className}`}>
        <span className="text-gray-400 text-xs text-center px-2">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} object-cover rounded ${className}`}
      onError={() => setError(true)}
    />
  )
}
