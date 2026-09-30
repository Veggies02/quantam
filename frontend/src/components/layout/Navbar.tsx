import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Clock,
  Bell,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getBreadcrumb = () => {
    if (path.includes('prediction') || path.includes('predict')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Prediction</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Fuel Consumption Prediction</span>
        </div>
      );
    }
    if (path.includes('optimization') || path.includes('optimize')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Optimization</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Optimization Workbench</span>
        </div>
      );
    }
    if (path.includes('fuels')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Fuels</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Alternative Fuels Comparison</span>
        </div>
      );
    }
    if (path.includes('compliance')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Compliance</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Regulatory & Environmental Compliance</span>
        </div>
      );
    }
    if (path.includes('benchmark')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Benchmark</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Algorithm Benchmark</span>
        </div>
      );
    }
    if (path.includes('fleet')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Fleet</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Fleet Management</span>
        </div>
      );
    }
    if (path.includes('voyages')) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-normal">Voyages</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-700 font-semibold">Voyage Scheduling & Tracking</span>
        </div>
      );
    }
    return (
      <div className="text-xs text-slate-700 font-semibold">
        Overview
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 h-12 px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs */}
      <div>{getBreadcrumb()}</div>

      {/* Right Controls: Search, Clock, Notification, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vessels, ports or routes..."
            className="w-64 pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200/90 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008B7A] focus:bg-white transition-all"
          />
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>24 Nov 2025 14:30 UTC</span>
        </div>

        {/* Bell Notification */}
        <button
          className="relative p-1 text-slate-400 hover:text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar */}
        <div className="h-7 w-7 rounded-full bg-[#008B7A] flex items-center justify-center text-white text-xs font-bold shadow-2xs select-none">
          B
        </div>
      </div>
    </header>
  );
};
