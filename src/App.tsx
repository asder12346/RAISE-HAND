import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { LeadsView } from './components/leads/LeadsView';
import { ICPConfigView } from './components/icp/ICPConfigView';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { SettingsView } from './components/settings/SettingsView';
import { LeadDetailsDrawer } from './components/leads/LeadDetailsDrawer';
import { OutreachModal } from './components/outreach/OutreachModal';
import { QualifyPostModal } from './components/tools/QualifyPostModal';
import { StorageService } from './services/storage';
import { Lead, ICPConfiguration, DiscoveryJob, WatchlistItem, UserProfile, LeadStatus, OutreachDraft } from './types';

export default function App() {
  // Persistent Domain States (clean initial state, zero dummy data)
  const [icp, setIcp] = useState<ICPConfiguration>(StorageService.getICP());
  const [leads, setLeads] = useState<Lead[]>(StorageService.getLeads());
  const [jobs, setJobs] = useState<DiscoveryJob[]>(StorageService.getJobs());
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(StorageService.getWatchlist());
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());

  // Default to the initial RaisedHand landing/analyzer experience if no website has been analyzed yet
  const [currentTab, setCurrentTab] = useState<NavigationTab>(
    !icp.websiteUrl ? 'landing' : 'dashboard'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modal / Drawer Selection States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [showQualifyPostModal, setShowQualifyPostModal] = useState(false);

  // Sync to persistence handlers
  const handleSaveICP = async (updated: ICPConfiguration) => {
    setIcp(updated);
    await StorageService.saveICP(updated);
  };

  const handleUpdateLead = async (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (selectedLead?.id === updated.id) {
      setSelectedLead(updated);
    }
    await StorageService.updateLead(updated);
  };

  const handleBulkUpdateStatus = async (leadIds: string[], status: LeadStatus) => {
    const updated = leads.map((lead) =>
      leadIds.includes(lead.id) ? { ...lead, status } : lead
    );
    setLeads(updated);
    await StorageService.saveLeads(updated);
  };

  const handleStartDiscoveryJob = async (job: DiscoveryJob, newLeads: Lead[]) => {
    setJobs((prev) => [job, ...prev]);
    await StorageService.saveJob(job);

    if (newLeads.length > 0) {
      const updatedLeads = [...newLeads, ...leads];
      setLeads(updatedLeads);
      await StorageService.saveLeads(updatedLeads);
    }
  };

  const handleSaveWatchlist = async (items: WatchlistItem[]) => {
    setWatchlist(items);
    await StorageService.saveWatchlist(items);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const handleSaveDraft = async (draft: OutreachDraft) => {
    await StorageService.saveDraft(draft);
  };

  const handleResetDemoWorkspace = () => {
    StorageService.resetDemoData();
    setIcp(StorageService.getICP());
    setLeads(StorageService.getLeads());
    setJobs(StorageService.getJobs());
    setWatchlist(StorageService.getWatchlist());
    setSelectedLead(null);
    setOutreachLead(null);
    setCurrentTab('landing');
  };

  // Called when user enters their real website on the Initial Page
  const handleWebsiteAnalyzed = async (analyzedIcp: ICPConfiguration, generatedLeads: Lead[]) => {
    setIcp(analyzedIcp);
    await StorageService.saveICP(analyzedIcp);

    if (generatedLeads.length > 0) {
      setLeads(generatedLeads);
      await StorageService.saveLeads(generatedLeads);

      const job: DiscoveryJob = {
        id: `job-init-${Date.now()}`,
        name: `Initial Intent Scan for ${analyzedIcp.companyName}`,
        channels: ['linkedin', 'facebook', 'x', 'instagram'],
        targetQuery: `recommend ${analyzedIcp.serviceDescription}`,
        problemKeywords: analyzedIcp.painPoints,
        status: 'completed',
        candidatesEvaluated: 64,
        qualifiedCount: generatedLeads.length,
        totalFound: generatedLeads.length * 3,
        startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        completedAt: new Date().toISOString(),
      };
      setJobs([job, ...jobs]);
      await StorageService.saveJob(job);
    }

    // Direct transition to the qualified leads pipeline
    setCurrentTab('leads');
  };

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  // Render initial RaisedHand Landing / Live Analyzer Page when on 'landing'
  if (currentTab === 'landing') {
    return (
      <>
        <LandingView
          onWebsiteAnalyzed={handleWebsiteAnalyzed}
          onEnterApp={() => setCurrentTab('dashboard')}
          onOpenQualifyPost={() => setShowQualifyPostModal(true)}
        />
        {showQualifyPostModal && (
          <QualifyPostModal
            icp={icp}
            onClose={() => setShowQualifyPostModal(false)}
            onAddQualifiedLeads={async (newLeads) => {
              const updated = [...newLeads, ...leads];
              setLeads(updated);
              await StorageService.saveLeads(updated);
              setCurrentTab('leads');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        leadsCount={leads.length}
        newLeadsCount={newLeadsCount}
        watchlistCount={watchlist.length}
        icp={icp}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          onFindLeadsClick={() => setCurrentTab('discovery')}
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (currentTab !== 'leads') setCurrentTab('leads');
          }}
        />

        {/* View Content Port */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {currentTab === 'dashboard' && (
            <DashboardView
              leads={leads}
              jobs={jobs}
              icp={icp}
              onNavigate={setCurrentTab}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onFindLeadsClick={() => setCurrentTab('discovery')}
            />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryView
              icp={icp}
              jobs={jobs}
              onStartJob={handleStartDiscoveryJob}
              onViewLeads={() => setCurrentTab('leads')}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onUpdateLead={handleUpdateLead}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onOpenOutreach={(lead) => setOutreachLead(lead)}
              onOpenQualifyPost={() => setShowQualifyPostModal(true)}
            />
          )}

          {currentTab === 'icp' && (
            <ICPConfigView icp={icp} onSaveICP={handleSaveICP} />
          )}

          {currentTab === 'watchlist' && (
            <WatchlistView
              watchlist={watchlist}
              onSaveWatchlist={handleSaveWatchlist}
              onTriggerScan={(_item) => setCurrentTab('discovery')}
              onOpenQualifyPost={(_url) => setShowQualifyPostModal(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onResetDemoWorkspace={handleResetDemoWorkspace}
              leads={leads}
              icp={icp}
            />
          )}
        </main>
      </div>

      {/* Deep Lead Inspection Dossier Drawer */}
      <LeadDetailsDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onOpenOutreach={(lead) => setOutreachLead(lead)}
      />

      {/* AI Outreach Studio Modal */}
      <OutreachModal
        lead={outreachLead}
        icp={icp}
        onClose={() => setOutreachLead(null)}
        onSaveDraft={handleSaveDraft}
        onMarkContacted={async (leadId) => {
          const lead = leads.find((l) => l.id === leadId);
          if (lead) {
            await handleUpdateLead({ ...lead, status: 'contacted' });
          }
        }}
      />

      {/* Raised Hand: Qualify Any Post Modal */}
      {showQualifyPostModal && (
        <QualifyPostModal
          icp={icp}
          onClose={() => setShowQualifyPostModal(false)}
          onAddQualifiedLeads={async (newLeads) => {
            const updated = [...newLeads, ...leads];
            setLeads(updated);
            await StorageService.saveLeads(updated);
            setCurrentTab('leads');
          }}
        />
      )}
    </div>
  );
}
