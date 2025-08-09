'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import UserForm from '@/components/admin/users/UserForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreUser } from '@/types/admin'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<FirestoreUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser && resolvedParams.id) {
      fetchUser()
    }
  }, [currentUser, resolvedParams.id])

  const fetchUser = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const token = await currentUser.getIdToken()
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 404) {
        setError('User not found')
      } else if (response.status === 403) {
        setError('You do not have permission to edit users')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load user')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedUser: any) => {
    console.log('User updated:', updatedUser)
    router.push('/admin/users')
  }

  const handleCancel = () => {
    router.push('/admin/users')
  }

  if (loading) {
    return (
      <AdminLayout title="Edit User">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading user...</span>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Edit User">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading user</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout title="Edit User">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Users', href: '/admin/users' },
    { name: user.displayName || user.email, href: `/admin/users/${user.uid}` },
    { name: 'Edit', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/users"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Back to Users
      </Link>
    </div>
  )

  // Transform user data for the form (exclude password fields for edit mode)
  const initialData = {
    email: user.email,
    displayName: user.displayName || '',
    role: user.role as 'admin' | 'editor' | 'author',
    bio: user.bio || '',
    expertise: user.expertise || [],
    // Don't include password fields for edit mode
    password: '',
    confirmPassword: ''
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100'
      case 'editor':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <AdminLayout 
      title={`Edit: ${user.displayName || user.email}`} 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update user information and permissions.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                {user.lastLogin && (
                  <div>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <UserForm 
              mode="edit"
              userId={user.uid}
              initialData={initialData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* User Profile Preview */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 text-sm text-gray-500">
              How this user appears in the system.
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=3b82f6&color=fff`}
                  alt={user.displayName || user.email}
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {user.displayName || 'No Display Name'}
                  </h4>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                {user.bio && (
                  <p className="text-sm text-gray-700 mt-2">{user.bio}</p>
                )}
                {user.expertise && user.expertise.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Expertise:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.social && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Social Links:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.social.website && (
                        <a href={user.social.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                          Website
                        </a>
                      )}
                      {user.social.twitter && (
                        <a href={`https://twitter.com/${user.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                          Twitter
                        </a>
                      )}
                      {user.social.linkedin && (
                        <a href={`https://linkedin.com/in/${user.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                          LinkedIn
                        </a>
                      )}
                      {user.social.github && (
                        <a href={`https://github.com/${user.social.github}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            📊 User Statistics
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.postsCount || 0}</div>
              <div className="text-sm text-gray-500">Published Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{user.draftsCount || 0}</div>
              <div className="text-sm text-gray-500">Draft Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.totalViews?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.permissions?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Permissions</div>
            </div>
          </div>
        </div>

        {/* Permissions Information */}
        {user.permissions && user.permissions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-4">
              🔐 User Permissions
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-yellow-900 mb-4">
            🔒 Security Notice
          </h4>
          <div className="text-sm text-yellow-700">
            <ul className="space-y-1">
              <li>• Changing user roles will immediately affect their permissions</li>
              <li>• Password changes require the user to log in again</li>
              <li>• Deactivating users will prevent them from accessing the admin panel</li>
              <li>• Only admins can modify user roles and permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}