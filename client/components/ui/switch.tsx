'use client'

import * as React from 'react'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          role="switch"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onChange?.(e)
            onCheckedChange?.(e.target.checked)
          }}
          className="peer sr-only"
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute start-0.5 top-0.5 size-5 rounded-full bg-background shadow-lg ring-0 transition-transform peer-checked:translate-x-5 peer-disabled:cursor-not-allowed" />
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
