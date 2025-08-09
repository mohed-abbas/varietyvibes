'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

// Form validation schema
const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt too long').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredImage: z.object({
    url: z.string().optional(),
    alt: z.string().optional()
  }).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  scheduledFor: z.string().optional()
})

type PostFormData = z.infer<typeof postSchema>

interface PostFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<PostFormData>
  postId?: string
  onSuccess?: (post: any) => void
  onCancel?: () => void
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function PostForm({ 
  mode, 
  initialData, 
  postId, 
  onSuccess, 
  onCancel 
}: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tagInput, setTagInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      categoryId: initialData?.categoryId || '',
      tags: initialData?.tags || [],
      featured: initialData?.featured || false,
      featuredImage: initialData?.featuredImage || { url: '', alt: '' },
      seo: initialData?.seo || {
        metaTitle: '',
        metaDescription: '',
        keywords: []
      },
      status: initialData?.status || 'draft',
      scheduledFor: initialData?.scheduledFor || ''
    }
  })

  const watchedTags = watch('tags') || []
  const watchedKeywords = watch('seo.keywords') || []
  const watchedStatus = watch('status')
  const watchedTitle = watch('title')
  const watchedDescription = watch('description')

  // Auto-populate SEO fields when title/description change
  useEffect(() => {
    if (watchedTitle && !watch('seo.metaTitle')) {
      setValue('seo.metaTitle', watchedTitle)
    }
    if (watchedDescription && !watch('seo.metaDescription')) {
      setValue('seo.metaDescription', watchedDescription)
    }
  }, [watchedTitle, watchedDescription, setValue, watch])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentUser?.uid) return

      try {
        const token = await currentUser.getIdToken()
        const response = await fetch('/api/admin/categories?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [currentUser])

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()]
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = watchedTags.filter((_, i) => i !== index)
    setValue('tags', newTags)
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !watchedKeywords.includes(keywordInput.trim())) {
      const newKeywords = [...watchedKeywords, keywordInput.trim()]
      setValue('seo.keywords', newKeywords)
      setKeywordInput('')
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = watchedKeywords.filter((_, i) => i !== index)
    setValue('seo.keywords', newKeywords)
  }

  const onSubmit = async (data: PostFormData) => {
    if (!currentUser?.uid) {
      toast.error('Authentication required')
      return
    }

    setIsLoading(true)
    
    try {
      const token = await currentUser.getIdToken()
      
      const submitData = {
        title: data.title,
        description: data.description,
        content: data.content,
        excerpt: data.excerpt || data.description.substring(0, 160),
        categoryId: data.categoryId,
        tags: data.tags || [],
        featured: data.featured || false,
        featuredImage: data.featuredImage?.url ? {
          url: data.featuredImage.url,
          alt: data.featuredImage.alt || data.title
        } : null,
        seo: {
          metaTitle: data.seo?.metaTitle || data.title,
          metaDescription: data.seo?.metaDescription || data.description,
          keywords: data.seo?.keywords || []
        },
        status: data.status,
        scheduledFor: data.status === 'scheduled' && data.scheduledFor ? data.scheduledFor : null
      }

      const url = mode === 'create' 
        ? '/api/admin/posts'
        : `/api/admin/posts/${postId}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${mode} post`)
      }

      toast.success(`Post ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push('/admin/posts')
      }

    } catch (error) {
      console.error(`Error ${mode}ing post:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} post`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/admin/posts')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              Basic Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">Essential details for your post</p>
          </div>
        
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              Post Title *
            </label>
            <div className="relative">
              <input
                {...register('title')}
                type="text"
                className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 ${
                  errors.title 
                    ? 'ring-red-300 focus:ring-red-500' 
                    : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                }`}
                placeholder="Enter an engaging, descriptive title for your post..."
                disabled={isLoading}
              />
              {watchedTitle && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400">{watchedTitle.length}/200</span>
                  </div>
                </div>
              )}
            </div>
            {errors.title ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Create a compelling headline that captures your reader's attention</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Post Description *
            </label>
            <div className="relative">
              <textarea
                {...register('description')}
                rows={3}
                className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 resize-none ${
                  errors.description 
                    ? 'ring-red-300 focus:ring-red-500' 
                    : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                }`}
                placeholder="Write a brief, compelling summary that describes what readers will learn or gain from this post..."
                disabled={isLoading}
              />
              {watchedDescription && (
                <div className="absolute bottom-2 right-2">
                  <span className="text-xs text-gray-400 bg-white px-1 rounded">{watchedDescription.length}/500</span>
                </div>
              )}
            </div>
            {errors.description ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">This description will be used in post previews and search results</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-900 mb-2">
              Post Content *
            </label>
            <div className="relative">
              <textarea
                {...register('content')}
                rows={16}
                className={`block w-full rounded-lg border-0 py-3 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 font-mono ${
                  errors.content 
                    ? 'ring-red-300 focus:ring-red-500' 
                    : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                }`}
                placeholder="Write your post content here using Markdown formatting...\n\n# Main Heading\n## Subheading\n\n**Bold text** and *italic text*\n\n- Bullet points\n- Are supported\n\n[Links](https://example.com) and images work too!"
                disabled={isLoading}
              />
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>📝 Markdown supported</span>
                  <span>•</span>
                  <span>~{Math.ceil((watch('content') || '').length / 1000)} min read</span>
                </div>
              </div>
            </div>
            {errors.content ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.content.message}
              </p>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                <p className="mb-1">Write your full post content using Markdown for formatting. Supported features:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">**Bold**</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">*Italic*</span>
                  <span className="bg-gray-100 px-2 py-1 rounded"># Headers</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">- Lists</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">[Links](url)</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">```Code```</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-900 mb-2">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 ${
                  errors.categoryId 
                    ? 'ring-red-300 focus:ring-red-500' 
                    : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                }`}
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.categoryId.message}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Choose the most relevant category for your post</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Post Settings
              </label>
              <div className="space-y-3">
                <label className="inline-flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <input
                    {...register('featured')}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Featured Post</div>
                    <div className="text-xs text-gray-500">Show prominently on homepage</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Content Enhancement */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold text-sm">2</span>
              </div>
              Content Enhancement
            </h3>
            <p className="text-sm text-gray-500 mt-1">Tags and additional content settings</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                  >
                    <span className="mr-1">#</span>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-300 hover:text-blue-800 transition-colors duration-200"
                      disabled={isLoading}
                      title={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {watchedTags.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No tags added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:ring-gray-400 sm:text-sm sm:leading-6"
                  placeholder="Add a relevant tag (e.g., tutorial, tips, guide)..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading || !tagInput.trim()}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Tag
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Tags help readers find your content and improve SEO. Use 3-5 relevant keywords.</p>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 font-semibold text-sm">3</span>
              </div>
              Publishing Settings
            </h3>
            <p className="text-sm text-gray-500 mt-1">Control when and how your post is published</p>
          </div>
        
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
                Publication Status *
              </label>
              <select
                {...register('status')}
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 transition-colors duration-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:ring-gray-400 sm:text-sm sm:leading-6"
                disabled={isLoading}
              >
                <option value="draft">📝 Draft - Save for later editing</option>
                <option value="published">🌐 Published - Live on website</option>
                <option value="scheduled">⏰ Scheduled - Publish at specific time</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">Choose how you want to publish this post</p>
            </div>

            <div className={`transition-opacity duration-200 ${watchedStatus === 'scheduled' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label htmlFor="scheduledFor" className="block text-sm font-semibold text-gray-900 mb-2">
                Scheduled Date & Time
              </label>
              <input
                {...register('scheduledFor')}
                type="datetime-local"
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 transition-colors duration-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:ring-gray-400 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200"
                disabled={isLoading || watchedStatus !== 'scheduled'}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="mt-2 text-sm text-gray-500">
                {watchedStatus === 'scheduled' ? 'Select when this post should be published' : 'Available when "Scheduled" status is selected'}
              </p>
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 -mx-6 px-6 py-4 mt-8 flex justify-between items-center rounded-b-xl">
          <div className="text-sm text-gray-500">
            {mode === 'create' ? 'Create a new post for your blog' : 'Update post settings and content'}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode === 'create' ? 'M12 4v16m8-8H4' : 'M5 13l4 4L19 7'} />
                  </svg>
                  {mode === 'create' ? 'Create Post' : 'Update Post'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}