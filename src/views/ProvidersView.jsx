import React, { useState } from 'react';
import {
  Tractor,
  Search,
  Star,
  Activity,
  CheckCircle,
  Eye,
  IndianRupee,
  Layers,
  Phone,
  Ban,
  Shield,
  Plus,
  Edit2,
  UserPlus,
  ExternalLink,
  FileText,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiFetch } from '../api';

export const ProvidersView = ({
  providers = [],
  onToggleUserStatus,
  onProcessVerification,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewProvider, setReviewProvider] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [providerForm, setProviderForm] = useState({
    name: '',
    phone: '',
    email: '',
    enterpriseName: '',
    primaryCategory: 'Land Preparation & Tillage',
    coverageRadiusKm: 25,
    machineryType: 'Tractor 4WD',
    machineryModel: 'John Deere 5310 4WD',
    regPlateNumber: 'PB-10-AZ-1122',
    horsepower: 55,
    kycStatus: 'approved',
    status: 'active',
    isOnline: true,
  });

  const handleOpenOnboard = () => {
    setProviderForm({
      name: '',
      phone: '',
      email: '',
      enterpriseName: '',
      primaryCategory: 'Land Preparation & Tillage',
      coverageRadiusKm: 25,
      machineryType: 'Tractor 4WD',
      machineryModel: 'John Deere 5310 4WD',
      regPlateNumber: 'PB-10-AZ-1122',
      horsepower: 55,
      kycStatus: 'approved',
      status: 'active',
      isOnline: true,
    });
    setIsOnboardModalOpen(true);
  };

  const handleOpenEdit = (p, e) => {
    if (e) e.stopPropagation();
    setReviewProvider(null);
    setEditingProvider(p);
    setProviderForm({
      name: p.name || '',
      phone: p.phone || '',
      email: p.email || '',
      enterpriseName: p.enterpriseName || '',
      primaryCategory: p.primaryCategory || 'Land Preparation & Tillage',
      coverageRadiusKm: p.coverageRadiusKm || 25,
      machineryType: p.fleet?.[0]?.machineryType || 'Tractor 4WD',
      machineryModel: p.fleet?.[0]?.model || 'Standard Machinery',
      regPlateNumber: p.fleet?.[0]?.regPlateNumber || 'PB-10-AZ-1122',
      horsepower: p.fleet?.[0]?.horsepower || 55,
      kycStatus: p.kycStatus || 'approved',
      status: p.status || 'active',
      isOnline: Boolean(p.isOnline),
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await apiFetch('/api/admin/providers', {
        method: 'POST',
        body: JSON.stringify(providerForm),
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
    if (!editingProvider) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/providers/${editingProvider._id}`, {
        method: 'PUT',
        body: JSON.stringify(providerForm),
      });
      setIsEditModalOpen(false);
      setEditingProvider(null);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = providers.filter(
    (p) => p.kycStatus === 'pending' || p.status === 'pending_verification'
  ).length;

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.enterpriseName?.toLowerCase().includes(search.toLowerCase()) ||
      p.contractorId?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);

    let matchesStatus = true;
    if (statusFilter === 'online') {
      matchesStatus = Boolean(p.isOnline);
    } else if (statusFilter === 'pending') {
      matchesStatus = p.kycStatus === 'pending' || p.status === 'pending_verification';
    } else if (statusFilter !== 'all') {
      matchesStatus = p.status === statusFilter;
    }

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
              placeholder="Search enterprise name, contractor ID, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Service Providers ({providers.length})</option>
              <option value="pending">Pending Review / KYC ({pendingCount})</option>
              <option value="online">Online / Ready Only</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
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
              <span>Onboard Fleet Operator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Tractor size={18} color="#0369a1" />
            <span>Agricultural Machinery Operators & Fleets</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Contractor & Enterprise</th>
                <th>Contact</th>
                <th>Dispatch Status</th>
                <th>Fleet Composition</th>
                <th>Performance KPIs</th>
                <th>KYC Status</th>
                <th>Account Status</th>
                <th>Total Earned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {p.contractorId}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.enterpriseName}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Proprietor: {p.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)' }}>{p.phone}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Radius: {p.coverageRadiusKm} KM</div>
                  </td>
                  <td>
                    {p.isOnline ? (
                      <span
                        className="status-pill active"
                        style={{ gap: '6px' }}
                      >
                        <span className="pulse-beacon" style={{ display: 'inline-block' }}></span>
                        <span>ONLINE (Ready)</span>
                      </span>
                    ) : (
                      <span className="status-pill" style={{ backgroundColor: '#f1f5eb', color: '#727971' }}>
                        OFFLINE
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.machineryFleet?.length || 0} Registered Units</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.machineryFleet?.map((m) => m.machineryType).slice(0, 2).join(', ')}
                      {(p.machineryFleet?.length || 0) > 2 ? '...' : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: '#b7791f' }}>
                        <Star size={13} fill="#b7791f" />
                        {p.metrics?.rating || 4.9}
                      </span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        ({p.metrics?.acceptanceRate || 98}% Accept)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${p.kycStatus === 'approved' ? 'active' : 'pending'}`}>
                      {p.kycStatus?.toUpperCase() || 'APPROVED'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${p.status}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#1b5e20' }}>
                      ₹{p.earnings?.totalAllTime?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {(p.kycStatus === 'pending' || p.status === 'pending_verification') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditModalOpen(false);
                            setReviewProvider(p);
                          }}
                          className="btn btn-sm btn-warning"
                          style={{
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                          }}
                          title="Review & Verify Submitted KYC"
                        >
                          <Shield size={13} />
                          <span>Review</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleOpenEdit(p, e)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                        title="Edit Fleet Operator Profile"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      {onToggleUserStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatus = p.status === 'active' ? 'suspended' : 'active';
                            const reason = window.prompt(`Confirm changing ${p.enterpriseName} status to ${newStatus.toUpperCase()}:`, 'Operational machinery audit');
                            if (reason !== null) {
                              onToggleUserStatus(p._id, newStatus, reason);
                            }
                          }}
                          className={`btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                          style={{
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                          }}
                          title={p.status === 'active' ? 'Suspend Fleet Account' : 'Reactivate Fleet Account'}
                        >
                          {p.status === 'active' ? <Ban size={13} /> : <Shield size={13} />}
                          <span>{p.status === 'active' ? 'Suspend' : 'Activate'}</span>
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

      {/* Fleet & KYC Review Dossier Modal */}
      {reviewProvider && (
        <Modal
          isOpen={Boolean(reviewProvider)}
          onClose={() => setReviewProvider(null)}
          title={`Provider Review & Verification — ${reviewProvider.enterpriseName || reviewProvider.name}`}
          maxWidth="750px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                {onProcessVerification && (reviewProvider.kycStatus === 'pending' || reviewProvider.status === 'pending_verification') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Approve verification for ${reviewProvider.enterpriseName || reviewProvider.name}?`)) {
                          await onProcessVerification('provider', reviewProvider._id, 'approve');
                          setReviewProvider(null);
                          if (onRefreshData) onRefreshData();
                        }
                      }}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                    >
                      <CheckCircle size={15} />
                      <span>Approve Provider</span>
                    </button>

                    <button
                      onClick={async () => {
                        const reason = window.prompt('Enter reason for requesting additional changes / rejection:');
                        if (reason) {
                          await onProcessVerification('provider', reviewProvider._id, 'action_needed', reason);
                          setReviewProvider(null);
                          if (onRefreshData) onRefreshData();
                        }
                      }}
                      className="btn btn-danger"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <XCircle size={15} />
                      <span>Request Changes</span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setReviewProvider(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          }
        >
          <div>
            {/* Enterprise & Proprietor Overview Header */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Contractor & Enterprise</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{reviewProvider.enterpriseName}</strong>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#0369a1', marginTop: '2px' }}>
                  ID: {reviewProvider.contractorId}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Proprietor & Contact</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{reviewProvider.name}</strong>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {reviewProvider.phone} {reviewProvider.email ? `• ${reviewProvider.email}` : ''}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Primary Category</span>
                <span style={{ fontWeight: 600 }}>{reviewProvider.primaryCategory || 'Harvesting & Mechanization'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Operational Coverage</span>
                <span style={{ fontWeight: 600 }}>{reviewProvider.coverageRadiusKm || 25} KM Radius</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Jobs Completed</div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>
                  {reviewProvider.metrics?.completedJobs || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acreage Worked</div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>
                  {reviewProvider.metrics?.totalAcreageWorked || 0} Ac
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KYC Status</div>
                <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>
                  <span className={`status-pill ${reviewProvider.kycStatus === 'approved' ? 'active' : 'pending'}`}>
                    {reviewProvider.kycStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wallet Balance</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{reviewProvider.availableBalance?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Submitted Verification & KYC Documents section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="var(--primary)" />
                <span>Submitted Verification Documents ({reviewProvider.kycDocuments?.length || 0})</span>
              </h4>

              {(!reviewProvider.kycDocuments || reviewProvider.kycDocuments.length === 0) ? (
                <div style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No verification documents uploaded yet (Operator skipped or pending upload).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reviewProvider.kycDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        backgroundColor: 'var(--surface)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px' }}>
                          {doc.title || doc.type?.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Type: <strong style={{ textTransform: 'capitalize' }}>{doc.type?.replace(/_/g, ' ')}</strong> • Uploaded:{' '}
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-pill ${doc.status === 'approved' ? 'active' : 'pending'}`} style={{ fontSize: '11px' }}>
                          {doc.status?.toUpperCase() || 'PENDING'}
                        </span>

                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                          >
                            <ExternalLink size={12} />
                            <span>View Document</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Machinery Fleet Listing */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tractor size={16} />
                <span>Certified Farm Machinery Units ({reviewProvider.machineryFleet?.length || 0})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(!reviewProvider.machineryFleet || reviewProvider.machineryFleet.length === 0) ? (
                  <div style={{ padding: '14px', backgroundColor: 'var(--surface)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No machinery units registered yet.
                  </div>
                ) : (
                  reviewProvider.machineryFleet.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border-color)',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>
                          {m.brand ? `${m.brand} ` : ''}{m.model} ({m.machineryType})
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Reg: <strong style={{ fontFamily: 'var(--font-mono)' }}>{m.regPlateNumber || m.registrationNumber || 'N/A'}</strong> • {m.horsepower || m.horsepowerHp || 55} HP • Year: {m.year || m.yearOfManufacture || '2023'}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`status-pill ${m.isAvailable !== false ? 'active' : 'urgent'}`}
                          style={{ fontSize: '11px' }}
                        >
                          {m.isAvailable !== false ? 'Operational' : 'Maintenance'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboard Fleet Operator Modal */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Fleet Operator / Contractor"
      >
        <form onSubmit={handleSubmitOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Proprietor Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.name}
                onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                placeholder="e.g. Jaswinder Singh"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile (+91) *</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.phone}
                onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Enterprise / Agency Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.enterpriseName}
                onChange={(e) => setProviderForm({ ...providerForm, enterpriseName: e.target.value })}
                placeholder="e.g. Malwa Custom Hiring & Drone Center"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Coverage Radius (KM)</label>
              <input
                type="number"
                required
                className="form-control"
                value={providerForm.coverageRadiusKm}
                onChange={(e) => setProviderForm({ ...providerForm, coverageRadiusKm: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Initial Machinery</label>
              <select
                className="form-control"
                value={providerForm.machineryType}
                onChange={(e) => setProviderForm({ ...providerForm, machineryType: e.target.value })}
              >
                <option value="Tractor 4WD">Tractor 4WD</option>
                <option value="Combine Harvester">Combine Harvester</option>
                <option value="Agri-Drone Sprayer">Agri-Drone Sprayer</option>
                <option value="Laser Land Leveler">Laser Land Leveler</option>
                <option value="Rotavator">Rotavator</option>
                <option value="Precision Seed Drill">Precision Seed Drill</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Model / Brand</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.machineryModel}
                onChange={(e) => setProviderForm({ ...providerForm, machineryModel: e.target.value })}
                placeholder="e.g. John Deere 5310"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Reg Plate Number</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.regPlateNumber}
                onChange={(e) => setProviderForm({ ...providerForm, regPlateNumber: e.target.value })}
                placeholder="PB-10-AZ-1122"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Onboarding...' : 'Onboard Fleet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Fleet Operator Modal - Modern B2B SaaS Design & Isolated State */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProvider(null);
        }}
        title={`Edit Fleet Operator — ${editingProvider?.enterpriseName || editingProvider?.name || 'Operator'}`}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {editingProvider && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#0369a1',
                    background: '#e0f2fe',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {editingProvider.contractorId || 'PRV-ID'}
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{editingProvider.enterpriseName}</span>
              </div>
              <span className={`status-pill ${editingProvider.status || 'active'}`} style={{ fontSize: '11px' }}>
                {editingProvider.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          )}

          {/* Section: Business Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Personal & Business Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Proprietor Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={providerForm.phone}
                  onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={providerForm.enterpriseName}
                  onChange={(e) => setProviderForm({ ...providerForm, enterpriseName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Coverage Radius (KM)
                </label>
                <input
                  type="number"
                  min="5"
                  max="150"
                  required
                  className="form-control"
                  value={providerForm.coverageRadiusKm}
                  onChange={(e) => setProviderForm({ ...providerForm, coverageRadiusKm: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Section: Platform Status & Availability */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Platform Verification & Dispatch Status
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  KYC Verification Status
                </label>
                <select
                  className="form-control"
                  value={providerForm.kycStatus}
                  onChange={(e) => setProviderForm({ ...providerForm, kycStatus: e.target.value })}
                >
                  <option value="approved">Approved & Verified</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected / Needs Update</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Dispatch Readiness
                </label>
                <select
                  className="form-control"
                  value={providerForm.isOnline ? 'yes' : 'no'}
                  onChange={(e) => setProviderForm({ ...providerForm, isOnline: e.target.value === 'yes' })}
                >
                  <option value="yes">ONLINE (Ready for Dispatches)</option>
                  <option value="no">OFFLINE (Unavailable)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProvider(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ fontWeight: 700, minWidth: '120px', justifyContent: 'center' }}
            >
              {isProcessing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
