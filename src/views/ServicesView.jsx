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
} from 'lucide-react';
import { ServiceModal } from '../components/ServiceModal';

export const ServicesView = ({
  services = [],
  categories = [],
  onSaveService,
  onDeleteService,
  isProcessing = false,
}) => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [pricingModelFilter, setPricingModelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price_asc' | 'price_desc' | 'rating'

  const handleOpenAdd = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedService(s);
    setIsModalOpen(true);
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

      return matchesSearch && matchesCategory && matchesPricing;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'price_desc') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // default: featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  // Calculate Metrics
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive !== false).length;
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
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Featured Top Picks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309' }}>{featuredServices}</div>
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
              Create and manage dynamic farm services, equipment specifications, pricing benchmarks, and provider assignments
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

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`btn btn-sm ${selectedCategoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
          >
            All Machinery ({services.length})
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
        {filteredServices.map((s) => (
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
              <img
                src={s.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}
                alt={s.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(2, 32, 12, 0.2) 0%, rgba(2, 32, 12, 0.85) 100%)',
                }}
              />

              {/* Promotional Badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#02200c',
                  color: '#4ade80',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                }}
              >
                {s.badgeTag || 'TOP PICK'}
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

              {/* Rating */}
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
                {s.rating || 4.8}
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>({s.reviewsCount || 86})</span>
              </span>
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

              {/* Provider Info Strip */}
              <div
                style={{
                  backgroundColor: '#f6fbf1',
                  border: '1px solid #dce8d6',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#02200c' }}>
                    ✓ {s.providerName || 'Rajesh Agricultural Services'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    📍 {s.operatingArea || 'Kalwar & 25 km radius'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ backgroundColor: '#ffffff', border: '1px solid #c8eccb', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, color: '#16a34a' }}>
                    {s.nextSlot || 'Available today'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Power & Implement:</span>
                  <strong>{s.specifications?.horsepower || '55-65 HP'} • {s.specifications?.implementWidth || '8 Feet'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Turnaround Speed:</span>
                  <strong>{s.specifications?.turnaroundTime || '1.5 hrs / acre'}</strong>
                </div>
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
        ))}
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
