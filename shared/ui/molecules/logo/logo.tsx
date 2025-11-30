'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoSVG } from '../logo_svg/logo_svg'

export type LogoVariant = 'mainColor' | 'black' | 'white'
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  width?: number
  height?: number
  clickable?: boolean  // Whether the logo is clickable and navigates to dashboard
  onClick?: () => void  // Optional click handler to override default navigation
  externalHref?: string  // External URL for the logo (for public pages) - renders plain <a> tag
}

const LOGO_SIZES = {
  xs: { width: 32, height: 32 },
  sm: { width: 48, height: 48 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
  xl: { width: 128, height: 128 }
} as const

export function Logo({
  variant = 'mainColor',
  size = 'md',
  className = '',
  width,
  height,
  clickable = false,
  onClick,
  externalHref
}: LogoProps) {
  // Get dimensions
  const dimensions = LOGO_SIZES[size]
  const finalWidth = width || dimensions.width
  const finalHeight = height || dimensions.height

  const logoElement = (
    <LogoSVG
      variant={variant}
      className={className}
      width={finalWidth}
      height={finalHeight}
    />
  )

  // If externalHref is provided, use plain <a> tag for external links
  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer transition-opacity hover:opacity-80"
      >
        {logoElement}
      </a>
    )
  }

  // If onClick is provided, use custom click handler
  if (onClick) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer transition-opacity hover:opacity-80"
      >
        {logoElement}
      </div>
    )
  }

  // If clickable, wrap in Link to overview
  if (clickable) {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'en'

    return (
      <Link href={`/${locale}/overview`} className="cursor-pointer transition-opacity hover:opacity-80">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}

// Convenience components for common use cases
export function HeaderLogo(props: Omit<LogoProps, 'size'>) {
  return <Logo size="md" {...props} />
}

export function SidebarLogo(props: Omit<LogoProps, 'size'>) {
  return <Logo size="xs" clickable={true} {...props} />
}

export function AuthLogo(props: Omit<LogoProps, 'size'>) {
  return <Logo size="lg" {...props} />
}

export function CompactLogo(props: Omit<LogoProps, 'size'>) {
  return <Logo size="xs" {...props} />
}