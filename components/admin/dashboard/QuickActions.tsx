'use client'

import Link from 'next/link'
import {
  PlusIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  PhotoIcon,
  UserPlusIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'

interface QuickAction {
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  color: string
  permission?: string
}

export default function QuickActions() {
  const { hasPermission } = useAuth()

  const actions: QuickAction[] = [
    {
      name: 'New Post',
      description: 'Create a new blog post',
      href: '/admin/posts/new',
      icon: DocumentPlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      permission: 'posts.create'
    },
    {
      name: 'Add Category',
      description: 'Create a new category',
      href: '/admin/categories/new',
      icon: FolderPlusIcon,
      color: 'bg-green-500 hover:bg-green-600',
      permission: 'categories.create'
    },
    {
      name: 'Upload Media',
      description: 'Upload new media files',
      href: '/admin/media/upload',
      icon: PhotoIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      permission: 'media.upload'
    },
    {
      name: 'Add User',
      description: 'Invite a new team member',
      href: '/admin/users/new',
      icon: UserPlusIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      permission: 'users.create'
    },
    {
      name: 'Settings',
      description: 'Configure site settings',
      href: '/admin/settings',
      icon: CogIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      permission: 'settings.view'
    }
  ]

  // Filter actions based on user permissions
  const allowedActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  )

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Common tasks and shortcuts to help you manage your content efficiently.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allowedActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
          >
            <div>
              <span className={`rounded-lg inline-flex p-3 text-white ${action.color} transition-colors duration-200`}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                <span className="absolute inset-0" aria-hidden="true" />
                {action.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {action.description}
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <PlusIcon className="h-6 w-6" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}