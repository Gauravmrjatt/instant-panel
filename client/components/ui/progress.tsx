'use client'

import * as React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = '', value = 0, max = 100, style, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const progressColor = (style as Record<string, string>)?.['--progress-color'] || 'var(--primary)'

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        data-state="progress"
        className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 transition-all duration-300 ease-in-out"
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            backgroundColor: progressColor,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
