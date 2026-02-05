"use client";

import * as React from "react";
import { cn } from "@fms/utils";

interface GaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  size = "md",
  className,
  ...props
}: GaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="opacity-20"
        />
        {/* 값 표시 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`${percentage * 2.83} 283`}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold">{Math.round(value)}</span>
      </div>
    </div>
  );
}
