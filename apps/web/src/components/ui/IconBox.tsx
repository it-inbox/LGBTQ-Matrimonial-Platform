import React from "react";
import { cn } from "../../lib/utils";

export interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "gradient" | "muted" | "emerald" | "amber" | "blue" | "purple" | "rose";
  icon?: React.ReactNode;
}

export const IconBox: React.FC<IconBoxProps> = ({
  size = "md",
  variant = "brand",
  icon,
  children,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: "w-7 h-7 rounded-lg text-xs",
    md: "w-10 h-10 rounded-2xl text-sm",
    lg: "w-12 h-12 rounded-2xl text-base",
  };

  const variantStyles = {
    brand: "bg-brand-50 text-brand-600 border border-brand-100",
    gradient: "bg-gradient-to-r from-brand-600 via-rose-600 to-rose-500 text-white shadow-md shadow-brand-500/20",
    muted: "bg-slate-100 text-slate-600 border border-slate-200/60",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    purple: "bg-purple-50 text-purple-600 border border-purple-100",
    rose: "bg-rose-50 text-rose-600 border border-rose-100",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 transition-transform select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon || children}
    </div>
  );
};

