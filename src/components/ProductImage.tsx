interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
}

export default function ProductImage({ src, alt, className, style }: ProductImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => {
          // При ошибке загрузки показываем заглушку
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const placeholder = target.nextElementSibling as HTMLElement
          if (placeholder) placeholder.style.display = 'flex'
        }}
      />
    )
  }

  return (
    <div
      className={`product-image-placeholder ${className || ''}`}
      style={style}
      aria-label={alt}
    >
      <span style={{ fontSize: '3rem', opacity: 0.3 }}>📦</span>
    </div>
  )
}
