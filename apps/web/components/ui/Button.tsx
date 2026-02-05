/**
 * @file src/components/ui/Button.tsx
 * @description
 * Common button component.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";

/** Button Variants */
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";

/** Button Sizes */
type ButtonSize = "sm" | "md" | "lg";

/** Button Props */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:-translate-y-0.5",
  secondary:
    "bg-card border border-border text-text hover:bg-card-hover",
  ghost:
    "bg-transparent text-text hover:bg-black/5 dark:hover:bg-white/5",
  outline:
    "bg-transparent border border-border text-text hover:bg-card-hover hover:border-border-hover",
  destructive:
    "bg-error text-white shadow-lg shadow-error/25 hover:bg-error-hover",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin text-[20px]">
            progress_activity
          </span>
        )}

        {!isLoading && leftIcon && (
          <span className="material-symbols-outlined text-[20px]">
            {leftIcon}
          </span>
        )}

        {children}

        {rightIcon && (
          <span className="material-symbols-outlined text-[20px]">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
