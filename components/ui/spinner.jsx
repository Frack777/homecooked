"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4"
  };

  return (
    <div className="flex items-center justify-center" {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent border-primary",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
