import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border border-border bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        outline: 'border border-border text-foreground',
        changelog: 'border-transparent bg-[var(--teal-dim)] text-[var(--teal)]',
        youtube: 'border-transparent bg-[var(--rose-dim)] text-[var(--rose)]',
        rss: 'border-transparent bg-[var(--amber-dim)] text-[var(--amber)]',
        scrap: 'border-transparent bg-[var(--green-dim)] text-[var(--green)]',
        success: 'border-transparent bg-[var(--green-dim)] text-[var(--green)]',
        warning: 'border-transparent bg-[var(--amber-dim)] text-[var(--amber)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
