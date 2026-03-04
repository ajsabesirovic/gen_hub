
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-center space-y-0 pb-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground mb-1" />}
        <CardTitle className="text-sm font-medium text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend) && (
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
