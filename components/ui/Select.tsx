import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-aurora/20 bg-aurora px-3 py-2 text-sm ring-offset-background placeholder:text-aurora-2 focus:outline-none focus:ring-2 focus:ring-aurora focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Select.displayName = 'Select'

export { Select }
