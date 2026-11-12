import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface MultiSearchableSelectProps {
  label?: string;
  required?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[] | { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  label,
  required,
  values = [],
  onChange,
  options,
  placeholder = "Select options...",
  disabled = false,
  disabledMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const filteredOptions = formattedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const removeOption = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== val));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {values.length > 0 && (
            <span className="text-[11px] text-brand-600 font-bold">
              {values.length} selected
            </span>
          )}
        </div>
      )}

      {/* Main Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch("");
          }
        }}
        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-left text-sm flex items-center justify-between transition-all cursor-pointer ${
          disabled
            ? "opacity-60 bg-slate-100 cursor-not-allowed border-slate-200"
            : isOpen
            ? "border-brand-500 bg-white ring-2 ring-brand-500/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex-1 truncate pr-2">
          {values.length > 0 ? (
            <span className="font-medium text-slate-900 truncate">
              {values.join(", ")}
            </span>
          ) : (
            <span className="text-slate-400">
              {disabled && disabledMessage ? disabledMessage : placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Selected Tags Below Dropdown */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
            >
              {val}
              <button
                type="button"
                onClick={(e) => removeOption(val, e)}
                className="hover:text-rose-600 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1 max-h-52">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleOption(opt.value)}
                    className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-400">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
