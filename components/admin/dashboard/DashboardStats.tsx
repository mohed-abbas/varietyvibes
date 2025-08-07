'use client'

import { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  FolderIcon,
  PhotoIcon,
  EyeIcon,
  UsersIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import StatsCard, { StatsCardData } from '@/components/admin/common/StatsCard'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalCategories: number
  totalMedia: number
  totalViews: number
  totalUsers: number
  totalComments: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Mock data for now
        setStats({
          totalPosts: 42,
          publishedPosts: 35,
          draftPosts: 7,
          totalCategories: 8,
          totalMedia: 156,
          totalViews: 12847,
          totalUsers: 3,
          totalComments: 89
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Mock data fallback
      setStats({
        totalPosts: 42,
        publishedPosts: 35,
        draftPosts: 7,
        totalCategories: 8,
        totalMedia: 156,
        totalViews: 12847,
        totalUsers: 3,
        totalComments: 89
      })
    } finally {
      setLoading(false)
    }
  }

  const statsData: StatsCardData[] = [
    {
      name: 'Total Posts',
      value: stats?.totalPosts || 0,
      change: '+12%',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'blue'
    },
    {
      name: 'Published',
      value: stats?.publishedPosts || 0,
      change: '+5%',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      name: 'Drafts',
      value: stats?.draftPosts || 0,
      change: '+2',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'yellow'
    },
    {
      name: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderIcon,
      color: 'purple'
    },
    {
      name: 'Media Files',
      value: stats?.totalMedia || 0,
      change: '+23',
      changeType: 'increase',
      icon: PhotoIcon,
      color: 'blue'
    },
    {
      name: 'Total Views',
      value: stats?.totalViews || 0,
      change: '+18%',
      changeType: 'increase',
      icon: EyeIcon,
      color: 'green'
    },
    {
      name: 'Active Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'gray'
    },
    {
      name: 'Comments',
      value: stats?.totalComments || 0,
      change: '+7%',
      changeType: 'increase',
      icon: ChatBubbleLeftIcon,
      color: 'purple'
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          A quick snapshot of your blog's performance and content metrics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={stat.name}
            stat={stat}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}