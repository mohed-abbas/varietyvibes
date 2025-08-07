import type { Metadata } from 'next'
import Link from 'next/link'
import { UserPlusIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import UserList from '@/components/admin/users/UserList'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata: Metadata = {
  title: 'Users'
}

export default function UsersPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Users', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/users/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Add User
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="User Management" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* User filters */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <input
              type="search"
              placeholder="Search users..."
              className="flex-1 max-w-sm rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Users table */}
        <UserList />

        {/* Role permissions info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            🔐 Role Permissions Overview
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Admin</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• Site configuration</li>
                <li>• All content operations</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Editor</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Content management</li>
                <li>• Category management</li>
                <li>• Media management</li>
                <li>• Limited user access</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Author</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create/edit own posts</li>
                <li>• Upload own media</li>
                <li>• Draft management</li>
                <li>• View own analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}