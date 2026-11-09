export type IntentChannel = 'linkedin' | 'facebook' | 'x' | 'instagram';

export type LeadStatus = 'new' | 'reviewing' | 'qualified' | 'disqualified' | 'contacted' | 'archived';

export type ContactVerificationStatus = 'verified' | 'unverified' | 'pending';

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  verificationStatus: ContactVerificationStatus;
  verificationSource?: string;
}

export interface ScoreBreakdown {
  needUrgency: number;      // 0 - 25
  authorityFit: number;     // 0 - 25
  offeringMatch: number;    // 0 - 30
  platformContext: number;  // 0 - 20
}

export interface BusinessDetails {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  fullAddress?: string;
  phoneNumber?: string;
  callTrackingNumber?: string;
  websiteAddress?: string;
  businessCategories?: string[];
  timezone?: string;
  customerId?: string;
  tags?: string[];
  lists?: string[];
  googleRating?: number;
  reviewCount?: number;
  operatingHours?: string;
  afterHoursGap?: string;
  estimatedRevenue?: string;
  employeeCount?: string;
  detectedTech?: string[];
  gmbClaimed?: boolean;
}

export interface Lead {
  id: string;
  jobId?: string;
  userId?: string;
  prospectName: string;
  jobTitle: string;
  company: string;
  companySize?: string;
  location: string;
  platform: IntentChannel;
  sourceUrl: string;
  postContent: string;
  postAuthorHandle?: string;
  discoveredAt: string;
  fitScore: number;         // 0 - 100
  scoreRationale: string;
  scoreBreakdown?: ScoreBreakdown;
  extractedNeed: string;
  evidenceQuotes: string[];
  missingEvidence: string[];
  contactInfo: ContactInfo;
  businessDetails?: BusinessDetails;
  status: LeadStatus;
  notes: string;
  feedback?: 'good' | 'bad' | 'removed';
  isDemo?: boolean;
}

export interface PostEngager {
  name: string;
  jobTitle: string;
  company: string;
  fits: boolean;
  reason: string;
  profileUrl: string;
  actionTaken: 'liked' | 'commented';
}

export interface PostQualifyResult {
  postUrl: string;
  originalAuthor: string;
  postTopic: string;
  totalChecked: number;
  qualifiedCount: number;
  engagers: PostEngager[];
}


export interface ICPConfiguration {
  id: string;
  userId?: string;
  companyName: string;
  websiteUrl: string;
  serviceDescription: string;
  targetIndustries: string[];
  targetTitles: string[];
  targetSeniority: string[];
  targetCountries: string[];
  companySizeRange: string;
  painPoints: string[];
  negativeExclusions: string[];
  dailyLeadTarget: number;
  updatedAt: string;
}

export interface DiscoveryJob {
  id: string;
  name: string;
  channels: IntentChannel[];
  targetQuery: string;
  problemKeywords: string[];
  status: 'queued' | 'running' | 'completed' | 'failed';
  candidatesEvaluated: number;
  qualifiedCount: number;
  totalFound: number;
  startedAt: string;
  completedAt?: string;
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  format: 'email' | 'direct_message';
  tone: 'consultative' | 'direct' | 'casual';
  subject?: string;
  bodyText: string;
  status: 'draft' | 'approved' | 'sent';
  generatedAt: string;
  referencedPains: string[];
}

export interface WatchlistItem {
  id: string;
  targetName: string;
  targetType: 'company' | 'keyword' | 'profile_page';
  profileRole?: string;
  profileUrl?: string;
  recentPostSnippet?: string;
  likesCount?: number;
  commentsCount?: number;
  lastSignalSummary?: string;
  avatarInitials?: string;
  channel: IntentChannel;
  lastCheckedAt: string;
  signalsCount: number;
  status: 'active' | 'paused';
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  createdAt: string;
}
