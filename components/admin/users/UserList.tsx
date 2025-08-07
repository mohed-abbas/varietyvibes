'use client'

import { useState, useEffect } from 'react'
import { 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import DataTable, { Column } from '@/components/admin/common/DataTable'
import StatusBadge from '@/components/admin/common/StatusBadge'
import { FirestoreUser } from '@/types/admin'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function UserList() {
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        // Mock data for now
        setUsers([
          {
            uid: 'user1',
            email: 'admin@example.com',
            displayName: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
            role: 'admin',
            permissions: ['posts.create', 'posts.edit', 'posts.delete', 'users.manage'],
            active: true,
            bio: 'Lead developer and content strategist',
            expertise: ['React', 'TypeScript', 'Node.js'],
            social: {
              twitter: '@johndoe',
              linkedin: 'johndoe',
              github: 'johndoe',
              website: 'https://johndoe.dev'
            },
            createdAt: new Date('2024-01-01'),
            lastLogin: new Date('2024-01-22'),
            joinDate: new Date('2024-01-01'),
            postsCount: 15,
            draftsCount: 3,
            totalViews: 12547
          },
          {
            uid: 'user2',
            email: 'editor@example.com',
            displayName: 'Jane Smith',
            role: 'editor',
            permissions: ['posts.create', 'posts.edit', 'posts.publish'],
            active: true,
            bio: 'Content editor and SEO specialist',
            expertise: ['SEO', 'Content Writing', 'Analytics'],
            social: {
              linkedin: 'janesmith'
            },
            createdAt: new Date('2024-01-05'),
            lastLogin: new Date('2024-01-21'),
            joinDate: new Date('2024-01-05'),
            postsCount: 8,
            draftsCount: 2,
            totalViews: 6234
          },
          {
            uid: 'user3',
            email: 'author@example.com',
            displayName: 'Mike Johnson',
            role: 'author',
            permissions: ['posts.create', 'posts.edit.own'],
            active: false,
            bio: 'Technical writer and developer',
            expertise: ['Python', 'Machine Learning', 'Data Science'],
            social: {
              github: 'mikejohnson'
            },
            createdAt: new Date('2024-01-10'),
            lastLogin: new Date('2024-01-15'),
            joinDate: new Date('2024-01-10'),
            postsCount: 4,
            draftsCount: 1,
            totalViews: 2156
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(user => user.uid !== userId))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.uid === userId)
    if (!user) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active })
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u.uid === userId 
            ? { ...u, active: !u.active }
            : u
        ))
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return ShieldCheckIcon
      case 'editor':
        return ShieldExclamationIcon
      default:
        return UserIcon
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600'
      case 'editor':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const columns: Column<FirestoreUser>[] = [
    {
      key: 'displayName',
      title: 'User',
      render: (_, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full"
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=3b82f6&color=fff`}
              alt={user.displayName}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.displayName}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      width: '30%'
    },
    {
      key: 'role',
      title: 'Role',
      render: (role, user) => {
        const Icon = getRoleIcon(role)
        return (
          <div className="flex items-center">
            <Icon className={`h-4 w-4 mr-2 ${getRoleColor(role)}`} />
            <span className={`text-sm font-medium capitalize ${getRoleColor(role)}`}>
              {role}
            </span>
          </div>
        )
      },
      sortable: true,
      width: '15%'
    },
    {
      key: 'active',
      title: 'Status',
      render: (active) => (
        <StatusBadge variant={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
      sortable: true,
      width: '10%'
    },
    {
      key: 'postsCount',
      title: 'Posts',
      render: (postsCount, user) => (
        <div>
          <div className="text-sm text-gray-900">
            {postsCount} published
          </div>
          <div className="text-xs text-gray-500">
            {user.draftsCount} drafts
          </div>
        </div>
      ),
      sortable: true,
      width: '12%'
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (lastLogin) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(lastLogin)}
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(lastLogin)}
          </div>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      key: 'totalViews',
      title: 'Total Views',
      render: (totalViews) => (
        <span className="text-sm text-gray-900">
          {totalViews?.toLocaleString() || '0'}
        </span>
      ),
      sortable: true,
      width: '10%'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {/* Navigate to edit user */}}
            className="text-blue-600 hover:text-blue-900"
            title="Edit user"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleUserStatus(user.uid)}
            className={user.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
            title={user.active ? "Deactivate user" : "Activate user"}
          >
            {user.active ? (
              <ShieldExclamationIcon className="h-4 w-4" />
            ) : (
              <ShieldCheckIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleDeleteUser(user.uid)}
            className="text-red-600 hover:text-red-900"
            title="Delete user"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      width: '8%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* User stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Admins</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldExclamationIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Editors</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'editor').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="No users found. Invite your first team member to get started!"
        emptyIcon={UserIcon}
      />
    </div>
  )
}