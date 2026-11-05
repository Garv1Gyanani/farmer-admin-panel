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
  X,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { GooglePlacesAutocomplete } from '../components/GooglePlacesAutocomplete';
import { apiFetch } from '../api';

const REGIONAL_LOCATIONS = {
  'Jaipur': ['Amber Tehsil', 'Jaipur Rural', 'Ganpati Nagar', 'Kalwar', 'Chomu', 'Sanganer', 'Bassi', 'Kotputli', 'Shahpura', 'Jamwa Ramgarh', 'Phulera', 'Jobner'],
  'Jodhpur': ['Mandore', 'Luni', 'Bilara', 'Bhopalgarh', 'Osian', 'Phalodi', 'Balesar', 'Shergarh'],
  'Alwar': ['Tijara', 'Behror', 'Kishangarh Bas', 'Kotkasim', 'Ramgarh', 'Thanagazi'],
  'Sikar': ['Fatehpur', 'Laxmangarh', 'Danta Ramgarh', 'Neem Ka Thana', 'Khandela', 'Sri Madhopur'],
  'Bikaner': ['Nokha', 'Lunkaransar', 'Kolayat', 'Khajuwala', 'Poogal', 'Dungargarh'],
  'Ajmer': ['Kishangarh', 'Beawar', 'Nasirabad', 'Kekri', 'Pushkar'],
  'Ludhiana': ['Samrala Rural', 'Machhiwara Hub', 'Khanna', 'Jagraon', 'Raikot', 'Payal'],
  'Patiala': ['Nabha', 'Rajpura', 'Samana', 'Patran'],
  'Bathinda': ['Talwandi Sabo', 'Rampura Phul', 'Maur'],
  'Amritsar': ['Ajnala', 'Majitha', 'Baba Bakala'],
};

