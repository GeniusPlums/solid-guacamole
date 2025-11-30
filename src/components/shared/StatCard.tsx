import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-apple border-0 bg-secondary/30",
        onClick && "cursor-pointer hover:bg-secondary/50 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          {trend && (
            <div
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

