import * as React from "react"

const labelStyles = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-white"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={className ? `${labelStyles} ${className}` : labelStyles}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
