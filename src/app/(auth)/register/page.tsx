'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/hooks/useRegister';
import {
  Building2,
  Mail,
  Lock,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code: string;
  industry: string | null;
  description: string | null;
  _count: { users: number };
}

interface FormData {
  selectedCompanyId: string;
  companyName: string;
  companyIndustry: string;
  createNew: boolean;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyCode: string;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, label: 'Company', icon: Building2 },
  { id: 2, label: 'Personal Info', icon: User },
  { id: 3, label: 'Complete', icon: Check },
];

function FieldError({ field, errors }: { field: string; errors: FormErrors }) {
  if (!errors[field]) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500 animate-fade-in">
      <AlertCircle className="h-3 w-3" />
      {errors[field]}
    </p>
  );
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    selectedCompanyId: '',
    companyName: '',
    companyIndustry: '',
    createNew: false,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { register, error, loading } = useRegister();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setLoadingCompanies(false);
      })
      .catch(() => setLoadingCompanies(false));
  }, []);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (formData.createNew) {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      } else {
        if (!formData.selectedCompanyId) newErrors.selectedCompanyId = 'Select a company';
      }
    } else if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8)
        newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const [createdCompany, setCreatedCompany] = useState<{ name: string; code: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    try {
      let companyIdToSend: string | undefined = formData.createNew
        ? undefined
        : formData.selectedCompanyId;

      if (formData.createNew) {
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.companyName,
            industry: formData.companyIndustry || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create company');
        companyIdToSend = data.company.id;
        setCreatedCompany({ name: data.company.name, code: data.company.code });
      } else {
        const company = companies.find((c) => c.id === companyIdToSend);
        if (company) {
          setCreatedCompany({ name: company.name, code: company.code });
        }
      }

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyId: companyIdToSend,
      });
      setCurrentStep(3);
    } catch {
      // error handled by hook
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-scale-in">
      <div className="mb-6 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-blue-500/25">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Get started with Nescom
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    currentStep > step.id
                      ? 'bg-emerald-500 text-white'
                      : currentStep === step.id
                        ? 'gradient-primary text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    currentStep >= step.id
                      ? 'text-slate-900'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 transition-colors sm:w-20 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-slide-in-up">
          {error}
        </div>
      )}

      {/* Step 1: Company Selection */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-slide-in-up">
          {!formData.createNew ? (
            <>
              {loadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="h-6 w-6 animate-spin text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : companies.length > 0 ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Select your company
                  </label>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={formData.companyCode}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, companyCode: code }));
                        // Auto-select if code matches
                        const match = companies.find((c) => c.code === code);
                        if (match) {
                          updateField('selectedCompanyId', match.id);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter company code (e.g. MYCO001)"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => updateField('selectedCompanyId', company.id)}
                        className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                          formData.selectedCompanyId === company.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Building2 className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {company.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{company.code}</span> · {company.industry || 'General'} · {company._count.users} member
                            {company._count.users !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {formData.selectedCompanyId === company.id && (
                          <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <FieldError field="selectedCompanyId" errors={errors} />
                </>
              ) : (
                <div className="text-center py-6">
                  <Users className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    No companies yet
                  </p>
                  <p className="text-xs text-slate-500">
                    Create your first company to get started
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => updateField('createNew', true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create new company
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.selectedCompanyId}
                className="w-full flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  New company
                </label>
                <button
                  type="button"
                  onClick={() => updateField('createNew', false)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Choose existing
                </button>
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                      errors.companyName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:border-blue-500'
                    }`}
                    placeholder="Acme Inc."
                  />
                </div>
                <FieldError field="companyName" errors={errors} />
              </div>

              <div>
                <label
                  htmlFor="companyIndustry"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Industry <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  id="companyIndustry"
                  value={formData.companyIndustry}
                  onChange={(e) => updateField('companyIndustry', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField('createNew', false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Personal Info */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-up">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
                placeholder="John Doe"
              />
            </div>
            <FieldError field="name" errors={errors} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
                placeholder="you@company.com"
              />
            </div>
            <FieldError field="email" errors={errors} />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            <FieldError field="password" errors={errors} />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            <FieldError field="confirmPassword" errors={errors} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  Create account
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Complete */}
      {currentStep === 3 && (
        <div className="text-center animate-scale-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Account created!</h3>
          <p className="mt-2 text-sm text-slate-500">
            Welcome to Nescom. Your account has been successfully created.
          </p>
          
          {createdCompany && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Your Company</p>
              <p className="text-sm font-semibold text-slate-900">{createdCompany.name}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500">Code:</span>
                <span className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {createdCompany.code}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Share this code with employees so they can join
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full rounded-lg gradient-primary py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
          >
            Go to dashboard
          </button>
        </div>
      )}

      {currentStep < 3 && (
        <p className="mt-6 text-center text-sm text-slate-500 animate-fade-in">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; 2026 Nescom. All rights reserved.
        </p>
      </div>
    </div>
  );
}
