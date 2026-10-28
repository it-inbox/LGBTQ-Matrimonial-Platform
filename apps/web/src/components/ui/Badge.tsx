import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "brand" | "neutral" | "outline";
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "sm",
  icon,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-bold tracking-tight rounded-full transition-colors select-none";

  const variantStyles = {
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/80 fill-emerald-600",
    warning:
      "bg-amber-50 text-amber-800 border border-amber-200/80 fill-amber-600",
    danger:
      "bg-rose-50 text-rose-700 border border-rose-200/80 fill-rose-600",
    brand:
      "bg-brand-50 text-brand-700 border border-brand-200/80 fill-brand-600",
    neutral:
      "bg-zinc-100 text-zinc-700 border border-zinc-200/60",
    outline:
      "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300",
  };

  const sizeStyles = {
    xs: "text-[9px] sm:text-[10px] px-2 py-0.5 gap-1",
    sm: "text-[11px] sm:text-xs px-2.5 py-1 gap-1.5",
    md: "text-xs px-3 py-1.5 gap-1.5",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
};
