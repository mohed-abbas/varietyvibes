'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { classNames } from '@/lib/utils'

export interface StatsCardData {
  name: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ComponentType<any>
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
}

interface StatsCardProps {
  stat: StatsCardData
  loading?: boolean
}

export default function StatsCard({ stat, loading = false }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  }

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-500'
  }

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-sm rounded-lg animate-pulse">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {stat.icon && (
              <div className={classNames(
                'p-2 rounded-md',
                colorClasses[stat.color || 'blue']
              )}>
                <stat.icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {typeof stat.value === 'number' 
                    ? stat.value.toLocaleString() 
                    : stat.value
                  }
                </div>
                {stat.change && stat.changeType && (
                  <div className={classNames(
                    'ml-2 flex items-baseline text-sm font-semibold',
                    changeColorClasses[stat.changeType]
                  )}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    ) : null}
                    <span className="sr-only">
                      {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                    </span>
                    {stat.change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}