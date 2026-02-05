"use client"

import * as React from "react"
import { Icon } from "./Icon"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className="peer size-4 appearance-none rounded border border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <Icon 
          name="check" 
          size="xs" 
          className="absolute pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