export const AgentsView = ({ agents = [], onToggleUserStatus, onRefreshData }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [selectedAgentForCredit, setSelectedAgentForCredit] = useState(null);
  const [creditForm, setCreditForm] = useState({ amount: '', description: 'Agent Commission / Performance Bonus' });
  const [quickVillageInput, setQuickVillageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [villageSearchInput, setVillageSearchInput] = useState('');

  const [agentForm, setAgentForm] = useState({
    name: '',
    phone: '',
    email: '',
    villages: 'Amber Tehsil, Jaipur Rural',
    district: 'Jaipur',
    kycStatus: 'approved',
    status: 'active',
  });

  // Extract all unique districts dynamically from regional list + existing agent records in database
  const availableDistricts = Array.from(
    new Set([
      ...Object.keys(REGIONAL_LOCATIONS),
      ...agents.flatMap((a) => a.coverageClusters?.map((c) => c.district) || []).filter(Boolean),
    ])
  ).sort();

  const currentVillagesList = agentForm.villages
    ? agentForm.villages.split(',').map((v) => v.trim()).filter(Boolean)
    : [];

  const handleAddVillage = (villageName) => {
    const trimmed = villageName.trim();
    if (!trimmed) return;
    if (!currentVillagesList.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...currentVillagesList, trimmed].join(', ');
      setAgentForm({ ...agentForm, villages: updated });
    }
    setVillageSearchInput('');
  };

  const handleRemoveVillage = (villageName) => {
    const updated = currentVillagesList
      .filter((v) => v.toLowerCase() !== villageName.toLowerCase())
      .join(', ');
    setAgentForm({ ...agentForm, villages: updated });
  };

  // Dynamic suggested villages based on chosen district & DB records
  const allVillagesInDistrict = Array.from(
    new Set([
      ...(REGIONAL_LOCATIONS[agentForm.district] || []),
      ...agents
        .flatMap((a) => a.coverageClusters || [])
        .filter((c) => !agentForm.district || c.district?.toLowerCase() === agentForm.district.toLowerCase())
        .map((c) => c.villageName),
    ])
  ).filter((v) => !currentVillagesList.some((cv) => cv.toLowerCase() === v.toLowerCase()));

  const matchingSuggestions = villageSearchInput.trim()
    ? allVillagesInDistrict.filter((v) =>
        v.toLowerCase().includes(villageSearchInput.trim().toLowerCase())
      )
    : allVillagesInDistrict.slice(0, 8);

  const handleOpenOnboard = () => {
    setVillageSearchInput('');
    setAgentForm({
      name: '',
      phone: '',
      email: '',
      villages: 'Amber Tehsil, Jaipur Rural',
      district: 'Jaipur',
      kycStatus: 'approved',
      status: 'active',
    });
    setIsOnboardModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setVillageSearchInput('');
    setSelectedAgent(a);
    setAgentForm({
      name: a.name,
      phone: a.phone,
      email: a.email || '',
      villages: a.coverageClusters?.map((c) => c.villageName).join(', ') || 'Amber Tehsil, Jaipur Rural',
      district: a.coverageClusters?.[0]?.district || 'Jaipur',
      kycStatus: a.kycStatus || 'approved',
      status: a.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const villageList = (Array.isArray(agentForm.villages)
        ? agentForm.villages
        : agentForm.villages.split(',')
      ).map((v) => v.trim()).filter(Boolean);

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
      const villageList = (Array.isArray(agentForm.villages)
        ? agentForm.villages
        : agentForm.villages.split(',')
      ).map((v) => v.trim()).filter(Boolean);

      await apiFetch(`/api/admin/agents/${selectedAgent._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: agentForm.name,
          phone: agentForm.phone,
          email: agentForm.email,
          status: agentForm.status,
          kycStatus: agentForm.kycStatus,
          villages: villageList,
          district: agentForm.district,
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

  const handleQuickAddAreaToAgent = async (agent, newVillageName) => {
    const trimmed = (newVillageName || '').trim();
    if (!trimmed) return;
    const existingVillages = agent.coverageClusters?.map((c) => c.villageName) || [];
    if (existingVillages.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Village "${trimmed}" is already assigned to ${agent.name}.`);
      return;
    }
    const updatedList = [...existingVillages, trimmed];
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/agents/${agent._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          villages: updatedList,
          district: agent.coverageClusters?.[0]?.district || agentForm.district || 'Jaipur',
        }),
      });
      const updatedClusters = [
        ...(agent.coverageClusters || []),
        { _id: `temp-${Date.now()}`, villageName: trimmed, district: agent.coverageClusters?.[0]?.district || 'Jaipur', isVisited: false, farmerCount: 0 },
      ];
      setSelectedAgent({ ...agent, coverageClusters: updatedClusters });
      setQuickVillageInput('');
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Failed to allocate area: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickRemoveAreaFromAgent = async (agent, villageNameToRemove) => {
    if (!window.confirm(`Are you sure you want to de-allocate "${villageNameToRemove}" from ${agent.name}?`)) return;
    const updatedList = (agent.coverageClusters?.map((c) => c.villageName) || [])
      .filter((v) => v.toLowerCase() !== villageNameToRemove.toLowerCase());
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/agents/${agent._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          villages: updatedList,
          district: agent.coverageClusters?.[0]?.district || 'Jaipur',
        }),
      });
      const updatedClusters = (agent.coverageClusters || [])
        .filter((c) => c.villageName.toLowerCase() !== villageNameToRemove.toLowerCase());
      setSelectedAgent({ ...agent, coverageClusters: updatedClusters });
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Failed to remove area: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCredit = (a) => {
    setSelectedAgentForCredit(a);
    setCreditForm({ amount: '', description: 'Agent Performance Incentive' });
    setIsCreditModalOpen(true);
  };

  const handleSubmitCredit = async (e) => {
    e.preventDefault();
    if (!selectedAgentForCredit) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/agents/${selectedAgentForCredit._id}/wallet/credit`, {
        method: 'POST',
        body: JSON.stringify(creditForm),
      });
      setIsCreditModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Credit failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return statusFilter === 'all' || a.status === statusFilter;
    }
    const matchesSearch =
      a.name.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.agentCode?.toLowerCase().includes(q) ||
      a.coverageClusters?.some(
        (c) =>
          c.villageName?.toLowerCase().includes(q) ||
          c.district?.toLowerCase().includes(q)
      );

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                        <MapPin size={13} color="#16a34a" />
                        <span>{a.coverageClusters?.length || 0} Villages</span>
                      </div>
                      <button
                        onClick={() => setSelectedAgent(a)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}
                        title="Add more villages / areas"
                      >
                        + Add Area
                      </button>
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
                    <div style={{ fontWeight: 700, color: '#1b5e20', fontSize: '14px' }}>
                      ₹{(a.availableCommission || 0).toLocaleString()}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      <button
                        onClick={() => handleOpenCredit(a)}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '4px',
                          color: '#166534',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          cursor: 'pointer',
                        }}
                        title="Credit manual commission bonus or adjustment"
                      >
                        + Credit Wallet
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ₹{(a.pendingCommission || 0).toLocaleString()} pending / ₹{(a.vestedCommission || 0).toLocaleString()} vested
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#16a34a" />
                  <span>Assigned Territory Villages ({selectedAgent.coverageClusters?.length || 0})</span>
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  District: <strong>{selectedAgent.coverageClusters?.[0]?.district || 'Jaipur'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedAgent.coverageClusters?.map((c) => (
                  <div
                    key={c._id || c.villageName}
                    style={{
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.villageName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Cluster District: {c.district || selectedAgent.coverageClusters?.[0]?.district || 'Jaipur'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="status-pill active"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        {c.isVisited || c.visited ? 'Visited' : 'Active Cluster'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickRemoveAreaFromAgent(selectedAgent, c.villageName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                        }}
                        title={`De-allocate ${c.villageName}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fast Inline Area Allocator */}
              <div style={{ marginTop: '14px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px dashed #86efac' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} color="#16a34a" />
                  <span>Assign More Areas / Villages to {selectedAgent.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <GooglePlacesAutocomplete
                      placeholder={`Search village, tehsil or locality to add...`}
                      value={quickVillageInput}
                      onChange={(val) => setQuickVillageInput(val)}
                      onSelect={(place) => {
                        const villageName = place.mainText || place.description.split(',')[0];
                        handleQuickAddAreaToAgent(selectedAgent, villageName);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap', height: '42px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      if (quickVillageInput.trim()) {
                        handleQuickAddAreaToAgent(selectedAgent, quickVillageInput.trim());
                      }
                    }}
                  >
                    <Plus size={15} /> Allocate Area
                  </button>
                </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>District *</label>
              <GooglePlacesAutocomplete
                required
                placeholder="Search district with Google Maps (e.g. Jaipur, Ludhiana)..."
                value={agentForm.district}
                onChange={(val) => setAgentForm({ ...agentForm, district: val })}
                onSelect={(place) => {
                  const districtName = place.mainText || place.description.split(',')[0];
                  setAgentForm({ ...agentForm, district: districtName });
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Assigned Territory Villages
            </label>

            {/* Selected village chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                minHeight: '36px',
                padding: '8px',
                background: 'var(--bg-secondary, #fafafa)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '8px',
                marginBottom: '8px',
                alignItems: 'center',
              }}
            >
              {currentVillagesList.map((village) => (
                <span
                  key={village}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#e8f5e9',
                    color: '#1b5e20',
                    fontWeight: 600,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    border: '1px solid #c8e6c9',
                  }}
                >
                  {village}
                  <button
                    type="button"
                    onClick={() => handleRemoveVillage(village)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#2e7d32',
                    }}
                    title="Remove village"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {currentVillagesList.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No villages selected yet. Search or click suggestions below.
                </span>
              )}
            </div>

            {/* Dynamic village search / add bar with Google Places Autocomplete */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                  placeholder={`Search address or village with Google Maps in ${agentForm.district || 'area'}...`}
                  value={villageSearchInput}
                  onChange={(val) => setVillageSearchInput(val)}
                  onSelect={(place) => {
                    const villageOrLocality = place.mainText || place.description.split(',')[0];
                    handleAddVillage(villageOrLocality);
                    setVillageSearchInput('');
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', height: '42px' }}
                onClick={() => {
                  if (villageSearchInput.trim()) {
                    handleAddVillage(villageSearchInput.trim());
                  }
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Suggestions list */}
            {matchingSuggestions.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Quick add suggestions for <strong>{agentForm.district}</strong>:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {matchingSuggestions.map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => handleAddVillage(sugg)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '3px 9px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#16a34a';
                        e.currentTarget.style.color = '#16a34a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Plus size={11} /> {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || currentVillagesList.length === 0}
              className="btn btn-primary"
            >
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>District *</label>
              <input
                list="district-options-edit"
                type="text"
                required
                className="form-control"
                value={agentForm.district}
                onChange={(e) => setAgentForm({ ...agentForm, district: e.target.value })}
                placeholder="Search district (e.g. Jaipur, Ludhiana)..."
              />
              <datalist id="district-options-edit">
                {availableDistricts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                className="form-control"
                value={agentForm.email}
                onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Assigned Territory Villages
            </label>

            {/* Selected village chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                minHeight: '36px',
                padding: '8px',
                background: 'var(--bg-secondary, #fafafa)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '8px',
                marginBottom: '8px',
                alignItems: 'center',
              }}
            >
              {currentVillagesList.map((village) => (
                <span
                  key={village}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#e8f5e9',
                    color: '#1b5e20',
                    fontWeight: 600,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    border: '1px solid #c8e6c9',
                  }}
                >
                  {village}
                  <button
                    type="button"
                    onClick={() => handleRemoveVillage(village)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#2e7d32',
                    }}
                    title="Remove village"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {currentVillagesList.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No villages selected yet. Search or click suggestions below.
                </span>
              )}
            </div>

            {/* Dynamic village search / add bar with Google Places Autocomplete */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                  placeholder={`Search address or village with Google Maps in ${agentForm.district || 'area'}...`}
                  value={villageSearchInput}
                  onChange={(val) => setVillageSearchInput(val)}
                  onSelect={(place) => {
                    const villageOrLocality = place.mainText || place.description.split(',')[0];
                    handleAddVillage(villageOrLocality);
                    setVillageSearchInput('');
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', height: '42px' }}
                onClick={() => {
                  if (villageSearchInput.trim()) {
                    handleAddVillage(villageSearchInput.trim());
                  }
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Suggestions list */}
            {matchingSuggestions.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Quick add suggestions for <strong>{agentForm.district}</strong>:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {matchingSuggestions.map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => handleAddVillage(sugg)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '3px 9px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#16a34a';
                        e.currentTarget.style.color = '#16a34a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Plus size={11} /> {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

      {/* Credit Agent Commission Wallet Modal */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Credit Agent Commission Wallet"
      >
        <form onSubmit={handleSubmitCredit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '12px', color: '#166534' }}>Target Field Agent</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#14532d' }}>
              {selectedAgentForCredit?.name} ({selectedAgentForCredit?.agentCode})
            </div>
            <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px' }}>
              Current Commission Balance: <strong>₹{(selectedAgentForCredit?.availableCommission || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Credit Amount (₹) *</label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 5000"
              className="form-control"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Credit Reason / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Harvest season onboarding incentive / Commission adjustment"
              className="form-control"
              value={creditForm.description}
              onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsCreditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing || !creditForm.amount} className="btn btn-primary">
              {isProcessing ? 'Crediting...' : `Confirm Credit ₹${Number(creditForm.amount || 0).toLocaleString()}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
