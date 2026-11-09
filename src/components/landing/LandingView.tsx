import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Check, 
  RefreshCw, 
  Building, 
  Radio, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  Download,
  Users,
  Search,
  Eye,
  Clock,
  Send,
  UserCheck,
  Target,
  Zap,
  HelpCircle
} from 'lucide-react';
import { ICPConfiguration, IntentChannel, Lead } from '../../types';
import { ApiService } from '../../services/api';

interface LandingViewProps {
  onWebsiteAnalyzed: (analyzedIcp: ICPConfiguration, generatedLeads: Lead[]) => void;
  onEnterApp: () => void;
  onOpenQualifyPost?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onWebsiteAnalyzed,
  onEnterApp,
  onOpenQualifyPost,
}) => {
  const [entryMode, setEntryMode] = useState<'niche' | 'website'>('niche');
  const [nicheInput, setNicheInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interactive mock state for "Qualify any post" snippet on landing page
  const [interactivePostUrl, setInteractivePostUrl] = useState('linkedin.com/posts/ai-receptionists-missed-calls…');
  const [postQualified, setPostQualified] = useState(false);

  // Interactive mock state for "Learns what a good lead is" feedback preview
  const [feedbackState, setFeedbackState] = useState<'good' | 'bad' | 'remove' | null>('good');

  const sampleNiches = [
    { 
      label: '🦷 Clinics · AI Receptionist', 
      niche: 'AI phone receptionists and appointment booking for dental and medical clinics', 
      url: 'https://callbotics.ai',
      problem: 'Missed calls after 5pm & high front-desk receptionist turnover' 
    },
    { 
      label: '🚀 B2B SaaS · Outbound Sales', 
      niche: 'Cold outbound sales pipeline and SDR meeting booking for B2B SaaS founders', 
      url: 'https://apexgrowth.io',
      problem: 'Low reply rates and unpredictable founder sales pipeline' 
    },
    { 
      label: '🔧 Contractors · 24/7 Answering', 
      niche: '24/7 emergency call answering and job dispatch for local HVAC & plumbing contractors', 
      url: 'https://proflowdispatch.com',
      problem: 'Unanswered evening emergency calls going to competitors' 
    },
    { 
      label: '🛍️ Ecommerce · Checkout CRO', 
      niche: 'Shopify checkout conversion optimization and abandoned cart recovery', 
      url: 'https://cartlift.co',
      problem: 'High Facebook ad CAC and lost checkout revenue' 
    },
  ];

  const handleStartAnalysis = async (customNiche?: string, customUrl?: string) => {
    const targetNiche = customNiche !== undefined ? customNiche : (entryMode === 'niche' ? nicheInput : serviceDesc);
    const targetUrl = customUrl !== undefined ? customUrl : (entryMode === 'website' ? websiteUrl : '');

    if (!targetNiche.trim() && !targetUrl.trim()) {
      setErrorMsg('Please enter your business niche, service, or customer problem.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep('Learning who buys your solution and identifying customer friction points...');

    try {
      // Step 1: Analyze Niche / Offering / Website with Gemini
      const analyzed = await ApiService.analyzeWebsite({
        websiteUrl: targetUrl.trim(),
        serviceDescription: targetNiche.trim() || targetUrl.trim(),
      });

      setAnalysisStep('Configuring your ideal customer profile (decision makers, company size, pain signals)...');

      const icpData: ICPConfiguration = {
        id: `icp-${Date.now()}`,
        companyName: analyzed.companyName || 'My Business',
        websiteUrl: targetUrl.trim(),
        serviceDescription: analyzed.serviceDescription || targetNiche.trim(),
        targetIndustries: analyzed.targetIndustries || ['Clinics', 'Local Businesses', 'Medical'],
        targetTitles: analyzed.targetTitles || ['Clinic Director', 'Practice Owner', 'Operations Manager'],
        targetSeniority: analyzed.targetSeniority || ['Owner', 'Director', 'Founder'],
        targetCountries: analyzed.targetCountries || ['US', 'Canada', 'UK'],
        companySizeRange: analyzed.companySizeRange || '1 - 25 employees',
        painPoints: analyzed.painPoints || ['Missed calls after 5pm', 'High receptionist turnover', 'Lost booking revenue'],
        negativeExclusions: analyzed.negativeExclusions || ['Students', 'Enterprise hospital conglomerates'],
        dailyLeadTarget: analyzed.dailyLeadTarget || 20,
        updatedAt: new Date().toISOString(),
      };

      setAnalysisStep('Listening on LinkedIn, Facebook groups, review sites, and X for people asking for help...');

      // Step 2: Generate dynamic real intent leads with Gemini matching this REAL user input
      const generatedLeads = await ApiService.generateDiscoveryLeads({
        icp: icpData,
        channels: ['linkedin', 'facebook', 'x', 'instagram'],
        query: `recommend ${icpData.serviceDescription} partner agency`,
        keywords: icpData.painPoints,
        count: 5,
      });

      setAnalysisStep('Found people who raised their hand! Opening your pipeline...');

      setTimeout(() => {
        onWebsiteAnalyzed(icpData, generatedLeads);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze niche. Ensure the server is online.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            RH
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            Raised Hand
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Buyer Intent Discovery on Auto-Pilot
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12] text-balance">
          Never cold pitch again.<br />
          Find people who <span className="text-indigo-600">raised their hand</span>.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Qualified people who already asked, delivered on auto-pilot.
        </p>

        {/* Live Intent Discovery Box: Niche / Problem / Offering */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-4 text-left">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEntryMode('niche')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  entryMode === 'niche'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target by Niche / Problem (No website needed)</span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode('website')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  entryMode === 'website'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Or Paste Website URL</span>
              </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900">
              {entryMode === 'niche' 
                ? 'Tell us your business niche, what you sell, or the problem you solve:' 
                : 'Paste your business website URL:'}
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                {entryMode === 'niche' ? (
                  <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                ) : (
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type="text"
                  placeholder={
                    entryMode === 'niche'
                      ? 'e.g. AI receptionist for dental clinics (missing calls after 5pm)'
                      : 'https://yourcompany.com or youragency.com'
                  }
                  value={entryMode === 'niche' ? nicheInput : websiteUrl}
                  onChange={(e) => {
                    if (entryMode === 'niche') {
                      setNicheInput(e.target.value);
                    } else {
                      setWebsiteUrl(e.target.value);
                    }
                  }}
                  disabled={isAnalyzing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleStartAnalysis();
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStartAnalysis()}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isAnalyzing ? 'Finding People...' : 'Find People With This Problem'}</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500">
              {entryMode === 'niche'
                ? 'We learn who has this exact problem, listen to live discussions across LinkedIn & Facebook, and deliver buyers who raised their hand.'
                : 'We read your site to learn who you sell to, and find buyers who already asked for what you do.'}
            </p>
          </div>

          {/* Quick Try Sample Chips */}
          <div className="pt-1 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">
              1-Click Popular Niche & Problem Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleNiches.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNicheInput(sample.niche);
                    setServiceDesc(sample.niche);
                    setWebsiteUrl(sample.url);
                    handleStartAnalysis(sample.niche, sample.url);
                  }}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors text-left"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Analysis Progress Animation */}
          {isAnalyzing && (
            <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  {analysisStep}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-3/4 animate-pulse rounded-full" />
              </div>
              <p className="text-[11px] text-slate-500">
                Scouring public buyer questions, complaints, and recommendations for this problem.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}
        </div>
      </section>

      {/* Section: What Raised Hand does for you */}
      <section id="what-it-does" className="py-16 bg-white border-y border-slate-200 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Auto-Pilot Lead Generation
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              What Raised Hand does for you
            </h2>
            <p className="text-sm text-slate-600">
              Qualified people who already asked, delivered on auto-pilot.
            </p>
          </div>

          {/* 6 Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Builds your ideal customer */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                  Local businesses
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                  Clinics
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                  AI receptionist
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                  US
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Builds your ideal customer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Understands your niche or reads your site to learn who you sell to. You confirm it in one screen.
                </p>
              </div>
            </div>

            {/* Feature 2: Listens where your buyers talk */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Every few hours</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Listens where your buyers talk
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  LinkedIn (posts, comments and likes), Facebook groups, review sites, job boards and the open web, every few hours.
                </p>
              </div>
            </div>

            {/* Feature 3: Catches buying signals */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  Posted
                </span>
                <p className="italic text-slate-800 leading-relaxed">
                  “Any recommendations for an AI receptionist? We miss too many calls after 5pm.”
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Catches buying signals
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Spots the moment someone asks for what you sell, or complains about who they have.
                </p>
              </div>
            </div>

            {/* Feature 4: Finds how to reach them */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-600">Email j••••@n•••••.com</span>
                  <span className="text-emerald-700 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-600">Phone +1 ••••••18</span>
                  <span className="text-emerald-700 font-bold">✓</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Finds how to reach them
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Email and phone, looked up and checked, with verification shown honestly.
                </p>
              </div>
            </div>

            {/* Feature 5: Learns what a good lead is */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setFeedbackState('good')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    feedbackState === 'good'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Good lead
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackState('bad')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    feedbackState === 'bad'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Bad lead
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackState('remove')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    feedbackState === 'remove'
                      ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Remove
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Learns what a good lead is
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mark good, bad or remove. Every mark makes the next batch better.
                </p>
              </div>
            </div>

            {/* Feature 6: Routes every lead */}
            <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-colors">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                <span>CSV</span>
                <span className="text-slate-300">·</span>
                <span>Excel</span>
                <span className="text-slate-300">·</span>
                <span className="text-indigo-600">Google Sheets</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Routes every lead
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daily batches and one-click export to CSV, Excel or Google Sheets. Integrations are coming soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: And once you have them */}
      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Advanced Automation
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              And once you have them
            </h2>
            <p className="text-sm text-slate-600">
              Three more things Raised Hand does with the people it finds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tool 1: Watch any profile */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                {/* Visual Mock Card from Raised Hand */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      AM
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Alex Moran</span>
                        <span className="text-[11px] text-slate-400">· Competitor</span>
                        <span className="text-[11px] text-indigo-600 font-semibold">Watching…</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    Spent 3 hours fixing our missed-call problem. Here's what finally worked for the clinic…
                  </p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>224 likes · 45 comments</span>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>New lead: Dana W. commented</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Watch any profile
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add competitors and the people your buyers follow. Anyone who fits and engages with their posts becomes a lead.
                  </p>
                </div>
              </div>
            </div>

            {/* Tool 2: Qualify any post */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                {/* Visual Mock Card from Raised Hand */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={interactivePostUrl}
                      onChange={(e) => setInteractivePostUrl(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-mono text-slate-700 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenQualifyPost) {
                          onOpenQualifyPost();
                        } else {
                          setPostQualified(!postQualified);
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white font-semibold text-xs rounded hover:bg-indigo-700 transition-colors shrink-0"
                    >
                      Check
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                      <span className="text-slate-800">Dana W. · Clinic director</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">Fits</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                      <span className="text-slate-800">Marcus H. · Owner</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">Fits</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                      <span className="text-slate-500">Sam K. · Student</span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">Skipped</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Qualify any post
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Paste a LinkedIn post. We check everyone who liked or commented and keep only the ones who fit.
                  </p>
                </div>
              </div>
            </div>

            {/* Tool 3: LinkedIn outreach */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                {/* Visual Mock Card from Raised Hand */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Invite sent</span>
                    <span className="text-slate-400 font-mono text-[11px]">Today, 9:02</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Accepted</span>
                    <span className="text-slate-400 font-mono text-[11px]">Today, 11:40</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-700">Message sent</span>
                    <span className="text-slate-500 text-[11px]">Written for Priya</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Follow-up</span>
                    <span className="text-slate-500 text-[11px]">Day 2, then day 5</span>
                  </div>
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-900 font-medium">
                    Auto-stopped the second they reply.
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    LinkedIn outreach
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Connect your LinkedIn once. Invites, messages and follow-ups all send from Raised Hand, and anyone who replies is stopped automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Raised Hand</span>
            <span>· Intent-based lead generation platform</span>
          </div>
          <button
            onClick={onEnterApp}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Launch Workspace &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
};
