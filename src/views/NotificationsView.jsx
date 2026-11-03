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
  Smartphone,
  Search,
  Radio,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../api';

export const NotificationsView = () => {
  const [targetType, setTargetType] = useState('role'); // 'role', 'individual', 'all'
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
    <div>
      {/* Alert banner if present */}
      {resultMessage && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: resultMessage.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: resultMessage.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${resultMessage.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {resultMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{resultMessage.text}</span>
        </div>
      )}

      {/* Main Grid Layout matching ProFarmer Admin Design System */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Card: Compose Notification */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Send size={18} color="var(--primary)" />
              <span>Compose Push Broadcast</span>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-fixed)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Radio size={12} /> Live FCM Gateway
            </span>
          </div>

          <form onSubmit={handleSend}>
            {/* Target Audience Pill Selector */}
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <div className="tabs-container" style={{ width: '100%', marginBottom: 0 }}>
                <button
                  type="button"
                  className={`tab-btn ${targetType === 'role' ? 'active' : ''}`}
                  onClick={() => setTargetType('role')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Users size={16} />
                  <span>By Role</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${targetType === 'individual' ? 'active' : ''}`}
                  onClick={() => setTargetType('individual')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <User size={16} />
                  <span>Individual</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${targetType === 'all' ? 'active' : ''}`}
                  onClick={() => setTargetType('all')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Globe size={16} />
                  <span>All Users</span>
                </button>
              </div>
            </div>

            {/* Target Role Filters */}
            {targetType !== 'all' && (
              <div className="form-group">
                <label className="form-label">
                  {targetType === 'individual' ? 'Filter by User Role' : 'Select Target Role Group'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('farmer');
                      setSelectedUserId('');
                    }}
                    className={`btn ${targetRole === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
                  >
                    <Users size={15} />
                    <span>Farmers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('provider');
                      setSelectedUserId('');
                    }}
                    className={`btn ${targetRole === 'provider' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
                  >
                    <Tractor size={15} />
                    <span>Providers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetRole('agent');
                      setSelectedUserId('');
                    }}
                    className={`btn ${targetRole === 'agent' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
                  >
                    <Briefcase size={15} />
                    <span>Agents</span>
                  </button>
                </div>
              </div>
            )}

            {/* Individual Dropdown Picker */}
            {targetType === 'individual' && (
              <div className="form-group">
                <label className="form-label">Select Specific {targetRole.toUpperCase()}</label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                <select
                  className="form-control"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isLoadingUsers}
                >
                  <option value="">
                    {isLoadingUsers ? 'Loading directory...' : `-- Select ${targetRole} recipient (${filteredUsers.length} available) --`}
                  </option>
                  {filteredUsers.map((u) => {
                    const id = u.userId?._id || u.userId || u._id;
                    const name = u.name || u.userName || 'Unnamed';
                    const phone = u.phone || u.userPhone || '';
                    return (
                      <option key={id} value={id}>
                        {name} • {phone}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Title Input */}
            <div className="form-group">
              <label className="form-label">Notification Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 🚜 Monsoon Machinery Pre-Booking Open"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Message Body */}
            <div className="form-group">
              <label className="form-label">Notification Message</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Enter the push notification message body that will appear on user devices..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSending}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Send size={16} />
              <span>{isSending ? 'Sending Push Notification...' : 'Dispatch Notification Now'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Device Mockup & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card: Live Device Preview */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Smartphone size={18} color="var(--primary)" />
                <span>Device Banner Preview</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Android / iOS</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-container)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Bell size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ProFarmer Network
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>via ProFarmer Mobile App</div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Just now</span>
              </div>

              <div style={{ paddingLeft: '36px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {title || 'Tractor Dispatch & Subsidy Notice'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {body || 'Your message will appear here on farmers, providers, and agents phone screens with high priority sound and banners.'}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Dispatch History */}
          <div className="card" style={{ marginBottom: 0, flex: 1 }}>
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--primary)" />
                <span>Recent System Broadcasts</span>
              </div>
              <span className="pill-count" style={{ marginLeft: 0 }}>{history.length}</span>
            </div>

            {isLoadingHistory ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading dispatch history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notifications dispatched yet.
              </div>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.slice(0, 15).map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            n.recipientRole === 'farmer'
                              ? 'var(--success-bg)'
                              : n.recipientRole === 'provider'
                              ? 'var(--warning-bg)'
                              : 'var(--info-bg)',
                          color:
                            n.recipientRole === 'farmer'
                              ? '#065f46'
                              : n.recipientRole === 'provider'
                              ? '#9a3412'
                              : '#0369a1',
                          textTransform: 'capitalize',
                        }}
                      >
                        {n.recipientRole || 'All'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
