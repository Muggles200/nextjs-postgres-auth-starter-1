'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Settings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        maintenanceMode: data.maintenanceMode === 'true',
        twoFactorAuth: data.twoFactorAuth === 'true',
        sessionTimeout: parseInt(data.sessionTimeout) || 30,
        smtpServer: data.smtpServer || '',
        smtpPort: parseInt(data.smtpPort) || 587,
        smtpUsername: data.smtpUsername || '',
        smtpPassword: data.smtpPassword || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          maintenanceMode: settings.maintenanceMode.toString(),
          twoFactorAuth: settings.twoFactorAuth.toString(),
          sessionTimeout: settings.sessionTimeout.toString(),
          smtpServer: settings.smtpServer,
          smtpPort: settings.smtpPort.toString(),
          smtpUsername: settings.smtpUsername,
          smtpPassword: settings.smtpPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceModeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    
    if (newValue) {
      if (!confirm('Are you sure you want to enable maintenance mode? This will restrict access to all non-admin users.')) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to disable maintenance mode? This will restore access to all users.')) {
        return;
      }
    }

    setSettings({ ...settings, maintenanceMode: newValue });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <input
                type="text"
                id="site-name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                id="site-description"
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500">Enable maintenance mode for system updates</p>
                {settings.maintenanceMode && (
                  <p className="text-sm text-red-600 mt-1">
                    Warning: Maintenance mode is currently enabled. Non-admin users will be redirected to the maintenance page.
                  </p>
                )}
              </div>
              <input
                type="checkbox"
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onChange={handleMaintenanceModeChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="two-factor-auth" className="text-sm font-medium text-gray-700">
                  Require Two-Factor Authentication
                </label>
                <p className="text-sm text-gray-500">Enforce 2FA for all users</p>
              </div>
              <input
                type="checkbox"
                id="two-factor-auth"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="session-timeout"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                min="5"
                max="1440"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="smtp-server" className="block text-sm font-medium text-gray-700">
                SMTP Server
              </label>
              <input
                type="text"
                id="smtp-server"
                value={settings.smtpServer}
                onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700">
                SMTP Port
              </label>
              <input
                type="number"
                id="smtp-port"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="smtp-username" className="block text-sm font-medium text-gray-700">
                SMTP Username
              </label>
              <input
                type="text"
                id="smtp-username"
                value={settings.smtpUsername}
                onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="smtp-password" className="block text-sm font-medium text-gray-700">
                SMTP Password
              </label>
              <input
                type="password"
                id="smtp-password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 