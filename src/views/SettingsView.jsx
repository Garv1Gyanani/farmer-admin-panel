import React, { useEffect, useState } from 'react';
import {
  Clock,
  CreditCard,
  Radio,
  Save,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';
import { apiFetch } from '../api';

const DEFAULT_BOOKING_CONFIG = {
  bookingHoursOptions: [2, 4, 6, 8],
  extensionHoursOptions: [1, 2, 4],
  collectPaymentBeforeService: false,
  broadcastToAllProviders: false,
  defaultTimeSlots: [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ],
};

export const SettingsView = () => {
  const [bookingConfig, setBookingConfig] = useState(DEFAULT_BOOKING_CONFIG);
  const [newBookingHour, setNewBookingHour] = useState('');
  const [newExtHour, setNewExtHour] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [loadingBookingCfg, setLoadingBookingCfg] = useState(true);
  const [savingBookingCfg, setSavingBookingCfg] = useState(false);
  const [bookingCfgMsg, setBookingCfgMsg] = useState(null);

  // Razorpay Gateway Settings
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [rzpUpdatedAt, setRzpUpdatedAt] = useState(null);
  const [loadingRzp, setLoadingRzp] = useState(true);
  const [savingRzp, setSavingRzp] = useState(false);
  const [rzpMsg, setRzpMsg] = useState(null);

  useEffect(() => {
    loadBookingConfig();
    loadRazorpaySettings();
  }, []);

  const loadBookingConfig = async () => {
    setLoadingBookingCfg(true);
    try {
      const res = await apiFetch('/api/admin/settings/booking-config');
      if (res?.config) {
        setBookingConfig({ ...DEFAULT_BOOKING_CONFIG, ...res.config });
      }
    } catch (err) {
      setBookingCfgMsg({ type: 'error', text: err.message || 'Failed to load settings' });
    } finally {
      setLoadingBookingCfg(false);
    }
  };

  const loadRazorpaySettings = async () => {
    setLoadingRzp(true);
    try {
      const res = await apiFetch('/api/admin/settings/razorpay');
      if (res?.settings) {
        setKeyId(res.settings.keyId || '');
        setKeySecret(res.settings.keySecretMasked || '');
        setWebhookSecret(res.settings.webhookSecret || '');
        setIsLiveMode(Boolean(res.settings.isLiveMode));
        setRzpUpdatedAt(res.settings.updatedAt ? new Date(res.settings.updatedAt).toLocaleString() : null);
      }
    } catch (err) {
      setRzpMsg({ type: 'error', text: err.message || 'Failed to load Razorpay settings' });
    } finally {
      setLoadingRzp(false);
    }
  };

  const handleSaveBookingConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingBookingCfg(true);
    setBookingCfgMsg(null);
    try {
      const res = await apiFetch('/api/admin/settings/booking-config', {
        method: 'PUT',
        body: JSON.stringify(bookingConfig),
      });
      if (res?.config) {
        setBookingConfig({ ...DEFAULT_BOOKING_CONFIG, ...res.config });
      }
      setBookingCfgMsg({ type: 'success', text: res?.message || 'Global booking & dispatch settings saved.' });
      setTimeout(() => setBookingCfgMsg(null), 3000);
    } catch (err) {
      setBookingCfgMsg({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setSavingBookingCfg(false);
    }
  };

  const handleSaveRazorpay = async (e) => {
    e.preventDefault();
    if (!keyId.trim().startsWith('rzp_')) {
      setRzpMsg({ type: 'error', text: 'Key ID must start with rzp_test_ or rzp_live_' });
      return;
    }
    setSavingRzp(true);
    setRzpMsg(null);
    try {
      const res = await apiFetch('/api/admin/settings/razorpay', {
        method: 'PUT',
        body: JSON.stringify({
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
          webhookSecret: webhookSecret.trim(),
          isLiveMode,
        }),
      });
      setRzpMsg({ type: 'success', text: res?.message || 'Razorpay gateway settings saved.' });
      await loadRazorpaySettings();
    } catch (err) {
      setRzpMsg({ type: 'error', text: err.message || 'Failed to save Razorpay keys' });
    } finally {
      setSavingRzp(false);
    }
  };

  const addNumberOption = (key, value, clearInput) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return;
    const current = bookingConfig[key] || [];
    if (current.includes(num)) {
      clearInput('');
      return;
    }
    setBookingConfig({
      ...bookingConfig,
      [key]: [...current, num].sort((a, b) => a - b),
    });
    clearInput('');
  };

  const removeNumberOption = (key, val) => {
    setBookingConfig({
      ...bookingConfig,
      [key]: (bookingConfig[key] || []).filter((item) => item !== val),
    });
  };

  const addTimeSlot = () => {
    const trimmed = newTimeSlot.trim();
    if (!trimmed) return;
    const current = bookingConfig.defaultTimeSlots || [];
    if (current.includes(trimmed)) {
      setNewTimeSlot('');
      return;
    }
    setBookingConfig({
      ...bookingConfig,
      defaultTimeSlots: [...current, trimmed],
    });
    setNewTimeSlot('');
  };

  const removeTimeSlot = (slot) => {
    setBookingConfig({
      ...bookingConfig,
      defaultTimeSlots: (bookingConfig.defaultTimeSlots || []).filter((s) => s !== slot),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--primary)" />
            <span>Global Platform Settings</span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Centralized controls for booking hours, service extensions, dispatch visibility, payment policy, and payment gateway keys.
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveBookingConfig}
          disabled={savingBookingCfg || loadingBookingCfg}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Save size={15} />
          <span>{savingBookingCfg ? 'Saving...' : 'Save Global Policy'}</span>
        </button>
      </div>

      {bookingCfgMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            backgroundColor: bookingCfgMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: bookingCfgMsg.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${bookingCfgMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
          }}
        >
          {bookingCfgMsg.text}
        </div>
      )}

      {/* 1. Dispatch & Payment Policies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Dispatch Visibility */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <Radio size={16} color="var(--primary)" />
              <span>Dispatch Visibility & Category Filter</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Control whether unassigned bookings (<code>pending_broadcast</code>) are filtered strictly by provider category/owned services, or broadcast to all online providers.
            </div>
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: bookingConfig.broadcastToAllProviders ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${bookingConfig.broadcastToAllProviders ? '#86efac' : 'var(--border-light)'}`,
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: bookingConfig.broadcastToAllProviders ? '#166534' : 'var(--text-primary)' }}>
                Broadcast Dispatches to All Online Providers
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {bookingConfig.broadcastToAllProviders
                  ? 'ON — All online providers see & can accept any unassigned booking.'
                  : 'OFF — Providers only see bookings matching their primaryCategory or owned services.'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(bookingConfig.broadcastToAllProviders)}
              onChange={(e) => setBookingConfig({ ...bookingConfig, broadcastToAllProviders: e.target.checked })}
              style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', flexShrink: 0 }}
            />
          </label>
        </div>

        {/* Payment Collection Policy */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Payment Collection Policy</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Decide whether farmers must pay upfront (Wallet / Razorpay) before a booking is dispatched, or can choose Pay After Service. Note: mid-service time extensions are always paid immediately.
            </div>
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: bookingConfig.collectPaymentBeforeService ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${bookingConfig.collectPaymentBeforeService ? '#86efac' : 'var(--border-light)'}`,
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: bookingConfig.collectPaymentBeforeService ? '#166534' : 'var(--text-primary)' }}>
                Collect Payment Before Service
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {bookingConfig.collectPaymentBeforeService
                  ? 'ON — Advance payment required at booking checkout.'
                  : 'OFF — Pay After Service is permitted at checkout.'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(bookingConfig.collectPaymentBeforeService)}
              onChange={(e) => setBookingConfig({ ...bookingConfig, collectPaymentBeforeService: e.target.checked })}
              style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', flexShrink: 0 }}
            />
          </label>
        </div>
      </div>

      {/* 2. Global Booking Hours, Extension Hours & Default Time Slots */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
          <Clock size={16} color="var(--primary)" />
          <span>Booking Hours, Extension Options & Default Slots</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Fallback global presets used whenever a service does not define custom hour packages or custom extension options.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* Booking Hours */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#02200c', marginBottom: '8px' }}>
              Global Booking Hours
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {(bookingConfig.bookingHoursOptions || []).map((hr) => (
                <span
                  key={hr}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#e8f5e4',
                    color: '#0e3d16',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {hr} {hr === 1 ? 'Hr' : 'Hrs'}
                  <button
                    type="button"
                    onClick={() => removeNumberOption('bookingHoursOptions', hr)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, display: 'flex' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="form-control"
                value={newBookingHour}
                onChange={(e) => setNewBookingHour(e.target.value)}
                placeholder="Add hrs (e.g. 2, 10)"
                style={{ height: '32px', fontSize: '12px' }}
              />
              <button
                type="button"
                onClick={() => addNumberOption('bookingHoursOptions', newBookingHour, setNewBookingHour)}
                className="btn btn-secondary btn-sm"
                style={{ height: '32px' }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Extension Hours */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#02200c', marginBottom: '8px' }}>
              Global Service Extension Hours (In-Progress)
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {(bookingConfig.extensionHoursOptions || []).map((hr) => (
                <span
                  key={hr}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  +{hr} {hr === 1 ? 'Hr' : 'Hrs'}
                  <button
                    type="button"
                    onClick={() => removeNumberOption('extensionHoursOptions', hr)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, display: 'flex' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="form-control"
                value={newExtHour}
                onChange={(e) => setNewExtHour(e.target.value)}
                placeholder="Add ext hrs (e.g. 0.5, 3)"
                style={{ height: '32px', fontSize: '12px' }}
              />
              <button
                type="button"
                onClick={() => addNumberOption('extensionHoursOptions', newExtHour, setNewExtHour)}
                className="btn btn-secondary btn-sm"
                style={{ height: '32px' }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Default Time Slots */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#02200c', marginBottom: '8px' }}>
              Default Time Slots
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {(bookingConfig.defaultTimeSlots || []).map((slot) => (
                <span
                  key={slot}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                  }}
                >
                  {slot}
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(slot)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, display: 'flex' }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                placeholder="e.g. 6:00 PM - 8:00 PM"
                style={{ height: '32px', fontSize: '12px' }}
              />
              <button
                type="button"
                onClick={addTimeSlot}
                className="btn btn-secondary btn-sm"
                style={{ height: '32px' }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Razorpay Gateway Settings */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <CreditCard size={16} color="var(--primary)" />
              <span>Razorpay Payment Gateway Settings</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {rzpUpdatedAt ? `Last updated: ${rzpUpdatedAt}` : 'Configure live or test Razorpay API credentials.'}
            </div>
          </div>
          {loadingRzp && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</span>}
        </div>

        {rzpMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: rzpMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: rzpMsg.type === 'success' ? '#166534' : '#991b1b',
            }}
          >
            {rzpMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveRazorpay} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Razorpay Key ID</label>
            <input
              type="text"
              className="form-control"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="rzp_test_..."
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Razorpay Key Secret</label>
            <input
              type="password"
              className="form-control"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              placeholder="Enter secret to update"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Webhook Secret</label>
            <input
              type="text"
              className="form-control"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="profarmer_razorpay_webhook_secret_2026"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span>Live Mode</span>
            </label>
            <button type="submit" disabled={savingRzp} className="btn btn-primary btn-sm" style={{ height: '36px', padding: '0 14px', fontWeight: 700 }}>
              {savingRzp ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
