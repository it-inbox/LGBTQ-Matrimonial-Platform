import React from "react";
import { Heart } from "lucide-react";

export const AppLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 select-none">
      <div className="flex flex-col items-center gap-4">
        {/* EverPride Heart Logo with glowing pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-pink-500 to-amber-400 opacity-25 blur-xl animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-pride-pink to-pride-yellow p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Heart className="w-7 h-7 text-brand-600 fill-brand-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-1">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Ever<span className="text-brand-600">Pride</span>
          </span>
        </div>

        {/* Minimal indeterminate loading bar */}
        <div className="w-28 h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-brand-500 via-pink-500 to-brand-600 rounded-full w-1/2 animate-indeterminate" />
        </div>
      </div>
    </div>
  );
};
