'use client'

import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { classNames } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ComponentType<any>
  onRowClick?: (item: T) => void
  className?: string
}

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  emptyIcon: EmptyIcon,
  onRowClick,
  className
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: keyof T | string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = getValueByKey(a, sortConfig.key)
      const bValue = getValueByKey(b, sortConfig.key)

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const getValueByKey = (obj: any, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((o, k) => o?.[k], obj)
    }
    return obj[key]
  }

  const renderCell = (column: Column<T>, item: T) => {
    const value = getValueByKey(item, column.key)
    
    if (column.render) {
      return column.render(value, item)
    }
    
    return value
  }

  const sortedData = getSortedData()

  if (loading) {
    return (
      <div className={classNames("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            {/* Table header skeleton */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: columns.map(col => col.width || '1fr').join(' ') }}>
                {columns.map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Table rows skeleton */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border-b border-gray-100 py-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: columns.map(col => col.width || '1fr').join(' ') }}>
                  {columns.map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      {data.length === 0 ? (
        <div className="text-center py-12">
          {EmptyIcon && <EmptyIcon className="mx-auto h-12 w-12 text-gray-400" />}
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className={classNames(
                      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      column.sortable ? "cursor-pointer select-none hover:bg-gray-100" : "",
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="flex flex-col">
                          <ChevronUpIcon
                            className={classNames(
                              "h-3 w-3",
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? "text-gray-900"
                                : "text-gray-400"
                            )}
                          />
                          <ChevronDownIcon
                            className={classNames(
                              "h-3 w-3 -mt-1",
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? "text-gray-900"
                                : "text-gray-400"
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={classNames(
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : "",
                    "transition-colors duration-150"
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={classNames(
                        "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                        column.className
                      )}
                    >
                      {renderCell(column, item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}