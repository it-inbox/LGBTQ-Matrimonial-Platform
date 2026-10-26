import React from "react";
import { Link } from "react-router-dom";

interface InterestsHeaderProps {
  activeTab?: string;
}

export const InterestsHeader: React.FC<InterestsHeaderProps> = ({ activeTab }) => {
  const tabs = [
    { id: "received", label: "Received", path: "/interests/received" },
    { id: "sent", label: "Sent", path: "/interests/sent" },
  ];

  return (
    <div>
      {/* Navigation Tabs (Received | Sent) */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`pb-3 text-xs font-bold transition-colors relative whitespace-nowrap ${
                isActive ? "text-rose-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
