import React from 'react';
import { 
  LayoutDashboard, 
  Radar, 
  Users, 
  Target, 
  BookmarkCheck, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  ShieldCheck,
  Building2,
  Globe
} from 'lucide-react';
import { ICPConfiguration } from '../../types';

export type NavigationTab = 'landing' | 'dashboard' | 'discovery' | 'leads' | 'icp' | 'watchlist' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  leadsCount: number;
  newLeadsCount: number;
  watchlistCount: number;
  icp: ICPConfiguration;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  leadsCount,
  newLeadsCount,
  watchlistCount,
  icp,
}) => {
  const navItems = [
    {
      id: 'landing' as NavigationTab,
      label: 'Website Analyzer',
      icon: Globe,
      badge: 'Live',
    },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'discovery' as NavigationTab,
      label: 'Lead Discovery',
      icon: Radar,
      badge: 'Jobs',
    },
    {
      id: 'leads' as NavigationTab,
      label: 'Leads Pipeline',
      icon: Users,
      badge: leadsCount > 0 ? leadsCount : null,
      highlightBadge: newLeadsCount > 0,
    },
    {
      id: 'icp' as NavigationTab,
      label: 'Ideal Customer Profile',
      icon: Target,
      badge: null,
    },
    {
      id: 'watchlist' as NavigationTab,
      label: 'Watchlist',
      icon: BookmarkCheck,
      badge: watchlistCount > 0 ? watchlistCount : null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & Supabase',
      icon: SlidersHorizontal,
      badge: null,
    },
  ];

  return (
    <aside 
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none z-20 ${
        collapsed ? 'w-18' : 'w-64'
      } shrink-0`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 tracking-tight text-sm truncate">
                LeadSignal AI
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                Intent Discovery Engine
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Radio className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Campaign Context Widget */}
      {!collapsed && (
        <div className="p-3 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[130px]">{icp.companyName || 'Active Workspace'}</span>
            </div>
            <button 
              onClick={() => onSelectTab('icp')}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
            >
              Edit ICP
            </button>
          </div>
          <div className="text-[11px] text-slate-500 line-clamp-1">
            {icp.targetTitles[0] || 'Target buyers'} · {icp.companySizeRange}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors group relative ${
                isActive
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
              />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge !== null && (
                <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                  item.highlightBadge 
                    ? 'bg-indigo-100 text-indigo-700 font-semibold' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot indicator */}
              {collapsed && item.highlightBadge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Monitored Channels Status */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-3 border-t border-slate-100 pt-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Active Signal Channels
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>LinkedIn</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Facebook</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <span>X (Twitter)</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              <span>Instagram</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-indigo-200">
            AM
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                Alex Mercer
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Apex Growth Labs
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
