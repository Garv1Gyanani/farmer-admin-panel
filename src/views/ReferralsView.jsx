import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Wallet,
  Search,
  Filter,
  RefreshCw,
  Award,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../api';

export const ReferralsView = ({ onRefreshParent }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalReferrals: 0,
      pendingApprovals: 0,
      activeApproved: 0,
      rejectedCount: 0,
      totalBookingsCount: 0,
      totalBookingGMV: 0,
      totalCommissionsEarned: 0,
    },
    agentStats: [],
    referrals: [],
    agents: [],
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'active', 'rejected'
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    fetchReferralData();
  }, [activeTab, selectedAgent]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (selectedAgent !== 'all') params.append('agentId', selectedAgent);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiFetch(`/api/admin/referrals/analytics?${params.toString()}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching referral analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReferralData();
  };

  const handleApproveFarmer = async (farmerId, farmerName) => {
    if (!window.confirm(`Are you sure you want to approve farmer "${farmerName}"? Once approved, they can immediately log in to the ProFarmer mobile app.`)) {
      return;
    }

    setProcessingId(farmerId);
    setFeedbackMsg(null);
    try {
      const res = await apiFetch(`/api/admin/verification/farmer/${farmerId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Farmer "${farmerName}" approved successfully! They can now log in to the app, and the agent has been notified.`,
        });
        await fetchReferralData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to approve farmer.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectFarmer = async (farmerId, farmerName) => {
    const reason = window.prompt(`Enter rejection reason for farmer "${farmerName}":`, 'Documentation incomplete or invalid phone.');
    if (reason === null) return;

    setProcessingId(farmerId);
    setFeedbackMsg(null);
    try {
      const res = await apiFetch(`/api/admin/verification/farmer/${farmerId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject', reason }),
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Farmer "${farmerName}" rejected.`,
        });
        await fetchReferralData();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to reject farmer.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const summary = data.summary || {};
  const agentStats = data.agentStats || [];
  const referrals = data.referrals || [];
  const agents = data.agents || [];

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={28} style={{ color: 'var(--primary)' }} />
            Field Agent Referral Analytics
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Monitor farmers onboarded by field agents, review pending intake verification, and audit agent commission earnings.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchReferralData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {feedbackMsg && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: feedbackMsg.type === 'success' ? '#059669' : '#dc2626',
            border: `1px solid ${feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Onboarded
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{summary.totalReferrals || 0}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {agents.length} authorized field agents
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: (summary.pendingApprovals || 0) > 0 ? 'rgba(245, 158, 11, 0.4)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
              Awaiting Approval
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706' }}>{summary.pendingApprovals || 0}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pending verification to unlock app login
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Active & Approved
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>{summary.activeApproved || 0}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Granted full login & booking access
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Commissions Earned
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{(summary.totalCommissionsEarned || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            From {summary.totalBookingsCount || 0} completed farm jobs
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Award size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Agent Referral Leaderboard
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({agentStats.length} Field Agents)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {agentStats.slice(0, 4).map((agent, index) => (
            <div
              key={agent.agentId}
              style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-main)' }}>
                      #{index + 1} {agent.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {agent.phone} • <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{agent.agentCode}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                    }}
                  >
                    {agent.district}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    margin: '12px 0',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--background)',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{agent.totalReferrals}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ref</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>{agent.approvedReferrals}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>{agent.pendingReferrals}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Commission:</span>
                <strong style={{ color: 'var(--primary)' }}>₹{agent.commissionsEarned.toLocaleString()}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals Master Table Card */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}
      >
        {/* Table Filters & Search */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Status Tabs */}
          <div className="tabs-container" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Referrals ({summary.totalReferrals || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Awaiting Approval ({summary.pendingApprovals || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active / Approved ({summary.activeApproved || 0})
            </button>
          </div>

          {/* Search & Agent Filter */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-main)',
                fontSize: '13px',
              }}
            >
              <option value="all">All Field Agents</option>
              {agents.map((ag) => (
                <option key={ag._id} value={ag._id}>
                  {ag.name} ({ag.agentCode || ag.phone})
                </option>
              ))}
            </select>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search farmer or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    width: '200px',
                  }}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
                Filter
              </button>
            </form>
          </div>
        </div>

        {/* Master Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Farmer Details</th>
                <th style={{ padding: '12px 16px' }}>Referred By (Agent)</th>
                <th style={{ padding: '12px 16px' }}>Holding & Location</th>
                <th style={{ padding: '12px 16px' }}>Intake Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <RefreshCw size={18} className="spin" />
                      Loading referral records...
                    </div>
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <UserCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>No Referrals Found</div>
                    <div style={{ fontSize: '12.5px', marginTop: '4px' }}>
                      No farmer records matched the selected criteria or filters.
                    </div>
                  </td>
                </tr>
              ) : (
                referrals.map((item) => {
                  const isApproved = item.status === 'active' || item.kycStatus === 'approved';
                  const isPending = !isApproved && item.status !== 'rejected';
                  const isRejected = item.status === 'rejected';

                  return (
                    <tr
                      key={item.farmerId}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        fontSize: '13px',
                      }}
                    >
                      {/* Farmer Name & Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13.5px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.phone}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Farm: {item.farmName}
                        </div>
                      </td>

                      {/* Referring Agent */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.agent ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>🤝 {item.agent.name}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {item.agent.phone}
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              Code: {item.agent.agentCode}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Direct Registration</span>
                        )}
                      </td>

                      {/* Holding & Location */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.totalLandSize} {item.landUnit || 'Acres'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {item.village}{item.district ? `, ${item.district}` : ''}
                        </div>
                      </td>

                      {/* Onboarded Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {item.onboardedAt ? new Date(item.onboardedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {isApproved && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#059669',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Active / Approved
                          </span>
                        )}
                        {isPending && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#d97706',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={13} />
                            Pending Verification
                          </span>
                        )}
                        {isRejected && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#dc2626',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            <XCircle size={13} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveFarmer(item.farmerId, item.name)}
                              disabled={processingId === item.farmerId}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                padding: '6px 12px',
                                backgroundColor: '#059669',
                                borderColor: '#059669',
                              }}
                            >
                              <CheckCircle2 size={13} />
                              {processingId === item.farmerId ? 'Approving...' : 'Approve Farmer'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRejectFarmer(item.farmerId, item.name)}
                              disabled={processingId === item.farmerId}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                padding: '6px 10px',
                              }}
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {isApproved ? 'Login Enabled' : 'Access Restricted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

