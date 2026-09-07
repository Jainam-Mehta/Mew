import React, { useState, useEffect } from 'react';
import {
  Bell,
  Radio,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  Send,
  Save,
  Link,
  Shield,
  Sliders,
  Check
} from 'lucide-react';
import api from '../../api/client';

export default function UserAlertingSettings() {
  const [config, setConfig] = useState({
    slack_webhook_url: '',
    discord_webhook_url: '',
    custom_webhook_url: '',
    custom_webhook_secret: '',
    email_alerts_enabled: true,
    sms_alerts_enabled: true,
    alert_email_recipient: '',
    alert_phone_recipient: '',
    events: {
      temp_threshold: true,
      humidity_threshold: true,
      sensor_offline: true,
      device_reconnected: true,
      daily_summary: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testState, setTestState] = useState({ loading: false, message: '', type: '' });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/webhooks');
      if (res && res.webhooks) {
        setConfig((prev) => ({
          ...prev,
          ...res.webhooks,
          events: {
            ...prev.events,
            ...(res.webhooks.events || {}),
          },
        }));
      }
    } catch (err) {
      console.warn('Using baseline user webhooks config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.post('/users/me/webhooks', config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save webhook settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async (channel = 'all') => {
    setTestState({ loading: true, message: '', type: '' });
    try {
      const res = await api.post('/users/me/test-alert', { channel });
      setTestState({
        loading: false,
        message: res.message || 'Simulated alert payload dispatched successfully!',
        type: 'success',
      });
      setTimeout(() => setTestState({ loading: false, message: '', type: '' }), 4000);
    } catch (err) {
      setTestState({
        loading: false,
        message: err.message || 'Failed to dispatch test alert.',
        type: 'error',
      });
    }
  };

  const toggleEvent = (eventKey) => {
    setConfig((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [eventKey]: !prev.events[eventKey],
      },
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Alerting Channels & Webhook Integrations
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Configure external webhook receivers (Slack, Discord, Custom endpoints) and emergency escalation recipients.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" /> Preferences Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Webhook Preferences'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Webhooks Grid */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Link className="w-4 h-4 text-primary-500" /> Real-Time Webhook Endpoints
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slack Webhook */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Slack Incoming Webhook
                </label>
                <button
                  type="button"
                  onClick={() => handleTestAlert('slack')}
                  disabled={testState.loading}
                  className="text-[11px] font-semibold text-primary-600 hover:underline flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Test Slack
                </button>
              </div>
              <input
                type="url"
                value={config.slack_webhook_url}
                onChange={(e) => setConfig({ ...config, slack_webhook_url: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-slate-100"
              />
              <span className="text-[10px] text-gray-500 dark:text-slate-400 block">
                Posts formatted alert cards directly to your designated operations Slack channel.
              </span>
            </div>

            {/* Discord Webhook */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Discord Channel Webhook
                </label>
                <button
                  type="button"
                  onClick={() => handleTestAlert('discord')}
                  disabled={testState.loading}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Test Discord
                </button>
              </div>
              <input
                type="url"
                value={config.discord_webhook_url}
                onChange={(e) => setConfig({ ...config, discord_webhook_url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-slate-100"
              />
              <span className="text-[10px] text-gray-500 dark:text-slate-400 block">
                Dispatches embedded rich markdown alerts with warning banners to Discord channels.
              </span>
            </div>
          </div>

          {/* Custom Webhook Endpoint */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-500" /> Custom HTTPS Endpoint & Signing Secret
              </label>
              <button
                type="button"
                onClick={() => handleTestAlert('custom')}
                disabled={testState.loading}
                className="text-[11px] font-semibold text-orange-600 hover:underline flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Test Endpoint
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 block mb-1">Target POST URL</span>
                <input
                  type="url"
                  value={config.custom_webhook_url}
                  onChange={(e) => setConfig({ ...config, custom_webhook_url: e.target.value })}
                  placeholder="https://api.yourdomain.com/v1/telemetry-alerts"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-slate-100"
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 block mb-1">HMAC Signature Secret</span>
                <input
                  type="text"
                  value={config.custom_webhook_secret}
                  onChange={(e) => setConfig({ ...config, custom_webhook_secret: e.target.value })}
                  placeholder="whsec_..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Direct Contacts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" /> Direct Emergency Escalation Contacts
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary-500" /> Immediate Email Notification
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.email_alerts_enabled}
                    onChange={(e) => setConfig({ ...config, email_alerts_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <input
                type="email"
                value={config.alert_email_recipient}
                onChange={(e) => setConfig({ ...config, alert_email_recipient: e.target.value })}
                placeholder="alerts@company.com"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-slate-100"
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" /> WhatsApp & SMS Dispatch Hotline
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sms_alerts_enabled}
                    onChange={(e) => setConfig({ ...config, sms_alerts_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <input
                type="text"
                value={config.alert_phone_recipient}
                onChange={(e) => setConfig({ ...config, alert_phone_recipient: e.target.value })}
                placeholder="+91 90904 80044"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Event Triggers Switcher */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-500" /> Webhook Dispatch Event Filters
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { key: 'temp_threshold', label: 'Temperature Limit Breached' },
              { key: 'humidity_threshold', label: 'Humidity Enclosure Alert' },
              { key: 'sensor_offline', label: 'Sensor Heartbeat Lost (Offline)' },
              { key: 'device_reconnected', label: 'Probe Restored (Online)' },
              { key: 'daily_summary', label: 'Daily Operations Digest (08:00)' },
            ].map((evt) => {
              const active = config.events?.[evt.key] !== false;
              return (
                <button
                  key={evt.key}
                  type="button"
                  onClick={() => toggleEvent(evt.key)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    active
                      ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800 text-primary-900 dark:text-primary-200'
                      : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500'
                  }`}
                >
                  <span>{evt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      active ? 'bg-primary-600 text-white' : 'bg-gray-300 dark:bg-slate-700'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Test Alert Output Banner */}
        {testState.message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 animate-fade-in ${
              testState.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{testState.message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
