"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "bg-muted/30",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800",
};

export function StatCard({
  label,
  value,
  icon,
  description,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("py-4", variantStyles[variant], className)}>
      <CardContent className="p-0 px-4">
        <div className="flex flex-col items-center text-center">
          {icon && (
            <div className="rounded-lg bg-background p-2 shadow-sm mb-2">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
