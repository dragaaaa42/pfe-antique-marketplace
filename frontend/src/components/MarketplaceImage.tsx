import { useEffect, useState, type ImgHTMLAttributes } from 'react'

import { fallbackArtifactImage } from '../api'

type MarketplaceImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
}

export function MarketplaceImage({
  fallbackSrc = fallbackArtifactImage,
  src,
  alt,
  onError,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: MarketplaceImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <img
      {...props}
      alt={alt}
      decoding={decoding}
      loading={loading}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
        onError?.(event)
      }}
    />
  )
}
