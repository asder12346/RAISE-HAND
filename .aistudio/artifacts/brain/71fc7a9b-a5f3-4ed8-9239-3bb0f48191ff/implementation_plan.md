# LeadSignal AI: Intent-Based Lead Generation SaaS

LeadSignal AI is a high-conviction, intent-based lead generation platform that continuously monitors social discussions (LinkedIn, Facebook, X, Instagram) for prospects actively expressing pain points or seeking solutions ("raised hands"), qualifying them against an Ideal Customer Profile (ICP) and drafting consultative, value-first outreach.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been established based on your discovery selections:

- **Confirmed Intent Channels**: Primary focus on **LinkedIn**, **Facebook**, **X (Twitter)**, and **Instagram** public discussions, groups, and posts where business buyers and consumers explicitly ask for recommendations, voice frustrations, or seek vendors.
- **Confirmed Persistence & Authentication**: Hybrid **Supabase PostgreSQL** architecture with environment variable configuration (`SUPABASE_URL`, `SUPABASE_ANON_KEY`). To ensure immediate zero-friction local exploration, the system includes a seamless auto-switching local storage adapter when live Supabase credentials are not yet populated.
- **Confirmed Outreach Strategy**: **Value-first consultative** pitch style. Drafts lead with empathy regarding the observed friction or question, cite factual evidence from the source post, and offer actionable insight before any soft call-to-action.
- **AI Engine**: Gemini 3.8 Flash (`gemini-3.8-flash`) executed strictly through server-side Express endpoints to safeguard API keys and run prompt injection sanitization against untrusted social post inputs.

---

### 1. Overview & Core Concept

- **What It Does**: LeadSignal AI replaces blunt firmographic cold scraping with real-time "buying intent detection". Users enter their website or services; the AI synthesizes a deep Ideal Customer Profile (ICP), runs discovery jobs across target social platforms, scores candidate posts from 0 to 100 with transparent evidence, and drafts human-in-the-loop personalized outreach.
- **Target Audience / Persona**: B2B agency owners, SaaS founders, enterprise sales development representatives (SDRs), and consultants who need high-converting, warm-context opportunities rather than low-response cold lists.
- **Key Value**: 10x higher response rates by reaching prospects at the exact moment of need with verifiable post context and consultative, non-spammy outreach.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Onboarding & ICP Setup**: User provides their agency or company URL and brief service overview. Gemini analyzes the offerings, automatically extracting target industries, decision-maker roles, company sizes, customer pain points, negative exclusions, and daily lead goals.
2. **Lead Discovery Jobs**: User triggers intent scans across chosen channels (LinkedIn, Facebook, X, Instagram). Real-time progress displays candidate extraction, filtering, qualification, and lead scoring.
3. **Lead Pipeline Management**: Dual-view interface (high-density table with tabular numerals and detailed cards) with filtering by platform, fit score, qualification status, and contact status.
4. **Lead Inspection & Evidence Dossier**: Clicking a lead opens a deep inspection drawer/view showing the verbatim source post, clickable original URL, explainable ICP fit breakdown (score factors, positive evidence, missing data), and contact details.
5. **AI Outreach Generation**: One-click generation of personalized email or direct message drafts customized to the prospect's exact post text, with instant editing, tone shifting, clipboard copying, and approval tracking.
6. **Watchlist & Platform Settings**: Saved accounts and keywords for recurring signal detection, plus Supabase connection status and profile configuration.

#### Visual Identity & Theme
- **Aesthetic Direction**: Premium B2B SaaS console. Executive, calm, and trustworthy—mirroring modern data workspaces like Linear and Stripe.
- **Color Palette & Distribution**:
  - *60% Canvas*: Off-white / light slate (`#F8FAFC` background, `#FFFFFF` high-clarity structural cards).
  - *30% Surfaces & Typography*: Deep navy typography (`#0F172A`), cool slate borders (`#E2E8F0`), and muted text (`#64748B`).
  - *10% Accent*: Restrained indigo / deep sapphire (`#4338CA` / `#3B82F6`) for active controls and primary CTAs.
  - *Semantic Indicators*: Emerald (`#16A34A`) for high fit/qualified, Amber (`#D97706`) for under review, Rose (`#E11D48`) for unqualified, strictly paired with text labels.
- **Anti-Slop & Zero-Pill Discipline**: Metadata displayed with clean typographic dividers (`·` and `/`), zero static pill enclosures, no fake AI latency meters, and no code-comment titles.
- **Typography**: Clean display sans (`Plus Jakarta Sans` / `Outfit`) for high-contrast headers, legible geometric body (`DM Sans`), and strict tabular numerals (`font-mono tabular-nums`) for scores, counts, and dates.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Untrusted Data Sanitization for AI Ingestion**
  - *Chosen Approach*: Social posts and web snippets are wrapped in strict delimiters (`<untrusted_post_content>`) within the server-side Gemini prompt, with explicit instruction to treat the contents purely as raw text data rather than instructions.
  - *Why*: Prevents prompt injection attacks where a malicious social post attempts to hijack the scoring or outreach generation engine.
