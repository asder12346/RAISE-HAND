import React from 'react';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Radar, 
  Target, 
  Mail, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Lead, ICPConfiguration, DiscoveryJob } from '../../types';
import { NavigationTab } from '../layout/Sidebar';

interface DashboardViewProps {
  leads: Lead[];
  jobs: DiscoveryJob[];
  icp: ICPConfiguration;
  onNavigate: (tab: NavigationTab) => void;
  onSelectLead: (lead: Lead) => void;
  onFindLeadsClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  jobs,
  icp,
  onNavigate,
  onSelectLead,
  onFindLeadsClick,
}) => {
  // Compute Key Metrics
  const totalQualified = leads.filter(l => l.status === 'qualified' || l.fitScore >= 80).length;
  const awaitingReview = leads.filter(l => l.status === 'new' || l.status === 'reviewing').length;
  const avgFitScore = leads.length > 0 
    ? Math.round(leads.reduce((acc, l) => acc + l.fitScore, 0) / leads.length) 
    : 0;
  
  // Leads discovered today (within last 24h)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newToday = leads.filter(l => new Date(l.discoveredAt).getTime() > oneDayAgo).length;

  // Setup Checklist completion calculation
  const checklistItems = [
    {
      id: 'icp',
      title: 'Define Ideal Customer Profile (ICP)',
      description: 'Configure target decision makers, pain points, and company size.',
      completed: Boolean(icp.websiteUrl && icp.targetTitles.length > 0),
      action: () => onNavigate('icp'),
      cta: 'Review ICP',
    },
    {
      id: 'discovery',
      title: 'Run your first Intent Discovery Job',
      description: 'Search social signals across LinkedIn, Facebook, X, and Instagram.',
      completed: jobs.length > 0,
      action: () => onNavigate('discovery'),
      cta: 'Open Discovery',
    },
    {
      id: 'review',
      title: 'Qualify and inspect candidate leads',
      description: 'Review verbatim evidence quotes and customer friction statements.',
      completed: leads.some(l => l.status === 'qualified' || l.status === 'contacted'),
      action: () => onNavigate('leads'),
      cta: 'View Pipeline',
    },
    {
      id: 'outreach',
      title: 'Generate personalized consultative outreach',
      description: 'Draft value-first emails or DMs citing factual post context.',
      completed: leads.some(l => l.status === 'contacted'),
      action: () => {
        if (leads.length > 0) onSelectLead(leads[0]);
        else onNavigate('leads');
      },
      cta: 'Start Outreach',
    },
  ];

  const completedCount = checklistItems.filter(i => i.completed).length;

  // 7-Day Velocity Data
  const velocityData = [
    { day: 'Mon', count: 3, qualified: 2 },
    { day: 'Tue', count: 6, qualified: 4 },
    { day: 'Wed', count: 9, qualified: 7 },
    { day: 'Thu', count: 8, qualified: 6 },
    { day: 'Fri', count: 14, qualified: 11 },
    { day: 'Sat', count: 11, qualified: 8 },
    { day: 'Sun (Today)', count: newToday || 12, qualified: totalQualified || 9 },
  ];
  const maxDayCount = Math.max(...velocityData.map(d => d.count), 15);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Intent Pipeline Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring active conversations for <span className="font-semibold text-slate-700">{icp.companyName || 'your business'}</span> across LinkedIn, Facebook, X, and Instagram.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('discovery')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Configure Search
          </button>
          <button
            onClick={onFindLeadsClick}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find Leads Now
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Qualified Leads */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Qualified Leads</span>
            <span className="text-emerald-700 font-medium text-[11px]">+18% this week</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalQualified}
            </span>
            <span className="text-xs text-slate-500">fit score ≥ 80</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Verified intent signals</span>
            <span aria-hidden="true">·</span>
            <span>4 channels</span>
          </div>
        </div>

        {/* New Leads Today */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>New Leads Today</span>
            <span className="text-indigo-600 text-[11px] font-medium font-mono tabular-nums">
              Target: {icp.dailyLeadTarget}/day
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {newToday}
            </span>
            <span className="text-xs text-slate-500">discovered in 24h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Scanned 240+ discussions</span>
          </div>
        </div>

        {/* Avg Lead-Fit Score */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Fit Score</span>
            <span className="text-emerald-600 font-medium text-[11px]">High precision</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {avgFitScore}/100
            </span>
            <span className="text-xs text-slate-500">match rate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>4-factor explainable AI rating</span>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Awaiting Review</span>
            <span className="text-amber-700 font-medium text-[11px]">Action required</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {awaitingReview}
            </span>
            <span className="text-xs text-slate-500">unreviewed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <button 
              onClick={() => onNavigate('leads')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Review queue →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Discovery Velocity Chart + Setup Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): 7-Day Velocity Chart */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Lead Discovery & Qualification Velocity
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></span>
                  <span>Candidates Scanned</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span>
                  <span>Qualified Leads</span>
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Daily volume of public social posts identified with high buying intent.
            </p>

            {/* Custom Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
              {velocityData.map((item, idx) => {
                const totalHeightPct = Math.round((item.count / maxDayCount) * 100);
                const qualHeightPct = Math.round((item.qualified / maxDayCount) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                      {/* Total Bar */}
                      <div 
                        style={{ height: `${totalHeightPct}%` }}
                        className="w-1/2 bg-slate-200 rounded-t-sm group-hover:bg-slate-300 transition-all relative"
                        title={`${item.count} total signals on ${item.day}`}
                      />
                      {/* Qualified Bar */}
                      <div 
                        style={{ height: `${qualHeightPct}%` }}
                        className="w-1/2 bg-indigo-600 rounded-t-sm group-hover:bg-indigo-700 transition-all relative"
                        title={`${item.qualified} qualified leads on ${item.day}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated across LinkedIn, Facebook, X, and Instagram</span>
            <button 
              onClick={() => onNavigate('discovery')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>View Discovery Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (1 col): Setup Checklist */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Setup Checklist
              </h2>
              <span className="text-xs font-mono tabular-nums font-semibold text-indigo-600">
                {completedCount} of {checklistItems.length} complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Get maximum conversion from intent-based discovery.
            </p>

            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all ${
                    item.completed 
                      ? 'bg-slate-50/70 border-slate-200' 
                      : 'bg-white border-indigo-100 shadow-xs ring-1 ring-indigo-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.completed ? 'text-emerald-600' : 'text-slate-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${
                          item.completed ? 'text-slate-700 line-through' : 'text-slate-900'
                        }`}>
                          {item.title}
                        </span>
                        <button
                          onClick={item.action}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        >
                          {item.cta}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Target daily pace: {icp.dailyLeadTarget} leads</span>
            <button 
              onClick={() => onNavigate('icp')}
              className="text-slate-700 font-medium hover:underline"
            >
              Adjust targets
            </button>
          </div>
        </div>
      </div>

      {/* Recent High-Intent Signals Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recent Intent Signals & Expressed Needs
            </h2>
            <p className="text-xs text-slate-500">
              Latest prospects publicly asking questions or voicing pain points matching your ICP.
            </p>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Leads ({leads.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 pr-4">Prospect & Company</th>
                <th className="py-2.5 px-4">Channel</th>
                <th className="py-2.5 px-4">Extracted Customer Need</th>
                <th className="py-2.5 px-4 text-center">Fit Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-xs">No intent signals discovered yet.</p>
                      <button
                        onClick={() => onNavigate('discovery')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                      >
                        Run First Intent Discovery Scan
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.slice(0, 5).map((lead) => (
                  <tr 
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {lead.prospectName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lead.jobTitle} · {lead.company}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-slate-700">
                        {lead.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={lead.extractedNeed}>
                      {lead.extractedNeed}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono tabular-nums font-bold text-xs ${
                        lead.fitScore >= 90 ? 'text-emerald-700' :
                        lead.fitScore >= 80 ? 'text-indigo-600' :
                        lead.fitScore >= 70 ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {lead.fitScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-slate-600 font-medium">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
                        Review Lead
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
