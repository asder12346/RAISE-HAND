# LeadSignal AI: Intent-Based Lead Discovery & Outreach SaaS

LeadSignal AI is an AI-powered SaaS platform inspired by modern intent listening workflows. It scans public discussions across **LinkedIn**, **Facebook Groups**, **X (formerly Twitter)**, and **Instagram** for prospects explicitly voicing customer pain points or requesting partner recommendations ("raising their hand").

## Key Capabilities

1. **AI ICP Generation & Fine-Tuning**: Enter your company URL or service description; Gemini 3.8 Flash automatically extracts decision-maker titles, company sizes, target industries, key buying triggers, and negative exclusions.
2. **Multi-Channel Intent Signal Scans**: Run discovery jobs across LinkedIn, Facebook, X, and Instagram with real-time candidate evaluation, filtering, and scoring.
3. **Explainable 0–100 Lead-Fit Scoring**: Meticulous 4-factor scoring (Need Urgency, Authority Fit, Offering Match, Platform Context) paired with verbatim quotes as proof and clear disclosure of missing evidence.
4. **Value-First AI Outreach Studio**: Generates personalized, consultative emails and direct messages referencing factual post details, with tone switches, live edits, clipboard copying, and approval tracking.
5. **Continuous Signal Watchlists**: Monitor high-density communities, competitor accounts, and intent keywords for incoming signals.
6. **Dual Persistence Architecture**: Works out of the box with an interactive demo workspace and seamlessly connects to **Supabase PostgreSQL** with Row Level Security (RLS) via environment variables or the in-app Settings panel.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide icons.
- **Backend**: Express on Node.js mounting Vite dev middlewares on port 3000.
- **AI Engine**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` on the server.
- **Database**: Supabase PostgreSQL with RLS schema (or resilient local storage fallback).

## Quick Start

1. Start development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000`.
3. To configure Supabase:
   - Navigate to **Settings & Integrations**.
   - Copy the provided SQL schema into your Supabase SQL Editor.
   - Enter your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
