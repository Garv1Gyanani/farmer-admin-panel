import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  Fuel,
  UserCheck,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  Info,
  DollarSign,
  Gauge,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from './Modal';
import { apiUpload } from '../api';

const PRESET_IMAGES = [
  {
    label: 'Laser Leveler',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Combine Harvester',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Agri-Drone Sprayer',
    url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Super Seeder',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Rotavator Tillage',
    url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Straw Baler',
    url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
  },
];

const MACHINERY_SUGGESTIONS = [
  'Laser Land Leveler',
  'Tractor 4WD (55-75 HP)',
  'Multi-Crop Combine Harvester',
  'Agri-Drone Precision Sprayer',
  'Super Seeder Direct Drill',
  'Heavy Duty Rotavator',
  'High-Density Straw Baler',
  'Soil Testing Lab Kit',
];

const BADGE_SUGGESTIONS = ['Top Pick', 'Multi-Acre', 'Priority', 'Seasonal', 'Eco-Choice', 'Express Fleet'];

export const ServiceModal = ({
  isOpen,
  onClose,
  service = null,
  categories = [],
  preselectedCategoryId = null,
  onSave,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'specs' | 'provider' | 'visuals'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    machineryType: 'Tractor 4WD',
    pricingModel: 'per_acre',
    basePrice: 1000,
    minUnits: 1,
    horsepower: '',
    implementWidth: '',
    turnaroundTime: '',
    fuelIncluded: true,
    operatorIncluded: true,
    providerName: '',
    badgeTag: '',
    nextSlot: '',
    operatingArea: '',
    responseTime: '',
    rating: 0,
    reviewsCount: 0,
    isFeatured: false,
    isActive: true,
    imageUrl: '',
  });

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        category: service.category?._id || service.category || categories[0]?._id || '',
        description: service.description || '',
        machineryType: service.machineryType || '',
        pricingModel: service.pricingModel || 'per_acre',
        basePrice: service.basePrice || 0,
        minUnits: service.minUnits || 1,
        horsepower: service.specifications?.horsepower || '',
        implementWidth: service.specifications?.implementWidth || '',
        turnaroundTime: service.specifications?.turnaroundTime || '',
        fuelIncluded: service.specifications?.fuelIncluded !== false,
        operatorIncluded: service.specifications?.operatorIncluded !== false,
        providerName: service.providerName || '',
        badgeTag: service.badgeTag || '',
        nextSlot: service.nextSlot || '',
        operatingArea: service.operatingArea || '',
        responseTime: service.responseTime || '',
        rating: service.rating || 0,
        reviewsCount: service.reviewsCount || 0,
        isFeatured: Boolean(service.isFeatured),
        isActive: service.isActive !== false,
        imageUrl: service.imageUrl || '',
      });
    } else {
      setFormData({
        title: '',
        category: preselectedCategoryId || categories[0]?._id || '',
        description: '',
        machineryType: 'Tractor 4WD',
        pricingModel: 'per_acre',
        basePrice: 1000,
        minUnits: 1,
        horsepower: '',
        implementWidth: '',
        turnaroundTime: '',
        fuelIncluded: true,
        operatorIncluded: true,
        providerName: '',
        badgeTag: '',
        nextSlot: '',
        operatingArea: '',
        responseTime: '',
        rating: 0,
        reviewsCount: 0,
        isFeatured: false,
        isActive: true,
        imageUrl: '',
      });
    }
    setActiveTab('basic');
    setUploadError('');
  }, [service, isOpen, preselectedCategoryId, categories]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'machinery');
      const res = await apiUpload('/api/upload', data);
      if (res.fileUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.fileUrl }));
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload to S3 failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Service Title is required');
      return;
    }
    if (!formData.category) {
      alert('Please select a Service Category');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      machineryType: formData.machineryType.trim(),
      pricingModel: formData.pricingModel,
      basePrice: Number(formData.basePrice),
      minUnits: Number(formData.minUnits) || 1,
      specifications: {
        horsepower: formData.horsepower,
        implementWidth: formData.implementWidth,
        turnaroundTime: formData.turnaroundTime,
        fuelIncluded: Boolean(formData.fuelIncluded),
        operatorIncluded: Boolean(formData.operatorIncluded),
      },
      providerName: formData.providerName.trim(),
      badgeTag: formData.badgeTag.trim(),
      nextSlot: formData.nextSlot.trim(),
      operatingArea: formData.operatingArea.trim(),
      responseTime: formData.responseTime.trim(),
      rating: Number(formData.rating) || 4.8,
      reviewsCount: Number(formData.reviewsCount) || 86,
      isFeatured: Boolean(formData.isFeatured),
      isActive: Boolean(formData.isActive),
      imageUrl: formData.imageUrl,
    };

    if (onSave) {
      await onSave(service?._id, payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c._id === formData.category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? `Edit Service: ${service.title}` : 'Create New Service Offering'}
      maxWidth="860px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '10px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'basic', label: '1. Basic Info', icon: Info },
            { id: 'pricing', label: '2. Pricing & Scale', icon: DollarSign },
            { id: 'specs', label: '3. Machine Specs', icon: Gauge },
            { id: 'provider', label: '4. Provider & Slots', icon: Sliders },
            { id: 'visuals', label: '5. Photos & Mobile Preview', icon: Sparkles },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  fontWeight: isCurrent ? 700 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Service Offering Title *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Laser Land Leveling 75 HP"
                  style={{ height: '42px', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Parent Service Category *
                </label>
                <select
                  required
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ height: '42px', fontSize: '13px' }}
                >
                  <option value="">-- Choose Agricultural Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.servicesCount || 0} services)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Machinery Class / Implement Model *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.machineryType}
                  onChange={(e) => setFormData({ ...formData, machineryType: e.target.value })}
                  placeholder="e.g. Laser Leveler + 4WD Tractor"
                  style={{ height: '40px' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {MACHINERY_SUGGESTIONS.slice(0, 4).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setFormData({ ...formData, machineryType: sugg })}
                      style={{
                        fontSize: '11px',
                        background: 'var(--surface-sunken)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Card Promotional Badge
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.badgeTag}
                  onChange={(e) => setFormData({ ...formData, badgeTag: e.target.value })}
                  placeholder="e.g. Top Pick, Priority, Seasonal"
                  style={{ height: '40px' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {BADGE_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeTag: tag })}
                      style={{
                        fontSize: '11px',
                        background: formData.badgeTag === tag ? '#edf7ee' : 'var(--surface-sunken)',
                        border: formData.badgeTag === tag ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        color: formData.badgeTag === tag ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: formData.badgeTag === tag ? 700 : 400,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Service Overview & Farmer Value Proposition
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="High-grade agricultural field service with certified operator and specialized farm machinery dispatch."
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & UNITS */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Base Hiring Price (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      fontSize: '15px',
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-control"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    style={{ paddingLeft: '32px', height: '42px', fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Pricing Model Unit *
                </label>
                <select
                  className="form-control"
                  value={formData.pricingModel}
                  onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                  style={{ height: '42px', fontSize: '13px' }}
                >
                  <option value="per_acre">Per Acre (₹/acre)</option>
                  <option value="per_hour">Per Hour (₹/hour)</option>
                  <option value="flat">Flat Fixed Fee (₹/job)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Min Booking Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.minUnits}
                  onChange={(e) => setFormData({ ...formData, minUnits: e.target.value })}
                  style={{ height: '42px' }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Min {formData.minUnits} {formData.pricingModel === 'per_acre' ? 'acres' : 'hours'} per booking
                </div>
              </div>
            </div>

            {/* Price Preview Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f6fbf1 0%, #eef8e8 100%)',
                border: '1px solid #c8eccb',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Farmer Rate</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)' }}>
                  From ₹{Number(formData.basePrice || 0).toLocaleString()}
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
                    /{formData.pricingModel === 'per_acre' ? 'Acre' : formData.pricingModel === 'per_hour' ? 'Hour' : 'Service'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>Platform Fee: Included</div>
                <div>Machinery Dispatch Guarantee: Active</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MACHINE SPECS */}
        {activeTab === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Engine Horsepower
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.horsepower}
                  onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                  placeholder="e.g. 55-65 HP 4WD"
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Implement Working Width
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.implementWidth}
                  onChange={(e) => setFormData({ ...formData, implementWidth: e.target.value })}
                  placeholder="e.g. 8 Feet Scraper"
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Est. Turnaround Time
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.turnaroundTime}
                  onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                  placeholder="e.g. 1.5 hrs / acre"
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            {/* Operational Inclusions Checkboxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                onClick={() => setFormData({ ...formData, fuelIncluded: !formData.fuelIncluded })}
                style={{
                  border: formData.fuelIncluded ? '1px solid #16a34a' : '1px solid var(--border-light)',
                  backgroundColor: formData.fuelIncluded ? '#f6fbf1' : '#ffffff',
                  padding: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.fuelIncluded}
                  onChange={(e) => setFormData({ ...formData, fuelIncluded: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Diesel / Fuel Included</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Provider covers diesel consumption for standard field operations
                  </div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, operatorIncluded: !formData.operatorIncluded })}
                style={{
                  border: formData.operatorIncluded ? '1px solid #16a34a' : '1px solid var(--border-light)',
                  backgroundColor: formData.operatorIncluded ? '#f6fbf1' : '#ffffff',
                  padding: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.operatorIncluded}
                  onChange={(e) => setFormData({ ...formData, operatorIncluded: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Certified Operator Included</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Trained driver/agronomist operates machinery on farmer parcel
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROVIDER & SLOTS */}
        {activeTab === 'provider' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Default Service Provider / Fleet Partner
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  placeholder="e.g. Registered Provider Name"
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Next Available Slot Text
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nextSlot}
                  onChange={(e) => setFormData({ ...formData, nextSlot: e.target.value })}
                  placeholder="e.g. Available today, Tomorrow 9:00 AM"
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Operating Coverage Area
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.operatingArea}
                  onChange={(e) => setFormData({ ...formData, operatingArea: e.target.value })}
                  placeholder="e.g. 25 km radius"
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Expected Response Time
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
                  placeholder="e.g. < 30 mins"
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                style={{
                  border: formData.isFeatured ? '1px solid #f59e0b' : '1px solid var(--border-light)',
                  backgroundColor: formData.isFeatured ? '#fffbeb' : '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: formData.isFeatured ? '#b45309' : 'var(--text-secondary)' }}>
                  Mark as Featured Service (Promoted on Mobile Home)
                </span>
              </div>

              <div
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                style={{
                  border: formData.isActive ? '1px solid #16a34a' : '1px solid var(--border-light)',
                  backgroundColor: formData.isActive ? '#f6fbf1' : '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: formData.isActive ? '#16a34a' : '#dc2626' }}>
                  Live & Visible in Farmer Mobile App
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VISUALS & LIVE MOBILE PREVIEW */}
        {activeTab === 'visuals' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Visual Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Photo Asset URL (or pick agricultural preset below)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  style={{ height: '40px', fontSize: '12px' }}
                />
              </div>

              {/* Direct File Upload to S3 */}
              <div
                style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  background: 'var(--surface-sunken)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Upload size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    style={{ fontSize: '12px' }}
                  />
                  {isUploadingImage && <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>Uploading to S3...</div>}
                  {uploadError && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>{uploadError}</div>}
                </div>
              </div>

              {/* Presets Grid */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  One-Click Photo Presets
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {PRESET_IMAGES.map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      style={{
                        height: '60px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: formData.imageUrl === preset.url ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      }}
                    >
                      <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '2px',
                        }}
                      >
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Mobile Card Preview */}
            <div
              style={{
                backgroundColor: '#f1f5eb',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #dce4d6',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.6px' }}>
                📱 Live Farmer App Card Preview
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  padding: '14px',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                {/* Header with image */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#02200c', flexShrink: 0 }}>
                    <img src={formData.imageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                        {formData.badgeTag || 'TOP PICK'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b7791f', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={11} fill="#b7791f" /> {formData.rating || 4.8}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', marginTop: '2px', lineHeight: 1.2 }}>
                      {formData.title || 'Service Title Preview'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#526054', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formData.description || 'High quality professional agricultural modern service...'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                      ✓ {formData.providerName || 'Registered Provider'}
                    </div>
                  </div>
                </div>

                {/* Next slot badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#2d3748', marginTop: '10px', background: '#f7fafc', padding: '4px 8px', borderRadius: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                  <strong>{formData.nextSlot}</strong>
                  <span style={{ color: '#a0aec0' }}>•</span>
                  <span>4.2 km away</span>
                </div>

                {/* Price and CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #edf2f7', paddingTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#a0aec0', textTransform: 'uppercase' }}>Confidential estimate</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#02200c' }}>
                      From ₹{Number(formData.basePrice || 0).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#02200c',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    View Details →
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Category: <strong style={{ color: 'var(--text-primary)' }}>{currentCategory?.name || 'Unassigned'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing || isUploadingImage} className="btn btn-primary" style={{ padding: '0 24px', fontWeight: 700 }}>
              {isProcessing ? 'Saving Offering...' : service ? 'Update Service Offering' : 'Create Service Offering'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
