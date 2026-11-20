import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  path?: string;
}

export interface UnderlineTabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export const UnderlineTabs: React.FC<UnderlineTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-6 sm:gap-8 border-b border-slate-200 overflow-x-auto scrollbar-none",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const content = (
          <>
            <span className="flex items-center gap-1.5">
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors",
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-600 via-rose-600 to-rose-500 rounded-full" />
            )}
          </>
        );

        if (tab.path) {
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "pb-3 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer select-none",
                isActive ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              "pb-3 text-xs font-bold transition-colors relative whitespace-nowrap cursor-pointer select-none",
              isActive ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
};

