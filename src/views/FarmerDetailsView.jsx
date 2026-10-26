import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  IndianRupee,
  Shield,
  CheckCircle,
  AlertCircle,
  FlaskConical,
  Plus,
  Trash2,
  FileText,
  Download,
  Tractor,
  Wallet,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  User,
} from 'lucide-react';
import { apiFetch } from '../api';
import { SoilReportModal } from '../components/SoilReportModal';

export const FarmerDetailsView = ({
  farmerId,
  initialFarmer = null,
  bookings = [],
  onBack,
  onRefreshData,
  onOpenEdit,
  onOpenCredit,
}) => {
  const [farmer, setFarmer] = useState(initialFarmer);
  const [dossierData, setDossierData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'parcels' | 'bookings' | 'wallet'
  const [inspectingParcel, setInspectingParcel] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Parcel Form State
  const [newParcelForm, setNewParcelForm] = useState({
    name: '',
    acreage: 4,
    soilType: 'Alluvial Loam',
    irrigationSource: 'Tubewell',
    approachRoadNotes: '',
  });

  const loadDossier = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/farmers/${farmerId}/dossier`);
      if (res && res.dossier) {
        setDossierData(res.dossier);
        if (res.dossier.user) {
          setFarmer((prev) => ({
            ...(prev || {}),
            ...res.dossier.user,
            ...(res.dossier.profile || {}),
            _id: res.dossier.user._id,
            name: res.dossier.user.name,
            phone: res.dossier.user.phone,
            email: res.dossier.user.email,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to load dossier in FarmerDetailsView:', err);
      // Fallback
      if (initialFarmer) {
        setDossierData({
          user: initialFarmer,
          profile: initialFarmer,
          wallet: { balance: initialFarmer.walletBalance || 0 },
          transactions: [],
          bookings: bookings.filter((b) => (b.farmerId?._id || b.farmerId) === initialFarmer._id),
          soilReports: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) {
      loadDossier();
    }
  }, [farmerId]);

  // Handle Add Parcel
  const handleAddParcel = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await apiFetch(`/api/admin/farmers/${farmerId}/parcels`, {
        method: 'POST',
        body: JSON.stringify(newParcelForm),
      });
      setNewParcelForm({
        name: '',
        acreage: 4,
        soilType: 'Alluvial Loam',
        irrigationSource: 'Tubewell',
        approachRoadNotes: '',
      });
      await loadDossier();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(`Add parcel failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete Parcel
  const handleDeleteParcel = async (parcelId) => {
    if (!window.confirm('Delete this land parcel from grower profile?')) return;
    try {
      await apiFetch(`/api/admin/farmers/${farmerId}/parcels/${parcelId}`, {
        method: 'DELETE',
      });
      await loadDossier();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert(`Delete parcel failed: ${err.message}`);
    }
  };

  // Handle Document Download
  const handleDownloadPdf = async (endpoint, filename) => {
    try {
      const blob = await apiFetch(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download document.');
    }
  };

  // Derived display details
  const displayName = dossierData?.user?.name || farmer?.name || 'Grower Profile';
  const displayPhone = dossierData?.user?.phone || farmer?.phone || 'N/A';
  const displayEmail = dossierData?.user?.email || farmer?.email || '';
  const farmName = dossierData?.profile?.farmName || farmer?.farmName || 'Agri Holding';
  const village = dossierData?.profile?.village || farmer?.village || 'N/A';
  const district = dossierData?.profile?.district || farmer?.district || 'Punjab';
  const state = dossierData?.profile?.state || farmer?.state || 'Punjab';
  const tehsilBlock = dossierData?.profile?.tehsilBlock || farmer?.tehsilBlock || 'N/A';
  const totalLandSize = dossierData?.profile?.totalLandSize ?? farmer?.totalLandSize ?? 0;
  const landUnit = dossierData?.profile?.landUnit || farmer?.landUnit || 'Acres';
  const kycStatus = dossierData?.profile?.kycStatus || farmer?.kycStatus || 'pending';
  const walletBalance = dossierData?.wallet?.balance ?? farmer?.walletBalance ?? 0;
  const parcels = dossierData?.profile?.parcels || farmer?.parcels || [];
  const farmerBookings = dossierData?.bookings || [];
  const transactions = dossierData?.transactions || [];
  const joinedDate = new Date(dossierData?.user?.createdAt || farmer?.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP NAVIGATION & HEADER BAR */}
      <div
        className="card"
        style={{
          padding: '16px 22px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Farmers</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Grower ID:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                background: 'var(--surface-sunken)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              {farmerId}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onOpenCredit && (
            <button
              onClick={() => onOpenCredit(farmer || { _id: farmerId, name: displayName, walletBalance })}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IndianRupee size={15} color="#16a34a" />
              <span>Credit Subsidy</span>
            </button>
          )}

          {onOpenEdit && (
            <button
              onClick={() => onOpenEdit(farmer || { _id: farmerId, name: displayName })}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit2 size={15} />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FARMER PROFILE HERO BANNER */}
      <div
        className="card"
        style={{
          margin: 0,
          padding: '24px',
          background: 'linear-gradient(135deg, #02200c 0%, #0d4a22 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(2, 32, 12, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Avatar Badge */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                color: '#02200c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '26px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {displayName}
                </h1>

                <span
                  style={{
                    backgroundColor: kycStatus === 'approved' ? '#15803d' : '#d97706',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {kycStatus === 'approved' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  {kycStatus === 'approved' ? 'KYC Verified Grower' : 'KYC Pending Review'}
                </span>

                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#c8eccb',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  Joined {joinedDate}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '18px',
                  flexWrap: 'wrap',
                  fontSize: '13px',
                  color: '#c8eccb',
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} style={{ color: '#4ade80' }} />
                  <a href={`tel:${displayPhone}`} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 700 }}>
                    {displayPhone}
                  </a>
                </div>

                {displayEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ color: '#4ade80' }} />
                    <span>{displayEmail}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: '#4ade80' }} />
                  <span>
                    {village}, {district}, {state}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#facc15' }} />
                  <span>Farm: <strong>{farmName}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance Hero Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '14px 20px',
              textAlign: 'right',
              minWidth: '180px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#c8eccb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Agri-Wallet Balance
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#4ade80', marginTop: '2px' }}>
              ₹{walletBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              Direct Subsidy Active
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Cultivated Land</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
              {totalLandSize} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{landUnit}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tractor size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Machinery Bookings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
              {farmerBookings.length} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Jobs</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#fefce8',
              color: '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Lifetime Farm GMV</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{farmerBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#faf5ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Referred Agent</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#9333ea', marginTop: '3px' }}>
              {dossierData?.profile?.referredByAgentId?.name || farmer?.referredBy || 'Direct Registration'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAIL TABS NAVIGATION */}
      <div
        className="card"
        style={{
          padding: 0,
          margin: 0,
          overflow: 'hidden',
          borderBottom: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '8px 12px',
            background: 'var(--surface-sunken)',
            borderBottom: '1px solid var(--border-light)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: 700, padding: '8px 16px', borderRadius: '8px' }}
          >
            Overview & Location
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parcels')}
            className={`btn btn-sm ${activeTab === 'parcels' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: 700, padding: '8px 16px', borderRadius: '8px' }}
          >
            Land Parcels & Soil ({parcels.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: 700, padding: '8px 16px', borderRadius: '8px' }}
          >
            Machinery Bookings ({farmerBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`btn btn-sm ${activeTab === 'wallet' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: 700, padding: '8px 16px', borderRadius: '8px' }}
          >
            Wallet & Subsidies ({transactions.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & LOCATION */}
        {activeTab === 'overview' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Account Credentials */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '18px',
                  background: '#ffffff',
                }}
              >
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  👤 Account Identity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registered Full Name:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{displayName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{displayPhone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                    <span>{displayEmail || 'Not configured'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>KYC Document Status:</span>
                    <span className={`status-pill ${kycStatus === 'approved' ? 'active' : 'pending'}`}>
                      {kycStatus === 'approved' ? 'Verified' : kycStatus}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Account Created:</span>
                    <span>{joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Farm Geographic Location */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '18px',
                  background: '#ffffff',
                }}
              >
                <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  📍 Farm & Location Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Farm Name:</span>
                    <strong>{farmName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Village / Gram:</span>
                    <strong>{village}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tehsil / Block:</span>
                    <strong>{tehsilBlock}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>District:</span>
                    <strong>{district}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>State:</span>
                    <strong>{state}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Documents Section */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '18px',
                background: '#ffffff',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                📑 KYC & Identity Verification Documents
              </h3>
              {dossierData?.profile?.kycDocuments && dossierData.profile.kycDocuments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {dossierData.profile.kycDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: 'var(--surface-sunken)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{doc.docType || 'Document'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Status: {doc.status || 'Verified'}
                        </div>
                      </div>
                      {doc.docUrl && (
                        <a
                          href={doc.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <ExternalLink size={12} />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Standard Aadhaar / Land record documents verified via field agent or digital OTP onboarding.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PARCELS & SOIL */}
        {activeTab === 'parcels' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Registered Agricultural Parcels</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Manage killa numbers, soil health reports, and irrigation channels.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {parcels.length > 0 ? (
                parcels.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#02200c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🌱</span>
                        <span>{p.name}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Area: <strong style={{ color: '#16a34a' }}>{p.acreage} Acres</strong> • Soil: <strong>{p.soilType}</strong> • Irrigation: <strong>{p.irrigationSource}</strong>
                      </div>
                      {p.approachRoadNotes && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Road/Access: {p.approachRoadNotes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setInspectingParcel({ farmer, parcel: p })}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#16a34a', fontWeight: 700 }}
                      >
                        <FlaskConical size={14} />
                        <span>Soil Health Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteParcel(p._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#dc2626' }}
                        title="Delete Parcel"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
                  No parcels registered yet. Register the first parcel below.
                </div>
              )}
            </div>

            {/* Inline Form to Add Parcel */}
            <form
              onSubmit={handleAddParcel}
              style={{
                backgroundColor: 'var(--surface-sunken)',
                borderRadius: '10px',
                padding: '18px',
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px dashed var(--border-light)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#02200c' }}>+ Register New Agricultural Parcel</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Parcel Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. North Canal Killa"
                    value={newParcelForm.name}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Acreage (Acres) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    className="form-control"
                    placeholder="Acres"
                    value={newParcelForm.acreage}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, acreage: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Soil Type</label>
                  <select
                    className="form-control"
                    value={newParcelForm.soilType}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, soilType: e.target.value })}
                  >
                    <option value="Alluvial Loam">Alluvial Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Black Cotton">Black Cotton</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Irrigation</label>
                  <select
                    className="form-control"
                    value={newParcelForm.irrigationSource}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, irrigationSource: e.target.value })}
                  >
                    <option value="Tubewell">Tubewell</option>
                    <option value="Canal">Canal</option>
                    <option value="Drip/Sprinkler">Drip/Sprinkler</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="submit" disabled={isProcessing} className="btn btn-primary btn-sm" style={{ padding: '8px 18px', fontWeight: 700 }}>
                  {isProcessing ? 'Registering...' : '+ Add Parcel to Dossier'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Machinery & Farming Operations</h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Total: {farmerBookings.length} Recorded Jobs
              </span>
            </div>

            {farmerBookings.length > 0 ? (
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Equipment Service</th>
                      <th>Scheduled Date</th>
                      <th>Acreage</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerBookings.map((b) => (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{b.bookingNumber}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {b.serviceId?.title || 'Farm Machinery Job'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {b.serviceId?.machineryType || 'Heavy Agri Machinery'}
                          </div>
                        </td>
                        <td>{new Date(b.scheduledDate || Date.now()).toLocaleDateString('en-IN')}</td>
                        <td>{b.landDetails?.acreage || 1} Acres</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                          ₹{(b.pricing?.totalAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-pill ${b.status === 'completed' ? 'active' : 'pending'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(`/api/bookings/${b._id}/invoice`, `Invoice_${b.bookingNumber}.pdf`)}
                              className="btn btn-secondary btn-sm"
                              title="Download GST Invoice"
                              style={{ padding: '4px 8px' }}
                            >
                              <FileText size={13} color="var(--primary)" />
                              <span>Invoice</span>
                            </button>
                            {b.status === 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(`/api/bookings/${b._id}/certificate`, `Cert_${b.bookingNumber}.pdf`)}
                                className="btn btn-secondary btn-sm"
                                title="Download Work Certificate"
                                style={{ padding: '4px 8px' }}
                              >
                                <Download size={13} color="#15803d" />
                                <span>Certificate</span>
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
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
                No farm equipment operations booked yet by this grower.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WALLET & TRANSACTIONS */}
        {activeTab === 'wallet' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f6fbf1',
                padding: '18px 22px',
                borderRadius: '10px',
                border: '1px solid #c8eccb',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Available Subsidy / Wallet Balance</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                  ₹{walletBalance.toLocaleString()}
                </div>
              </div>
              {onOpenCredit && (
                <button
                  onClick={() => onOpenCredit(farmer || { _id: farmerId, name: displayName, walletBalance })}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '10px 18px' }}
                >
                  + Issue Direct Subsidy Credit
                </button>
              )}
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800 }}>Ledger Transaction History</h3>
              <div className="table-responsive">
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Transaction Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Post-Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t._id}>
                          <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className={`status-pill ${t.type === 'credit' ? 'active' : 'suspended'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{t.description}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: t.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                            {t.type === 'credit' ? '+' : '-'}₹{(t.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(t.balanceAfter || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          No wallet ledger transactions on record.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Soil Report Modal */}
      {inspectingParcel && (
        <SoilReportModal
          isOpen={Boolean(inspectingParcel)}
          onClose={() => setInspectingParcel(null)}
          farmer={inspectingParcel.farmer}
          parcel={inspectingParcel.parcel}
        />
      )}
    </div>
  );
};
