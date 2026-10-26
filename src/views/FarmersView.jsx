import React, { useState } from 'react';
import {
  Users,
  Search,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  MapPin,
  Calendar,
  Layers,
  IndianRupee,
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Tractor,
  Wallet,
  FileText,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  Download,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { SoilReportModal } from '../components/SoilReportModal';
import { apiFetch } from '../api';

export const FarmersView = ({
  farmers = [],
  agents = [],
  bookings = [],
  onToggleUserStatus,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [isDossierLoading, setIsDossierLoading] = useState(false);
  const [dossierTab, setDossierTab] = useState('overview'); // 'overview', 'parcels', 'bookings', 'wallet'

  const [inspectingParcel, setInspectingParcel] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Forms
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    phone: '',
    email: '',
    farmName: '',
    totalLandSize: 5,
    landUnit: 'acres',
    village: '',
    tehsilBlock: '',
    district: 'Ludhiana',
    referredByAgentId: '',
    initialWalletCredit: 0,
    kycStatus: 'approved',
    status: 'active',
  });

  const [newParcelForm, setNewParcelForm] = useState({
    name: '',
    acreage: 4,
    soilType: 'Alluvial Loam',
    irrigationSource: 'Tubewell',
    approachRoadNotes: '',
  });

  const [creditForm, setCreditForm] = useState({
    amount: 1000,
    description: 'Punjab Govt Stubble Management Machinery Subsidy',
  });

  // Calculate High-Level Metrics
  const totalFarmers = farmers.length;
  const totalAcreage = farmers.reduce((sum, f) => sum + (Number(f.totalLandSize) || 0), 0);
  const verifiedFarmers = farmers.filter((f) => f.kycStatus === 'approved').length;
  const totalSpentAll = farmers.reduce((sum, f) => sum + (Number(f.totalSpent) || 0), 0);

  // Extract Unique Districts
  const districts = Array.from(new Set(farmers.map((f) => f.district).filter(Boolean)));

  // Filter Farmers
  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      (f.village && f.village.toLowerCase().includes(search.toLowerCase())) ||
      (f.farmName && f.farmName.toLowerCase().includes(search.toLowerCase()));

    const matchesDistrict = districtFilter === 'all' || f.district === districtFilter;
    const matchesKyc = kycFilter === 'all' || f.kycStatus === kycFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesKyc && matchesStatus;
  });

  // Open 360 Dossier
  const handleOpenDossier = async (farmer) => {
    setSelectedFarmer(farmer);
    setDossierTab('overview');
    setIsDossierLoading(true);
    try {
      const res = await apiFetch(`/api/admin/farmers/${farmer._id}/dossier`);
      if (res && res.dossier) {
        setDossierData(res.dossier);
      }
    } catch (err) {
      console.warn('Failed to load dossier:', err);
      // Fallback to basic farmer info
      setDossierData({
        user: farmer,
        profile: farmer,
        wallet: { balance: farmer.walletBalance || 0 },
        transactions: [],
        bookings: bookings.filter((b) => (b.farmerId?._id || b.farmerId) === farmer._id),
        soilReports: [],
      });
    } finally {
      setIsDossierLoading(false);
    }
  };

  // Open Onboard Modal
  const handleOpenOnboard = () => {
    setFarmerForm({
      name: '',
      phone: '',
      email: '',
      farmName: '',
      totalLandSize: 5,
      landUnit: 'acres',
      village: '',
      tehsilBlock: '',
      district: 'Ludhiana',
      referredByAgentId: agents[0]?._id || '',
      initialWalletCredit: 500,
      kycStatus: 'approved',
      status: 'active',
    });
    setIsOnboardModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (farmer) => {
    setSelectedFarmer(farmer);
    setFarmerForm({
      name: farmer.name,
      phone: farmer.phone,
      email: farmer.email || '',
      farmName: farmer.farmName || '',
      totalLandSize: farmer.totalLandSize || 5,
      landUnit: farmer.landUnit || 'acres',
      village: farmer.village || '',
      tehsilBlock: farmer.tehsilBlock || '',
      district: farmer.district || 'Ludhiana',
      referredByAgentId: farmer.referredByAgentId || '',
      kycStatus: farmer.kycStatus || 'approved',
      status: farmer.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  // Open Direct Subsidy Credit Modal
  const handleOpenCredit = (farmer) => {
    setSelectedFarmer(farmer);
    setCreditForm({
      amount: 1500,
      description: 'Punjab Stubble Management Machinery Subsidy Incentive',
    });
    setIsCreditModalOpen(true);
  };

  // Submit Onboarding
  const handleSubmitOnboard = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await apiFetch('/api/admin/farmers', {
        method: 'POST',
        body: JSON.stringify(farmerForm),
      });
      setIsOnboardModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Onboard failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/farmers/${selectedFarmer._id}`, {
        method: 'PUT',
        body: JSON.stringify(farmerForm),
      });
      setIsEditModalOpen(false);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Add Parcel
  const handleAddParcel = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/farmers/${selectedFarmer._id}/parcels`, {
        method: 'POST',
        body: JSON.stringify(newParcelForm),
      });
      // Refresh dossier
      await handleOpenDossier(selectedFarmer);
      if (onRefreshData) await onRefreshData();
      setNewParcelForm({
        name: '',
        acreage: 4,
        soilType: 'Alluvial Loam',
        irrigationSource: 'Tubewell',
        approachRoadNotes: '',
      });
    } catch (err) {
      alert(`Add parcel failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Delete Parcel
  const handleDeleteParcel = async (parcelId) => {
    if (!window.confirm('Are you sure you want to remove this land parcel?')) return;
    if (!selectedFarmer) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/farmers/${selectedFarmer._id}/parcels/${parcelId}`, {
        method: 'DELETE',
      });
      await handleOpenDossier(selectedFarmer);
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Delete parcel failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Wallet Credit / Subsidy
  const handleSubmitCredit = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/farmers/${selectedFarmer._id}/wallet/credit`, {
        method: 'POST',
        body: JSON.stringify(creditForm),
      });
      setIsCreditModalOpen(false);
      if (dossierData) {
        await handleOpenDossier(selectedFarmer);
      }
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      alert(`Credit failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper: Open PDF blob
  const handleDownloadPdf = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not download document.');
    }
  };

  return (
    <div>
      {/* 1. Hero KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '18px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #02200c, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Growers</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalFarmers}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #15803d, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Cultivated Acreage</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
              {totalAcreage.toFixed(1)} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Acres</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>KYC Compliance</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7' }}>
              {totalFarmers > 0 ? Math.round((verifiedFarmers / totalFarmers) * 100) : 0}%{' '}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({verifiedFarmers}/{totalFarmers} Verified)
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #b45309, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Machinery GMV</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{totalSpentAll.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search, Filters & Action Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by farmer name, phone (+91), village, or farm..."
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* District Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', height: '40px', fontSize: '12.5px' }}
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="all">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* KYC Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', height: '40px', fontSize: '12.5px' }}
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <option value="all">All KYC Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="action_needed">Action Needed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--surface-sunken)', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 8px' }}
                title="Directory Table View"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 8px' }}
                title="Visual Farm Cards Grid"
              >
                <LayoutGrid size={15} />
              </button>
            </div>

            {/* Onboard Grower Button */}
            <button
              onClick={handleOpenOnboard}
              className="btn btn-primary"
              style={{
                height: '40px',
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              }}
            >
              <UserPlus size={17} />
              <span>Onboard New Grower</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Grower Profile</th>
                  <th>Contact Info</th>
                  <th>Farm & Location</th>
                  <th style={{ textAlign: 'center' }}>Total Land</th>
                  <th style={{ textAlign: 'center' }}>Machinery Orders</th>
                  <th style={{ textAlign: 'right' }}>Wallet Balance</th>
                  <th>Field Agent</th>
                  <th style={{ textAlign: 'center' }}>KYC Status</th>
                  <th style={{ textAlign: 'center' }}>Account</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((f) => (
                  <tr key={f._id}>
                    {/* Grower Profile */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '15px',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        >
                          {f.name ? f.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px', whiteSpace: 'nowrap' }}>
                            {f.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                            Joined {new Date(f.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                          <Phone size={13} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
                          <a href={`tel:${f.phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            {f.phone}
                          </a>
                        </div>
                        {f.email && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={12} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{f.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Farm & Location */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#02200c' }}>{f.farmName || 'Agri Parcel'}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', whiteSpace: 'nowrap' }}>
                        <MapPin size={12} style={{ flexShrink: 0 }} />
                        {f.village || 'N/A'}, {f.district || 'Punjab'}
                      </div>
                    </td>

                    {/* Total Land */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#16a34a' }}>
                        {f.totalLandSize} {f.landUnit || 'Acres'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        {f.parcels?.length || 1} Registered Parcels
                      </div>
                    </td>

                    {/* Machinery Orders */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{f.totalBookingsCount || 0} Jobs</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        ₹{(f.totalSpent || 0).toLocaleString()} GMV
                      </div>
                    </td>

                    {/* Wallet Balance with Quick Credit Trigger */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>
                        ₹{(f.walletBalance || 0).toLocaleString()}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        <button
                          onClick={() => handleOpenCredit(f)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-accent)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline',
                          }}
                        >
                          + Credit Subsidy
                        </button>
                      </div>
                    </td>

                    {/* Field Agent */}
                    <td>
                      {f.referredBy ? (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          👤 {f.referredBy}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Direct Onboarding</span>
                      )}
                    </td>

                    {/* KYC Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill ${f.kycStatus === 'approved' ? 'active' : 'pending'}`}>
                        {f.kycStatus === 'approved' ? 'Verified' : f.kycStatus}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill ${f.status === 'active' ? 'active' : 'suspended'}`}>
                        {f.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenDossier(f)}
                          className="btn btn-secondary btn-sm"
                          title="Open 360° Farmer Dossier"
                          style={{ padding: '6px 10px' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Farmer Profile"
                          style={{ padding: '6px 10px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        {f.parcels?.length > 0 && (
                          <button
                            onClick={() => setInspectingParcel({ farmer: f, parcel: f.parcels[0] })}
                            className="btn btn-secondary btn-sm"
                            title="Inspect Soil Health Card"
                            style={{ padding: '6px 10px', color: '#16a34a' }}
                          >
                            <FlaskConical size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const nextStatus = f.status === 'active' ? 'suspended' : 'active';
                            if (onToggleUserStatus) onToggleUserStatus(f._id, nextStatus);
                          }}
                          className={`btn btn-sm ${f.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                          title={f.status === 'active' ? 'Suspend Farmer Account' : 'Approve & Activate Farmer Account'}
                          style={{ padding: '6px 10px' }}
                        >
                          {f.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VISUAL FARM CARDS GRID */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredFarmers.map((f) => (
            <div
              key={f._id}
              className="card"
              style={{
                padding: 0,
                margin: 0,
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Aerial Banner */}
              <div
                style={{
                  height: '140px',
                  width: '100%',
                  position: 'relative',
                  backgroundColor: '#02200c',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                  alt="Farm"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(2, 32, 12, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {f.totalLandSize} {f.landUnit || 'Acres'} Holding
                </span>

                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: f.kycStatus === 'approved' ? '#15803d' : '#d97706',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                  }}
                >
                  {f.kycStatus === 'approved' ? 'KYC Verified' : 'KYC Pending'}
                </span>

                {/* Farmer Floating Avatar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    left: '18px',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#1b5e20',
                    border: '3px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '17px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {f.name.charAt(0)}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '28px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {f.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <MapPin size={11} />
                      {f.village || 'N/A'}, {f.district}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {f.phone}
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#02200c', marginTop: '8px' }}>
                  🌾 {f.farmName}
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    backgroundColor: 'var(--surface-sunken)',
                    borderRadius: '8px',
                    padding: '10px',
                    margin: '14px 0',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Registered Parcels:</span>
                    <div style={{ fontWeight: 700 }}>{f.parcels?.length || 1} Parcels</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Machinery Jobs:</span>
                    <div style={{ fontWeight: 700 }}>{f.totalBookingsCount || 0} Orders</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total GMV:</span>
                    <div style={{ fontWeight: 700 }}>₹{(f.totalSpent || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Wallet Balance:</span>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(f.walletBalance || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleOpenDossier(f)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontWeight: 700 }}
                  >
                    <Eye size={13} />
                    <span>360° Dossier</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Profile"
                  >
                    <Edit2 size={13} />
                  </button>
                  {f.parcels?.length > 0 && (
                    <button
                      onClick={() => setInspectingParcel({ farmer: f, parcel: f.parcels[0] })}
                      className="btn btn-secondary btn-sm"
                      title="Soil Health Card"
                      style={{ color: '#16a34a' }}
                    >
                      <FlaskConical size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. 360° FARMER DOSSIER MODAL */}
      <Modal
        isOpen={Boolean(selectedFarmer && dossierData)}
        onClose={() => {
          setSelectedFarmer(null);
          setDossierData(null);
        }}
        title={`360° Grower Dossier: ${dossierData?.user?.name || selectedFarmer?.name}`}
      >
        {dossierData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Dossier Header Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #02200c 0%, #17351f 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                  }}
                >
                  {dossierData.user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                      {dossierData.user.name}
                    </h3>
                    <span
                      style={{
                        backgroundColor: dossierData.profile?.kycStatus === 'approved' ? '#15803d' : '#d97706',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {dossierData.profile?.kycStatus === 'approved' ? 'KYC Verified' : 'KYC Pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#c8eccb', marginTop: '2px' }}>
                    📞 {dossierData.user.phone} • 🌾 {dossierData.profile?.farmName} • 📍 {dossierData.profile?.village}, {dossierData.profile?.district}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#c8eccb' }}>Agri-Wallet Balance</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80' }}>
                  ₹{(dossierData.wallet?.balance || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setDossierTab('overview')}
                className={`btn btn-sm ${dossierTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Overview & Bio
              </button>
              <button
                type="button"
                onClick={() => setDossierTab('parcels')}
                className={`btn btn-sm ${dossierTab === 'parcels' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Parcels & Soil ({dossierData.profile?.parcels?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setDossierTab('bookings')}
                className={`btn btn-sm ${dossierTab === 'bookings' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Machinery Bookings ({dossierData.bookings?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setDossierTab('wallet')}
                className={`btn btn-sm ${dossierTab === 'wallet' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Wallet & Subsidies
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {dossierTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Acreage</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                      {dossierData.profile?.totalLandSize || 0} Acres
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Orders Placed</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{dossierData.bookings?.length || 0} Jobs</div>
                  </div>
                  <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifetime Farm GMV</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>
                      ₹{dossierData.bookings?.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Field Agent</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                      {dossierData.profile?.referredByAgentId?.name || 'Direct Grower'}
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Farm Geographic Location</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Village:</span> <strong>{dossierData.profile?.village || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tehsil / Block:</span> <strong>{dossierData.profile?.tehsilBlock || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>District:</span> <strong>{dossierData.profile?.district || 'Punjab'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>State:</span> <strong>{dossierData.profile?.state || 'Punjab'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PARCELS & SOIL */}
            {dossierTab === 'parcels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>Registered Land Parcels</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Total: {dossierData.profile?.parcels?.length || 0} Parcels
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dossierData.profile?.parcels?.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#02200c' }}>
                          🌱 {p.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Area: <strong>{p.acreage} Acres</strong> • Soil: <strong>{p.soilType}</strong> • Irrigation: <strong>{p.irrigationSource}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setInspectingParcel({ farmer: selectedFarmer, parcel: p })}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#16a34a', fontWeight: 600 }}
                        >
                          <FlaskConical size={13} />
                          <span>PAU Soil Card</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteParcel(p._id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#dc2626' }}
                          title="Delete Parcel"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Form to Add Parcel */}
                <form
                  onSubmit={handleAddParcel}
                  style={{
                    backgroundColor: 'var(--surface-sunken)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#02200c' }}>+ Register New Land Parcel</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Parcel Name (e.g. North Killa)"
                      value={newParcelForm.name}
                      onChange={(e) => setNewParcelForm({ ...newParcelForm, name: e.target.value })}
                      style={{ fontSize: '12px' }}
                    />
                    <input
                      type="number"
                      required
                      step="0.5"
                      className="form-control"
                      placeholder="Acres"
                      value={newParcelForm.acreage}
                      onChange={(e) => setNewParcelForm({ ...newParcelForm, acreage: e.target.value })}
                      style={{ fontSize: '12px' }}
                    />
                    <select
                      className="form-control"
                      value={newParcelForm.soilType}
                      onChange={(e) => setNewParcelForm({ ...newParcelForm, soilType: e.target.value })}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="Alluvial Loam">Alluvial Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Black Cotton">Black Cotton</option>
                    </select>
                    <select
                      className="form-control"
                      value={newParcelForm.irrigationSource}
                      onChange={(e) => setNewParcelForm({ ...newParcelForm, irrigationSource: e.target.value })}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="Tubewell">Tubewell</option>
                      <option value="Canal">Canal</option>
                      <option value="Drip/Sprinkler">Drip/Sprinkler</option>
                      <option value="Rainfed">Rainfed</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={isProcessing} className="btn btn-primary btn-sm">
                      {isProcessing ? 'Saving...' : 'Add Parcel'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: BOOKINGS */}
            {dossierTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dossierData.bookings?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Job #</th>
                          <th>Service</th>
                          <th>Scheduled Date</th>
                          <th>Acreage</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Docs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dossierData.bookings.map((b) => (
                          <tr key={b._id}>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{b.bookingNumber}</td>
                            <td>{b.serviceId?.title || 'Farm Machinery Job'}</td>
                            <td>{new Date(b.scheduledDate || Date.now()).toLocaleDateString('en-IN')}</td>
                            <td>{b.landDetails?.acreage || 1} Acres</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{b.pricing?.totalAmount || 0}</td>
                            <td>
                              <span className={`status-pill ${b.status === 'completed' ? 'active' : 'pending'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(`/api/bookings/${b._id}/invoice`, `Invoice_${b.bookingNumber}.pdf`)}
                                  className="btn btn-ghost btn-sm"
                                  title="Download GST Invoice"
                                  style={{ padding: '2px 6px' }}
                                >
                                  <FileText size={13} color="var(--primary)" />
                                </button>
                                {b.status === 'completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPdf(`/api/bookings/${b._id}/certificate`, `Cert_${b.bookingNumber}.pdf`)}
                                    className="btn btn-ghost btn-sm"
                                    title="Download Work Certificate"
                                    style={{ padding: '2px 6px' }}
                                  >
                                    <Download size={13} color="#15803d" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No machinery operations booked yet by this grower.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: WALLET & SUBSIDIES */}
            {dossierTab === 'wallet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6fbf1', padding: '14px', borderRadius: '8px', border: '1px solid #c8eccb' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Available Balance</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                      ₹{(dossierData.wallet?.balance || 0).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => handleOpenCredit(selectedFarmer)} className="btn btn-primary btn-sm">
                    + Issue Direct Subsidy Credit
                  </button>
                </div>

                <h4 style={{ margin: '6px 0 2px', fontSize: '13.5px' }}>Recent Ledger Transactions</h4>
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th style={{ textAlign: 'right' }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossierData.transactions?.length > 0 ? (
                        dossierData.transactions.map((t) => (
                          <tr key={t._id}>
                            <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className={`status-pill ${t.type === 'credit' ? 'active' : 'suspended'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td>{t.description}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                              {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{t.balanceAfter}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No wallet transactions on record.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 6. ONBOARD NEW GROWER MODAL */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Agricultural Grower"
      >
        <form onSubmit={handleSubmitOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Grower Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={farmerForm.name}
                onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                placeholder="e.g. Jaswinder Singh"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile (+91) *</label>
              <input
                type="text"
                required
                className="form-control"
                value={farmerForm.phone}
                onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Farm Holding Name</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.farmName}
                onChange={(e) => setFarmerForm({ ...farmerForm, farmName: e.target.value })}
                placeholder="e.g. Guru Nanak Agri Farm"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Initial Acreage</label>
              <input
                type="number"
                step="0.5"
                required
                className="form-control"
                value={farmerForm.totalLandSize}
                onChange={(e) => setFarmerForm({ ...farmerForm, totalLandSize: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Village</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.village}
                onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                placeholder="Village name"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Tehsil / Block</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.tehsilBlock}
                onChange={(e) => setFarmerForm({ ...farmerForm, tehsilBlock: e.target.value })}
                placeholder="e.g. Samrala"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>District</label>
              <select
                className="form-control"
                value={farmerForm.district}
                onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Patiala">Patiala</option>
                <option value="Sangrur">Sangrur</option>
                <option value="Bathinda">Bathinda</option>
                <option value="Fatehgarh Sahib">Fatehgarh Sahib</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Jalandhar">Jalandhar</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Assigned Field Agent</label>
              <select
                className="form-control"
                value={farmerForm.referredByAgentId}
                onChange={(e) => setFarmerForm({ ...farmerForm, referredByAgentId: e.target.value })}
              >
                <option value="">Direct Onboarding (No Agent)</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Initial Subsidy Credit (₹)</label>
              <input
                type="number"
                className="form-control"
                value={farmerForm.initialWalletCredit}
                onChange={(e) => setFarmerForm({ ...farmerForm, initialWalletCredit: e.target.value })}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsOnboardModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Onboarding...' : 'Onboard Grower'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. EDIT GROWER PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Grower: ${selectedFarmer?.name}`}
      >
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Grower Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                value={farmerForm.name}
                onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Phone Number</label>
              <input
                type="text"
                required
                className="form-control"
                value={farmerForm.phone}
                onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Farm Holding Name</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.farmName}
                onChange={(e) => setFarmerForm({ ...farmerForm, farmName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Land (Acres)</label>
              <input
                type="number"
                step="0.5"
                required
                className="form-control"
                value={farmerForm.totalLandSize}
                onChange={(e) => setFarmerForm({ ...farmerForm, totalLandSize: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Village</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.village}
                onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>District</label>
              <input
                type="text"
                className="form-control"
                value={farmerForm.district}
                onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>KYC Status</label>
              <select
                className="form-control"
                value={farmerForm.kycStatus}
                onChange={(e) => setFarmerForm({ ...farmerForm, kycStatus: e.target.value })}
              >
                <option value="approved">Approved (Verified)</option>
                <option value="pending">Pending Review</option>
                <option value="action_needed">Action Needed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Account Status</label>
              <select
                className="form-control"
                value={farmerForm.status}
                onChange={(e) => setFarmerForm({ ...farmerForm, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="pending_verification">Pending Verification</option>
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

      {/* 8. DIRECT SUBSIDY CREDIT MODAL */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title={`Issue Agricultural Subsidy Credit to ${selectedFarmer?.name}`}
      >
        <form onSubmit={handleSubmitCredit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#f6fbf1', padding: '12px', borderRadius: '8px', border: '1px solid #c8eccb' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target Farmer</div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#02200c' }}>
              {selectedFarmer?.name} ({selectedFarmer?.phone})
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Current Wallet Balance: <strong>₹{(selectedFarmer?.walletBalance || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Credit Amount (₹) *</label>
            <input
              type="number"
              required
              min="50"
              className="form-control"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Subsidy / Incentive Scheme *</label>
            <input
              type="text"
              required
              className="form-control"
              value={creditForm.description}
              onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
              placeholder="e.g. Stubble Management Machinery Subsidy"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsCreditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Processing Credit...' : 'Credit Wallet Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. Soil Report Modal */}
      {inspectingParcel && (
        <SoilReportModal
          farmer={inspectingParcel.farmer}
          parcel={inspectingParcel.parcel}
          onClose={() => setInspectingParcel(null)}
        />
      )}
    </div>
  );
};
