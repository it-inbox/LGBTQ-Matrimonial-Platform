import React from "react";
import { cn } from "../../lib/utils";
import { IconBox, IconBoxProps } from "./IconBox";

export interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: IconBoxProps["variant"];
  iconSize?: IconBoxProps["size"];
  action?: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconVariant = "brand",
  iconSize = "sm",
  action,
  className,
  divider = true,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 mb-6",
        divider && "pb-3.5 border-b border-slate-100",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <IconBox size={iconSize} variant={iconVariant}>
            {icon}
          </IconBox>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export interface SectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: IconBoxProps["variant"];
  action?: React.ReactNode;
  divider?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  iconVariant,
  action,
  divider = true,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 scroll-mt-24",
        className
      )}
      {...props}
    >
      {title && (
        <CardHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          iconVariant={iconVariant}
          action={action}
          divider={divider}
        />
      )}
      {children}
    </div>
  );
};
