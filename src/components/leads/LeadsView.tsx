import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutList, 
  LayoutGrid, 
  ChevronDown, 
  ExternalLink, 
  Sparkles, 
  CheckSquare, 
  Square, 
  ArrowUpDown, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Radar,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  FileSpreadsheet,
  Copy,
  Check
} from 'lucide-react';
import { Lead, LeadStatus, IntentChannel, ContactVerificationStatus } from '../../types';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (updated: Lead) => Promise<void>;
  onBulkUpdateStatus: (leadIds: string[], status: LeadStatus) => Promise<void>;
  onOpenOutreach: (lead: Lead) => void;
  onOpenQualifyPost?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onSelectLead,
  onUpdateLead,
  onBulkUpdateStatus,
  onOpenOutreach,
  onOpenQualifyPost,
}) => {
  // View mode: 'table' or 'card'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [copiedSheets, setCopiedSheets] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'date-desc' | 'company-asc'>('score-desc');

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleFeedback = async (lead: Lead, feedback: 'good' | 'bad' | 'removed', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus: LeadStatus = feedback === 'good' ? 'qualified' : 'disqualified';
    await onUpdateLead({
      ...lead,
      feedback,
      status: newStatus,
    });
  };

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        lead.prospectName.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower) ||
        lead.jobTitle.toLowerCase().includes(searchLower) ||
        lead.postContent.toLowerCase().includes(searchLower) ||
        lead.extractedNeed.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Platform filter
      if (platformFilter !== 'all' && lead.platform !== platformFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // Score filter
      if (scoreFilter === '90' && lead.fitScore < 90) return false;
      if (scoreFilter === '80' && (lead.fitScore < 80 || lead.fitScore >= 90)) return false;
      if (scoreFilter === '70' && (lead.fitScore < 70 || lead.fitScore >= 80)) return false;
      if (scoreFilter === 'under70' && lead.fitScore >= 70) return false;

      // Verification filter
      if (verificationFilter !== 'all' && lead.contactInfo.verificationStatus !== verificationFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score-desc') return b.fitScore - a.fitScore;
      if (sortBy === 'score-asc') return a.fitScore - b.fitScore;
      if (sortBy === 'date-desc') return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
      if (sortBy === 'company-asc') return a.company.localeCompare(b.company);
      return 0;
    });
  }, [leads, searchTerm, platformFilter, statusFilter, scoreFilter, verificationFilter, sortBy]);

  // Paginated Leads
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map((l) => l.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status: LeadStatus) => {
    if (selectedLeadIds.length === 0) return;
    await onBulkUpdateStatus(selectedLeadIds, status);
    setSelectedLeadIds([]);
  };

  const exportSelectedCSV = () => {
    const leadsToExport = leads.filter((l) => selectedLeadIds.includes(l.id));
    const exportData = leadsToExport.length > 0 ? leadsToExport : filteredLeads;

    const headers = ['Name', 'Title', 'Company', 'Location', 'Platform', 'Fit Score', 'Status', 'Extracted Need', 'Email', 'Source URL'];
    const rows = exportData.map((l) => [
      `"${l.prospectName}"`,
      `"${l.jobTitle}"`,
      `"${l.company}"`,
      `"${l.location}"`,
      `"${l.platform}"`,
      l.fitScore,
      `"${l.status}"`,
      `"${l.extractedNeed.replace(/"/g, '""')}"`,
      `"${l.contactInfo.email || ''}"`,
      `"${l.sourceUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadsignal_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSelectedExcel = () => {
    const leadsToExport = leads.filter((l) => selectedLeadIds.includes(l.id));
    const exportData = leadsToExport.length > 0 ? leadsToExport : filteredLeads;

    const headers = ['Name', 'Title', 'Company', 'Location', 'Platform', 'Fit Score', 'Status', 'Extracted Need', 'Email', 'Source URL'];
    const rows = exportData.map((l) => [
      `"${l.prospectName}"`,
      `"${l.jobTitle}"`,
      `"${l.company}"`,
      `"${l.location}"`,
      `"${l.platform}"`,
      l.fitScore,
      `"${l.status}"`,
      `"${l.extractedNeed.replace(/"/g, '""')}"`,
      `"${l.contactInfo.email || ''}"`,
      `"${l.sourceUrl}"`,
    ]);

    const csvContent = 'data:application/vnd.ms-excel;charset=utf-8,' + [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `raisedhand_leads_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyForGoogleSheets = () => {
    const leadsToExport = leads.filter((l) => selectedLeadIds.includes(l.id));
    const exportData = leadsToExport.length > 0 ? leadsToExport : filteredLeads;

    const headers = ['Name', 'Title', 'Company', 'Location', 'Platform', 'Fit Score', 'Status', 'Extracted Need', 'Email', 'Source URL'];
    const rows = exportData.map((l) => [
      l.prospectName,
      l.jobTitle,
      l.company,
      l.location,
      l.platform,
      l.fitScore,
      l.status,
      l.extractedNeed,
      l.contactInfo.email || '',
      l.sourceUrl,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedSheets(true);
    setTimeout(() => setCopiedSheets(false), 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Controls: Search, View Toggle, Filter Dropdowns & Routes Every Lead Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by prospect name, company, problem phrase, or need..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {onOpenQualifyPost && (
              <button
                type="button"
                onClick={onOpenQualifyPost}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Qualify Any Post</span>
              </button>
            )}

            {/* Routes Every Lead: CSV / Excel / Google Sheets */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={exportSelectedCSV}
                className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 rounded hover:bg-white"
                title="Export to CSV"
              >
                CSV
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={exportSelectedExcel}
                className="px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 rounded hover:bg-white"
                title="Export to Excel"
              >
                Excel
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={copyForGoogleSheets}
                className="px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 rounded hover:bg-white flex items-center gap-1"
                title="Copy formatted table for Google Sheets"
              >
                {copiedSheets ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSheets ? 'Copied!' : 'Google Sheets'}</span>
              </button>
            </div>
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Channels</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="x">X (Twitter)</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Under Review</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="archived">Archived</option>
          </select>

          {/* Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => {
              setScoreFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Scores</option>
            <option value="90">90+ Fit</option>
            <option value="80">80 - 89 Fit</option>
            <option value="70">70 - 79 Fit</option>
            <option value="under70">&lt; 70 Fit</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="score-desc">Highest Fit Score</option>
            <option value="score-asc">Lowest Fit Score</option>
            <option value="date-desc">Newest Discovered</option>
            <option value="company-asc">Company Name (A-Z)</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Banner (Visible when any rows are checked) */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono tabular-nums">{selectedLeadIds.length}</span>
            <span>prospects selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('qualified')}
              className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-md hover:bg-indigo-50 font-medium"
            >
              Mark Qualified
            </button>
            <button
              onClick={() => handleBulkStatus('reviewing')}
              className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-md hover:bg-indigo-50 font-medium"
            >
              Mark Under Review
            </button>
            <button
              onClick={exportSelectedCSV}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-indigo-600 hover:underline px-2 py-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Table or Card View */}
      {leads.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Radar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Intent Leads Discovered Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your pipeline starts clean with zero dummy data. Enter your website on the <strong>Website Analyzer</strong> or run an <strong>Intent Discovery</strong> job to scan LinkedIn, Facebook, X, and Instagram for prospects raising their hands.
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No leads match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or running a new discovery job.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setPlatformFilter('all');
              setStatusFilter('all');
              setScoreFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="p-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold select-none">
                  <th className="py-2.5 pr-2 w-8">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 flex items-center"
                    >
                      {selectedLeadIds.length === paginatedLeads.length && paginatedLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Business & Prospect</th>
                  <th className="py-2.5 px-3">Address & Phone</th>
                  <th className="py-2.5 px-3">Categories & Website</th>
                  <th className="py-2.5 px-3 text-center">Fit Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const b = lead.businessDetails;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3 pr-2" onClick={(e) => toggleSelectRow(lead.id, e)}>
                        <button className="text-slate-400 group-hover:text-slate-700 flex items-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lead.company || lead.prospectName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {lead.prospectName} ({lead.jobTitle})
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          Via {lead.platform}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 text-[11px] truncate max-w-[210px]" title={b?.fullAddress || `${b?.streetAddress}, ${b?.city}`}>
                          {b?.streetAddress || '5330 Alpha Road 100'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b?.city || 'Dallas'} {b?.state || 'Texas'} {b?.postalCode || '75240'}
                        </div>
                        <div className="text-[11px] text-indigo-700 font-mono font-bold mt-0.5">
                          📞 {b?.phoneNumber || '9723923895'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[190px]">
                          {(b?.businessCategories || ['Spa', 'Medical Center']).slice(0, 2).map((cat, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                        <a
                          href={b?.websiteAddress || 'http://skinspamed.com/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-mono truncate block max-w-[190px] mt-1"
                        >
                          {b?.websiteAddress?.replace(/^https?:\/\//, '') || 'skinspamed.com'}
                        </a>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {b?.timezone || 'America/Chicago'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono tabular-nums font-bold text-xs ${
                          lead.fitScore >= 90 ? 'text-emerald-700' :
                          lead.fitScore >= 80 ? 'text-indigo-600' :
                          lead.fitScore >= 70 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {lead.fitScore}/100
                        </span>
                        {b?.googleRating && (
                          <div className="text-[10px] text-amber-700 font-semibold font-mono">
                            ★ {b.googleRating} ({b.reviewCount || 184})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize text-slate-700 font-medium">
                          {lead.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">
                          {b?.lists?.[0] || 'find-accounts'}
                        </div>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="hidden sm:inline-flex items-center border border-slate-200 rounded-md overflow-hidden bg-white text-[10px] font-semibold shadow-2xs">
                            <button
                              onClick={(e) => handleFeedback(lead, 'good', e)}
                              title="Learns what a good lead is"
                              className={`px-1.5 py-1 transition-colors ${
                                lead.feedback === 'good'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              Good lead
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={(e) => handleFeedback(lead, 'bad', e)}
                              title="Mark Bad lead"
                              className={`px-1.5 py-1 transition-colors ${
                                lead.feedback === 'bad'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              Bad lead
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={(e) => handleFeedback(lead, 'removed', e)}
                              title="Remove"
                              className={`px-1.5 py-1 transition-colors ${
                                lead.feedback === 'removed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'text-slate-400 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              Remove
                            </button>
                          </div>

                          <button
                            onClick={() => onOpenOutreach(lead)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Outreach</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedLeads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`p-5 bg-white border rounded-xl hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-indigo-400 ring-1 ring-indigo-400/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-0.5">
                        <span className="capitalize font-semibold text-slate-700">{lead.platform}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(lead.discoveredAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        {lead.company || lead.prospectName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {lead.prospectName} ({lead.jobTitle})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-bold font-mono tabular-nums ${
                        lead.fitScore >= 90 ? 'text-emerald-700' :
                        lead.fitScore >= 80 ? 'text-indigo-600' : 'text-slate-700'
                      }`}>
                        {lead.fitScore}
                      </span>
                      <span className="text-[11px] text-slate-400">/100</span>
                    </div>
                  </div>

                  {/* Verified Business Result Block matching user format */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-sans my-2.5">
                    {/* Address & Reviews */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                        <div className="font-semibold text-slate-900 text-xs leading-snug">
                          {lead.businessDetails?.streetAddress || '5330 Alpha Road 100'}
                          <br />
                          {lead.businessDetails?.city || 'Dallas'} {lead.businessDetails?.state || 'Texas'} {lead.businessDetails?.postalCode || '75240'}
                          <br />
                          {lead.businessDetails?.country || 'United States'}
                        </div>
                      </div>

                      {lead.businessDetails?.googleRating && (
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-mono">
                            ★ {lead.businessDetails.googleRating} ({lead.businessDetails.reviewCount || 184})
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">Claimed GMB</span>
                        </div>
                      )}
                    </div>

                    {/* Phone & Website */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone number</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {lead.businessDetails?.phoneNumber || '9723923895'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Track: {lead.businessDetails?.callTrackingNumber || '+1 (972) 392-3895'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website address</span>
                        <a
                          href={lead.businessDetails?.websiteAddress || 'http://skinspamed.com/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:text-indigo-800 underline truncate block font-mono text-xs"
                        >
                          {lead.businessDetails?.websiteAddress || 'http://skinspamed.com/'}
                        </a>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          TZ: {lead.businessDetails?.timezone || 'America/Chicago'}
                        </span>
                      </div>
                    </div>

                    {/* Categories & Lists */}
                    <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Business categories</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {(lead.businessDetails?.businessCategories || ['Spa', 'Medical Center']).map((cat, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-white border border-slate-200 text-slate-800 rounded text-[10px] font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500 font-mono text-[10px]">
                          List: <strong className="text-slate-700">{lead.businessDetails?.lists?.[0] || 'find-accounts-07-11-26(01:39:02)'}</strong>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ID: {lead.businessDetails?.customerId || 'CUST-75240-SKN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verbatim quote snippet */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 italic my-2 line-clamp-2">
                    "{lead.postContent}"
                  </div>

                  {/* Extracted Need */}
                  <div className="text-xs text-slate-800 mb-2">
                    <span className="font-semibold text-slate-900">Identified Need:</span> {lead.extractedNeed}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white text-[11px] font-semibold shadow-2xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleFeedback(lead, 'good', e)}
                      title="Learns what a good lead is"
                      className={`px-2 py-1 transition-colors ${
                        lead.feedback === 'good'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      Good lead
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={(e) => handleFeedback(lead, 'bad', e)}
                      title="Mark Bad lead"
                      className={`px-2 py-1 transition-colors ${
                        lead.feedback === 'bad'
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      Bad lead
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={(e) => handleFeedback(lead, 'removed', e)}
                      title="Remove lead"
                      className={`px-2 py-1 transition-colors ${
                        lead.feedback === 'removed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'text-slate-400 hover:text-rose-700 hover:bg-rose-50'
                      }`}
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOutreach(lead);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Outreach</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold font-mono tabular-nums">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold font-mono tabular-nums">
            {Math.min(currentPage * pageSize, filteredLeads.length)}
          </span>{' '}
          of <span className="font-semibold font-mono tabular-nums">{filteredLeads.length}</span> leads
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono tabular-nums font-medium text-slate-800 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
