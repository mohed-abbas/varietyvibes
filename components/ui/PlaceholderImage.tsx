interface PlaceholderImageProps {
  width: number
  height: number
  text?: string
  className?: string
}

export default function PlaceholderImage({ 
  width, 
  height, 
  text = "Image",
  className = ""
}: PlaceholderImageProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium ${className}`}
      style={{ width, height }}
    >
      {text}
    </div>
  )
}