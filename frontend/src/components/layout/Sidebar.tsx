import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Anchor,
  Navigation,
  LineChart,
  Sliders,
  Fuel,
  ShieldCheck,
  BarChart2,
  Settings,
  ArrowRight,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface SidebarProps {
  onRunOptimizer?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onRunOptimizer }) => {
  const navSections: NavSection[] = [
    {
      group: 'MAIN',
      items: [
        {
          to: '/overview',
          label: 'Overview',
          icon: LayoutGrid,
          badge: 'LIVE',
        },
      ],
    },
    {
      group: 'FLEET OPS',
      items: [
        {
          to: '/fleet',
          label: 'Fleet Management',
          icon: Anchor,
        },
        {
          to: '/voyages',
          label: 'Voyages',
          icon: Navigation,
        },
      ],
    },
    {
      group: 'ANALYTICS',
      items: [
        {
          to: '/prediction',
          label: 'Prediction',
          icon: LineChart,
        },
        {
          to: '/optimization',
          label: 'Optimization',
          icon: Sliders,
        },
        {
          to: '/fuels',
          label: 'Fuels',
          icon: Fuel,
        },
      ],
    },
    {
      group: 'COMPLIANCE',
      items: [
        {
          to: '/compliance',
          label: 'Regulatory',
          icon: ShieldCheck,
        },
        {
          to: '/benchmark',
          label: 'Benchmark',
          icon: BarChart2,
        },
      ],
    },
  ];

  return (
    <aside className="w-56 bg-[#06141D] text-white flex flex-col justify-between shrink-0 select-none border-r border-[#0d2230] z-20">
      {/* Brand Header */}
      <div>
        <div className="px-5 pt-5 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#008B7A]/20 border border-[#008B7A]/50 flex items-center justify-center text-[#00E5FF]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white font-sans block leading-none">
                MERIDIAN
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 block">
                Fleet Optimization
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="px-3 space-y-4">
          {navSections.map((sec) => (
            <div key={sec.group}>
              <div className="px-2 pb-1.5 text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                {sec.group}
              </div>
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all',
                          isActive
                            ? 'bg-[#008B7A] text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && !isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="h-3.5 w-3.5 text-white/90 shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#0f2434] space-y-2">
        <button
          onClick={onRunOptimizer}
          className="w-full bg-[#008B7A] hover:bg-[#007768] active:bg-[#00685b] text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm group"
        >
          <span>Run Optimizer</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>

        <NavLink
          to="/settings"
          className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors rounded-md"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
