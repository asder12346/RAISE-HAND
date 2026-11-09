import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  Play, 
  Pause,
  ExternalLink,
  Radio,
  Eye,
  UserCheck,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users
} from 'lucide-react';
import { WatchlistItem, IntentChannel, Lead } from '../../types';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onSaveWatchlist: (items: WatchlistItem[]) => Promise<void>;
  onTriggerScan: (item: WatchlistItem) => void;
  onOpenQualifyPost?: (prefilledUrl?: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onSaveWatchlist,
  onTriggerScan,
  onOpenQualifyPost,
}) => {
  const [items, setItems] = useState<WatchlistItem[]>(watchlist);
  const [isAdding, setIsAdding] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [targetType, setTargetType] = useState<'profile_page' | 'company' | 'keyword'>('profile_page');
  const [profileRole, setProfileRole] = useState('Competitor');
  const [profileUrl, setProfileUrl] = useState('');
  const [channel, setChannel] = useState<IntentChannel>('linkedin');
  const [notes, setNotes] = useState('');
  const [recentPostSnippet, setRecentPostSnippet] = useState('');
  const [scanningId, setScanningId] = useState<string | null>(null);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    const initials = targetName
      .trim()
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'WP';

    const newItem: WatchlistItem = {
      id: `watch-${Date.now()}`,
      targetName: targetName.trim(),
      targetType,
      profileRole: targetType === 'profile_page' ? profileRole : undefined,
      profileUrl: profileUrl.trim() || undefined,
      recentPostSnippet: recentPostSnippet.trim() || undefined,
      avatarInitials: initials,
      likesCount: 140,
      commentsCount: 38,
      lastSignalSummary: `Monitoring post comments for buying intent`,
      channel,
      lastCheckedAt: new Date().toISOString(),
      signalsCount: 0,
      status: 'active',
      notes: notes.trim(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await onSaveWatchlist(updated);

    // Reset form
    setTargetName('');
    setProfileUrl('');
    setRecentPostSnippet('');
    setNotes('');
    setIsAdding(false);
  };

  const toggleStatus = async (id: string) => {
    const updated = items.map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'active' ? ('paused' as const) : ('active' as const) }
        : item
    );
    setItems(updated);
    await onSaveWatchlist(updated);
  };

  const deleteItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await onSaveWatchlist(updated);
  };

  const handleScanProfile = (item: WatchlistItem) => {
    setScanningId(item.id);
    setTimeout(() => {
      setScanningId(null);
      if (onOpenQualifyPost) {
        onOpenQualifyPost(item.profileUrl || `https://linkedin.com/posts/${item.targetName.toLowerCase().replace(/\s+/g, '-')}-discussion`);
      } else {
        onTriggerScan(item);
      }
    }, 600);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Raised Hand "Watch Any Profile" Headline Section */}
      <div className="p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Eye className="w-3.5 h-3.5" />
              <span>Competitor & Audience Intelligence</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Watch any profile
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Add competitors and the people your buyers follow. Anyone who fits and engages with their posts becomes a lead.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Watch New Profile</span>
            </button>
          </div>
        </div>

        {/* Live Example Spotlight Card (Verbatim Raised Hand Experience) */}
        <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Alex Moran</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500 font-medium">Competitor</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Watching…
                </span>
              </div>
              <p className="text-xs text-slate-700 italic mt-1 line-clamp-1">
                "Spent 3 hours fixing our missed-call problem. Here's what finally worked for the clinic…"
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="font-mono tabular-nums font-semibold text-slate-700">224 likes · 45 comments</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  New lead: Dana W. commented
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                if (onOpenQualifyPost) {
                  onOpenQualifyPost('https://linkedin.com/posts/alex-moran-missed-call-clinic-solution');
                }
              }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qualify Engagers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Profile / Target Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="p-5 bg-white border border-indigo-200 rounded-xl space-y-4 shadow-sm animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Add Profile or Account to Watch</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Person or Company Name
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Alex Moran or Apex AI"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Relationship / Role
              </label>
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Competitor">Direct Competitor</option>
                <option value="Industry Influencer">Industry Influencer (Followed by Buyers)</option>
                <option value="Key Prospect">High-Intent Account Executive</option>
                <option value="Customer Community">User Community / Group</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as IntentChannel)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 capitalize"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="x">X (Twitter)</option>
                <option value="facebook">Facebook Group</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Profile or Post URL (Optional)
              </label>
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/alex-moran"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recent Post or Focus Topic
              </label>
              <input
                type="text"
                value={recentPostSnippet}
                onChange={(e) => setRecentPostSnippet(e.target.value)}
                placeholder="e.g. Missed calls, AI receptionists, dental clinic operations"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Strategy / Listening Trigger
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Anyone who likes or comments on their missed call posts fits our AI phone agent offering"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Start Watching Profile
            </button>
          </div>
        </form>
      )}

      {/* Watched Profiles List */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Monitored Profiles ({items.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Checked automatically every few hours
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">No watched profiles yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add competitors or industry leaders your buyers follow. We'll listen to their posts and convert engagers into qualified leads.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Monitored Profile</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.avatarInitials || item.targetName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.targetName}</span>
                      {item.profileRole && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-500">{item.profileRole}</span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="capitalize font-medium text-[11px] text-slate-600">
                        {item.channel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {item.status === 'active' ? (
                          <>
                            <Radio className="w-2 h-2 text-emerald-600 animate-pulse" />
                            <span>Watching…</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-2 h-2 text-slate-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </div>

                    {item.recentPostSnippet && (
                      <p className="text-xs text-slate-700 italic mt-0.5 line-clamp-1">
                        "{item.recentPostSnippet}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      {item.likesCount !== undefined && (
                        <span className="font-mono tabular-nums">
                          {item.likesCount} likes · {item.commentsCount} comments
                        </span>
                      )}
                      {item.lastSignalSummary && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-indigo-700">
                            {item.lastSignalSummary}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleScanProfile(item)}
                    disabled={scanningId === item.id}
                    title="Qualify this profile's post engagers"
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${scanningId === item.id ? 'animate-spin' : ''}`} />
                    <span>{scanningId === item.id ? 'Checking...' : 'Check Post Engagers'}</span>
                  </button>

                  <button
                    onClick={() => deleteItem(item.id)}
                    title="Delete profile"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
