import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  Target, 
  Globe, 
  Building, 
  Check, 
  AlertCircle, 
  Plus, 
  X, 
  RefreshCw,
  Info
} from 'lucide-react';
import { ICPConfiguration } from '../../types';
import { ApiService } from '../../services/api';

interface ICPConfigViewProps {
  icp: ICPConfiguration;
  onSaveICP: (updated: ICPConfiguration) => Promise<void>;
}

export const ICPConfigView: React.FC<ICPConfigViewProps> = ({ icp, onSaveICP }) => {
  const [formData, setFormData] = useState<ICPConfiguration>(icp);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Temporary input holders for multi-tag additions
  const [newIndustry, setNewIndustry] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPain, setNewPain] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Handle Gemini AI Website / Description Analysis
  const handleAnalyzeWithAI = async () => {
    if (!formData.websiteUrl && !formData.serviceDescription) {
      setErrorMsg('Please enter either a business website URL or a service description to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const suggested = await ApiService.analyzeWebsite({
        websiteUrl: formData.websiteUrl,
        serviceDescription: formData.serviceDescription,
      });

      setFormData(prev => ({
        ...prev,
        companyName: suggested.companyName || prev.companyName,
        serviceDescription: suggested.serviceDescription || prev.serviceDescription,
        targetIndustries: suggested.targetIndustries?.length ? suggested.targetIndustries : prev.targetIndustries,
        targetTitles: suggested.targetTitles?.length ? suggested.targetTitles : prev.targetTitles,
        targetSeniority: suggested.targetSeniority?.length ? suggested.targetSeniority : prev.targetSeniority,
        targetCountries: suggested.targetCountries?.length ? suggested.targetCountries : prev.targetCountries,
        companySizeRange: suggested.companySizeRange || prev.companySizeRange,
        painPoints: suggested.painPoints?.length ? suggested.painPoints : prev.painPoints,
        negativeExclusions: suggested.negativeExclusions?.length ? suggested.negativeExclusions : prev.negativeExclusions,
        dailyLeadTarget: suggested.dailyLeadTarget || prev.dailyLeadTarget,
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze website. Ensure the server is online.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onSaveICP({
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to save ICP configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tag removal / addition helpers
  const removeTag = (field: 'targetIndustries' | 'targetTitles' | 'painPoints' | 'negativeExclusions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addTag = (field: 'targetIndustries' | 'targetTitles' | 'painPoints' | 'negativeExclusions', value: string, clearFn: (s: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    clearFn('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header and AI Synthesis Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ideal Customer Profile (ICP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the criteria used by Gemini to discover, score, and qualify public intent signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-all shadow-xs"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isAnalyzing ? 'Synthesizing with Gemini...' : 'Synthesize ICP with AI'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
          >
            {saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved' : isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Ideal Customer Profile successfully synchronized to persistence!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity & Offering */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              1. Business Identity & Core Service
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Agency Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Apex Growth Labs"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourcompany.com (optional)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Niche, Services & Customer Problems Solved
            </label>
            <textarea
              rows={3}
              value={formData.serviceDescription}
              onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
              placeholder="Describe your niche, what problems you solve, and who you help (e.g. AI phone receptionists for dental clinics missing after-hours patient calls)..."
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Target Decision Makers & Firmographics */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              2. Target Decision Makers & Firmographics
            </h2>
          </div>

          {/* Job Titles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Job Titles
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.targetTitles.map((title, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                >
                  <span>{title}</span>
                  <button
                    type="button"
                    onClick={() => removeTag('targetTitles', idx)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('targetTitles', newTitle, setNewTitle);
                  }
                }}
                placeholder="Add job title (e.g. Chief Revenue Officer) and press Enter..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addTag('targetTitles', newTitle, setNewTitle)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Target Industries */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Industries
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.targetIndustries.map((ind, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                >
                  <span>{ind}</span>
                  <button
                    type="button"
                    onClick={() => removeTag('targetIndustries', idx)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('targetIndustries', newIndustry, setNewIndustry);
                  }
                }}
                placeholder="Add industry (e.g. FinTech, B2B SaaS)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addTag('targetIndustries', newIndustry, setNewIndustry)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Company Size Range & Daily Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Company Size
              </label>
              <select
                value={formData.companySizeRange}
                onChange={(e) => setFormData({ ...formData, companySizeRange: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="1 - 10 employees">1 - 10 employees (Early Stage)</option>
                <option value="11 - 50 employees">11 - 50 employees (Growth)</option>
                <option value="20 - 250 employees">20 - 250 employees (Mid-Market)</option>
                <option value="250 - 1000 employees">250 - 1000 employees (Scale-up)</option>
                <option value="1000+ employees">1000+ employees (Enterprise)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Qualified Lead Target
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={formData.dailyLeadTarget}
                onChange={(e) => setFormData({ ...formData, dailyLeadTarget: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Customer Pain Points & Buying Triggers */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              3. Relevant Customer Problems & Buying Triggers
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Our AI scans public posts for these exact operational frictions, questions, and requests for recommendations.
          </p>

          <div className="space-y-2">
            {formData.painPoints.map((pain, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <span className="text-slate-800">{pain}</span>
                <button
                  type="button"
                  onClick={() => removeTag('painPoints', idx)}
                  className="text-slate-400 hover:text-rose-600 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPain}
              onChange={(e) => setNewPain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('painPoints', newPain, setNewPain);
                }
              }}
              placeholder="e.g. Inability to generate qualified enterprise demos without paid ads..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => addTag('painPoints', newPain, setNewPain)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Add Pain Point
            </button>
          </div>
        </div>

        {/* Section 4: Negative Exclusions */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <X className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">
              4. Excluded Job Titles & Industries
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Posts mentioning these roles or industries will be automatically disqualified to preserve pipeline purity.
          </p>

          <div className="flex flex-wrap gap-2">
            {formData.negativeExclusions.map((excl, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-rose-50 text-rose-800 rounded-md border border-rose-200"
              >
                <span>{excl}</span>
                <button
                  type="button"
                  onClick={() => removeTag('negativeExclusions', idx)}
                  className="text-rose-400 hover:text-rose-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('negativeExclusions', newExclusion, setNewExclusion);
                }
              }}
              placeholder="e.g. Dropshipping, Unfunded students, Crypto token launches..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => addTag('negativeExclusions', newExclusion, setNewExclusion)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Add Exclusion
            </button>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving ICP...' : 'Save & Update Pipeline Filter'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
