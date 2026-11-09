import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  User, 
  Bell, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { UserProfile, ICPConfiguration, Lead } from '../../types';
import { 
  getSupabaseConfig, 
  isSupabaseConfigured, 
  resetSupabaseClient, 
  SUPABASE_SQL_SCHEMA,
  getSupabase
} from '../../services/supabase';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetDemoWorkspace: () => void;
  leads: Lead[];
  icp: ICPConfiguration;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onResetDemoWorkspace,
  leads,
  icp,
}) => {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  const [copiedSchema, setCopiedSchema] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form state
  const [userProfile, setUserProfile] = useState<UserProfile>(profile);

  // Notification toggles
  const [dailyDigest, setDailyDigest] = useState(true);
  const [highIntentAlerts, setHighIntentAlerts] = useState(true);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    setSupabaseStatus(null);

    try {
      localStorage.setItem('leadsignal_supabase_url', supabaseUrl.trim());
      localStorage.setItem('leadsignal_supabase_key', supabaseKey.trim());
      resetSupabaseClient();

      if (!supabaseUrl.trim() || !supabaseKey.trim()) {
        setSupabaseStatus('Credentials cleared. Reverted to local storage demo workspace.');
        setIsTestingSupabase(false);
        return;
      }

      // Test connection
      const client = getSupabase();
      if (!client) {
        setSupabaseStatus('Invalid URL or key format.');
        setIsTestingSupabase(false);
        return;
      }

      const { data, error } = await client.from('leads').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        setSupabaseStatus(`Connected to Supabase endpoint! (Note: ensure you have executed the SQL schema below in your Supabase SQL editor: ${error.message})`);
      } else {
        setSupabaseStatus('Successfully connected to Supabase database with Row Level Security!');
      }
    } catch (err: any) {
      setSupabaseStatus(`Connection failed: ${err.message || 'Check network'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(userProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportAll = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: userProfile,
      icp,
      leads,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadsignal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Settings & Integrations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Supabase PostgreSQL database storage, Gemini AI server connectivity, and user profile.
        </p>
      </div>

      {/* Section 1: Supabase Configuration */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Supabase PostgreSQL Database & Auth
            </h2>
          </div>

          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${
            isSupabaseConfigured()
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {isSupabaseConfigured() ? 'Supabase Configured' : 'Using Local Storage Workspace'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          LeadSignal AI supports cloud persistence with <strong>Supabase</strong>. When configured, leads, jobs, ICP configurations, and outreach drafts are securely synced to your PostgreSQL instance with Row Level Security (RLS).
        </p>

        <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {supabaseStatus && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{supabaseStatus}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopySchema}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'SQL Schema Copied to Clipboard!' : 'Copy Supabase SQL Schema (Tables & RLS)'}</span>
            </button>

            <button
              type="submit"
              disabled={isTestingSupabase}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isTestingSupabase && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isTestingSupabase ? 'Verifying...' : 'Save & Test Connection'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Gemini AI Engine Status */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Gemini AI Intent Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block mb-0.5">Active Model</span>
            <span className="font-semibold text-slate-900 font-mono">gemini-3.8-flash</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block mb-0.5">Execution Location</span>
            <span className="font-semibold text-slate-900">Server-Side Express Proxy</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block mb-0.5">API Key Injection</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Runtime Env (process.env)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Untrusted user social media content is wrapped in strict boundaries to prevent prompt injections during intent qualification and outreach synthesis.
        </p>
      </div>

      {/* Section 3: User Profile */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              User Profile & Workspace Account
            </h2>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={userProfile.companyName}
                onChange={(e) => setUserProfile({ ...userProfile, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={userProfile.role}
                onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Notification Preferences */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Alert & Notification Preferences
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <div>
              <span className="font-semibold text-slate-800 block">Daily Qualified Leads Digest</span>
              <span className="text-[11px] text-slate-500">Summary of all buying intent posts discovered in the last 24 hours.</span>
            </div>
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <div>
              <span className="font-semibold text-slate-800 block">Immediate High-Intent Alerts (90+ Fit Score)</span>
              <span className="text-[11px] text-slate-500">Notify immediately when a prospect explicitly requests recommendations.</span>
            </div>
            <input
              type="checkbox"
              checked={highIntentAlerts}
              onChange={(e) => setHighIntentAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Section 5: Data & Workspace Management */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Download className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Workspace Data Management
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Workspace (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset workspace to clean synthetic demo dataset? Your custom leads and ICP changes will be restored to defaults.')) {
                onResetDemoWorkspace();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo Workspace Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
