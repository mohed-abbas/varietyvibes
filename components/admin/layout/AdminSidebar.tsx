'use client'

import { Fragment, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react'
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  PhotoIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  XMarkIcon,
  Bars3Icon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: any
  current: boolean
  permission?: string
  badge?: string
}

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, hasPermission } = useAuth()

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      current: pathname === '/admin'
    },
    {
      name: 'Posts',
      href: '/admin/posts',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/admin/posts'),
      permission: 'posts.view'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderIcon,
      current: pathname.startsWith('/admin/categories'),
      permission: 'categories.view'
    },
    {
      name: 'Media Library',
      href: '/admin/media',
      icon: PhotoIcon,
      current: pathname.startsWith('/admin/media'),
      permission: 'media.view'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      current: pathname.startsWith('/admin/users'),
      permission: 'users.view'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: pathname.startsWith('/admin/analytics'),
      permission: 'analytics.view'
    },
    {
      name: 'Diagnostics',
      href: '/admin/diagnostics',
      icon: WrenchScrewdriverIcon,
      current: pathname.startsWith('/admin/diagnostics'),
      permission: 'system.diagnostics'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      current: pathname.startsWith('/admin/settings'),
      permission: 'settings.view'
    }
  ]

  // Filter navigation based on user permissions
  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  )

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/5">
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/admin">
          <h2 className="text-xl font-bold text-white">Variety Vibes</h2>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-red-600 px-2.5 py-0.5 text-center text-xs font-medium text-white ring-1 ring-inset ring-red-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white">
              <img
                className="h-8 w-8 rounded-full bg-gray-800"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=374151&color=fff`}
                alt="User avatar"
              />
              <span className="sr-only">Your profile</span>
              <div className="flex flex-col">
                <span aria-hidden="true">{user?.displayName}</span>
                <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 xl:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}