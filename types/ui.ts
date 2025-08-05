// UI-related TypeScript interfaces

export interface HeroSection {
  title: string
  subtitle: string
  description: string
  ctaButton: {
    text: string
    href: string
    variant: 'primary' | 'secondary' | 'outline'
  }
  backgroundImage?: string
  badges?: {
    text: string
    color: 'green' | 'blue' | 'purple' | 'red' | 'yellow'
  }[]
}

export interface NavigationItem {
  name: string
  href: string
  current: boolean
  description?: string
  icon?: string
  children?: NavigationItem[]
}

export interface MobileMenuConfig {
  showSearch: boolean
  showCategories: boolean
  showSocialLinks: boolean
  closeOnNavigate: boolean
}

export interface FooterSection {
  title: string
  links: {
    name: string
    href: string
    description?: string
  }[]
}

export interface SocialLink {
  name: string
  href: string
  icon: string
  color: string
}

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export interface InputProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  className?: string
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}