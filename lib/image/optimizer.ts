export const optimizeImageUrl = (src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options
  
  // For local images
  if (src.startsWith('/')) {
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    params.append('format', format)
    return `${src}?${params.toString()}`
  }
  
  // For external images (would need proxy in production)
  return src
}

export const getImageSizes = (src: string) => {
  // This would be implemented with actual image processing
  return {
    width: 800,
    height: 600,
    aspectRatio: 4/3
  }
}

export const getImageProps = (props: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
}) => {
  const { src, alt, width, height, className, loading = 'lazy' } = props
  
  // Optimize the image URL
  const optimizedSrc = optimizeImageUrl(src, { width, height })
  
  return {
    src: optimizedSrc,
    alt,
    width,
    height,
    className,
    loading,
    decoding: "async" as const
  }
}
