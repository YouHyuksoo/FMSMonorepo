/**
 * @file src/components/ui/Input.tsx
 * @description
 * Common input component.
 */

"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Icon } from "./Icon";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      leftIcon,
      error,
      helperText,
      type = "text",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const inputStyles = `
      block w-full rounded-lg
      bg-surface
      py-3.5 text-text
      shadow-sm ring-1 ring-inset
      ${error ? "ring-error" : "ring-border"}
      placeholder:text-text-secondary
      focus:ring-2 focus:ring-inset focus:ring-primary
      focus:bg-background-white
      transition-all text-sm
      ${leftIcon ? "pl-11" : "pl-4"}
      ${isPassword ? "pr-12" : "pr-4"}
    `;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text dark:text-gray-200 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary">
              <Icon name={leftIcon} size="sm" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputStyles}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-text transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} size="sm" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
