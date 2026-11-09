import React from 'react';
import { 
  Search, 
  Sparkles, 
  Database, 
  Bell, 
  ExternalLink,
  Info
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { isSupabaseConfigured } from '../../services/supabase';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onFindLeadsClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onNavigate,
  onFindLeadsClick,
  searchQuery,
  onSearchChange,
}) => {
  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    landing: { title: 'Website Analyzer & Live Onboarding', subtitle: 'Enter your website to automatically extract ICP and discover intent leads' },
    dashboard: { title: 'Pipeline Overview', subtitle: 'Intent monitoring & qualification health' },
    discovery: { title: 'Intent Discovery', subtitle: 'Search social discussions for explicit buying signals' },
    leads: { title: 'Qualified Leads', subtitle: 'Review verified prospect pain points & evidence' },
    icp: { title: 'Ideal Customer Profile', subtitle: 'Target audience, pain points & exclusion criteria' },
    watchlist: { title: 'Signal Watchlist', subtitle: 'Monitored communities, keywords & companies' },
    settings: { title: 'Settings & Integrations', subtitle: 'Supabase PostgreSQL, Gemini API & notification preferences' },
  };

  const isConnectedToSupabase = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Breadcrumbs & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>LeadSignal AI</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold truncate">
            {tabTitles[currentTab]?.title || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Zone 2: Search & Environment Status */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, companies, or extracted pain points..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Storage State Badge & Primary CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors ${
            isConnectedToSupabase 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title={isConnectedToSupabase ? 'Connected to Supabase PostgreSQL' : 'Local storage workspace active (Click to configure Supabase)'}
        >
          <Database className={`w-3.5 h-3.5 ${isConnectedToSupabase ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span className="font-medium whitespace-nowrap">
            {isConnectedToSupabase ? 'Supabase Live' : 'Demo Workspace'}
          </span>
        </button>

        <button
          onClick={onFindLeadsClick}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find Leads Now</span>
        </button>
      </div>
    </header>
  );
};
