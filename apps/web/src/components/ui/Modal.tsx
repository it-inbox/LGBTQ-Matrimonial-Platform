import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ModalIconVariant = "brand" | "danger" | "success" | "warning" | "neutral";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: ModalIconVariant;
  iconContainerClassName?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

const iconVariantStyles: Record<ModalIconVariant, string> = {
  brand: "bg-brand-50 text-brand-600",
  danger: "bg-rose-50 text-rose-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  neutral: "bg-slate-100 text-slate-600",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconVariant = "brand",
  iconContainerClassName,
  children,
  footer,
  maxWidthClassName = "max-w-md",
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal Window Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-none">
          <DialogPrimitive.Content
            className={cn(
              "w-full bg-white rounded-3xl border border-zinc-200/90 shadow-modal p-6 relative pointer-events-auto",
              "transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              maxWidthClassName
            )}
          >
            {/* Top Right Close button */}
            <DialogPrimitive.Close
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Icon Header */}
            {icon && (
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5",
                  iconVariantStyles[iconVariant],
                  iconContainerClassName
                )}
              >
                {icon}
              </div>
            )}

            {/* Title & Description */}
            {title && (
              <DialogPrimitive.Title className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-1">
                {title}
              </DialogPrimitive.Title>
            )}
            {description && (
              <DialogPrimitive.Description className="text-xs text-zinc-500 leading-relaxed mb-5">
                {description}
              </DialogPrimitive.Description>
            )}

            {/* Custom Content Body */}
            {children && <div className="space-y-4 mb-5">{children}</div>}

            {/* Actions Footer */}
            {footer && <div className="flex items-center gap-2 pt-2">{footer}</div>}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
