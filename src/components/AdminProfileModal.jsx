import React, { useState, useEffect } from 'react';
import { Shield, Key, User, Mail, Phone, Laptop, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { apiFetch } from '../api';

export const AdminProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setFeedback(null);
      apiFetch('/api/admin/profile')
        .then((res) => {
          if (res.admin) {
            setProfileData(res.admin);
            setForm({
              name: res.admin.name || '',
              email: res.admin.email || '',
              phone: res.admin.phone || '',
              currentPassword: '',
              newPassword: '',
            });
          }
        })
        .catch((err) => {
          setFeedback({ type: 'error', text: err.message });
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };
      if (form.currentPassword && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await apiFetch('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setFeedback({ type: 'success', text: res.message || 'Profile updated successfully!' });
      if (onProfileUpdated && res.admin) {
        onProfileUpdated(res.admin);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Profile & Access Control"
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="btn btn-primary"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Updates'}
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading admin credentials and session details...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'linear-gradient(135deg, #02200c 0%, #17351f 100%)',
              borderRadius: '10px',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(200, 236, 203, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c8eccb',
              }}
            >
              <Shield size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800 }}>{profileData?.name || 'Administrator'}</span>
                <span
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  SUPER ADMIN
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#c8eccb', marginTop: '2px' }}>
                System-wide Root Administrative Authority • All Permissions Active
              </div>
            </div>
          </div>

          {feedback && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: feedback.type === 'success' ? '#166534' : '#991b1b',
              }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Official Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> Registered Mobile
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Role Privilege Level</label>
                <input
                  type="text"
                  className="form-control"
                  value="Super Administrator (Level 1 Root)"
                  disabled
                  style={{ background: '#f1f5eb', color: '#727971' }}
                />
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px',
                marginTop: '6px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="var(--primary)" />
                <span>Security & Password Update (Optional)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new strong password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Role Permissions Badges */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                ASSIGNED SYSTEM PERMISSIONS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(profileData?.permissions || [
                  'ALL_PERMISSIONS',
                  'USER_VERIFICATION',
                  'FINANCIAL_RECONCILIATION',
                  'DISPATCH_OVERRIDE',
                  'CATALOG_MANAGEMENT',
                  'SYSTEM_AUDIT',
                ]).map((perm, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      background: '#edf7ee',
                      color: '#1b5e20',
                      border: '1px solid #c8eccb',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                ACTIVE SECURITY SESSIONS
              </div>
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Laptop size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Web Operations Console (Macintosh / Browser)</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IP: 127.0.0.1 • TLS 1.3 Encrypted</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#16a34a',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Active Session
                </span>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
