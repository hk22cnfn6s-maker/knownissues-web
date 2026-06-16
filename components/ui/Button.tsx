import Link from 'next/link'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm font-body font-semibold text-sm px-5 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary:
    'bg-transparent border border-text-primary text-text-primary hover:bg-text-primary hover:text-white',
  ghost: 'bg-transparent text-accent hover:text-accent-hover',
}

interface CommonProps {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string }

type ButtonProps = ButtonAsButton | ButtonAsLink

export default function Button({
  variant = 'primary',
  className = '',
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
