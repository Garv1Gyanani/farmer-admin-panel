import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Star,
  Fuel,
  UserCheck,
  MapPin,
  Tag,
  Info,
  DollarSign,
  Gauge,
  Sliders,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { apiUpload, resolveMediaUrl } from '../api';

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

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 800,
  color: '#02200c',
  marginBottom: '14px',
  paddingBottom: '10px',
  borderBottom: '1px solid var(--border-light)',
};

const labelStyle = {
  fontSize: '12.5px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: '5px',
  display: 'block',
};

export const ServiceModal = ({
  isOpen,
  onClose,
  service = null,
  categories = [],
  preselectedCategoryId = null,
  onSave,
  isProcessing = false,
}) => {
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
    rating: 4.8,
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
        rating: service.rating || 4.8,
        reviewsCount: service.reviewsCount || 0,
        isFeatured: Boolean(service.isFeatured),
        isActive: service.isActive !== false,
        imageUrl: resolveMediaUrl(service.imageUrl || ''),
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
        providerName: 'ProFarmer Verified Fleet',
        badgeTag: 'Top Pick',
        nextSlot: 'Available today',
        operatingArea: '',
        responseTime: '< 30 mins',
        rating: 4.8,
        reviewsCount: 0,
        isFeatured: false,
        isActive: true,
        imageUrl: '',
      });
    }
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
      const uploadedUrl = resolveMediaUrl(res.fileUrl || res.relativeUrl || '');
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed');
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
      reviewsCount: Number(formData.reviewsCount) || 0,
      isFeatured: Boolean(formData.isFeatured),
      isActive: Boolean(formData.isActive),
      imageUrl: resolveMediaUrl(formData.imageUrl),
    };

    if (onSave) {
      await onSave(service?._id, payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c._id === formData.category);
  const previewImageUrl = resolveMediaUrl(formData.imageUrl);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dedicated Top Header Bar */}
      <div
        className="card"
        style={{
          padding: '16px 22px',
          margin: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#02200c' }}>
              {service ? `Edit Service: ${service.title}` : 'Create New Service Offering'}
            </h2>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Category: <strong style={{ color: 'var(--primary)' }}>{currentCategory?.name || 'Unassigned'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ height: '40px', padding: '0 18px' }}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || isUploadingImage}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 22px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={15} />
            <span>{isProcessing ? 'Saving...' : service ? 'Update Service' : 'Create Service'}</span>
          </button>
        </div>
      </div>

      {/* Spacious 2-Column SaaS Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 1fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: All Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Section 1: Basic Info */}
          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={sectionTitleStyle}>
              <Info size={16} color="var(--primary)" />
              <span>Basic Information</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Service Offering Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Laser Land Leveling (Dual Transmitter)"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Agricultural Category *</label>
                  <select
                    required
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Machinery / Equipment Type *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.machineryType}
                  onChange={(e) => setFormData({ ...formData, machineryType: e.target.value })}
                  placeholder="e.g. Laser Land Leveler"
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {MACHINERY_SUGGESTIONS.map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setFormData({ ...formData, machineryType: sug })}
                      style={{
                        fontSize: '11px',
                        padding: '3px 9px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-light)',
                        background: formData.machineryType === sug ? '#f0fdf4' : '#ffffff',
                        borderColor: formData.machineryType === sug ? 'var(--primary)' : 'var(--border-light)',
                        color: formData.machineryType === sug ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Farmer-Facing Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the field operation, water savings, or crop benefits in simple language..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', paddingTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Featured on Home Screen</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Published (Visible to Farmers)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Scale */}
          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={sectionTitleStyle}>
              <DollarSign size={16} color="var(--primary)" />
              <span>Pricing & Booking Scale</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Pricing Billing Unit</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'per_acre', label: 'Per Acre' },
                    { id: 'per_hour', label: 'Per Hour' },
                    { id: 'flat', label: 'Flat Rate' },
                  ].map((model) => (
                    <button
                      type="button"
                      key={model.id}
                      onClick={() => setFormData({ ...formData, pricingModel: model.id })}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        border: formData.pricingModel === model.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        backgroundColor: formData.pricingModel === model.id ? '#f6fbf1' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: formData.pricingModel === model.id ? '#02200c' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Base Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Min Units Required</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.minUnits}
                  onChange={(e) => setFormData({ ...formData, minUnits: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Machine & Operational Specs */}
          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={sectionTitleStyle}>
              <Gauge size={16} color="var(--primary)" />
              <span>Machine & Field Specifications</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Horsepower / Power</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.horsepower}
                  onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                  placeholder="e.g. 55-65 HP 4WD"
                />
              </div>
              <div>
                <label style={labelStyle}>Implement Width / Swath</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.implementWidth}
                  onChange={(e) => setFormData({ ...formData, implementWidth: e.target.value })}
                  placeholder="e.g. 8 Feet Scraper"
                />
              </div>
              <div>
                <label style={labelStyle}>Turnaround Speed</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.turnaroundTime}
                  onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                  placeholder="e.g. 1.5 hrs / acre"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setFormData({ ...formData, fuelIncluded: !formData.fuelIncluded })}
                style={{
                  border: formData.fuelIncluded ? '1.5px solid #16a34a' : '1px solid var(--border-light)',
                  backgroundColor: formData.fuelIncluded ? '#f6fbf1' : '#ffffff',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Fuel size={18} color={formData.fuelIncluded ? '#16a34a' : '#64748b'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#02200c' }}>Fuel / Battery Included</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No extra fuel charge for farmer</div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, operatorIncluded: !formData.operatorIncluded })}
                style={{
                  border: formData.operatorIncluded ? '1.5px solid #16a34a' : '1px solid var(--border-light)',
                  backgroundColor: formData.operatorIncluded ? '#f6fbf1' : '#ffffff',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <UserCheck size={18} color={formData.operatorIncluded ? '#16a34a' : '#64748b'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#02200c' }}>Operator / Pilot Included</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trained operator arrives with machine</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Provider & Dispatch Info */}
          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={sectionTitleStyle}>
              <Sliders size={16} color="var(--primary)" />
              <span>Catalog Branding & Dispatch Availability</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Catalog / Fleet Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  placeholder="e.g. ProFarmer Verified Fleet"
                />
              </div>
              <div>
                <label style={labelStyle}>Operating Cluster / Region</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.operatingArea}
                  onChange={(e) => setFormData({ ...formData, operatingArea: e.target.value })}
                  placeholder="e.g. Jaipur & Amber Tehsil"
                />
              </div>
              <div>
                <label style={labelStyle}>Next Available Slot</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nextSlot}
                  onChange={(e) => setFormData({ ...formData, nextSlot: e.target.value })}
                  placeholder="e.g. Available today"
                />
              </div>
              <div>
                <label style={labelStyle}>Response Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
                  placeholder="e.g. < 30 mins"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Promotional Badge Tag</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '180px' }}
                  value={formData.badgeTag}
                  onChange={(e) => setFormData({ ...formData, badgeTag: e.target.value })}
                  placeholder="e.g. Top Pick"
                />
                {BADGE_SUGGESTIONS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setFormData({ ...formData, badgeTag: b })}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-light)',
                      background: formData.badgeTag === b ? '#f0fdf4' : '#ffffff',
                      borderColor: formData.badgeTag === b ? 'var(--primary)' : 'var(--border-light)',
                      color: formData.badgeTag === b ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Image Uploader + Live Mobile Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'sticky', top: '20px' }}>
          {/* Photo Upload Card */}
          <div className="card" style={{ padding: '20px', margin: 0 }}>
            <div style={sectionTitleStyle}>
              <ImageIcon size={16} color="var(--primary)" />
              <span>Service Photo</span>
            </div>

            <div
              style={{
                border: '1.5px dashed var(--border-medium)',
                borderRadius: '12px',
                padding: '14px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#02200c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Service preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ color: '#86efac', textAlign: 'center', fontSize: '12px' }}>
                    <ImageIcon size={28} style={{ margin: '0 auto 6px', opacity: 0.7 }} />
                    No photo selected yet
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                    opacity: isUploadingImage ? 0.7 : 1,
                  }}
                >
                  <Upload size={14} />
                  <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    style={{ display: 'none' }}
                  />
                </label>

                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Clear
                  </button>
                )}
              </div>

              {uploadError && (
                <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 600 }}>{uploadError}</div>
              )}

              <input
                type="text"
                className="form-control"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Or paste image URL (https://...)"
                style={{ height: '36px', fontSize: '12px' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                One-Click Machinery Presets
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {PRESET_IMAGES.map((preset) => (
                  <div
                    key={preset.label}
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                    style={{
                      height: '58px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      border: previewImageUrl === preset.url ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    }}
                  >
                    <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
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

          {/* Live Farmer App Preview Card */}
          <div className="card" style={{ padding: '18px', margin: 0, backgroundColor: '#f6fbf1', border: '1px solid #d4edd6' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.6px' }}>
              📱 Live Farmer App Card Preview
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e2ece0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#02200c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {previewImageUrl ? (
                    <img src={previewImageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={22} color="#86efac" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                      {formData.badgeTag || 'TOP PICK'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 700 }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" /> {formData.rating || 4.8}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#02200c', marginTop: '2px', lineHeight: 1.25 }}>
                    {formData.title || 'Service Offering Title'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formData.description || 'Describe service details for farmers...'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                    ✓ {formData.providerName || 'ProFarmer Verified Fleet'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8faf7', padding: '7px 10px', borderRadius: '8px', fontSize: '11px' }}>
                <span style={{ color: '#15803d', fontWeight: 700 }}>● {formData.nextSlot || 'Available today'}</span>
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={10} /> {formData.operatingArea || 'Nearby'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ESTIMATED RATE</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#02200c' }}>
                    ₹{formData.basePrice || 0}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>
                      /{formData.pricingModel === 'per_acre' ? 'acre' : formData.pricingModel === 'per_hour' ? 'hr' : 'flat'}
                    </span>
                  </div>
                </div>
                <div style={{ background: '#02200c', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                  View Details →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
