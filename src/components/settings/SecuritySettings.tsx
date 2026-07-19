'use client';

import { Button } from '@/components/Button';
import { Loader2, Save, Check, LogOut } from 'lucide-react';

interface SecuritySettingsProps {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onLogout: () => void;
}

export function SecuritySettings({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  saving,
  saved,
  onSave,
  onLogout,
}: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your password and security</p>
      </div>
      <div className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
              Update Password
            </>
          )}
        </Button>
      </div>
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Account Actions</h3>
        <Button variant="danger" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
