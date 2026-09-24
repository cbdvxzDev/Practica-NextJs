import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-brand-muted uppercase tracking-wider block">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "w-full h-10 px-3 text-sm rounded-button border border-border bg-white text-brand-dark placeholder-neutral-400 transition-colors focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark disabled:bg-neutral-50 disabled:text-brand-muted disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-600 animate-fadeIn pl-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };