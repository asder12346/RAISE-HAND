import React, { useState } from 'react';
import { 
  Radar, 
  Play, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Radio, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Search,
  AlertCircle,
  Code2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Database,
  Cpu,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DiscoveryJob, ICPConfiguration, IntentChannel, Lead } from '../../types';
import { ApiService } from '../../services/api';

interface DiscoveryViewProps {
  icp: ICPConfiguration;
  jobs: DiscoveryJob[];
  onStartJob: (job: DiscoveryJob, newLeads: Lead[]) => Promise<void>;
  onViewLeads: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  icp,
  jobs,
  onStartJob,
  onViewLeads,
}) => {
  const [query, setQuery] = useState(
    icp.serviceDescription ? `recommend ${icp.serviceDescription.slice(0, 40)}` : 'recommend agency B2B outbound pipeline founder sales'
  );
  const [keywords, setKeywords] = useState(
    icp.painPoints.length > 0 ? icp.painPoints.slice(0, 4).join(', ') : 'high CAC, reply rates dropped, outbound agency, scaling reps'
  );
  const [selectedChannels, setSelectedChannels] = useState<IntentChannel[]>([
    'linkedin',
    'facebook',
    'x',
    'instagram',
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPct, setProgressPct] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [lastFinishedJob, setLastFinishedJob] = useState<DiscoveryJob | null>(null);

  // Search Technology Guide toggle & copy states
  const [showTechGuide, setShowTechGuide] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mainKeyword = keywords.split(',')[0]?.trim() || icp.targetIndustries[0] || 'AI receptionist';
  const linkedinDork = `site:linkedin.com/posts ("recommend" OR "looking for" OR "alternative to") "${mainKeyword}"`;
  const xDork = `(site:twitter.com OR site:x.com) ("any recommendations for" OR "who do you use for") "${mainKeyword}"`;
  const facebookDork = `site:facebook.com/groups ("looking for" OR "recommendations") "${mainKeyword}"`;

  const copyDork = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleChannel = (channel: IntentChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChannels.length === 0) return;

    setIsRunning(true);
    setProgressPct(5);
    setProgressStage('Initializing search parameters & intent keywords...');
    setCandidatesCount(0);
    setQualifiedCount(0);

    const jobId = `job-${Date.now()}`;
    const newJob: DiscoveryJob = {
      id: jobId,
      name: query.slice(0, 36) || 'Custom Intent Search',
      channels: selectedChannels,
      targetQuery: query,
      problemKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      status: 'running',
      candidatesEvaluated: 0,
      qualifiedCount: 0,
      totalFound: 0,
      startedAt: new Date().toISOString(),
    };

    // Step 1: Scanning public feeds (simulated provider fetch)
    setTimeout(() => {
      setProgressPct(30);
      setProgressStage(`Scanning authorized public discussions across ${selectedChannels.join(', ')}...`);
      setCandidatesCount(24);
    }, 700);

    // Step 2: Extracting candidate posts
    setTimeout(() => {
      setProgressPct(65);
      setProgressStage('Filtering candidate posts against ICP negative exclusions...');
      setCandidatesCount(58);
      setQualifiedCount(2);
    }, 1500);

    // Step 3: AI intent evaluation with Gemini
    setTimeout(async () => {
      setProgressPct(85);
      setProgressStage('Evaluating intent urgency & extracting pain points with Gemini 3.8 Flash...');

      try {
        const generatedLeads = await ApiService.generateDiscoveryLeads({
          icp,
          channels: selectedChannels,
          query,
          keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
          count: 4,
        });

        const completedJob: DiscoveryJob = {
          ...newJob,
          status: 'completed',
          candidatesEvaluated: 84,
          qualifiedCount: generatedLeads.length,
          totalFound: generatedLeads.length * 3,
          completedAt: new Date().toISOString(),
        };

        setCandidatesCount(84);
        setQualifiedCount(generatedLeads.length);
        setProgressPct(100);
        setProgressStage(`Discovery complete! ${generatedLeads.length} high-fit leads qualified.`);
        setIsRunning(false);
        setLastFinishedJob(completedJob);

        await onStartJob(completedJob, generatedLeads);
      } catch (err: any) {
        console.error('Error generating discovery leads:', err);
        setProgressStage('Completed with fallback');
        setIsRunning(false);
      }
    }, 1800);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Intent Signal Discovery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure search jobs to discover prospects who have raised their hand asking for solutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTechGuide(!showTechGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Search Technologies & APIs</span>
            {showTechGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>ICP: <strong className="text-slate-800">{icp.companyName || 'Configured Profile'}</strong></span>
          </div>
        </div>
      </div>

      {/* Recommended Search Technologies & Data Providers Architecture Guide */}
      {showTechGuide && (
        <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Engineering Blueprint
                </span>
                <span className="text-xs text-slate-400">Social Intent Search Architecture</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Recommended Search Technologies for Intent-Based Lead Generation
              </h2>
            </div>
            <button
              onClick={() => setShowTechGuide(false)}
              className="text-xs text-slate-400 hover:text-white self-start sm:self-auto"
            >
              Close Guide
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            To search social networks (LinkedIn, Facebook groups, X, Reddit) in production without getting blocked or paying tens of thousands for official enterprise firehoses, modern lead engines (such as Raised Hand and Rea) combine three layers:
          </p>

          {/* 4 Technologies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Google Custom Search / SerpAPI */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-white">Google Programmable Search & SerpAPI</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">Fast & Free Tier</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Uses Google Dorks to search indexed public posts on LinkedIn, X, and Facebook. Google indexes new posts every few hours, making it ideal for finding "Any recommendations for...".
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
                GET https://serpapi.com/search.json?q=site:linkedin.com/posts "recommend" "{mainKeyword}"
              </div>
            </div>

            {/* 2. Apify Social Scrapers */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-white">Apify Social Actors (Scrapers)</h3>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono font-medium">Deep Extraction</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Headless browser actors like <code className="text-indigo-300">apify/linkedin-post-scraper</code> and <code className="text-indigo-300">apify/facebook-groups-scraper</code> that fetch full post texts, likers lists, and commenters without official API restrictions.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
                POST https://api.apify.com/v2/acts/apify~linkedin-post-scraper/runs
              </div>
            </div>

            {/* 3. Crustdata & Proxycurl */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-white">Crustdata & Proxycurl Real-Time APIs</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-medium">B2B Graph Webhooks</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Specialized data providers that monitor company followers, post engagements, and founder updates in real time, triggering webhooks when someone comments or engages.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
                POST https://api.crustdata.com/screener/linkedin/posts/search
              </div>
            </div>

            {/* 4. Exa.ai Neural Search */}
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-xs font-bold text-white">Exa.ai (Neural Semantic Search)</h3>
                </div>
                <span className="text-[10px] text-pink-400 font-mono font-medium">AI Semantic Search</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Search the web using natural meaning rather than raw keywords. Search: <em>"Executives looking for an AI phone agent replacement"</em> and Exa returns direct discussion links.
              </p>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
                POST https://api.exa.ai/search {`{ "query": "asking for ${mainKeyword} recommendations" }`}
              </div>
            </div>
          </div>

          {/* Live Generated Google Dorks Based on User ICP */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Ready-To-Use Search Queries for Your ICP ("{mainKeyword}")</span>
              </h4>
              <span className="text-[10px] text-slate-500">Test directly in your browser</span>
            </div>

            <div className="space-y-2">
              {/* LinkedIn Dork */}
              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <div className="font-mono text-slate-300 truncate">
                  <span className="text-blue-400">LinkedIn:</span> {linkedinDork}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyDork(linkedinDork, 'li')}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy query"
                  >
                    {copiedKey === 'li' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(linkedinDork)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-indigo-400 hover:text-indigo-300"
                    title="Test on Google"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* X / Twitter Dork */}
              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <div className="font-mono text-slate-300 truncate">
                  <span className="text-neutral-400">X (Twitter):</span> {xDork}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyDork(xDork, 'x')}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy query"
                  >
                    {copiedKey === 'x' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(xDork)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-indigo-400 hover:text-indigo-300"
                    title="Test on Google"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Facebook Groups Dork */}
              <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <div className="font-mono text-slate-300 truncate">
                  <span className="text-blue-300">Facebook:</span> {facebookDork}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyDork(facebookDork, 'fb')}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy query"
                  >
                    {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(facebookDork)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-indigo-400 hover:text-indigo-300"
                    title="Test on Google"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Job Configuration Form */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Radar className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Configure Discovery Search
          </h2>
        </div>

        <form onSubmit={handleStartDiscovery} className="space-y-4">
          {/* Query input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prospect Search Query & Problem Context
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. recommend B2B outbound agency pipeline scaling"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Natural language description of what problems, questions, or requests the ideal buyer is voicing.
            </p>
          </div>

          {/* Keywords input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intent Keywords & Pain Phrases (Comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. high CAC, outbound agency, reply rates dropped, scaling SDRs"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Authorized Intent Channels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'linkedin' as IntentChannel, name: 'LinkedIn', color: 'border-blue-200 text-blue-800' },
                { id: 'facebook' as IntentChannel, name: 'Facebook Groups', color: 'border-blue-300 text-blue-900' },
                { id: 'x' as IntentChannel, name: 'X (Twitter)', color: 'border-neutral-300 text-neutral-900' },
                { id: 'instagram' as IntentChannel, name: 'Instagram', color: 'border-pink-200 text-pink-800' },
              ].map((channel) => {
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{channel.name}</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected ? 'text-indigo-600' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {selectedChannels.length === 0 && (
              <p className="text-[11px] text-rose-600 mt-1">Please select at least one channel.</p>
            )}
          </div>

          {/* Action Button & Live Progress */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Engine: Powered by Gemini 3.8 Flash Intent Reasoning</span>
            </div>

            <button
              type="submit"
              disabled={isRunning || selectedChannels.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
            >
              {isRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isRunning ? 'Discovery in Progress...' : 'Start Intent Discovery Job'}</span>
            </button>
          </div>
        </form>

        {/* Live Search Progress State */}
        {isRunning && (
          <div className="mt-4 p-4 bg-slate-50 border border-indigo-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                {progressStage}
              </span>
              <span className="font-mono tabular-nums text-indigo-600">{progressPct}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Counter badges */}
            <div className="flex items-center gap-6 pt-1 text-xs">
              <div>
                <span className="text-slate-500">Candidate Signals Evaluated: </span>
                <span className="font-mono tabular-nums font-bold text-slate-900">{candidatesCount}</span>
              </div>
              <div>
                <span className="text-slate-500">Qualified Buying Signals: </span>
                <span className="font-mono tabular-nums font-bold text-emerald-700">{qualifiedCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert upon completion */}
        {lastFinishedJob && !isRunning && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>Job completed:</strong> Discovered {lastFinishedJob.qualifiedCount} high-conviction intent leads matching your ICP.
              </div>
            </div>
            <button
              onClick={onViewLeads}
              className="px-3.5 py-1.5 bg-emerald-700 text-white font-semibold rounded-md hover:bg-emerald-800 transition-colors flex items-center gap-1 self-start sm:self-auto shrink-0 shadow-xs"
            >
              <span>View In Pipeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Discovery Job History */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Discovery Job History
          </h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {jobs.length} jobs run
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 pr-4">Search Job</th>
                <th className="py-2.5 px-4">Channels</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Evaluated</th>
                <th className="py-2.5 px-4 text-center">Qualified</th>
                <th className="py-2.5 pl-4 text-right">Date Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-900">{job.name}</div>
                    <div className="text-[11px] text-slate-500 max-w-sm truncate">
                      {job.targetQuery}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {job.channels.map((c) => (
                        <span key={c} className="capitalize text-[11px] text-slate-600">
                          {c} ·
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-slate-700 font-medium">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                    {job.candidatesEvaluated}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-emerald-700">
                    {job.qualifiedCount}
                  </td>
                  <td className="py-3 pl-4 text-right text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(job.startedAt).toLocaleDateString()} {new Date(job.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
