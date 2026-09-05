import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from './Card';

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    isPositiveGood?: boolean;
    label?: string;
  };
  accentColor?: 'teal' | 'violet' | 'amber' | 'success' | 'quantum';
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  accentColor = 'teal',
  className,
  onClick,
}) => {
  const accentBorderStyles = {
    teal: 'border-l-4 border-l-teal',
    violet: 'border-l-4 border-l-violet',
    amber: 'border-l-4 border-l-amber',
    success: 'border-l-4 border-l-success',
    quantum: 'border-l-4 border-l-quantum',
  };

  const accentIconStyles = {
    teal: 'bg-teal-light text-teal',
    violet: 'bg-violet-light text-violet',
    amber: 'bg-amber-light text-amber',
    success: 'bg-success-light text-success',
    quantum: 'bg-quantum-light text-quantum-dark',
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'neutral') return 'text-navy-muted bg-gray-100';
    const isGood = trend.isPositiveGood ?? true;
    const isUp = trend.direction === 'up';
    if ((isUp && isGood) || (!isUp && !isGood)) {
      return 'text-success bg-success-light border border-success/20';
    }
    return 'text-danger bg-danger-light border border-danger/20';
  };

  return (
    <Card
      className={twMerge(
        clsx(
          'p-4 cursor-pointer relative hover:-translate-y-0.5 transition-transform duration-150',
          accentBorderStyles[accentColor],
          className
        )
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-secondary">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-navy-primary font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-navy-muted">
                {unit}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={clsx(
              'p-2.5 rounded-lg flex items-center justify-center shrink-0',
              accentIconStyles[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/40">
        {trend && (
          <div
            className={clsx(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-xs',
              getTrendColor()
            )}
          >
            {trend.direction === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
            {trend.direction === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend.direction === 'neutral' && <Minus className="h-3.5 w-3.5" />}
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-navy-muted font-normal ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <span className="text-navy-muted truncate ml-auto">{subtitle}</span>
        )}
      </div>
    </Card>
  );
};
