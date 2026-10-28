import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl";

    const variantStyles = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md hover:shadow-brand-600/15 border border-transparent",
      secondary:
        "bg-zinc-100 text-zinc-800 hover:bg-zinc-200/90 hover:text-zinc-900 border border-transparent",
      outline:
        "bg-white text-zinc-700 hover:text-zinc-900 border border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50 shadow-subtle",
      ghost:
        "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md hover:shadow-rose-600/15 border border-transparent",
      emerald:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:shadow-emerald-600/15 border border-transparent",
    };

    const sizeStyles = {
      xs: "text-[11px] px-2.5 py-1 gap-1 min-h-[28px]",
      sm: "text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px]",
      md: "text-xs sm:text-sm px-4 py-2 gap-2 min-h-[40px]",
      lg: "text-sm sm:text-base px-5 py-2.5 gap-2 min-h-[46px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
