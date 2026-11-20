import React from "react";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export interface AlertBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "error" | "success" | "warning" | "info";
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = "error",
  title,
  message,
  onClose,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    error: {
      container: "bg-rose-50 border-rose-200 text-rose-800",
      iconColor: "text-rose-600",
      Icon: AlertCircle,
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-800",
      iconColor: "text-emerald-600",
      Icon: CheckCircle2,
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      iconColor: "text-amber-600",
      Icon: AlertTriangle,
    },
    info: {
      container: "bg-sky-50 border-sky-200 text-sky-800",
      iconColor: "text-sky-600",
      Icon: Info,
    },
  };

  const current = variantStyles[variant];
  const IconComponent = current.Icon;

  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-xl border flex items-start gap-2.5 text-xs font-medium leading-relaxed transition-all",
        current.container,
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-4 h-4 shrink-0 mt-0.5", current.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold mb-0.5 text-slate-900">{title}</h4>}
        <div>{message || children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
