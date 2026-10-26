import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
  Eye,
  ExternalLink,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiFetch } from '../api';

export const VerificationQueueView = ({ queueData, onProcessVerification, isProcessing }) => {
  const [viewMode, setViewMode] = useState('queue'); // 'queue' or 'history'
  const [activeTab, setActiveTab] = useState('farmers'); // 'farmers', 'agents', 'providers'
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'review', 'reject', 'action_needed'
  const [rejectReason, setRejectReason] = useState('');

  // History state
  const [historyData, setHistoryData] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyRoleFilter, setHistoryRoleFilter] = useState('all');

  const counts = queueData?.counts || {};
  const queue = queueData?.queue || {};

  const currentList =
    activeTab === 'farmers'
      ? queue.farmers || []
      : activeTab === 'agents'
      ? queue.agents || []
      : queue.providers || [];

  useEffect(() => {
    if (viewMode === 'history' && !historyData) {
      setIsLoadingHistory(true);
      apiFetch('/api/admin/verification/history')
        .then((res) => {
          if (res.history) setHistoryData(res.history);
        })
        .catch((err) => console.warn('History fetch error:', err))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [viewMode, historyData]);

  const handleOpenReview = (item) => {
    setSelectedUser(item);
    setModalMode('review');
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    const role = activeTab === 'farmers' ? 'farmer' : activeTab === 'agents' ? 'agent' : 'provider';
    await onProcessVerification(role, selectedUser._id, 'approve');
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleRejectSubmit = async () => {
    if (!selectedUser) return;
    const role = activeTab === 'farmers' ? 'farmer' : activeTab === 'agents' ? 'agent' : 'provider';
    await onProcessVerification(role, selectedUser._id, 'reject', rejectReason);
    setModalMode(null);
    setSelectedUser(null);
    setRejectReason('');
  };

  const handleActionNeededSubmit = async () => {
    if (!selectedUser) return;
    const role = activeTab === 'farmers' ? 'farmer' : activeTab === 'agents' ? 'agent' : 'provider';
    await onProcessVerification(role, selectedUser._id, 'action_needed', rejectReason);
    setModalMode(null);
    setSelectedUser(null);
    setRejectReason('');
  };

  // Compile history items
  const historyList = [];
  if (historyData) {
    if (historyRoleFilter === 'all' || historyRoleFilter === 'farmer') {
      (historyData.farmers || []).forEach((f) => historyList.push({ ...f, userRole: 'farmer' }));
    }
    if (historyRoleFilter === 'all' || historyRoleFilter === 'agent') {
      (historyData.agents || []).forEach((a) => historyList.push({ ...a, userRole: 'agent' }));
    }
    if (historyRoleFilter === 'all' || historyRoleFilter === 'provider') {
      (historyData.providers || []).forEach((p) => historyList.push({ ...p, userRole: 'provider' }));
    }
  }

  return (
    <div>
      {/* View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${viewMode === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('queue')}
          >
            <ShieldCheck size={16} />
            <span>Pending KYC Queue ({counts.total || 0})</span>
          </button>
          <button
            className={`btn ${viewMode === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('history')}
          >
            <History size={16} />
            <span>Verification Audit History</span>
          </button>
        </div>

        {viewMode === 'history' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Role:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={historyRoleFilter}
              onChange={(e) => setHistoryRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers Only</option>
              <option value="agent">Agents Only</option>
              <option value="provider">Machinery Fleets Only</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'queue' ? (
        <>
          {/* Category Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
              onClick={() => setActiveTab('farmers')}
            >
              <span>Farmers KYC</span>
              <span className="pill-count">{counts.farmers || 0}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
              onClick={() => setActiveTab('agents')}
            >
              <span>Field Agents KYC</span>
              <span className="pill-count">{counts.agents || 0}</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
              onClick={() => setActiveTab('providers')}
            >
              <span>Fleet & Provider KYC</span>
              <span className="pill-count">{counts.providers || 0}</span>
            </button>
          </div>

          {/* Verification Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ShieldCheck size={18} color="#2e7d32" />
                <span>Pending {activeTab.toUpperCase()} Verification Requests</span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Turnaround SLA: 24 Hours
              </span>
            </div>

            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Contact Details</th>
                    <th>Target Details</th>
                    <th>Document Types</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.userId?.name || 'Applicant'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          ID: {item.userId?._id?.slice(-8)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)' }}>{item.userId?.phone}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.userId?.email || 'No email provided'}
                        </div>
                      </td>
                      <td>
                        {activeTab === 'farmers' && (
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.totalLandSize} Acres</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.village || 'Nabha, Patiala'}
                            </div>
                          </div>
                        )}
                        {activeTab === 'agents' && (
                          <div>
                            <span style={{ fontWeight: 600 }}>Code: {item.agentCode}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.coverageClusters?.length || 0} Villages
                            </div>
                          </div>
                        )}
                        {activeTab === 'providers' && (
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.enterpriseName}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {item.machineryFleet?.length || 0} Machinery Units
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(item.kycDocuments || []).map((doc, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '10.5px',
                                backgroundColor: '#edf2eb',
                                color: '#17351f',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {doc.documentType?.replace('_', ' ').toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${item.kycStatus}`}>
                          {item.kycStatus === 'action_needed' ? 'INFO NEEDED' : item.kycStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--text-muted)" />
                          <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          <Eye size={13} />
                          <span>Review Dossier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentList.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} color="#15803d" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, margin: 0 }}>Queue Clear!</p>
                <p style={{ fontSize: '12.5px', margin: '4px 0 0' }}>
                  No pending {activeTab} verification requests at this time.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History View */
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <History size={18} color="var(--primary)" />
              <span>Processed KYC Verifications ({historyList.length})</span>
            </div>
          </div>

          {isLoadingHistory ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading audit history...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Decision</th>
                    <th>Audited Date</th>
                    <th>Remarks / Notes</th>
                    <th>Document Links</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.userId?.name || 'Applicant'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.farmName || item.enterpriseName || `Code: ${item.agentCode || 'N/A'}`}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#edf2eb',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.userRole?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                          {item.userId?.phone}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${item.kycStatus === 'approved' ? 'active' : 'urgent'}`}>
                          {item.kycStatus === 'approved' ? 'APPROVED' : 'REJECTED'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px' }}>
                          {new Date(item.kycVerifiedAt || item.updatedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {item.kycRejectionReason || 'Identity & land title verified against official records.'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(item.kycDocuments || []).map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '3px 6px' }}
                            >
                              <ExternalLink size={11} />
                              <span>{doc.documentType}</span>
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review & Decision Modal */}
      {selectedUser && (
        <Modal
          isOpen={modalMode === 'review'}
          onClose={() => setModalMode(null)}
          title={`Review KYC Application — ${selectedUser.userId?.name}`}
          maxWidth="680px"
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setModalMode('action_needed')}
                className="btn btn-secondary"
                disabled={isProcessing}
              >
                <AlertCircle size={15} color="#ea580c" />
                <span>Request Info</span>
              </button>
              <button
                onClick={() => setModalMode('reject')}
                className="btn btn-danger"
                disabled={isProcessing}
              >
                <XCircle size={15} />
                <span>Reject</span>
              </button>
              <button
                onClick={handleApprove}
                className="btn btn-success"
                disabled={isProcessing}
              >
                <CheckCircle size={15} />
                <span>{isProcessing ? 'Verifying...' : 'Approve & Activate Account'}</span>
              </button>
            </div>
          }
        >
          <div>
            {/* Applicant Summary */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Applicant Name:</span>{' '}
                <strong>{selectedUser.userId?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span>{' '}
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.userId?.phone}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Role Category:</span>{' '}
                <strong style={{ textTransform: 'uppercase' }}>{activeTab}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registration Date:</span>{' '}
                <strong>{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* Document Review Checklist */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              Submitted Verification Proofs ({selectedUser.kycDocuments?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(selectedUser.kycDocuments || []).map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {doc.documentType?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Status: <span style={{ textTransform: 'capitalize' }}>{doc.status || 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink size={13} />
                    <span>View Official Document</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {selectedUser && (
        <Modal
          isOpen={modalMode === 'reject'}
          onClose={() => setModalMode('review')}
          title="Reject Verification Application"
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalMode('review')} className="btn btn-secondary">
                Back
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn btn-danger"
                disabled={isProcessing || !rejectReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Specify the exact policy non-compliance reason. This reason will be logged in the audit ledger
              and dispatched directly to the applicant's mobile app:
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g. Blurred Aadhaar card, Land record does not match applicant name, Expired registration certificate..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}

      {/* Request Info Modal */}
      {selectedUser && (
        <Modal
          isOpen={modalMode === 'action_needed'}
          onClose={() => setModalMode('review')}
          title="Request Additional Documentation"
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalMode('review')} className="btn btn-secondary">
                Back
              </button>
              <button
                onClick={handleActionNeededSubmit}
                className="btn btn-primary"
                disabled={isProcessing || !rejectReason.trim()}
              >
                Send Request to Applicant
              </button>
            </div>
          }
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Inform the applicant what supplemental proof is required to complete verification:
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g. Please re-upload page 2 of Jamabandi showing Khasra number, or upload clear photo of tractor RC..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
