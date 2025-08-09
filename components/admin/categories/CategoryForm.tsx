'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

// Form validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format'),
  icon: z.string().min(1, 'Icon is required').max(10, 'Icon too long'),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().min(0, 'Sort order must be positive').max(9999, 'Sort order too large').optional(),
  seo: z.object({
    title: z.string().max(200, 'SEO title too long').optional(),
    description: z.string().max(300, 'SEO description too long').optional(),
    keywords: z.array(z.string()).optional()
  }).optional(),
  hero: z.object({
    title: z.string().max(100, 'Hero title too long').optional(),
    subtitle: z.string().max(200, 'Hero subtitle too long').optional()
  }).optional()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<CategoryFormData>
  categoryId?: string
  onSuccess?: (category: any) => void
  onCancel?: () => void
}

const popularColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

const commonIcons = [
  '📁', '💻', '🏥', '✈️', '🍕', '💼', '📚', '⚽', '🎵', '🎨', 
  '🔧', '💡', '🌟', '📸', '🎯', '🚗', '🏠', '💰', '🌱', '🔬'
]

export default function CategoryForm({ 
  mode, 
  initialData, 
  categoryId, 
  onSuccess, 
  onCancel 
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      color: initialData?.color || '#3B82F6',
      icon: initialData?.icon || '📁',
      featured: initialData?.featured || false,
      active: initialData?.active !== false, // Default to true
      sortOrder: initialData?.sortOrder || 999,
      seo: {
        title: initialData?.seo?.title || '',
        description: initialData?.seo?.description || '',
        keywords: initialData?.seo?.keywords || []
      },
      hero: {
        title: initialData?.hero?.title || '',
        subtitle: initialData?.hero?.subtitle || ''
      }
    }
  })

  const watchedColor = watch('color')
  const watchedIcon = watch('icon')
  const watchedKeywords = watch('seo.keywords') || []
  const watchedName = watch('name')
  const watchedDescription = watch('description')

  // Auto-populate SEO and hero fields
  React.useEffect(() => {
    if (watchedName && !watch('seo.title')) {
      setValue('seo.title', watchedName)
    }
    if (watchedDescription && !watch('seo.description')) {
      setValue('seo.description', watchedDescription)
    }
    if (watchedName && !watch('hero.title')) {
      setValue('hero.title', watchedName)
    }
    if (watchedDescription && !watch('hero.subtitle')) {
      setValue('hero.subtitle', watchedDescription)
    }
  }, [watchedName, watchedDescription, setValue, watch])

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

  const onSubmit = async (data: CategoryFormData) => {
    if (!currentUser?.uid) {
      toast.error('Authentication required')
      return
    }

    setIsLoading(true)
    
    try {
      const token = await currentUser.getIdToken()
      
      const submitData = {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        featured: data.featured || false,
        active: data.active !== false, // Default to true
        sortOrder: data.sortOrder || 999,
        seo: {
          title: data.seo?.title || data.name,
          description: data.seo?.description || data.description,
          keywords: data.seo?.keywords || []
        },
        hero: {
          title: data.hero?.title || data.name,
          subtitle: data.hero?.subtitle || data.description
        }
      }

      const url = mode === 'create' 
        ? '/api/admin/categories'
        : `/api/admin/categories/${categoryId}`
      
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
        throw new Error(result.error || `Failed to ${mode} category`)
      }

      toast.success(`Category ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push('/admin/categories')
      }

    } catch (error) {
      console.error(`Error ${mode}ing category:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} category`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/admin/categories')
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
          <p className="text-sm text-gray-500 mt-1">Essential details for your category</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Category Name *
            </label>
            <div className="relative">
              <input
                {...register('name')}
                type="text"
                className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 ${
                  errors.name 
                    ? 'ring-red-300 focus:ring-red-500' 
                    : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                }`}
                placeholder="e.g., Technology, Health, Finance"
                disabled={isLoading}
              />
              {watchedName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400">{watchedName.length}/100</span>
                  </div>
                </div>
              )}
            </div>
            {errors.name ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Choose a clear, descriptive name for your category</p>
            )}
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-semibold text-gray-900 mb-2">
              Display Order
            </label>
            <input
              {...register('sortOrder', { valueAsNumber: true })}
              type="number"
              min="0"
              max="9999"
              className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 ${
                errors.sortOrder 
                  ? 'ring-red-300 focus:ring-red-500' 
                  : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
              }`}
              placeholder="999"
              disabled={isLoading}
            />
            {errors.sortOrder ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.sortOrder.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Lower numbers appear first</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description *
          </label>
          <div className="relative">
            <textarea
              {...register('description')}
              rows={4}
              className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 resize-none ${
                errors.description 
                  ? 'ring-red-300 focus:ring-red-500' 
                  : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
              }`}
              placeholder="Describe what this category covers and what readers can expect to find here..."
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
            <p className="mt-2 text-sm text-gray-500">Help visitors understand what content they'll find in this category</p>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-semibold text-sm">2</span>
            </div>
            Visual Appearance
          </h3>
          <p className="text-sm text-gray-500 mt-1">Customize how your category looks</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="color" className="block text-sm font-semibold text-gray-900 mb-3">
              Brand Color *
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    {...register('color')}
                    type="text"
                    className={`block w-28 rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 font-mono ${
                      errors.color 
                        ? 'ring-red-300 focus:ring-red-500' 
                        : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                    }`}
                    placeholder="#3B82F6"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: watchedColor }}
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Preview</div>
                    <div className="text-xs text-gray-400">{watchedColor}</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Popular Colors</p>
                <div className="flex flex-wrap gap-2">
                  {popularColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg shadow-sm ring-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                        watchedColor === color 
                          ? 'ring-gray-900 ring-offset-2' 
                          : 'ring-gray-200 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue('color', color)}
                      disabled={isLoading}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            {errors.color ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.color.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">This color will be used for category badges and highlights</p>
            )}
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-semibold text-gray-900 mb-3">
              Category Icon *
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    {...register('icon')}
                    type="text"
                    className={`block w-20 rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6 text-center ${
                      errors.icon 
                        ? 'ring-red-300 focus:ring-red-500' 
                        : 'ring-gray-300 focus:ring-blue-500 hover:ring-gray-400'
                    }`}
                    placeholder="📁"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ring-1 ring-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    {watchedIcon}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Preview</div>
                    <div className="text-xs text-gray-400">Category icon</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Popular Icons</p>
                <div className="grid grid-cols-10 gap-1">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`w-8 h-8 text-lg rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 flex items-center justify-center ${
                        watchedIcon === icon 
                          ? 'bg-blue-100 ring-2 ring-blue-500' 
                          : 'hover:bg-gray-50 hover:ring-1 hover:ring-gray-200'
                      }`}
                      onClick={() => setValue('icon', icon)}
                      disabled={isLoading}
                      title={`Use ${icon} icon`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {errors.icon ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.icon.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Choose an emoji that represents your category</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900">Settings</h4>
        
        <div className="space-y-4">
          <label className="inline-flex items-center">
            <input
              {...register('featured')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Featured category (shown prominently)</span>
          </label>

          <label className="inline-flex items-center">
            <input
              {...register('active')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Active (visible to visitors)</span>
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900">SEO & Meta</h4>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="seo.title" className="block text-sm font-medium text-gray-700">
              SEO Title
            </label>
            <input
              {...register('seo.title')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Auto-filled from name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="hero.title" className="block text-sm font-medium text-gray-700">
              Hero Title
            </label>
            <input
              {...register('hero.title')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Auto-filled from name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="seo.description" className="block text-sm font-medium text-gray-700">
            SEO Description
          </label>
          <textarea
            {...register('seo.description')}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Auto-filled from description"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="hero.subtitle" className="block text-sm font-medium text-gray-700">
            Hero Subtitle
          </label>
          <textarea
            {...register('hero.subtitle')}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Auto-filled from description"
            disabled={isLoading}
          />
        </div>

        {/* SEO Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SEO Keywords
          </label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            {watchedKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add SEO keyword..."
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              disabled={isLoading}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="bg-gray-50 -mx-6 px-6 py-4 mt-8 flex justify-between items-center rounded-b-xl">
        <div className="text-sm text-gray-500">
          {mode === 'create' ? 'Create a new category' : 'Update category settings'}
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
                {mode === 'create' ? 'Create Category' : 'Update Category'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
    </div>
  )
}