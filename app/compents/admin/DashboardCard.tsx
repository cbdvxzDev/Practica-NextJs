"use client";

import * as React from "react";
import { cn } from "../..//lib/utils";

export interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  trend,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 border border-border/40 rounded-card shadow-subtle flex flex-col justify-between space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          {title}
        </h3>
        {icon && <div className="text-brand-dark/50">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-brand-dark">
          {value}
        </span>
        
        {trend && (
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}