'use client';

import { Building2, User, Bell, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import {
  NotificationSettings,
  type NotificationPrefs,
} from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

const tabs = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    taskAssignments: true,
    salaryUpdates: false,
    weeklyDigest: true,
    messageAlerts: true,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch('/api/companies', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const payload = json.data ?? json;
          const companies = payload.companies || [];
          const myCompany = companies.find((c: { id: string }) => c.id === user?.companyId);
          if (myCompany) {
            setCompanyId(myCompany.id);
            setCompanyName(myCompany.name || '');
            setCompanyDescription(myCompany.description || '');
            setCompanyIndustry(myCompany.industry || '');
            setCompanyCode(myCompany.code || '');
          }
        }
      } catch (error) {
        console.error('Failed to fetch company:', error);
      } finally {
        setLoadingCompany(false);
      }
    };
    if (user?.companyId) fetchCompany();
  }, [user?.companyId]);

  useEffect(() => {
    if (user) {
      const parts = user.name?.split(' ') || [];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

  const showSuccess = () => {
    setSaving(false);
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const showError = (msg: string) => {
    setSaving(false);
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const handleSaveCompany = async () => {
    if (!companyId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: companyId,
          name: companyName,
          industry: companyIndustry,
          description: companyDescription,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      showSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: profileEmail,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      showSuccess();
      window.location.reload();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    try {
      localStorage.setItem('notification_prefs', JSON.stringify(notifPrefs));
      showSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/users/me/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your company and account settings</p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-56 shrink-0" aria-label="Settings tabs">
          <div
            className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
            role="tablist"
            aria-orientation="horizontal"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {activeTab === 'company' && (
            <CompanySettings
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyDescription={companyDescription}
              setCompanyDescription={setCompanyDescription}
              companyIndustry={companyIndustry}
              setCompanyIndustry={setCompanyIndustry}
              companyCode={companyCode}
              loadingCompany={loadingCompany}
              saving={saving}
              saved={saved}
              onSave={handleSaveCompany}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              user={user}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              saving={saving}
              saved={saved}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings
              notifPrefs={notifPrefs}
              setNotifPrefs={setNotifPrefs}
              saving={saving}
              saved={saved}
              onSave={handleSaveNotifications}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              saving={saving}
              saved={saved}
              onSave={handleChangePassword}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
