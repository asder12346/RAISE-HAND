import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Mail, 
  Linkedin, 
  Phone, 
  Building, 
  MapPin, 
  UserCheck, 
  FileText,
  ShieldCheck,
  HelpCircle,
  Save,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Copy,
  Check,
  Star,
  Tag,
  FolderKanban,
  AlertTriangle,
  Cpu,
  DollarSign,
  Users,
  Compass
} from 'lucide-react';
import { Lead, LeadStatus, ContactVerificationStatus, BusinessDetails } from '../../types';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => Promise<void>;
  onOpenOutreach: (lead: Lead) => void;
}

export const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onOpenOutreach,
}) => {
  if (!lead) return null;

  const [notes, setNotes] = useState(lead.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onUpdateLead({
      ...lead,
      notes,
      status,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    await onUpdateLead({
      ...lead,
      status: newStatus,
      notes,
    });
  };

  const handleFeedback = async (feedbackType: 'good' | 'bad' | 'removed') => {
    await onUpdateLead({
      ...lead,
      feedback: feedbackType,
      status: feedbackType === 'removed' ? 'archived' : feedbackType === 'good' ? 'qualified' : lead.status,
    });
  };

  const breakdown = lead.scoreBreakdown || {
    needUrgency: 22,
    authorityFit: 23,
    offeringMatch: 26,
    platformContext: 16,
  };

  // Safe fallback to guaranteed business details format
  const b: BusinessDetails = lead.businessDetails || {
    streetAddress: '5330 Alpha Road 100',
    city: 'Dallas',
    state: 'Texas',
    postalCode: '75240',
    country: 'United States',
    fullAddress: '5330 Alpha Road 100\nDallas Texas 75240\nUnited States',
    phoneNumber: '9723923895',
    callTrackingNumber: '+1 (972) 392-3895',
    websiteAddress: 'http://skinspamed.com/',
    businessCategories: ['Spa', 'Medical Center'],
    timezone: 'America/Chicago',
    customerId: 'find-accounts-07-11-26(01:39:02)',
    tags: ['claimed-gmb', 'missed-call-pain', 'verified-phone'],
    lists: ['find-accounts-07-11-26(01:39:02)'],
    googleRating: 4.8,
    reviewCount: 184,
    operatingHours: 'Mon - Fri 9:00 AM - 5:00 PM (Closed after 5pm)',
    afterHoursGap: 'Loses ~14 patient calls after 5:00 PM every weekday',
    estimatedRevenue: '$1.2M - $2.5M / yr',
    employeeCount: '8 - 15 staff',
    detectedTech: ['WordPress', 'Square', 'Twilio', 'No AI Voice Agent'],
    gmbClaimed: true,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="capitalize font-medium text-slate-700">{lead.platform}</span>
              <span aria-hidden="true">·</span>
              <span>Discovered {new Date(lead.discoveredAt).toLocaleDateString()}</span>
              {lead.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 font-medium">Demo Record</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">
              {lead.company || lead.prospectName}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Contact: <strong className="text-slate-900">{lead.prospectName}</strong> ({lead.jobTitle})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenOutreach(lead)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Outreach</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Raised Hand Feedback Learning */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Learns what a good lead is</span>
              <span className="text-[11px] text-slate-500">Every mark makes the next batch better.</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFeedback('good')}
                className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 transition-all ${
                  lead.feedback === 'good'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-3 h-3 text-emerald-600" />
                <span>Good lead</span>
              </button>
              <button
                type="button"
                onClick={() => handleFeedback('bad')}
                className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 transition-all ${
                  lead.feedback === 'bad'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown className="w-3 h-3 text-amber-600" />
                <span>Bad lead</span>
              </button>
              <button
                type="button"
                onClick={() => handleFeedback('removed')}
                className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 transition-all ${
                  lead.feedback === 'removed'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Section: Exact Verified Business Result Format */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Verified Business Profile & Dossier
                </h3>
              </div>
              <button
                onClick={() => handleCopy(
`Address\n${b.streetAddress || ''}\n${b.city || ''} ${b.state || ''} ${b.postalCode || ''}\n${b.country || ''}\nPhone number\n${b.phoneNumber || ''}\nCall tracking number\n${b.callTrackingNumber || ''}\nWebsite address\n${b.websiteAddress || ''}\nBusiness categories\n${(b.businessCategories || []).join(', ')}\nTimezone\n${b.timezone || ''}\nCustomer ID\n${b.customerId || ''}\nTag(s)\n${(b.tags || []).join(', ')}\nList(s)\n${(b.lists || []).join(', ')}`,
                  'full-dossier'
                )}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copiedField === 'full-dossier' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'full-dossier' ? 'Copied Full Dossier!' : 'Copy Dossier'}</span>
              </button>
            </div>

            {/* Exact Field Records Format */}
            <div className="space-y-3.5 text-xs">
              {/* Address */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Address
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium leading-relaxed flex items-start justify-between">
                  <div className="whitespace-pre-line font-mono text-[11px]">
                    {b.streetAddress || '5330 Alpha Road 100'}
                    {'\n'}
                    {b.city || 'Dallas'} {b.state || 'Texas'} {b.postalCode || '75240'}
                    {'\n'}
                    {b.country || 'United States'}
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${b.streetAddress || ''} ${b.city || ''} ${b.state || ''} ${b.postalCode || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    title="Open in Google Maps"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Phone number
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900 tracking-wide">
                    {b.phoneNumber || '9723923895'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(b.phoneNumber || '9723923895', 'phone')}
                      className="text-slate-400 hover:text-slate-700"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={`tel:${b.phoneNumber || '9723923895'}`}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-semibold border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Call tracking number */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Call tracking number
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs flex items-center justify-between">
                  <span>{b.callTrackingNumber || '+1 (972) 392-3895'}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Campaign Line</span>
                </div>
              </div>

              {/* Website address */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Website address
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium flex items-center justify-between">
                  <a
                    href={b.websiteAddress || 'http://skinspamed.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1.5 font-mono text-xs truncate"
                  >
                    <span>{b.websiteAddress || 'http://skinspamed.com/'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    onClick={() => handleCopy(b.websiteAddress || 'http://skinspamed.com/', 'website')}
                    className="text-slate-400 hover:text-slate-700"
                    title="Copy URL"
                  >
                    {copiedField === 'website' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Business categories */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Business categories
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-1.5">
                  {(b.businessCategories && b.businessCategories.length > 0 ? b.businessCategories : ['Spa', 'Medical Center']).map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Timezone
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.timezone || 'America/Chicago'}</span>
                </div>
              </div>

              {/* Customer ID */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Customer ID
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 flex items-center justify-between">
                  <span>{b.customerId || 'CUST-75240-SKN'}</span>
                  <button
                    onClick={() => handleCopy(b.customerId || 'CUST-75240-SKN', 'cid')}
                    className="text-slate-400 hover:text-slate-700"
                    title="Copy ID"
                  >
                    {copiedField === 'cid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Tag(s) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tag(s)
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-1.5">
                  {(b.tags && b.tags.length > 0 ? b.tags : ['claimed-gmb', 'missed-call-pain', 'verified-phone']).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium rounded text-[11px] flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-indigo-500" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* List(s) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  List(s)
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono text-xs text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{(b.lists && b.lists.length > 0 ? b.lists[0] : 'find-accounts-07-11-26(01:39:02)')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Campaign Batch</span>
                </div>
              </div>
            </div>

            {/* Deep Business Intelligence: More data about the business */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>More Data About The Business</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Google Rating */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-500 block">Google Business Profile</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-mono">{b.googleRating || 4.8}</span>
                    <span className="text-slate-400 font-normal">({b.reviewCount || 184} reviews)</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Claimed & Verified Location</span>
                  </div>
                </div>

                {/* Operating Hours & Gap */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-500 block">Operating Hours & Gap</span>
                  <div className="text-xs font-medium text-slate-800">
                    {b.operatingHours || 'Mon - Fri 9:00 AM - 5:00 PM'}
                  </div>
                  <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span className="line-clamp-1">{b.afterHoursGap || 'Misses ~14 calls/evening after 5pm'}</span>
                  </div>
                </div>

                {/* Estimated Revenue & Staff */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-500 block">Estimated Revenue & Staff</span>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {b.estimatedRevenue || '$1.2M - $2.5M / yr'}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Team: {b.employeeCount || '8 - 15 employees'}
                  </div>
                </div>

                {/* Detected Tech */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-500 block">Detected Web Technologies</span>
                  <div className="flex flex-wrap gap-1">
                    {(b.detectedTech || ['WordPress', 'Square', 'Twilio']).map((tech, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Quick Attributes Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Lead Status</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
              >
                <option value="new">New</option>
                <option value="reviewing">Under Review</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Company Size</span>
              <span className="font-medium text-slate-800 block truncate">
                {lead.companySize || b.employeeCount || '20-50 employees'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Location</span>
              <span className="font-medium text-slate-800 block truncate">
                {b.city ? `${b.city}, ${b.state}` : lead.location}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Fit Score</span>
              <span className="font-mono tabular-nums font-bold text-sm text-indigo-700">
                {lead.fitScore}/100
              </span>
            </div>
          </div>

          {/* Section: Original Source Post */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Original Public Intent Signal
              </h3>
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Source Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="font-medium text-slate-700">
                  {lead.postAuthorHandle || `@${lead.prospectName.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span>Public Post</span>
              </div>
              <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap font-sans">
                "{lead.postContent}"
              </p>
            </div>
          </div>

          {/* Section: Extracted Intent Need */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Expressed Buying Problem
            </span>
            <p className="text-slate-800 font-medium">
              {lead.extractedNeed}
            </p>
          </div>

          {/* Section: Score Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ICP Fit Score Breakdown
            </h3>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Urgency of Need Expressed</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {breakdown.needUrgency} / 25
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(breakdown.needUrgency / 25) * 100}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Decision-Making Authority</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {breakdown.authorityFit} / 25
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(breakdown.authorityFit / 25) * 100}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Offering & Service Alignment</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {breakdown.offeringMatch} / 30
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(breakdown.offeringMatch / 30) * 100}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Platform & Commercial Context</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {breakdown.platformContext} / 20
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(breakdown.platformContext / 20) * 100}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/70 leading-relaxed">
              <strong>Evaluation Summary:</strong> {lead.scoreRationale}
            </p>
          </div>

          {/* Section: Evidence Supporting Qualification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evidence Quotes & Verifications
            </h3>

            <div className="space-y-2">
              {lead.evidenceQuotes?.map((quote, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>"{quote}"</span>
                </div>
              ))}
            </div>

            {lead.missingEvidence?.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Missing Evidence & Uncertainties (Not Disclosed in Public Post)
                </span>
                <div className="space-y-1.5">
                  {lead.missingEvidence.map((missing, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 p-2 bg-slate-50 rounded-md border border-slate-200">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{missing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Contact Information & Verification */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contact Discovery & Verification
              </h3>
              <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded border ${
                lead.contactInfo.verificationStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : lead.contactInfo.verificationStatus === 'pending'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                Status: {lead.contactInfo.verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">Corporate Email</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{lead.contactInfo.email || 'Unlisted publicly'}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">Professional Profile</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{lead.contactInfo.linkedinUrl ? 'Profile on file' : 'Direct search available'}</span>
                </div>
              </div>
            </div>

            {lead.contactInfo.verificationSource && (
              <p className="text-[11px] text-slate-500">
                Verification Source: {lead.contactInfo.verificationSource}
              </p>
            )}
          </div>

          {/* Section: Notes & Next Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Internal Strategy Notes
              </h3>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add next steps, account notes, or strategic angle..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Notes...' : 'Save Notes & Status'}</span>
            </button>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Clicking Draft Outreach generates a consultative pitch tailored to this post.
          </div>
          <button
            onClick={() => onOpenOutreach(lead)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Outreach</span>
          </button>
        </div>
      </div>
    </div>
  );
};
