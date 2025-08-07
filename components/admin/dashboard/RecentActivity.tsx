'use client'

import { useState, useEffect } from 'react'
import { formatRelativeTime } from '@/lib/utils'
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface ActivityItem {
  id: string
  type: 'post_created' | 'post_updated' | 'post_published' | 'post_deleted' | 'user_login'
  title: string
  description: string
  user: string
  timestamp: Date
  metadata?: any
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/dashboard/activity')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        // Mock data for now
        setActivities([
          {
            id: '1',
            type: 'post_published',
            title: 'New post published',
            description: '"10 Tips for Better Web Performance" was published',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'post_created',
            title: 'Draft created',
            description: '"Understanding React Hooks" was saved as draft',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'user_login',
            title: 'User logged in',
            description: 'Admin user accessed the dashboard',
            user: 'Admin',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          },
          {
            id: '4',
            type: 'post_updated',
            title: 'Post updated',
            description: '"Getting Started with TypeScript" was modified',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            id: '5',
            type: 'post_deleted',
            title: 'Post deleted',
            description: '"Old Tutorial Post" was moved to trash',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_created':
        return DocumentTextIcon
      case 'post_updated':
        return PencilIcon
      case 'post_published':
        return EyeIcon
      case 'post_deleted':
        return TrashIcon
      case 'user_login':
        return UserIcon
      default:
        return DocumentTextIcon
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_created':
        return 'bg-blue-100 text-blue-600'
      case 'post_updated':
        return 'bg-yellow-100 text-yellow-600'
      case 'post_published':
        return 'bg-green-100 text-green-600'
      case 'post_deleted':
        return 'bg-red-100 text-red-600'
      case 'user_login':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-500">
          Latest actions and updates from your team.
        </p>
      </div>
      
      <div className="px-6 py-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first post or inviting team members.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.map((activity, activityIdx) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {activity.title}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <span>{activity.user}</span>
                            <span className="mx-1">•</span>
                            <time dateTime={activity.timestamp.toISOString()}>
                              {formatRelativeTime(activity.timestamp)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm">
            <button className="font-medium text-blue-600 hover:text-blue-500">
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}