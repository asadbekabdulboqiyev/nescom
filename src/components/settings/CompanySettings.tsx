'use client';

import { Button } from '@/components/Button';
import { Loader2, Save, Check } from 'lucide-react';

interface CompanySettingsProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  companyDescription: string;
  setCompanyDescription: (v: string) => void;
  companyIndustry: string;
  setCompanyIndustry: (v: string) => void;
  companyCode: string;
  loadingCompany: boolean;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

export function CompanySettings({
  companyName,
  setCompanyName,
  companyDescription,
  setCompanyDescription,
  companyIndustry,
  setCompanyIndustry,
  companyCode,
  loadingCompany,
  saving,
  saved,
  onSave,
}: CompanySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Company Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Update your company information</p>
      </div>
      {loadingCompany ? (
        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading company data">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="company-code" className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Code
            </label>
            <div className="flex items-center gap-2">
              <input
                id="company-code"
                type="text"
                value={companyCode}
                readOnly
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(companyCode)}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Copy
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Share this code with employees to join your company
            </p>
          </div>
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="company-industry" className="block text-sm font-medium text-slate-700 mb-1.5">
              Industry
            </label>
            <select
              id="company-industry"
              value={companyIndustry}
              onChange={(e) => setCompanyIndustry(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>
          <div>
            <label htmlFor="company-description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="company-description"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your company"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
