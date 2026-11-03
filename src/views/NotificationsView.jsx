import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Tractor,
  Briefcase,
  Globe,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { apiFetch } from '../api';

export const NotificationsView = () => {
  const [targetType, setTargetType] = useState('role'); // 'role', 'all', 'individual'
  const [targetRole, setTargetRole] = useState('farmer'); // 'farmer', 'provider', 'agent'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch users for individual targeting
  useEffect(() => {
    if (targetType === 'individual') {
      fetchUsers();
    }
  }, [targetType, targetRole]);

  // Fetch dispatch history
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      let endpoint = '/api/admin/farmers';
      if (targetRole === 'provider') endpoint = '/api/admin/providers';
      if (targetRole === 'agent') endpoint = '/api/admin/agents';

      const data = await apiFetch(endpoint);
      if (data.success) {
        if (targetRole === 'farmer') setAvailableUsers(data.farmers || []);
        if (targetRole === 'provider') setAvailableUsers(data.providers || []);
        if (targetRole === 'agent') setAvailableUsers(data.agents || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await apiFetch('/api/admin/notifications/history');
      if (data.success) {
        setHistory(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notification history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please fill in notification title and message.');
      return;
    }

    if (targetType === 'individual' && !selectedUserId) {
      alert('Please select an individual recipient.');
      return;
    }

    setIsSending(true);
    setResultMessage(null);

    try {
      const payload = {
        targetType,
        targetRole: targetType === 'role' ? targetRole : undefined,
        userId: targetType === 'individual' ? selectedUserId : undefined,
        title: title.trim(),
        body: body.trim(),
      };

      const res = await apiFetch('/api/admin/notifications/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setResultMessage({
          type: 'success',
          text: `${res.message} (${res.stats?.devicesPushed || 0} devices delivered)`,
        });
        setTitle('');
        setBody('');
        fetchHistory();
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch push notification.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = availableUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    const name = (u.name || u.userName || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  return (
    <div className="view-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={28} color="#22c55e" />
            Push Notification Dispatcher
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '14px' }}>
            Broadcast real-time announcements, weather warnings, and direct push alerts to Farmers, Providers, or Agents via Firebase Cloud Messaging.
          </p>
        </div>
      </div>

      {resultMessage && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: resultMessage.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: resultMessage.type === 'success' ? '#6ee7b7' : '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: `1px solid ${resultMessage.type === 'success' ? '#059669' : '#b91c1c'}`,
          }}
        >
          {resultMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: '600' }}>{resultMessage.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.2fr) 1fr', gap: '28px' }}>
        {/* Dispatch Form Card */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #334155',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="#38bdf8" />
            Compose Message
          </h2>

          <form onSubmit={handleSend}>
            {/* Target Audience Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                TARGET AUDIENCE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTargetType('role')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: targetType === 'role' ? '2px solid #22c55e' : '1px solid #334155',
                    background: targetType === 'role' ? 'rgba(34, 197, 94, 0.15)' : '#0f172a',
                    color: targetType === 'role' ? '#4ade80' : '#cbd5e1',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Users size={20} />
                  <span>By Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('individual')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: targetType === 'individual' ? '2px solid #38bdf8' : '1px solid #334155',
                    background: targetType === 'individual' ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                    color: targetType === 'individual' ? '#38bdf8' : '#cbd5e1',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={20} />
                  <span>Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: targetType === 'all' ? '2px solid #f59e0b' : '1px solid #334155',
                    background: targetType === 'all' ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
                    color: targetType === 'all' ? '#fbbf24' : '#cbd5e1',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Globe size={20} />
                  <span>All Users</span>
                </button>
              </div>
            </div>

            {/* Role Filter (if By Role or Individual) */}
            {targetType !== 'all' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                  {targetType === 'individual' ? 'SELECT USER TYPE' : 'TARGET ROLE GROUP'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('farmer');
                      setSelectedUserId('');
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: targetRole === 'farmer' ? '1px solid #22c55e' : '1px solid #334155',
                      background: targetRole === 'farmer' ? 'rgba(34, 197, 94, 0.2)' : '#0f172a',
                      color: targetRole === 'farmer' ? '#4ade80' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}
                  >
                    <Users size={16} /> Farmers
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('provider');
                      setSelectedUserId('');
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: targetRole === 'provider' ? '1px solid #f97316' : '1px solid #334155',
                      background: targetRole === 'provider' ? 'rgba(249, 115, 22, 0.2)' : '#0f172a',
                      color: targetRole === 'provider' ? '#fb923c' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}
                  >
                    <Tractor size={16} /> Providers
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('agent');
                      setSelectedUserId('');
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: targetRole === 'agent' ? '1px solid #a855f7' : '1px solid #334155',
                      background: targetRole === 'agent' ? 'rgba(168, 85, 247, 0.2)' : '#0f172a',
                      color: targetRole === 'agent' ? '#c084fc' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                    }}
                  >
                    <Briefcase size={16} /> Agents
                  </button>
                </div>
              </div>
            )}

            {/* Individual User Picker */}
            {targetType === 'individual' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                  SELECT SPECIFIC {targetRole.toUpperCase()}
                </label>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    marginBottom: '8px',
                    fontSize: '13px',
                  }}
                />
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Choose {targetRole} recipient --</option>
                  {filteredUsers.map((u) => {
                    const id = u.userId?._id || u.userId || u._id;
                    const name = u.name || u.userName || 'Unnamed';
                    const phone = u.phone || u.userPhone || '';
                    return (
                      <option key={id} value={id}>
                        {name} ({phone})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Message Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                NOTIFICATION TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. 🚜 Special Subsidy Announcement or Weather Alert"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                NOTIFICATION MESSAGE
              </label>
              <textarea
                rows={4}
                placeholder="Enter detailed message to appear on users' device notification shade..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: isSending ? '#475569' : '#22c55e',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: isSending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
            >
              <Send size={18} />
              {isSending ? 'Dispatching Push Notification...' : 'Send Push Notification Now'}
            </button>
          </form>
        </div>

        {/* Live Preview & Recent History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Phone Notification Preview */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #334155',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} color="#a855f7" />
              Real-time Device Preview
            </h3>

            <div
              style={{
                background: '#0f172a',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #334155',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={12} color="#000" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0' }}>ProFarmer Network</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>just now</span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                {title || 'Sample Title (e.g. Tractor Dispatch Update)'}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                {body || 'Your message will appear here on user phones with instant banner and audio alerts.'}
              </div>
            </div>
          </div>

          {/* Recent Dispatches */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #334155',
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#38bdf8" />
              Recent System Dispatches ({history.length})
            </h3>

            {isLoadingHistory ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>Loading notification history...</div>
            ) : history.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>No notifications dispatched yet.</div>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    style={{
                      background: '#0f172a',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#e2e8f0' }}>{n.title}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: n.recipientRole === 'farmer' ? '#064e3b' : n.recipientRole === 'provider' ? '#7c2d12' : '#581c87',
                          color: n.recipientRole === 'farmer' ? '#6ee7b7' : n.recipientRole === 'provider' ? '#fdba74' : '#d8b4fe',
                          textTransform: 'capitalize',
                        }}
                      >
                        {n.recipientRole || 'all'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{n.body}</p>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
