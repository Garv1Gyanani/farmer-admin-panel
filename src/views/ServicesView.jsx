import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Fuel,
  UserCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tractor,
  SlidersHorizontal,
  DollarSign,
  ArrowUpDown,
  Phone,
  ShieldCheck,
  XCircle,
  Building,
} from 'lucide-react';
import { ServiceModal } from '../components/ServiceModal';

export const ServicesView = ({
  services = [],
  categories = [],
  providers = [],
  onSaveService,
  onDeleteService,
  onReviewApproval,
  isProcessing = false,
}) => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [pricingModelFilter, setPricingModelFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price_asc' | 'price_desc' | 'rating'

  const getProviderInfo = (s) => {
    const pId = s.providerId?._id || s.providerId;
    const pIdStr = pId?.toString();
    const found = providers.find(
      (p) => p._id?.toString() === pIdStr || p.id?.toString() === pIdStr
    );

    return {
      name: found?.name || s.providerId?.name || s.providerName || 'Registered Provider',
      phone: found?.phone || s.providerId?.phone || '',
      enterpriseName: found?.enterpriseName || '',
      contractorId: found?.contractorId || '',
      kycStatus: found?.kycStatus || '',
      coverageRadiusKm: found?.coverageRadiusKm || '',
    };
  };

  const handleOpenAdd = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedService(s);
    setIsModalOpen(true);
  };

  const handleApprove = (s) => {
    if (onReviewApproval) {
      onReviewApproval(s._id, 'approved');
    }
  };

  const handleReject = (s) => {
    const reason = window.prompt(`Enter rejection reason for "${s.title}":`, 'Service details or pricing require revision');
    if (reason !== null && onReviewApproval) {
      onReviewApproval(s._id, 'rejected', reason);
    }
  };

  // Filter & Sort
  const filteredServices = services
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.machineryType?.toLowerCase().includes(q) ||
        s.providerName?.toLowerCase().includes(q);

      const catId = s.category?._id || s.category;
      const matchesCategory =
        selectedCategoryFilter === 'all' || catId === selectedCategoryFilter;

      const matchesPricing =
        pricingModelFilter === 'all' || s.pricingModel === pricingModelFilter;

      const matchesApproval =
        approvalFilter === 'all' ||
        (approvalFilter === 'approved' && (s.approvalStatus === 'approved' || !s.approvalStatus)) ||
        s.approvalStatus === approvalFilter;

      return matchesSearch && matchesCategory && matchesPricing && matchesApproval;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'price_desc') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // default: pending review first, then featured
      if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
      if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1;
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  // Calculate Metrics
  const totalServices = services.length;
  const pendingReviewCount = services.filter((s) => s.approvalStatus === 'pending').length;
  const activeServices = services.filter((s) => (s.approvalStatus === 'approved' || !s.approvalStatus) && s.isActive !== false).length;
  const featuredServices = services.filter((s) => s.isFeatured).length;
  const avgPrice =
    totalServices > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.basePrice || 0), 0) / totalServices)
      : 0;

  return (
    <div>
      {/* 1. Header Metrics Strip */}
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
            <Tractor size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Service Offerings</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalServices}</div>
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active in Farmer Apps</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
              {activeServices} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalServices}</span>
            </div>
          </div>
        </div>

        <div
          className="card"
          onClick={() => setApprovalFilter('pending')}
          style={{
            padding: '18px 20px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            border: pendingReviewCount > 0 ? '1.5px solid #f59e0b' : '1px solid var(--border-light)',
            backgroundColor: pendingReviewCount > 0 ? '#fffbeb' : 'var(--surface-card)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: pendingReviewCount > 0 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'var(--surface-sunken)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: pendingReviewCount > 0 ? '#ffffff' : 'var(--text-muted)',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: pendingReviewCount > 0 ? '#b45309' : 'var(--text-muted)', fontWeight: 600 }}>
              Pending Provider Review
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: pendingReviewCount > 0 ? '#d97706' : 'var(--text-primary)' }}>
              {pendingReviewCount}
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
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Benchmark Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{avgPrice}</div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Agricultural Mechanization & Service Catalog
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Review provider submitted services, configure farm machinery catalog, benchmark pricing, and publish to farmers
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search machinery, provider, title..."
                style={{ paddingLeft: '32px', height: '38px', fontSize: '12.5px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '150px', height: '38px', fontSize: '12px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Approval Tabs */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setApprovalFilter('all')}
            className={`btn btn-sm ${approvalFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderRadius: '8px' }}
          >
            All Services ({totalServices})
          </button>
          <button
            onClick={() => setApprovalFilter('pending')}
            className={`btn btn-sm ${approvalFilter === 'pending' ? 'btn-warning' : 'btn-secondary'}`}
            style={{
              fontSize: '12px',
              borderRadius: '8px',
              backgroundColor: approvalFilter === 'pending' ? '#f59e0b' : undefined,
              color: approvalFilter === 'pending' ? '#ffffff' : undefined,
            }}
          >
            ⏳ Pending Review ({pendingReviewCount})
          </button>
          <button
            onClick={() => setApprovalFilter('approved')}
            className={`btn btn-sm ${approvalFilter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderRadius: '8px' }}
          >
            ✓ Approved ({activeServices})
          </button>
          <button
            onClick={() => setApprovalFilter('rejected')}
            className={`btn btn-sm ${approvalFilter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderRadius: '8px' }}
          >
            ✕ Rejected ({services.filter((s) => s.approvalStatus === 'rejected').length})
          </button>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`btn btn-sm ${selectedCategoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
          >
            All Categories
          </button>
          {categories.map((c) => {
            const count = services.filter((s) => (s.category?._id || s.category) === c._id).length;
            return (
              <button
                key={c._id}
                onClick={() => setSelectedCategoryFilter(c._id)}
                className={`btn btn-sm ${selectedCategoryFilter === c._id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Services Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '22px',
        }}
      >
        {filteredServices.map((s) => {
          const provider = getProviderInfo(s);
          return (
            <div
              key={s._id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                margin: '0',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Image Banner */}
              <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#02200c' }}>
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #02200c 0%, #0d381e 100%)',
                      color: '#4ade80',
                    }}
                  >
                    <Tractor size={48} strokeWidth={1.5} />
                    <span style={{ fontSize: '13px', color: '#a7f3d0', marginTop: '8px', fontWeight: 700 }}>
                      {s.machineryType || 'Farm Machinery Service'}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(2, 32, 12, 0.15) 0%, rgba(2, 32, 12, 0.75) 100%)',
                  }}
                />

                {/* Status Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor:
                      s.approvalStatus === 'pending'
                        ? '#b45309'
                        : s.approvalStatus === 'rejected'
                        ? '#991b1b'
                        : '#02200c',
                    color:
                      s.approvalStatus === 'pending'
                        ? '#fef3c7'
                        : s.approvalStatus === 'rejected'
                        ? '#fee2e2'
                        : '#4ade80',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border:
                      s.approvalStatus === 'pending'
                        ? '1px solid #fde68a'
                        : s.approvalStatus === 'rejected'
                        ? '1px solid #fecaca'
                        : '1px solid rgba(74, 222, 128, 0.4)',
                  }}
                >
                  {s.approvalStatus === 'pending'
                    ? '⏳ PENDING REVIEW'
                    : s.approvalStatus === 'rejected'
                    ? '✕ REJECTED'
                    : s.badgeTag || 'ACTIVE'}
                </span>

                {/* Category Pill */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(6px)',
                    color: '#02200c',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {s.category?.name || 'General Agri'}
                </span>

                {/* Rating - Only display if real reviews exist */}
                {s.reviewsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    {Number(s.rating).toFixed(1)}
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>({s.reviewsCount})</span>
                  </span>
                )}
              </div>

              {/* Card Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px 0' }}>
                    {s.title}
                  </h3>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
                    Machinery: {s.machineryType}
                  </div>
                </div>

                {s.description ? (
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      marginBottom: '14px',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {s.description}
                  </p>
                ) : null}

                {/* WHICH PROVIDER LISTED IT - Prominent & Accurate Provider Details */}
                <div
                  style={{
                    backgroundColor: '#f6fbf1',
                    border: '1px solid #dce8d6',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 800, color: '#15803d', marginBottom: '2px' }}>
                        Listed by Service Provider
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#02200c' }}>
                        {provider.name}
                      </div>
                      {provider.enterpriseName && (
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', marginTop: '1px' }}>
                          🏢 {provider.enterpriseName}
                        </div>
                      )}
                    </div>
                    {provider.kycStatus && (
                      <span
                        style={{
                          backgroundColor: provider.kycStatus === 'approved' ? '#dcfce7' : '#fef3c7',
                          border: `1px solid ${provider.kycStatus === 'approved' ? '#86efac' : '#fde68a'}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: provider.kycStatus === 'approved' ? '#166534' : '#92400e',
                        }}
                      >
                        {provider.kycStatus === 'approved' ? '✓ KYC Approved' : 'KYC Pending'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)', paddingTop: '8px', borderTop: '1px solid #e2ece0' }}>
                    {provider.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Phone size={12} color="var(--primary)" /> {provider.phone}
                      </span>
                    )}
                    {provider.contractorId && (
                      <span style={{ fontWeight: 600, color: '#02200c' }}>
                        ID: {provider.contractorId}
                      </span>
                    )}
                    {s.operatingArea ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} /> {s.operatingArea}
                      </span>
                    ) : provider.coverageRadiusKm ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} /> {provider.coverageRadiusKm} km radius
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Technical Specifications - Only show what provider actually listed */}
                <div
                  style={{
                    backgroundColor: 'var(--surface-sunken)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px',
                  }}
                >
                  {s.specifications?.horsepower && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Power / Capacity:</span>
                      <strong>{s.specifications.horsepower}</strong>
                    </div>
                  )}
                  {s.specifications?.implementWidth && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Implement Width:</span>
                      <strong>{s.specifications.implementWidth}</strong>
                    </div>
                  )}
                  {s.specifications?.turnaroundTime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Turnaround Speed:</span>
                      <strong>{s.specifications.turnaroundTime}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Fuel / Crew:</span>
                    <span style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: s.specifications?.fuelIncluded !== false ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <Fuel size={12} /> {s.specifications?.fuelIncluded !== false ? 'Fuel Inc' : 'No Fuel'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: s.specifications?.operatorIncluded !== false ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <UserCheck size={12} /> {s.specifications?.operatorIncluded !== false ? 'Operator Inc' : 'Machine Only'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Provider Submission Approval Review Banner */}
                {s.approvalStatus === 'pending' && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>
                      <Clock size={14} />
                      PROVIDER SUBMISSION • PENDING REVIEW
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
                      Submitted by <strong>{provider.name}</strong> {provider.enterpriseName ? `(${provider.enterpriseName})` : ''}{provider.phone ? ` • ${provider.phone}` : ''}. Approving will publish this service live to all farmers.
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(s)}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontWeight: 700,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '6px',
                        }}
                        disabled={isProcessing}
                      >
                        <CheckCircle2 size={14} />
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReject(s)}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          fontWeight: 700,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '6px',
                        }}
                        disabled={isProcessing}
                      >
                        <AlertCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

              {s.approvalStatus === 'rejected' && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '16px',
                    fontSize: '11.5px',
                    color: '#991b1b',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>Service Rejected</div>
                  <div>Reason: {s.rejectionReason || 'Did not meet requirements'}</div>
                  <div style={{ marginTop: '6px' }}>
                    <button
                      onClick={() => handleApprove(s)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      disabled={isProcessing}
                    >
                      Re-Approve Service
                    </button>
                  </div>
                </div>
              )}

              {/* Price & Actions Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hiring Estimate</div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{Number(s.basePrice || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      /{s.pricingModel === 'per_acre' ? 'Acre' : s.pricingModel === 'per_hour' ? 'Hour' : 'Job'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleOpenEdit(s)} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteService && onDeleteService(s._id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#dc2626', padding: '0 10px' }}
                    title="Delete service offering"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

      {filteredServices.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Tractor size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>No Service Offerings Found</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search criteria or category filter.</div>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            + Create New Offering
          </button>
        </div>
      )}

      {/* Modern Add / Edit Service Modal with Live Mobile Preview */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        categories={categories}
        onSave={onSaveService}
        isProcessing={isProcessing}
      />
    </div>
  );
};
