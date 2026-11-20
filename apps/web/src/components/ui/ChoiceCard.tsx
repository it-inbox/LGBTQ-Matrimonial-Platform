import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export interface ChoiceCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  selected?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  indicator?: "radio" | "checkbox" | "none";
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  selected = false,
  title,
  description,
  icon,
  badge,
  disabled = false,
  indicator = "radio",
  className,
  onClick,
  ...props
}) => {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(e as any);
        }
      }}
      className={cn(
        "p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 select-none text-left",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]",
        selected
          ? "border-brand-600 bg-brand-50/40 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50",
        className
      )}
      {...props}
    >
      {/* Indicator */}
      {indicator === "radio" && (
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
            selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"
          )}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      )}

      {indicator === "checkbox" && (
        <div
          className={cn(
            "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
            selected
              ? "border-brand-600 bg-gradient-to-r from-brand-600 to-rose-500 text-white"
              : "border-slate-300 bg-white"
          )}
        >
          {selected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      )}

      {/* Icon if provided */}
      {icon && <div className="shrink-0 mt-0.5 text-brand-600">{icon}</div>}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs sm:text-sm font-bold",
              selected ? "text-brand-900" : "text-slate-800"
            )}
          >
            {title}
          </span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {description && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
