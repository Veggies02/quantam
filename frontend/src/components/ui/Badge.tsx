import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'violet' | 'amber' | 'success' | 'danger' | 'navy' | 'quantum' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'teal',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  const variantStyles = {
    teal: 'bg-teal-light text-teal border-teal/20',
    violet: 'bg-violet-light text-violet border-violet/20',
    amber: 'bg-amber-light text-amber border-amber/20',
    success: 'bg-success-light text-success border-success/20',
    danger: 'bg-danger-light text-danger border-danger/20',
    navy: 'bg-navy-primary/5 text-navy-primary border-navy-primary/10',
    quantum: 'bg-quantum-light text-quantum-dark border-quantum/30',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const dotColors = {
    teal: 'bg-teal',
    violet: 'bg-violet',
    amber: 'bg-amber',
    success: 'bg-success',
    danger: 'bg-danger',
    navy: 'bg-navy-primary',
    quantum: 'bg-quantum animate-pulse',
    neutral: 'bg-gray-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border transition-colors',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
