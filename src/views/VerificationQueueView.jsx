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
  Truck,
  Building,
  CreditCard,
  MapPin,
  User,
  Phone,
  Tag,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { API_BASE_URL, apiFetch } from '../api';

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
                              {(doc.title || doc.type || doc.documentType || 'Document').replace(/_/g, ' ').toUpperCase()}
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
                              href={doc.fileUrl || doc.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '3px 6px' }}
                            >
                              <ExternalLink size={11} />
                              <span>{doc.title || doc.type || doc.documentType || 'Doc'}</span>
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
          title={`Review Application — ${selectedUser.userId?.name || selectedUser.enterpriseName || 'Applicant'}`}
          maxWidth="760px"
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Applicant & Account Summary */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                padding: '16px 18px',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Applicant Name</span>
                <strong style={{ fontSize: '14px' }}>{selectedUser.userId?.name || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Mobile Number</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.userId?.phone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Role Category</span>
                <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                  {activeTab}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>KYC Status</span>
                <span
                  className={`badge ${
                    selectedUser.kycStatus === 'approved'
                      ? 'badge-success'
                      : selectedUser.kycStatus === 'action_needed'
                      ? 'badge-warning'
                      : 'badge-warning'
                  }`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {selectedUser.kycStatus || 'Pending'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Registration Date</span>
                <strong>{new Date(selectedUser.createdAt || selectedUser.userId?.createdAt || Date.now()).toLocaleDateString()}</strong>
              </div>
              {selectedUser.contractorId && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Contractor ID</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{selectedUser.contractorId}</strong>
                </div>
              )}
              {selectedUser.agentCode && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Agent Code</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{selectedUser.agentCode}</strong>
                </div>
              )}
            </div>

            {/* Provider Enterprise & Operations Details */}
            {(activeTab === 'providers' || selectedUser.enterpriseName) && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <Building size={16} />
                  <span>Enterprise & Service Coverage</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Enterprise Name:</span>
                    <strong>{selectedUser.enterpriseName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Primary Category:</span>
                    <strong>{selectedUser.primaryCategory || 'Harvesting & Mechanization'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Operational Radius:</span>
                    <strong>{selectedUser.coverageRadiusKm || 35} km</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Business PAN:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.businessPan || 'Not Provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>GSTIN:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.gstin || 'Not Provided'}</strong>
                  </div>
                </div>

                {selectedUser.serviceTags && selectedUser.serviceTags.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Offered Services:</span>
                    {selectedUser.serviceTags.map((tag, i) => (
                      <span key={i} className="badge badge-secondary" style={{ fontSize: '11px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Machinery Fleet */}
            {(activeTab === 'providers' || (selectedUser.machineryFleet && selectedUser.machineryFleet.length > 0)) && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <Truck size={16} />
                  <span>Machinery & Equipment Fleet ({selectedUser.machineryFleet?.length || 0})</span>
                </h4>
                {selectedUser.machineryFleet && selectedUser.machineryFleet.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ fontSize: '12.5px', marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th>Equipment Type</th>
                          <th>Model & Specs</th>
                          <th>Registration Plate</th>
                          <th>Operator / Driver</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.machineryFleet.map((machine, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{machine.machineryType || 'Tractor'}</td>
                            <td>
                              {machine.model || 'Standard'} {machine.horsepower ? `(${machine.horsepower} HP)` : ''}
                              {machine.year ? ` • ${machine.year}` : ''}
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                {machine.regPlateNumber || 'N/A'}
                              </span>
                            </td>
                            <td>
                              {machine.driverName || 'Self / Operator'}
                              {machine.driverPhone ? (
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  {machine.driverPhone}
                                </span>
                              ) : null}
                            </td>
                            <td>
                              <span className={`badge ${machine.isAvailable !== false ? 'badge-success' : 'badge-secondary'}`}>
                                {machine.isAvailable !== false ? 'Ready' : 'Deployed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                    No machinery added yet during onboarding.
                  </div>
                )}
              </div>
            )}

            {/* Bank Payout Information */}
            {selectedUser.bankDetails && (selectedUser.bankDetails.accountNumber || selectedUser.bankDetails.bankName) && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <CreditCard size={16} />
                  <span>Bank & Payout Account</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Account Holder:</span>
                    <strong>{selectedUser.bankDetails.accountHolder || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bank Name:</span>
                    <strong>{selectedUser.bankDetails.bankName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Account Number:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.bankDetails.accountNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>IFSC Code:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.bankDetails.ifsc || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Farmer Farm Details */}
            {activeTab === 'farmers' && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <MapPin size={16} />
                  <span>Farm Parcel & Location</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Farm Name:</span>
                    <strong>{selectedUser.farmName || 'Farm Holding'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Land Size:</span>
                    <strong>{selectedUser.totalLandSize || 0} {selectedUser.landUnit || 'acres'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Farming Background:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{selectedUser.farmingBackground || 'Owner Cultivator'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Village & District:</span>
                    <strong>
                      {[selectedUser.village, selectedUser.tehsilBlock, selectedUser.district, selectedUser.state, selectedUser.pinCode]
                        .filter(Boolean)
                        .join(', ') || 'Not Specified'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Document Review Checklist */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--primary)" />
                <span>Submitted Verification Proofs ({selectedUser.kycDocuments?.length || 0})</span>
              </h4>

              {selectedUser.kycDocuments && selectedUser.kycDocuments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedUser.kycDocuments.map((doc, idx) => {
                    const rawFile = doc.fileUrl || doc.documentUrl;
                    const docUrl = rawFile
                      ? rawFile.startsWith('http://') || rawFile.startsWith('https://')
                        ? rawFile
                        : `${API_BASE_URL}${rawFile.startsWith('/') ? '' : '/'}${rawFile}`
                      : null;

                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--surface)',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(26, 93, 26, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FileText size={18} color="var(--primary)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                              {doc.title || (doc.type || doc.documentType || 'OFFICIAL PROOF').replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{doc.status || 'Pending'}</span>
                              {doc.uploadedAt ? ` • Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}` : ''}
                            </div>
                          </div>
                        </div>

                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontWeight: 600 }}
                          >
                            <ExternalLink size={13} />
                            <span>View Proof</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No file attached</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                  }}
                >
                  <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#92400e', display: 'block' }}>No Verification Proof Documents Uploaded Yet</strong>
                    <span style={{ color: '#b45309', fontSize: '12px' }}>
                      The user skipped document upload during onboarding or document upload is currently pending.
                    </span>
                  </div>
                </div>
              )}
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
