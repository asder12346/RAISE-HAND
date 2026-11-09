import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Mail, 
  Send, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { Lead, ICPConfiguration, OutreachDraft } from '../../types';
import { ApiService } from '../../services/api';

interface OutreachModalProps {
  lead: Lead | null;
  icp: ICPConfiguration;
  onClose: () => void;
  onSaveDraft: (draft: OutreachDraft) => Promise<void>;
  onMarkContacted: (leadId: string) => Promise<void>;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  lead,
  icp,
  onClose,
  onSaveDraft,
  onMarkContacted,
}) => {
  if (!lead) return null;

  const [viewTab, setViewTab] = useState<'composer' | 'sequence'>('sequence');
  const [format, setFormat] = useState<'email' | 'direct_message'>('email');
  const [tone, setTone] = useState<'consultative' | 'direct' | 'casual'>('consultative');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [referencedPains, setReferencedPains] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate initial draft on mount
  useEffect(() => {
    generateDraft(format, tone);
  }, []);

  const generateDraft = async (
    targetFormat: 'email' | 'direct_message',
    targetTone: 'consultative' | 'direct' | 'casual'
  ) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setCopied(false);
    try {
      const res = await ApiService.generateOutreach({
        lead,
        icp,
        format: targetFormat,
        tone: targetTone,
      });

      setSubject(res.subject || `Regarding your post on ${lead.platform}`);
      setBodyText(res.bodyText || '');
      setReferencedPains(res.referencedPains || lead.evidenceQuotes || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate outreach draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = format === 'email' ? `Subject: ${subject}\n\n${bodyText}` : bodyText;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveAndSave = async () => {
    const draft: OutreachDraft = {
      id: `draft-${Date.now()}`,
      leadId: lead.id,
      format,
      tone,
      subject: format === 'email' ? subject : undefined,
      bodyText,
      status: 'approved',
      referencedPains,
      generatedAt: new Date().toISOString(),
    };

    await onSaveDraft(draft);
    await onMarkContacted(lead.id);
    setApproved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                AI Outreach Studio
              </h2>
              <p className="text-xs text-slate-500">
                Personalized for <strong className="text-slate-800">{lead.prospectName}</strong> ({lead.company}) based on their {lead.platform} post.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Format & Tone Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Outreach Channel Format
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormat('email');
                    generateDraft('email', tone);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-medium transition-all ${
                    format === 'email'
                      ? 'bg-white border-indigo-500 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormat('direct_message');
                    generateDraft('direct_message', tone);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-medium transition-all ${
                    format === 'direct_message'
                      ? 'bg-white border-indigo-500 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Message</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Message Tone
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'consultative' as const, label: 'Value-First' },
                  { id: 'direct' as const, label: 'Direct Pitch' },
                  { id: 'casual' as const, label: 'Peer Network' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTone(t.id);
                      generateDraft(format, t.id);
                    }}
                    className={`flex-1 py-1.5 px-2 text-center rounded-lg border font-medium transition-all ${
                      tone === t.id
                        ? 'bg-white border-indigo-500 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Outreach Mode Toggle */}
          <div className="flex border-b border-slate-200 -mt-2">
            <button
              type="button"
              onClick={() => setViewTab('composer')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                viewTab === 'composer'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Single Message Composer
            </button>
            <button
              type="button"
              onClick={() => setViewTab('sequence')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                viewTab === 'sequence'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>LinkedIn Sequence</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-bold">Auto-Pilot</span>
            </button>
          </div>

          {viewTab === 'sequence' ? (
            /* LinkedIn Outreach Automation Sequence (Raised Hand) */
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    LinkedIn outreach
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    LinkedIn Connected
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Connect your LinkedIn once. Invites, messages and follow-ups all send from Raised Hand, and anyone who replies is stopped automatically.
                </p>
              </div>

              {/* Timeline Sequence */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Invite sent</span>
                      <span className="text-[11px] text-slate-500 font-mono">Today, 9:02</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tailored connection request with no spammy pitch.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Accepted</span>
                      <span className="text-[11px] text-slate-500 font-mono">Today, 11:40</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lead.prospectName} accepted your network invitation.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Send className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Message sent</span>
                      <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        Written for {lead.prospectName.split(' ')[0]}
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 whitespace-pre-wrap">
                      {bodyText}
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                      4
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Follow-up</span>
                      <span className="text-[11px] text-slate-500 font-mono">Day 2, then day 5</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Polite bump referencing their {lead.extractedNeed} challenge. Auto-stops the second they reply.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Auto-stop protection active:</strong> If {lead.prospectName} replies to any message, remaining steps cancel immediately so you can jump in live.
                </span>
              </div>
            </div>
          ) : (
            /* Standard Message Composer */
            <>
              {/* Context Snippet being referenced */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Factual Intent Signal Context (Verbatim from {lead.platform})
                </span>
                <p className="italic text-slate-800 line-clamp-2">
                  "{lead.postContent}"
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email Subject Line (if format === 'email') */}
              {format === 'email' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Message Body Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Outreach Message Draft (Editable)
                  </label>
                  <button
                    type="button"
                    onClick={() => generateDraft(format, tone)}
                    disabled={isGenerating}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Generating...' : 'Regenerate Draft'}</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Draft content..."
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* Safety Notice */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 leading-relaxed">
                <strong>Human-in-the-loop:</strong> Raised Hand never sends unreviewed messages. Edit and copy with confidence or start the automated sequence.
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Message'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveAndSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              {approved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ThumbsUp className="w-3.5 h-3.5" />
              )}
              <span>{approved ? 'Approved & Saved!' : 'Approve & Mark Contacted'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
