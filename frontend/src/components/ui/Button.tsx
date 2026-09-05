import React from 'react';
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
