import React from 'react';
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