- **Decision 2: Explainable Multi-Factor Scoring (0–100) vs. Black-Box Rating**
  - *Chosen Approach*: The scoring algorithm requires Gemini to return a structured JSON schema including numerical sub-scores (Need Urgency, Authority/Seniority, Offering Match, Platform Context), factual quotes as positive evidence, and explicit uncertainties.
  - *Why*: Eliminates arbitrary hallucinated scores and arms the salesperson with the exact reasoning before reaching out.
- **Decision 3: Pluggable Data Provider Adapter Architecture**
  - *Chosen Approach*: Abstract discovery interface (`IntentSignalProvider`) supporting both live integrations and rich, contextually realistic synthetic demo feeds labeled with clear disclosure.
  - *Why*: Enables immediate end-to-end functionality without forcing the user to connect expensive enterprise social API keys during initial testing.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### System Architecture & Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LeadSignal AI                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     Client-Side UI (React)    │               │    Server Backend (Express)   │
│  - Dashboard & Analytics      │   REST / JSON │  - Express App & Middleware   │
│  - ICP Configuration Wizard   │ ────────────> │  - Gemini 3.8 Flash SDK Proxy │
│  - Discovery Job Controller   │ <──────────── │  - Supabase Auth & DB Bridge  │
│  - Leads Table & Card Dossier │               │  - Provider Discovery Engine  │
│  - AI Consultative Outreach   │               │  - Lead Scoring Pipeline      │
│  - Watchlist & Settings       │               └───────────────┬───────────────┘
└─────────────┬─────────────────┘                               │
              │                                                 ▼
              │ (Direct/SDK fallback)           ┌───────────────────────────────┐
              └───────────────────────────────> │  Supabase PostgreSQL / Cloud  │
                                                │  - profiles                   │
                                                │  - icp_configurations         │
                                                │  - discovery_jobs             │
                                                │  - leads                      │
                                                │  - outreach_drafts            │
                                                │  - watchlists                 │
                                                └───────────────────────────────┘
```

#### Core Data Entities
- **Profile**: `id`, `user_id`, `company_name`, `website_url`, `created_at`
- **ICPConfiguration**: `id`, `user_id`, `company_name`, `website_url`, `service_description`, `target_industries[]`, `target_titles[]`, `target_countries[]`, `company_size_range`, `pain_points[]`, `negative_exclusions[]`, `daily_lead_target`
- **DiscoveryJob**: `id`, `user_id`, `name`, `channels[]` (`linkedin`, `facebook`, `x`, `instagram`), `keywords[]`, `status` (`queued`, `running`, `completed`, `failed`), `candidates_count`, `qualified_count`, `created_at`
- **Lead**: `id`, `job_id`, `user_id`, `prospect_name`, `job_title`, `company`, `location`, `platform`, `source_url`, `post_content`, `discovered_at`, `fit_score` (0-100), `score_rationale`, `evidence_quotes[]`, `missing_evidence[]`, `status` (`new`, `reviewing`, `qualified`, `contacted`, `archived`), `contact_info` (`email`, `phone`, `verification_status`), `notes`
- **OutreachDraft**: `id`, `lead_id`, `format` (`email`, `direct_message`), `tone` (`consultative`, `direct`, `casual`), `subject`, `body_text`, `status` (`draft`, `approved`, `sent`), `generated_at`
- **WatchlistItem**: `id`, `user_id`, `target_name`, `target_type` (`company`, `keyword`, `profile_page`), `channel`, `last_checked_at`, `signals_detected_count`

#### Interactive Component & State Mapping
- **ICP Wizard**: Multi-step or tabbed configuration with real-time "Analyze Website with Gemini" button that populates all parameters dynamically.
- **Discovery Controller**: Channel selector with toggles for LinkedIn, Facebook, X, and Instagram; query keyword tags; live discovery progress animation with candidate evaluation counts.
- **Leads Hub**: Instant search across prospect name, company, and post text; faceted filter toggles (Platform, Score Range, Review Status); bulk selection for bulk status update or export.
- **Lead Dossier Drawer**: Comprehensive right-side flyout detailing full verbatim post snippet, highlighted evidence chips, score factor breakdown, editable notes, and direct trigger to Outreach Studio.
- **Outreach Studio**: Side-by-side or modal editor with one-click copy, template tone switcher, and approval workflow.
