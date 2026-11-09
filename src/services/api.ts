import { Lead, ICPConfiguration, OutreachDraft, PostQualifyResult } from '../types';

export interface AnalyzeWebsiteResponse {
  companyName: string;
  serviceDescription: string;
  targetIndustries: string[];
  targetTitles: string[];
  targetSeniority: string[];
  targetCountries: string[];
  companySizeRange: string;
  painPoints: string[];
  negativeExclusions: string[];
  dailyLeadTarget: number;
  notice?: string;
}

export interface EvaluateLeadResponse {
  fitScore: number;
  scoreRationale: string;
  scoreBreakdown: {
    needUrgency: number;
    authorityFit: number;
    offeringMatch: number;
    platformContext: number;
  };
  extractedNeed: string;
  evidenceQuotes: string[];
  missingEvidence: string[];
}

export interface GenerateOutreachResponse {
  subject: string;
  bodyText: string;
  referencedPains: string[];
}

export const ApiService = {
  async analyzeWebsite(params: { websiteUrl?: string; serviceDescription?: string }): Promise<AnalyzeWebsiteResponse> {
    const res = await fetch('/api/ai/analyze-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze website.');
    }
    return res.json();
  },

  async evaluateLead(params: {
    postContent: string;
    prospectName?: string;
    jobTitle?: string;
    company?: string;
    platform?: string;
    icp: ICPConfiguration;
  }): Promise<EvaluateLeadResponse> {
    const res = await fetch('/api/ai/evaluate-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to evaluate lead.');
    }
    return res.json();
  },

  async generateOutreach(params: {
    lead: Lead;
    icp: ICPConfiguration;
    format: 'email' | 'direct_message';
    tone: 'consultative' | 'direct' | 'casual';
  }): Promise<GenerateOutreachResponse> {
    const res = await fetch('/api/ai/generate-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate outreach.');
    }
    return res.json();
  },

  async generateDiscoveryLeads(params: {
    icp: ICPConfiguration;
    channels: string[];
    query?: string;
    keywords?: string[];
    count?: number;
  }): Promise<Lead[]> {
    const res = await fetch('/api/discovery/generate-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate discovery leads.');
    }
    const data = await res.json();
    return (data.leads || []).map((lead: any, idx: number) => ({
      ...lead,
      id: `lead-${Date.now()}-${idx}`,
      discoveredAt: new Date(Date.now() - idx * 3600000 * 2).toISOString(),
      status: 'new',
      notes: '',
      isDemo: false,
    }));
  },

  async qualifyPost(params: {
    postUrl: string;
    icp: ICPConfiguration;
  }): Promise<PostQualifyResult> {
    const res = await fetch('/api/ai/qualify-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to qualify post.');
    }
    return res.json();
  },

  async checkHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Health check unreachable:', e);
    }
    return { status: 'offline', hasGeminiKey: false };
  },
};
