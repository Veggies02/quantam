import os

files = {}

# 1. index.css
files["frontend/src/index.css"] = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 14 124 123;
    --color-secondary: 70 60 119;
    --color-navy: 15 27 45;
  }

  body {
    @apply bg-background text-navy-primary font-sans antialiased selection:bg-teal-light selection:text-teal;
    min-height: 100vh;
  }

  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #F5F8F7;
  }
  ::-webkit-scrollbar-thumb {
    background: #DCE4E1;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #B4C4C0;
  }
}

@layer utilities {
  .glass-panel {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
  }
  .quantum-glow {
    box-shadow: 0 0 15px rgba(0, 180, 216, 0.35);
  }
}
"""

# 2. types/index.ts
files["frontend/src/types/index.ts"] = """export type VesselStatus = 'Underway' | 'Anchored' | 'Moored' | 'Optimizing' | 'Alert';
export type CIIRating = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  deadweightTons: number;
  lengthMeters: number;
  speedKnots: number;
  targetSpeedKnots: number;
  enginePowerKW: number;
  rpm: number;
  fuelRateMTPerDay: number;
  ciiRating: CIIRating;
  ciiScore: number;
  status: VesselStatus;
  origin: string;
  destination: string;
  eta: string;
  lat: number;
  lng: number;
  heading: number;
  draftMeters: number;
  trimMeters: number;
  seaStateBeaufort: number;
  waveHeightMeters: number;
  windSpeedKnots: number;
  quantumOptimized: boolean;
}

export interface MetricDelta {
  value: number | string;
  percentage?: number;
  isPositiveGood?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'teal' | 'violet' | 'amber' | 'success' | 'danger' | 'quantum';
}
"""

# 3. components/ui/Badge.tsx
files["frontend/src/components/ui/Badge.tsx"] = """import React from 'react';
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
"""

# 4. components/ui/Button.tsx
files["frontend/src/components/ui/Button.tsx"] = """import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'quantum';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variantStyles = {
      primary: 'bg-teal text-white hover:bg-teal-hover focus:ring-teal/40 shadow-sm',
      secondary: 'bg-violet text-white hover:bg-violet-hover focus:ring-violet/40 shadow-sm',
      outline: 'border border-border bg-white text-navy-primary hover:bg-background-panel hover:border-border-strong focus:ring-teal/20',
      ghost: 'text-navy-secondary hover:text-navy-primary hover:bg-background-panel focus:ring-teal/20',
      danger: 'bg-danger text-white hover:bg-danger-hover focus:ring-danger/40 shadow-sm',
      quantum: 'bg-gradient-to-r from-teal to-quantum text-white hover:brightness-105 focus:ring-quantum/40 shadow-sm',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 h-8',
      md: 'text-sm px-4 py-2 rounded-lg gap-2 h-9.5',
      lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5 h-11',
      icon: 'p-2 rounded-lg h-9.5 w-9.5 justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
"""

# 5. components/ui/Card.tsx
files["frontend/src/components/ui/Card.tsx"] = """import React from 'react';
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
"""

# 6. components/ui/KPICard.tsx
files["frontend/src/components/ui/KPICard.tsx"] = """import React from 'react';
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
"""

# 7. components/ui/Tabs.tsx
files["frontend/src/components/ui/Tabs.tsx"] = """import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className,
}) => {
  if (variant === 'segmented') {
    return (
      <div
        className={twMerge(
          clsx(
            'inline-flex p-1 bg-background-panel border border-border rounded-lg gap-1',
            className
          )
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                isActive
                  ? 'bg-white text-navy-primary shadow-xs font-semibold'
                  : 'text-navy-secondary hover:text-navy-primary hover:bg-white/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                    isActive ? 'bg-teal-light text-teal' : 'bg-border text-navy-secondary'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        className={twMerge(clsx('flex border-b border-border gap-6', className))}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-teal text-teal font-semibold'
                  : 'border-transparent text-navy-secondary hover:text-navy-primary hover:border-border'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-background-panel border border-border text-navy-secondary">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('flex flex-wrap gap-2', className))} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors border',
              isActive
                ? 'bg-teal text-white border-teal shadow-xs'
                : 'bg-white text-navy-secondary border-border hover:bg-background-panel hover:text-navy-primary'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive ? 'bg-teal-dark text-white' : 'bg-border text-navy-secondary'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
"""

# 8. components/ui/Modal.tsx
files["frontend/src/components/ui/Modal.tsx"] = """import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={twMerge(
          clsx(
            'relative w-full bg-white rounded-xl shadow-modal border border-border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200',
            sizeStyles[size],
            className
          )
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-panel/50">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-navy-primary flex items-center gap-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-navy-secondary mt-0.5">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="text-navy-muted hover:text-navy-primary h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-border bg-background-panel/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path}")
