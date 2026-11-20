import React from "react";
import { cn } from "../../lib/utils";

export interface FilterPillItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterPillsProps {
  items: FilterPillItem[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
  shape?: "pill" | "rect";
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  items,
  selectedId,
  onChange,
  className,
  shape = "pill",
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5",
        className
      )}
    >
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "font-semibold shrink-0 cursor-pointer transition-all select-none flex items-center gap-1.5 active:scale-[0.98]",
              shape === "pill" ? "px-3 py-1.5 rounded-full text-xs" : "px-3.5 py-2 rounded-xl text-xs",
              isSelected
                ? "bg-gradient-to-r from-brand-600 via-rose-600 to-rose-500 text-white shadow-xs shadow-brand-500/25"
                : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-rose-50/20"
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

