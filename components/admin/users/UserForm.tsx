'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

// Form validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  role: z.enum(['admin', 'editor', 'author'], { 
    errorMap: () => ({ message: 'Please select a valid role' }) 
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  expertise: z.array(z.string()).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<UserFormData>
  userId?: string
  onSuccess?: (user: any) => void
  onCancel?: () => void
}

export default function UserForm({ 
  mode, 
  initialData, 
  userId, 
  onSuccess, 
  onCancel 
}: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [expertiseInput, setExpertiseInput] = useState('')
  
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email || '',
      displayName: initialData?.displayName || '',
      role: initialData?.role || 'author',
      password: '',
      confirmPassword: '',
      bio: initialData?.bio || '',
      expertise: initialData?.expertise || []
    }
  })

  const watchedExpertise = watch('expertise') || []

  const addExpertise = () => {
    if (expertiseInput.trim() && !watchedExpertise.includes(expertiseInput.trim())) {
      const newExpertise = [...watchedExpertise, expertiseInput.trim()]
      setValue('expertise', newExpertise)
      setExpertiseInput('')
    }
  }

  const removeExpertise = (index: number) => {
    const newExpertise = watchedExpertise.filter((_, i) => i !== index)
    setValue('expertise', newExpertise)
  }

  const onSubmit = async (data: UserFormData) => {
    if (!currentUser?.uid) {
      toast.error('Authentication required')
      return
    }

    setIsLoading(true)
    
    try {
      // Get auth token
      const token = await currentUser.getIdToken()
      
      const submitData = {
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        bio: data.bio || '',
        expertise: data.expertise || []
      }

      if (mode === 'create') {
        // Add password for creation
        Object.assign(submitData, { password: data.password })
      }

      const url = mode === 'create' 
        ? '/api/admin/users'
        : `/api/admin/users/${userId}`
      
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
        throw new Error(result.error || `Failed to ${mode} user`)
      }

      toast.success(`User ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      if (onSuccess) {
        onSuccess(result)
      } else {
        // Default redirect
        router.push('/admin/users')
      }

    } catch (error) {
      console.error(`Error ${mode}ing user:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} user`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/admin/users')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="user@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name *
          </label>
          <input
            {...register('displayName')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="John Doe"
            disabled={isLoading}
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
          )}
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role *
        </label>
        <select
          {...register('role')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="author">Author</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Password Fields (Create mode only) */}
      {mode === 'create' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <div className="mt-1 relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Confirm password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          {...register('bio')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief description about the user..."
          disabled={isLoading}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Expertise Areas
        </label>
        <div className="mt-1 flex flex-wrap gap-2 mb-2">
          {watchedExpertise.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeExpertise(index)}
                className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500"
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
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add expertise area..."
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={addExpertise}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            disabled={isLoading}
          >
            Add
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
        </button>
      </div>
    </form>
  )
}