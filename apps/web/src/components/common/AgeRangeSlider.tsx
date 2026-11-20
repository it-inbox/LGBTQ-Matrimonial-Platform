import React, { useRef, useState, useCallback, useEffect } from "react";

interface AgeRangeSliderProps {
  minAge: number;
  maxAge: number;
  onChange: (min: number, max: number) => void;
  minLimit?: number;
  maxLimit?: number;
  hideLabel?: boolean;
}

export const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
  minAge,
  maxAge,
  onChange,
  minLimit = 18,
  maxLimit = 75,
  hideLabel = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const getPercent = (value: number) =>
    Math.round(((value - minLimit) / (maxLimit - minLimit)) * 100);

  const minPercent = getPercent(minAge);
  const maxPercent = getPercent(maxAge);

  const calculateValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return minLimit;
      const rect = trackRef.current.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(minLimit + fraction * (maxLimit - minLimit));
    },
    [minLimit, maxLimit]
  );

  const handlePointerDown = (clientX: number, targetThumb?: "min" | "max") => {
    const clickedVal = calculateValueFromPointer(clientX);
    let chosen: "min" | "max" = targetThumb || "min";

    if (!targetThumb) {
      // Determine which thumb is closer to click
      const distToMin = Math.abs(clickedVal - minAge);
      const distToMax = Math.abs(clickedVal - maxAge);
      chosen = distToMin <= distToMax ? "min" : "max";
    }

    setActiveThumb(chosen);

    if (chosen === "min") {
      const newMin = Math.min(clickedVal, maxAge - 1);
      onChange(Math.max(minLimit, newMin), maxAge);
    } else {
      const newMax = Math.max(clickedVal, minAge + 1);
      onChange(minAge, Math.min(maxLimit, newMax));
    }
  };

  useEffect(() => {
    if (!activeThumb) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const currentVal = calculateValueFromPointer(clientX);

      if (activeThumb === "min") {
        const newMin = Math.min(currentVal, maxAge - 1);
        onChange(Math.max(minLimit, newMin), maxAge);
      } else {
        const newMax = Math.max(currentVal, minAge + 1);
        onChange(minAge, Math.min(maxLimit, newMax));
      }
    };

    const handlePointerUp = () => {
      setActiveThumb(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [activeThumb, minAge, maxAge, minLimit, maxLimit, onChange, calculateValueFromPointer]);

  return (
    <div className="space-y-2 select-none">
      {!hideLabel && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Partner Age Range
          </label>
        </div>
      )}

      <div className="space-y-1.5 px-3">
        {/* Interactive Track Area */}
        <div
          ref={trackRef}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          className="relative w-full h-8 flex items-center cursor-pointer"
        >
          {/* Background Track */}
          <div className="absolute inset-x-0 h-2 bg-slate-200 rounded-full" />

          {/* Active Highlight Range */}
          <div
            className="absolute h-2 bg-gradient-to-r from-brand-600 via-rose-600 to-rose-500 rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Min Age Thumb Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              handlePointerDown(e.clientX, "min");
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handlePointerDown(e.touches[0].clientX, "min");
            }}
            className={`absolute w-6 h-6 bg-white border-2 border-brand-600 rounded-full shadow-md -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${
              activeThumb === "min" ? "scale-115 ring-4 ring-brand-100 z-30" : "z-20"
            }`}
            style={{ left: `${minPercent}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          </div>

          {/* Max Age Thumb Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              handlePointerDown(e.clientX, "max");
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handlePointerDown(e.touches[0].clientX, "max");
            }}
            className={`absolute w-6 h-6 bg-white border-2 border-brand-600 rounded-full shadow-md -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${
              activeThumb === "max" ? "scale-115 ring-4 ring-brand-100 z-30" : "z-20"
            }`}
            style={{ left: `${maxPercent}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          </div>
        </div>

        {/* Min / Max Guidance */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium -mx-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(minLimit, minAge - 1), maxAge)}
            className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
          >
            <span className="text-[11px] text-slate-400">Min:</span>
            <span className="font-bold text-slate-800 font-mono text-xs">{minAge} yrs</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(minAge, Math.min(maxLimit, maxAge + 1))}
            className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
          >
            <span className="text-[11px] text-slate-400">Max:</span>
            <span className="font-bold text-slate-800 font-mono text-xs">
              {maxAge >= maxLimit ? `${maxLimit}+` : `${maxAge} yrs`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
