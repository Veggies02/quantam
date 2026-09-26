import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  GitFork,
  BarChart3,
  ShieldCheck,
  Cpu,
  Settings,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Fleet Overview',
      subtitle: 'Command Hub & Routes',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeVariant: 'teal' as const,
    },
    {
      to: '/predict',
      label: 'PINN Fuel Predictor',
      subtitle: 'Hybrid Residual Models',
      icon: TrendingUp,
      badge: 'PINN',
      badgeVariant: 'violet' as const,
    },
    {
      to: '/optimize',
      label: 'Multi-Obj Route Optimizer',
      subtitle: 'Pareto Front Speed & Path',
      icon: GitFork,
      badge: 'Pareto',
      badgeVariant: 'teal' as const,
    },
    {
      to: '/benchmark',
      label: 'Algorithm Benchmark',
      subtitle: 'Q-NSGA-II vs Classical NSGA-II',
      icon: BarChart3,
      badge: 'Stats',
      badgeVariant: 'navy' as const,
    },
    {
      to: '/compliance',
      label: 'IMO CII & Carbon ETS',
      subtitle: 'FuelEU Maritime Trajectory',
      icon: ShieldCheck,
      badge: 'CII Grade',
      badgeVariant: 'amber' as const,
    },
    {
      to: '/quantum',
      label: 'Quantum-Inspired SQA Lab',
      subtitle: 'Classical SQA Berth & Dispatch',
      icon: Cpu,
      badge: 'SQA',
      badgeVariant: 'quantum' as const,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Group */}
      <div className="py-4 px-3 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-muted font-mono">
            Navigation Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-teal-light text-teal font-semibold shadow-xs border border-teal/20'
                        : 'text-navy-secondary hover:text-navy-primary hover:bg-background-panel'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-navy-muted font-normal">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Operational Status Box */}
        <div className="bg-background-panel border border-border rounded-lg p-3 mx-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
            <span className="text-[11px] font-semibold text-navy-primary flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-teal animate-pulse" />
              Satellite Uplink
            </span>
            <span className="text-[10px] font-mono text-success font-bold">100% ONLINE</span>
          </div>
          <div className="mt-2 text-[11px] text-navy-secondary space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-navy-muted">Inmarsat Ping:</span>
              <span className="font-semibold text-navy-primary">34 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-muted">AIS Feeds:</span>
              <span className="font-semibold text-teal">2,410 active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings & Platform Info */}
      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-secondary hover:text-navy-primary hover:bg-background-panel transition-colors">
          <Settings className="h-4 w-4 text-navy-muted" />
          <span>System Settings & API Keys</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-secondary hover:text-navy-primary hover:bg-background-panel transition-colors">
          <HelpCircle className="h-4 w-4 text-navy-muted" />
          <span>Documentation & Architecture</span>
        </button>
        <div className="pt-2 px-3 text-[10px] text-navy-muted font-mono">
          NavOptima Engine v2.4.0-enterprise
        </div>
      </div>
    </aside>
  );
};
