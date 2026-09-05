import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'flat' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-border shadow-card hover:shadow-card-hover transition-shadow duration-200',
    panel: 'bg-background-panel border border-border',
    flat: 'bg-white border border-border',
    highlight: 'bg-white border-2 border-teal/40 shadow-card',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-card p-5 overflow-hidden transition-all',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx('flex items-center justify-between pb-3 mb-4 border-b border-border/60', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={twMerge(
        clsx('text-base font-semibold text-navy-primary flex items-center gap-2', className)
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={twMerge(clsx('text-xs text-navy-secondary mt-0.5', className))}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={twMerge(clsx('', className))} {...props}>
      {children}
    </div>
  );
};
