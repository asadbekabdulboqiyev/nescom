'use client';

import { Button } from '@/components/Button';
import { Loader2, Save, Check } from 'lucide-react';

export interface NotificationPrefs {
  emailNotifications: boolean;
  taskAssignments: boolean;
  salaryUpdates: boolean;
  weeklyDigest: boolean;
  messageAlerts: boolean;
}

interface NotificationSettingsProps {
  notifPrefs: NotificationPrefs;
  setNotifPrefs: React.Dispatch<React.SetStateAction<NotificationPrefs>>;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

const notifItems = [
  {
    key: 'emailNotifications' as const,
    label: 'Email notifications',
    desc: 'Receive email for important updates',
  },
  {
    key: 'taskAssignments' as const,
    label: 'Task assignments',
    desc: 'Notify when assigned a new task',
  },
  { key: 'salaryUpdates' as const, label: 'Salary updates', desc: 'Notify on salary changes' },
  { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'Receive weekly summary email' },
  { key: 'messageAlerts' as const, label: 'Message alerts', desc: 'Notify on new messages' },
];

export function NotificationSettings({
  notifPrefs,
  setNotifPrefs,
  saving,
  saved,
  onSave,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
        <p className="text-sm text-slate-500 mt-1">Choose what notifications you receive</p>
      </div>
      <div className="space-y-3 max-w-lg">
        {notifItems.map((item) => (
          <label
            key={item.key}
            htmlFor={`notif-${item.key}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <input
              type="checkbox"
              id={`notif-${item.key}`}
              checked={notifPrefs[item.key]}
              onChange={(e) => setNotifPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        ))}
        <Button onClick={onSave} disabled={saving} className="mt-4">
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
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
