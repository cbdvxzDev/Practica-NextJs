"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface StatsCardProps {
  label: string;
  amount: string;
  percentage: string;
  isGrowth: boolean;
  className?: string;
}

export function StatsCard({
  label,
  amount,
  percentage,
  isGrowth,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-5 border border-border/40 rounded-card flex flex-col justify-between space-y-2",
        className
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </span>
      
      <div className="flex items-end justify-between">
        <span className="text-xl font-semibold text-brand-dark">
          {amount}
        </span>
        
        <div 
          className={cn(
            "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
            isGrowth 
              ? "text-emerald-700 bg-emerald-50" 
              : "text-red-600 bg-red-50"
          )}
        >
          {isGrowth ? "+" : "-"}{percentage}
        </div>
      </div>
    </div>
  );
}