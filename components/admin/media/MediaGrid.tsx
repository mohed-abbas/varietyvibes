'use client'

import { useState, useEffect } from 'react'
import { 
  PhotoIcon,
  DocumentIcon,
  PlayIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { FirestoreMedia } from '@/types/admin'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'

interface MediaGridProps {
  onSelect?: (media: FirestoreMedia) => void
  selectable?: boolean
  selectedIds?: string[]
}

export default function MediaGrid({ onSelect, selectable = false, selectedIds = [] }: MediaGridProps) {
  const [media, setMedia] = useState<FirestoreMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      } else {
        // Mock data for now
        setMedia([
          {
            id: '1',
            filename: 'hero-image.jpg',
            originalName: 'hero-image.jpg',
            storageRef: 'media/hero-image.jpg',
            downloadUrl: '/images/hero-bg.jpg',
            mimeType: 'image/jpeg',
            size: 2048576,
            dimensions: { width: 1920, height: 1080 },
            uploadedBy: 'user1',
            uploadedAt: new Date('2024-01-15'),
            alt: 'Hero background image',
            caption: 'Beautiful landscape for hero section',
            usedInPosts: ['post1', 'post2'],
            usedInCategories: []
          },
          {
            id: '2',
            filename: 'tutorial-video.mp4',
            originalName: 'react-tutorial.mp4',
            storageRef: 'media/tutorial-video.mp4',
            downloadUrl: '/videos/tutorial.mp4',
            mimeType: 'video/mp4',
            size: 15728640,
            uploadedBy: 'user2',
            uploadedAt: new Date('2024-01-20'),
            caption: 'React tutorial video',
            usedInPosts: ['post3'],
            usedInCategories: []
          },
          {
            id: '3',
            filename: 'document.pdf',
            originalName: 'user-guide.pdf',
            storageRef: 'media/document.pdf',
            downloadUrl: '/docs/guide.pdf',
            mimeType: 'application/pdf',
            size: 5242880,
            uploadedBy: 'user1',
            uploadedAt: new Date('2024-01-22'),
            caption: 'User guide document',
            usedInPosts: [],
            usedInCategories: []
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMedia(media.filter(item => item.id !== mediaId))
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon
    if (mimeType.startsWith('video/')) return PlayIcon
    return DocumentIcon
  }

  const renderMediaItem = (item: FirestoreMedia) => {
    const isSelected = selectedIds.includes(item.id)
    const Icon = getFileIcon(item.mimeType)

    return (
      <div
        key={item.id}
        className={`group relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
          selectable && isSelected 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSelect?.(item)}
      >
        <div className="aspect-square p-4 flex items-center justify-center overflow-hidden rounded-t-lg bg-gray-50">
          {item.mimeType.startsWith('image/') ? (
            <img
              src={item.downloadUrl}
              alt={item.alt || item.filename}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <Icon className="h-12 w-12 text-gray-400" />
          )}
        </div>

        <div className="p-3">
          <div className="text-sm font-medium text-gray-900 truncate">
            {item.originalName}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatFileSize(item.size)}
          </div>
          {item.dimensions && (
            <div className="text-xs text-gray-500">
              {item.dimensions.width} × {item.dimensions.height}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2">
            {formatRelativeTime(item.uploadedAt)}
          </div>
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(item.downloadUrl, '_blank')
              }}
              className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-white"
            >
              <EyeIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteMedia(item.id)
              }}
              className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-white"
            >
              <TrashIcon className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Usage indicator */}
        {(item.usedInPosts.length > 0 || item.usedInCategories.length > 0) && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Used in {item.usedInPosts.length + item.usedInCategories.length}
            </span>
          </div>
        )}

        {/* Selection indicator */}
        {selectable && isSelected && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex border border-gray-300 rounded-md">
          <button
            className={`px-3 py-1 text-sm font-medium ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium border-l border-gray-300 ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first image or document.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {media.map(renderMediaItem)}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center p-4 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                selectable && selectedIds.includes(item.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelect?.(item)}
            >
              <div className="flex-shrink-0">
                {item.mimeType.startsWith('image/') ? (
                  <img
                    src={item.downloadUrl}
                    alt={item.alt || item.filename}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    {React.createElement(getFileIcon(item.mimeType), { className: "h-6 w-6 text-gray-400" })}
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.originalName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(item.size)} • {formatRelativeTime(item.uploadedAt)}
                </p>
                {item.dimensions && (
                  <p className="text-xs text-gray-400">
                    {item.dimensions.width} × {item.dimensions.height}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(item.downloadUrl, '_blank')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteMedia(item.id)
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}