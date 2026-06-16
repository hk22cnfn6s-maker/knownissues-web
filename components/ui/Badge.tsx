type BadgeVariant = 'amber' | 'grey' | 'dark'

const variants: Record<BadgeVariant, string> = {
  amber: 'bg-accent/10 text-accent-hover',
  grey: 'bg-border/60 text-text-secondary',
  dark: 'bg-dark-surface text-white',
}

export default function Badge({
  children,
  variant = 'grey',
  className = '',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
