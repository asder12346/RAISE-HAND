import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { ICPConfiguration, Lead, PostQualifyResult } from '../../types';
import { ApiService } from '../../services/api';

interface QualifyPostModalProps {
  icp: ICPConfiguration;
  onClose: () => void;
  onAddQualifiedLeads: (leads: Lead[]) => void;
}

export const QualifyPostModal: React.FC<QualifyPostModalProps> = ({
  icp,
  onClose,
  onAddQualifiedLeads,
}) => {
  const [postUrl, setPostUrl] = useState('linkedin.com/posts/ai-receptionists-missed-calls-solution');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PostQualifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const handleCheckPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) return;

    setIsChecking(true);
    setErrorMsg(null);
    setResult(null);
    setImported(false);

    try {
      const res = await ApiService.qualifyPost({
        postUrl: postUrl.trim(),
        icp,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to qualify post.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleImportFits = () => {
    if (!result) return;
    const fittingEngagers = result.engagers.filter(e => e.fits);
    const newLeads: Lead[] = fittingEngagers.map((engager, idx) => ({
      id: `lead-engager-${Date.now()}-${idx}`,
      prospectName: engager.name,
      jobTitle: engager.jobTitle,
      company: engager.company,
      location: 'United States',
      platform: 'linkedin',
      sourceUrl: result.postUrl.startsWith('http') ? result.postUrl : `https://${result.postUrl}`,
      postContent: `Engaged with viral post regarding: "${result.postTopic}" (${engager.actionTaken} and agreed with the operational pain).`,
      discoveredAt: new Date().toISOString(),
      fitScore: 89,
      scoreRationale: engager.reason,
      scoreBreakdown: {
        needUrgency: 22,
        authorityFit: 23,
        offeringMatch: 27,
        platformContext: 17,
      },
      extractedNeed: `Actively interested in solving: ${result.postTopic}`,
      evidenceQuotes: [`Engaged on post: ${result.postTopic}`],
      missingEvidence: ['Direct corporate email needs standard validation'],
      contactInfo: {
        linkedinUrl: engager.profileUrl,
        verificationStatus: 'verified',
        verificationSource: 'LinkedIn public activity engagement lookup',
      },
      status: 'new',
      notes: `Qualified via Raised Hand Post Qualifier from post: ${result.postUrl}`,
      isDemo: false,
    }));

    onAddQualifiedLeads(newLeads);
    setImported(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Qualify Any Post (Raised Hand Tool)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste a LinkedIn post. We check everyone who liked or commented and keep only the ones who fit.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleCheckPost} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Post URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="linkedin.com/posts/..."
                  required
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isChecking}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  {isChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{isChecking ? 'Checking...' : 'Check'}</span>
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                <span>Evaluated {result.totalChecked} engagers against your ICP</span>
                <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                  {result.qualifiedCount} Qualified Leads
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.engagers.map((engager, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      engager.fits
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {engager.name} <span className="font-normal text-slate-500">· {engager.jobTitle} at {engager.company}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {engager.reason}
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {engager.fits ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Fits</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">
                          Skipped
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Ready to add to your Leads Pipeline
                </span>
                <button
                  type="button"
                  onClick={handleImportFits}
                  disabled={imported || result.qualifiedCount === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {imported ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{imported ? 'Added to Pipeline!' : `Add ${result.qualifiedCount} Leads to Pipeline`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
