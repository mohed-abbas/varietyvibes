'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/lib/utils'

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void
  title?: string
  actions?: React.ReactNode
}

export default function AdminHeader({ setSidebarOpen, title, actions }: AdminHeaderProps) {
  const { user, signOut } = useAuth()

  const userNavigation = [
    { name: 'Your Profile', href: '#', icon: UserCircleIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'Sign out', onClick: signOut, icon: ArrowRightOnRectangleIcon }
  ]

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 xl:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 xl:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4">
        {/* Page title */}
        <div className="flex-1">
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 ring-1 ring-gray-300"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-x-4">
          {actions}

          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge - show when there are notifications */}
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full bg-gray-50"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=3b82f6&color=fff`}
                alt="User avatar"
              />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {user?.displayName || user?.email}
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 capitalize mt-1">
                    {user?.role}
                  </p>
                </div>
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        className={classNames(
                          active ? 'bg-gray-50' : '',
                          'flex w-full items-center px-3 py-2 text-sm text-gray-700'
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                        {item.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}