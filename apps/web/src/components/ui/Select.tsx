import React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-zinc-700 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-white border rounded-xl text-xs sm:text-sm text-zinc-900 appearance-none transition-all duration-150 shadow-subtle pr-9 pl-3.5 sm:pl-4 py-2.5",
              "border-zinc-200/90 hover:border-zinc-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 cursor-pointer",
              "disabled:opacity-50 disabled:bg-zinc-50 disabled:cursor-not-allowed",
              error && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 text-zinc-400 pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = "Select";
