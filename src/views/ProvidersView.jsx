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
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiFetch } from '../api';

export const ProvidersView = ({ providers = [], onToggleUserStatus, onRefreshData }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
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

  const handleOpenEdit = (p) => {
    setSelectedProvider(p);
    setProviderForm({
      name: p.name,
      phone: p.phone,
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
    if (!selectedProvider) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/providers/${selectedProvider._id}`, {
        method: 'PUT',
        body: JSON.stringify(providerForm),
      });
      setIsEditModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.enterpriseName?.toLowerCase().includes(search.toLowerCase()) ||
      p.contractorId?.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'online') {
      matchesStatus = Boolean(p.isOnline);
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
              <option value="all">All Fleets ({providers.length})</option>
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
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedProvider(p)}
                        className="btn btn-secondary btn-sm"
                        title="View Machinery Fleet & Revenue Dossier"
                      >
                        <Eye size={13} />
                        <span>Fleet</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Fleet Operator Profile"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      {onToggleUserStatus && (
                        <button
                          onClick={() => {
                            const newStatus = p.status === 'active' ? 'suspended' : 'active';
                            const reason = window.prompt(`Confirm changing ${p.enterpriseName} status to ${newStatus.toUpperCase()}:`, 'Operational machinery audit');
                            if (reason !== null) {
                              onToggleUserStatus(p._id, newStatus, reason);
                            }
                          }}
                          className={`btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
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

      {/* Fleet Dossier Modal */}
      {selectedProvider && (
        <Modal
          isOpen={Boolean(selectedProvider)}
          onClose={() => setSelectedProvider(null)}
          title={`Machinery Fleet Dossier — ${selectedProvider.enterpriseName}`}
          maxWidth="700px"
          footer={
            <button onClick={() => setSelectedProvider(null)} className="btn btn-secondary">
              Close
            </button>
          }
        >
          <div>
            {/* Quick Metrics */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
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
                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                  {selectedProvider.metrics?.completedJobs || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Acreage Worked</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                  {selectedProvider.metrics?.totalAcreageWorked || 0} Ac
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer Rating</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#b7791f' }}>
                  ★ {selectedProvider.metrics?.rating || 4.9}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wallet Balance</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{selectedProvider.availableBalance?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Machinery Fleet Listing */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tractor size={16} />
                <span>Certified Farm Machinery Units ({selectedProvider.machineryFleet?.length || 0})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(selectedProvider.machineryFleet || []).map((m, idx) => (
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
                        {m.brand} {m.model} ({m.machineryType})
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Reg: <strong style={{ fontFamily: 'var(--font-mono)' }}>{m.registrationNumber}</strong> • {m.horsepowerHp} HP • Year: {m.yearOfManufacture || '2023'}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`status-pill ${m.isOperational ? 'active' : 'urgent'}`}
                        style={{ fontSize: '11px' }}
                      >
                        {m.isOperational ? 'Operational' : 'Maintenance'}
                      </span>
                    </div>
                  </div>
                ))}
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

      {/* Edit Fleet Operator Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Fleet Operator: ${selectedProvider?.enterpriseName}`}
      >
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Proprietor Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.name}
                onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile Phone</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.phone}
                onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Enterprise Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={providerForm.enterpriseName}
                onChange={(e) => setProviderForm({ ...providerForm, enterpriseName: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>KYC Status</label>
              <select
                className="form-control"
                value={providerForm.kycStatus}
                onChange={(e) => setProviderForm({ ...providerForm, kycStatus: e.target.value })}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Dispatch Ready (Online)</label>
              <select
                className="form-control"
                value={providerForm.isOnline ? 'yes' : 'no'}
                onChange={(e) => setProviderForm({ ...providerForm, isOnline: e.target.value === 'yes' })}
              >
                <option value="yes">Online (Available for Dispatch)</option>
                <option value="no">Offline</option>
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
