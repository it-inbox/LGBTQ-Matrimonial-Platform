import React from "react";
import { cn } from "../../lib/utils";
import { IconBox } from "./IconBox";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  iconVariant?: "brand" | "gradient" | "muted" | "rose" | "purple" | "emerald";
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconVariant = "brand",
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto select-none",
        className
      )}
      {...props}
    >
      {icon && (
        <IconBox size="lg" variant={iconVariant} className="mb-4">
          {icon}
        </IconBox>
      )}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
