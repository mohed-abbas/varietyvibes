'use client'

import { classNames } from '@/lib/utils'

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral'
  | 'draft'
  | 'published'
  | 'archived'

interface StatusBadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StatusBadge({ 
  variant, 
  children, 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full font-medium"
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-sm"
  }
  
  const variantClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-gray-100 text-gray-800",
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-red-100 text-red-800"
  }

  return (
    <span 
      className={classNames(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}