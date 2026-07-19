'use client';

import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Loader2, Save, Check } from 'lucide-react';

interface ProfileSettingsProps {
  user: { name?: string; role?: string; email?: string } | null;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  profileEmail: string;
  setProfileEmail: (v: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

export function ProfileSettings({
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileEmail,
  setProfileEmail,
  saving,
  saved,
  onSave,
}: ProfileSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information</p>
      </div>
      <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
        <Avatar src={null} alt={user?.name || 'User'} size="lg" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase() || 'Member'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
        </div>
      </div>
      <div className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Updated!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Update Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
