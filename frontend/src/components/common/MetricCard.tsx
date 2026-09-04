import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode | React.ElementType;
  trend?: 'positive' | 'negative' | 'neutral' | { value: number; isPositive: boolean };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  const isTrendPositive = typeof trend === 'object' ? trend.isPositive : trend === 'positive';
  const isTrendNegative = typeof trend === 'object' ? !trend.isPositive : trend === 'negative';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <Card className={cn("overflow-hidden border border-border/70 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{renderIcon()}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p
            className={cn(
              "text-xs mt-1",
              isTrendPositive && "text-emerald-600 dark:text-emerald-400 font-medium",
              isTrendNegative && "text-rose-600 dark:text-rose-400 font-medium",
              !isTrendPositive && !isTrendNegative && "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
