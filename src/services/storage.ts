import { 
  Lead, 
  ICPConfiguration, 
  DiscoveryJob, 
  OutreachDraft, 
  WatchlistItem,
  UserProfile 
} from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ICP: 'leadsignal_icp',
  LEADS: 'leadsignal_leads',
  JOBS: 'leadsignal_jobs',
  DRAFTS: 'leadsignal_drafts',
  WATCHLIST: 'leadsignal_watchlist',
  PROFILE: 'leadsignal_profile',
};

// Initial clean ICP state awaiting user's actual website or agency URL
export const DEFAULT_ICP: ICPConfiguration = {
  id: 'icp-primary',
  companyName: '',
  websiteUrl: '',
  serviceDescription: '',
  targetIndustries: [],
  targetTitles: [],
  targetSeniority: ['Founder & CEO', 'VP', 'Director', 'Head of Growth'],
  targetCountries: ['United States', 'United Kingdom', 'Canada', 'Germany'],
  companySizeRange: '11 - 50 employees',
  painPoints: [],
  negativeExclusions: ['B2C ecommerce', 'Solo dropshippers', 'Unfunded students'],
  dailyLeadTarget: 25,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PROFILE: UserProfile = {
  id: 'usr-default-01',
  name: 'Alex Mercer',
  email: 'alex@myagency.com',
  companyName: 'My Agency',
  role: 'Founder & CEO',
  createdAt: new Date().toISOString(),
};

// Storage Service with auto-fallback to localStorage and Supabase sync
export class StorageService {
  // ICP
  static getICP(): ICPConfiguration {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ICP);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading ICP from storage', e);
    }
    return DEFAULT_ICP;
  }

  static async saveICP(icp: ICPConfiguration): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ICP, JSON.stringify(icp));
    
    // Sync to Supabase if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('icp_configurations').upsert({
          id: icp.id,
          company_name: icp.companyName,
          website_url: icp.websiteUrl,
          service_description: icp.serviceDescription,
          target_industries: icp.targetIndustries,
          target_titles: icp.targetTitles,
          target_seniority: icp.targetSeniority,
          target_countries: icp.targetCountries,
          company_size_range: icp.companySizeRange,
          pain_points: icp.painPoints,
          negative_exclusions: icp.negativeExclusions,
          daily_lead_target: icp.dailyLeadTarget,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to sync ICP to Supabase:', err);
      }
    }
  }

  // LEADS (starts empty - no dummy data)
  static getLeads(): Lead[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading leads from storage', e);
    }
    return [];
  }

  static async saveLeads(leads: Lead[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }

  static async updateLead(updated: Lead): Promise<void> {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === updated.id);
    if (index >= 0) {
      leads[index] = updated;
    } else {
      leads.unshift(updated);
    }
    await this.saveLeads(leads);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leads').upsert({
          id: updated.id,
          prospect_name: updated.prospectName,
          job_title: updated.jobTitle,
          company: updated.company,
          company_size: updated.companySize,
          location: updated.location,
          platform: updated.platform,
          source_url: updated.sourceUrl,
          post_content: updated.postContent,
          post_author_handle: updated.postAuthorHandle,
          discovered_at: updated.discoveredAt,
          fit_score: updated.fitScore,
          score_rationale: updated.scoreRationale,
          score_breakdown: updated.scoreBreakdown,
          extracted_need: updated.extractedNeed,
          evidence_quotes: updated.evidenceQuotes,
          missing_evidence: updated.missingEvidence,
          contact_info: updated.contactInfo,
          status: updated.status,
          notes: updated.notes,
          is_demo: false,
        });
      } catch (err) {
        console.warn('Failed to sync lead to Supabase:', err);
      }
    }
  }

  // DISCOVERY JOBS
  static getJobs(): DiscoveryJob[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading jobs from storage', e);
    }
    return [];
  }

  static async saveJob(job: DiscoveryJob): Promise<void> {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('discovery_jobs').upsert({
          id: job.id,
          name: job.name,
          channels: job.channels,
          target_query: job.targetQuery,
          problem_keywords: job.problemKeywords,
          status: job.status,
          candidates_evaluated: job.candidatesEvaluated,
          qualified_count: job.qualifiedCount,
          total_found: job.totalFound,
          started_at: job.startedAt,
          completed_at: job.completedAt,
        });
      } catch (err) {
        console.warn('Failed to sync job to Supabase:', err);
      }
    }
  }

  // OUTREACH DRAFTS
  static getDrafts(): OutreachDraft[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading drafts from storage', e);
    }
    return [];
  }

  static async saveDraft(draft: OutreachDraft): Promise<void> {
    const drafts = this.getDrafts();
    const index = drafts.findIndex(d => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.unshift(draft);
    }
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('outreach_drafts').upsert({
          id: draft.id,
          lead_id: draft.leadId,
          format: draft.format,
          tone: draft.tone,
          subject: draft.subject,
          body_text: draft.bodyText,
          status: draft.status,
          referenced_pains: draft.referencedPains,
          generated_at: draft.generatedAt,
        });
      } catch (err) {
        console.warn('Failed to sync draft to Supabase:', err);
      }
    }
  }

  // WATCHLIST
  static getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading watchlist from storage', e);
    }
    return [];
  }

  static async saveWatchlist(items: WatchlistItem[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
  }

  // PROFILE
  static getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading profile from storage', e);
    }
    return INITIAL_PROFILE;
  }

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // CLEAR WORKSPACE
  static resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.ICP);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
    localStorage.removeItem(STORAGE_KEYS.DRAFTS);
  }
}
