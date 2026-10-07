import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Bell,
  Sliders,
  Shield,
  RotateCcw,
  Building2,
  Mail,
  Lock
} from 'lucide-react';
import { api } from '../../lib/api';

interface SettingsTabProps {
  onRefresh: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<any>({
    platform_name: 'AkoFinanced It - Underwriting & Operations Suite',
    support_email: 'operations@akofinanced.it',
    currency_code: 'NGN',
    application_prefix: 'AKO',
    auto_matching_enabled: true,
    require_cac_for_business: true,
    sla_hours_initial_assessment: 24,
    notification_email_on_new_app: true,
    notification_sms_on_status_change: true
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getAdminSettings();
        if (res && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateAdminSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#0B0B0F]">Fintech System & Underwriting Configuration</h2>
          <p className="text-xs text-[#8F95A5]">Manage business rules, lender matching automation, and operational SLA parameters</p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-[8px] border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Parameters */}
        <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#8F95A5]/15 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2D62FF]" />
            <h3 className="text-xs font-bold text-[#0B0B0F]">Platform & Currency Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">
                Portal Operations Title
              </label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                className="w-full py-2 px-3 bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">
                Support & Compliance Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full py-2 px-3 bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">
                Primary Financial Currency
              </label>
              <input
                type="text"
                value={settings.currency_code}
                onChange={(e) => setSettings({ ...settings, currency_code: e.target.value })}
                className="w-full py-2 px-3 bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">
                Loan Reference Code Prefix
              </label>
              <input
                type="text"
                value={settings.application_prefix}
                onChange={(e) => setSettings({ ...settings, application_prefix: e.target.value })}
                className="w-full py-2 px-3 bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[8px] text-[#0B0B0F] font-mono focus:outline-none focus:border-[#2D62FF]"
              />
            </div>
          </div>
        </div>

        {/* Underwriting Rules */}
        <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#8F95A5]/15 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2D62FF]" />
            <h3 className="text-xs font-bold text-[#0B0B0F]">Underwriting Automation & Verification Policies</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#8F95A5]/10">
              <div>
                <p className="font-bold text-[#0B0B0F]">Automated Lender Compatibility Engine</p>
                <p className="text-[11px] text-[#8F95A5]">Instantly score and suggest matching partner banks upon application submission</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_matching_enabled}
                onChange={(e) => setSettings({ ...settings, auto_matching_enabled: e.target.checked })}
                className="w-4 h-4 text-[#2D62FF] rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#8F95A5]/10">
              <div>
                <p className="font-bold text-[#0B0B0F]">Mandatory CAC Verification for Business Loans</p>
                <p className="text-[11px] text-[#8F95A5]">Flag applications as "Documents Required" if CAC certificate is missing</p>
              </div>
              <input
                type="checkbox"
                checked={settings.require_cac_for_business}
                onChange={(e) => setSettings({ ...settings, require_cac_for_business: e.target.checked })}
                className="w-4 h-4 text-[#2D62FF] rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-[#0B0B0F]">Initial Assessment SLA Window (Hours)</p>
                <p className="text-[11px] text-[#8F95A5]">Target time for loan officer first-touch review</p>
              </div>
              <input
                type="number"
                value={settings.sla_hours_initial_assessment}
                onChange={(e) => setSettings({ ...settings, sla_hours_initial_assessment: Number(e.target.value) })}
                className="w-20 py-1.5 px-2.5 text-right font-bold bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[8px]"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#8F95A5]/15 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2D62FF]" />
            <h3 className="text-xs font-bold text-[#0B0B0F]">Omnichannel Notifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#8F95A5]/10">
              <div>
                <p className="font-bold text-[#0B0B0F]">Staff Alert on New Loan Ingestion</p>
                <p className="text-[11px] text-[#8F95A5]">Send instant email alert to assigned underwriting triage team</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notification_email_on_new_app}
                onChange={(e) => setSettings({ ...settings, notification_email_on_new_app: e.target.checked })}
                className="w-4 h-4 text-[#2D62FF] rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-[#0B0B0F]">SMS Status Notifications to Borrowers</p>
                <p className="text-[11px] text-[#8F95A5]">Notify borrower immediately when status progresses to Processing, Sanctioned, or Approved</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notification_sms_on_status_change}
                onChange={(e) => setSettings({ ...settings, notification_sms_on_status_change: e.target.checked })}
                className="w-4 h-4 text-[#2D62FF] rounded"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            id="btn-save-admin-settings"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2D62FF] hover:bg-[#1E4ED8] disabled:opacity-50 text-white text-xs font-bold rounded-[10px] shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
