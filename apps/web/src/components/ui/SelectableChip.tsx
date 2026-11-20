import React from "react";
import { cn } from "../../lib/utils";

export interface SelectableChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  shape?: "rect" | "pill";
  icon?: React.ReactNode;
}

export const SelectableChip: React.FC<SelectableChipProps> = ({
  selected = false,
  shape = "rect",
  className,
  children,
  icon,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        "transition-all cursor-pointer select-none inline-flex items-center justify-center font-semibold active:scale-[0.98]",
        // Shape variants: "rect" is squarer touch target, "pill" is compact rounded-full capsule
        shape === "rect" && "rounded-xl px-3.5 py-2 text-xs",
        shape === "pill" && "rounded-full px-3 py-1.5 text-xs font-medium",
        // Unified selected vs unselected styling with rich brand red gradient
        selected
          ? "bg-gradient-to-r from-brand-600 via-rose-600 to-rose-500 text-white border border-transparent shadow-xs shadow-brand-500/25"
          : "bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-rose-50/20",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1.5 shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

