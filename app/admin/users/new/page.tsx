'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import UserForm from '@/components/admin/users/UserForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export default function NewUserPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Users', href: '/admin/users' },
    { name: 'New User', current: true }
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

  return (
    <AdminLayout 
      title="Create New User" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new user account with appropriate role and permissions.
            </p>
          </div>
          
          <div className="p-6">
            <UserForm 
              mode="create"
              onSuccess={(user) => {
                // Redirect will be handled by the form component
                console.log('User created:', user)
              }}
              onCancel={() => {
                // Redirect handled by the form component
                console.log('User creation cancelled')
              }}
            />
          </div>
        </div>

        {/* Role Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            🔐 Role Permissions Reference
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Admin</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• Site configuration</li>
                <li>• All content operations</li>
                <li>• Analytics and reporting</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Editor</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Content management</li>
                <li>• Category management</li>
                <li>• Media management</li>
                <li>• Content moderation</li>
                <li>• Analytics viewing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Author</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create/edit own posts</li>
                <li>• Upload own media</li>
                <li>• Draft management</li>
                <li>• View own analytics</li>
                <li>• Profile management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-yellow-900 mb-4">
            ⚠️ Security Guidelines
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">Password Requirements</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Minimum 6 characters (8+ recommended)</li>
                <li>• Mix of letters, numbers, and symbols</li>
                <li>• Avoid common passwords</li>
                <li>• Users should change on first login</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">Best Practices</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use corporate email addresses</li>
                <li>• Enable email verification</li>
                <li>• Set up MFA when possible</li>
                <li>• Regular permission reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}