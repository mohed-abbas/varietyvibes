'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import { classNames } from '@/lib/utils'

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface AdminBreadcrumbProps {
  pages: BreadcrumbItem[]
}

export default function AdminBreadcrumb({ pages }: AdminBreadcrumbProps) {
  if (!pages || pages.length === 0) return null

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link href="/admin" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                aria-hidden="true"
              />
              {page.href && !page.current ? (
                <Link
                  href={page.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  aria-current={page.current ? 'page' : undefined}
                >
                  {page.name}
                </Link>
              ) : (
                <span
                  className={classNames(
                    'ml-4 text-sm font-medium',
                    page.current
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                  aria-current={page.current ? 'page' : undefined}
                >
                  {page.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}