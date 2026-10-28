import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-zinc-700 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-white border rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-150 shadow-subtle",
              "border-zinc-200/90 hover:border-zinc-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
              "disabled:opacity-50 disabled:bg-zinc-50 disabled:cursor-not-allowed",
              leftIcon ? "pl-10" : "pl-3.5 sm:pl-4",
              rightIcon ? "pr-10" : "pr-3.5 sm:pr-4",
              "py-2.5",
              error && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-zinc-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-semibold text-rose-600 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-zinc-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
