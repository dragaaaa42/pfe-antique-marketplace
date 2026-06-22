import { type ImgHTMLAttributes } from 'react'

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
  // We avoid mutating src state on error inside the component
  // to prevent infinite loops or complicated state syncing, 
  // and instead just let the consumer manage it or just let the browser handle it
  // But if we want to fallback locally, we can just use the DOM node directly:
  return (
    <img
      {...props}
      alt={alt}
      decoding={decoding}
      loading={loading}
      src={src || fallbackSrc}
      onError={(event) => {
        const target = event.currentTarget
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc
        }
        onError?.(event)
      }}
    />
  )
}
