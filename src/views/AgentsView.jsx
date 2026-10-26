import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  IndianRupee,
  Users,
  Eye,
  CheckCircle,
  Building,
  Ban,
  Shield,
  Plus,
  Edit2,
  UserPlus,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiFetch } from '../api';

export const AgentsView = ({ agents = [], onToggleUserStatus, onRefreshData }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [agentForm, setAgentForm] = useState({
    name: '',
    phone: '',
    email: '',
    villages: 'Samrala Rural, Machhiwara Hub',
    district: 'Ludhiana',
    kycStatus: 'approved',
    status: 'active',
  });

  const handleOpenOnboard = () => {
    setAgentForm({
      name: '',
      phone: '',
      email: '',
      villages: 'Samrala Rural, Machhiwara Hub',
      district: 'Ludhiana',
      kycStatus: 'approved',
      status: 'active',
    });
    setIsOnboardModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setSelectedAgent(a);
    setAgentForm({
      name: a.name,
      phone: a.phone,
      email: a.email || '',
      villages: a.coverageClusters?.map((c) => c.villageName).join(', ') || 'Nabha, Samrala',
      district: a.coverageClusters?.[0]?.district || 'Ludhiana',
      kycStatus: a.kycStatus || 'approved',
      status: a.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const villageList = agentForm.villages.split(',').map((v) => v.trim()).filter(Boolean);
      await apiFetch('/api/admin/agents', {
        method: 'POST',
        body: JSON.stringify({
          name: agentForm.name,
          phone: agentForm.phone,
          email: agentForm.email,
          villages: villageList,
          district: agentForm.district,
          kycStatus: agentForm.kycStatus,
        }),
      });
      setIsOnboardModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Onboard failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setIsProcessing(true);
    try {
      const villageList = agentForm.villages.split(',').map((v) => v.trim()).filter(Boolean);
      await apiFetch(`/api/admin/agents/${selectedAgent._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: agentForm.name,
          phone: agentForm.phone,
          email: agentForm.email,
          status: agentForm.status,
          kycStatus: agentForm.kycStatus,
          villages: villageList,
        }),
      });
      setIsEditModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.agentCode?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Top Filter & Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ width: '320px' }}>
            <Search size={16} color="#727971" />
            <input
              type="text"
              placeholder="Search by agent name, phone, code (AG-...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Agents ({agents.length})</option>
              <option value="active">Active Only</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={handleOpenOnboard}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              }}
            >
              <UserPlus size={16} />
              <span>Onboard Field Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Briefcase size={18} color="#92400e" />
            <span>Field Agent Network & Commission Hierarchy</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Agent Code & Name</th>
                <th>Phone</th>
                <th>Coverage Clusters</th>
                <th>Referred Farmers</th>
                <th>Available Comm.</th>
                <th>Pending / Vested</th>
                <th>KYC Status</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {a.agentCode}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{a.phone}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                      <MapPin size={13} color="#16a34a" />
                      <span>{a.coverageClusters?.length || 0} Assigned Villages</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {a.coverageClusters?.map((c) => c.villageName).slice(0, 2).join(', ')}
                      {(a.coverageClusters?.length || 0) > 2 ? '...' : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{a.totalReferredFarmers} Farmers</div>
                    <div style={{ fontSize: '11px', color: '#16a34a' }}>
                      {a.activeFarmersCount} Active Growers
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1b5e20' }}>
                      ₹{a.availableCommission.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ₹{a.pendingCommission.toLocaleString()} pending / ₹{a.vestedCommission.toLocaleString()} vested
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${a.kycStatus === 'approved' ? 'active' : 'pending'}`}>
                      {a.kycStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${a.status}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedAgent(a)}
                        className="btn btn-secondary btn-sm"
                        title="View Territory & Bank Dossier"
                      >
                        <Eye size={13} />
                        <span>Territory</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(a)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Field Agent Profile"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      {onToggleUserStatus && (
                        <button
                          onClick={() => {
                            const newStatus = a.status === 'active' ? 'suspended' : 'active';
                            const reason = window.prompt(`Confirm changing ${a.name} status to ${newStatus.toUpperCase()}:`, 'Administrative policy compliance');
                            if (reason !== null) {
                              onToggleUserStatus(a._id, newStatus, reason);
                            }
                          }}
                          className={`btn btn-sm ${a.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                          title={a.status === 'active' ? 'Suspend Agent Account' : 'Reactivate Agent Account'}
                        >
                          {a.status === 'active' ? <Ban size={13} /> : <Shield size={13} />}
                          <span>{a.status === 'active' ? 'Suspend' : 'Activate'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Territory & Commission Details Modal */}
      {selectedAgent && (
        <Modal
          isOpen={Boolean(selectedAgent)}
          onClose={() => setSelectedAgent(null)}
          title={`Agent Dossier — ${selectedAgent.name} (${selectedAgent.agentCode})`}
          maxWidth="640px"
          footer={
            <button onClick={() => setSelectedAgent(null)} className="btn btn-secondary">
              Close
            </button>
          }
        >
          <div>
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mobile Number</div>
                <div style={{ fontWeight: 600 }}>{selectedAgent.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</div>
                <div style={{ fontWeight: 600 }}>{selectedAgent.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available Wallet Balance</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>
                  ₹{selectedAgent.availableCommission?.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifetime Commissions Earned</div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>
                  ₹{selectedAgent.totalEarned?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} />
                <span>Registered Settlement Bank Account</span>
              </h4>
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Bank: </span>
                    <strong>{selectedAgent.bankDetails?.bankName || 'State Bank of India'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>A/C: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedAgent.bankDetails?.accountNumber || '•••• •••• 9821'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>IFSC: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedAgent.bankDetails?.ifscCode || 'SBIN0001423'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>UPI: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedAgent.bankDetails?.upiId || 'agent@sbi'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Clusters */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>Assigned Territory Villages ({selectedAgent.coverageClusters?.length || 0})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedAgent.coverageClusters?.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.villageName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Tehsil: {c.tehsil || 'Nabha'} • District: {c.district || 'Patiala'}
                      </div>
                    </div>
                    <div>
                      <span
                        className="status-pill active"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        {c.isVisited ? 'Visited' : 'Active Cluster'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboard Field Agent Modal */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Field Agent"
      >
        <form onSubmit={handleSubmitOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                placeholder="e.g. Harjot Singh"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone (+91) *</label>
              <input
                type="text"
                required
                className="form-control"
                value={agentForm.phone}
                onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Email (Optional)</label>
            <input
              type="email"
              className="form-control"
              value={agentForm.email}
              onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
              placeholder="agent@example.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Assigned Territory Villages (Comma separated)</label>
              <input
                type="text"
                required
                className="form-control"
                value={agentForm.villages}
                onChange={(e) => setAgentForm({ ...agentForm, villages: e.target.value })}
                placeholder="e.g. Samrala, Machhiwara, Khanna"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>District</label>
              <select
                className="form-control"
                value={agentForm.district}
                onChange={(e) => setAgentForm({ ...agentForm, district: e.target.value })}
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Patiala">Patiala</option>
                <option value="Sangrur">Sangrur</option>
                <option value="Fatehgarh Sahib">Fatehgarh Sahib</option>
                <option value="Bathinda">Bathinda</option>
                <option value="Amritsar">Amritsar</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Onboarding...' : 'Onboard Agent'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Field Agent Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Field Agent: ${selectedAgent?.name}`}
      >
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone</label>
              <input
                type="text"
                required
                className="form-control"
                value={agentForm.phone}
                onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Assigned Territory Villages (Comma separated)</label>
            <input
              type="text"
              required
              className="form-control"
              value={agentForm.villages}
              onChange={(e) => setAgentForm({ ...agentForm, villages: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>KYC Status</label>
              <select
                className="form-control"
                value={agentForm.kycStatus}
                onChange={(e) => setAgentForm({ ...agentForm, kycStatus: e.target.value })}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Account Status</label>
              <select
                className="form-control"
                value={agentForm.status}
                onChange={(e) => setAgentForm({ ...agentForm, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
