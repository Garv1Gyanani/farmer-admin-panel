import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  Tag,
  CheckCircle,
  XCircle,
  Layers,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tractor,
  Sprout,
  Wheat,
  Shield,
  Scissors,
  Droplets,
  Radio,
  ExternalLink,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  ChevronUp,
  Fuel,
  UserCheck,
  Star,
  PlusCircle,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ServiceModal } from '../components/ServiceModal';
import { apiUpload } from '../api';

const ICON_MAP = {
  tractor: { label: 'Tractor / Heavy Machinery', icon: Tractor, color: '#16a34a' },
  sprout: { label: 'Seeding / Precision Planting', icon: Sprout, color: '#15803d' },
  drone: { label: 'Agri-Drone Spraying', icon: Radio, color: '#0284c7' },
  wheat: { label: 'Harvesting & Combine', icon: Wheat, color: '#d97706' },
  shield: { label: 'Crop Protection / Biosecurity', icon: Shield, color: '#7c3aed' },
  layers: { label: 'Land Prep & Laser Leveling', icon: Layers, color: '#b45309' },
  scissors: { label: 'Residue Mgmt / Mulching', icon: Scissors, color: '#dc2626' },
  droplets: { label: 'Irrigation & Soil Testing', icon: Droplets, color: '#0891b2' },
  agriculture: { label: 'General Agri Implement', icon: Tag, color: '#4b5563' },
};

const CATEGORY_PRESET_IMAGES = [
  { label: 'Land Prep', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sowing', url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Drone Care', url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=800&q=80' },
  { label: 'Harvesting', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80' },
  { label: 'Transport', url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Soil Lab', url: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80' },
];

export const CategoriesView = ({
  categories = [],
  services = [],
  onSaveCategory,
  onDeleteCategory,
  onSaveService,
  onDeleteService,
  isProcessing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [expandedCategories, setExpandedCategories] = useState({}); // { [categoryId]: boolean }

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    iconName: 'tractor',
    imageUrl: '',
    order: 0,
    isActive: true,
    equipmentTags: [],
  });

  // Service Modal State (Add/Edit service under a category)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceModalTargetCategory, setServiceModalTargetCategory] = useState(null);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  // Toggle Services Accordion for a Category
  const toggleAccordion = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Open Modal for New Category
  const handleOpenAddCategory = () => {
    setSelectedCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      iconName: 'tractor',
      imageUrl: CATEGORY_PRESET_IMAGES[0].url,
      order: categories.length + 1,
      isActive: true,
      equipmentTags: [],
    });
    setNewTagInput('');
    setUploadError('');
    setIsCategoryModalOpen(true);
  };

  // Open Modal for Edit Category
  const handleOpenEditCategory = (cat) => {
    setSelectedCategory(cat);
    setCategoryFormData({
      name: cat.name,
      description: cat.description || '',
      iconName: cat.iconName || 'tractor',
      imageUrl: cat.imageUrl || CATEGORY_PRESET_IMAGES[0].url,
      order: cat.order || 0,
      isActive: cat.isActive !== false,
      equipmentTags: Array.isArray(cat.equipmentTags) ? [...cat.equipmentTags] : [],
    });
    setNewTagInput('');
    setUploadError('');
    setIsCategoryModalOpen(true);
  };

  // Equipment Tag Handlers for Category Modal
  const handleAddEquipmentTag = (tag) => {
    const trimmed = (tag || '').trim();
    if (!trimmed) return;
    const currentTags = categoryFormData.equipmentTags || [];
    if (!currentTags.includes(trimmed)) {
      setCategoryFormData({
        ...categoryFormData,
        equipmentTags: [...currentTags, trimmed],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveEquipmentTag = (tagToRemove) => {
    setCategoryFormData({
      ...categoryFormData,
      equipmentTags: (categoryFormData.equipmentTags || []).filter((t) => t !== tagToRemove),
    });
  };

  // Image Upload to S3
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'categories');
      const res = await apiUpload('/api/upload', data);
      if (res.fileUrl) {
        setCategoryFormData((prev) => ({ ...prev, imageUrl: res.fileUrl }));
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload to S3 failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Category
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert('Category Name is required.');
      return;
    }

    const payload = {
      name: categoryFormData.name.trim(),
      description: categoryFormData.description.trim(),
      iconName: categoryFormData.iconName,
      imageUrl: categoryFormData.imageUrl,
      order: Number(categoryFormData.order) || 0,
      isActive: Boolean(categoryFormData.isActive),
      equipmentTags: categoryFormData.equipmentTags || [],
    };

    if (onSaveCategory) {
      await onSaveCategory(selectedCategory?._id, payload);
    }
    setIsCategoryModalOpen(false);
  };

  // Open Add Service directly under a Category
  const handleOpenAddService = (catId) => {
    setServiceModalTargetCategory(catId);
    setServiceToEdit(null);
    setIsServiceModalOpen(true);
  };

  // Open Edit Service
  const handleOpenEditService = (srv) => {
    setServiceToEdit(srv);
    setServiceModalTargetCategory(srv.category?._id || srv.category);
    setIsServiceModalOpen(true);
  };

  // Toggle Category Active Status Directly
  const handleToggleStatus = async (cat, e) => {
    e.stopPropagation();
    if (onSaveCategory) {
      await onSaveCategory(cat._id, {
        isActive: !cat.isActive,
      });
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return c.isActive !== false;
    if (statusFilter === 'inactive') return c.isActive === false;
    return true;
  });

  // Calculate category metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive !== false).length;
  const totalServices = services.length;
  const avgServices = totalCategories > 0 ? (totalServices / totalCategories).toFixed(1) : 0;

  return (
    <div>
      {/* 1. Hero Header & Metric Stats */}
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
            <FolderTree size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Dynamic Categories</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCategories}</div>
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
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active in Mobile Apps</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
              {activeCategories} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalCategories}</span>
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
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Mapped Service Offerings</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalServices}</div>
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
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Services / Domain</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{avgServices}</div>
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Controls */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search category name, slug, or keywords..."
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--surface-sunken)', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                Active ({activeCategories})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`btn btn-sm ${statusFilter === 'inactive' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                Disabled ({categories.length - activeCategories})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--surface-sunken)', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 8px' }}
                title="Grid Cards View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 8px' }}
                title="Table View"
              >
                <List size={15} />
              </button>
            </div>

            {/* Create Category Action Button */}
            <button
              onClick={handleOpenAddCategory}
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
              <Plus size={17} />
              <span>Create New Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRID VIEW (Cards with Expandable Mapped Services) */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredCategories.map((c) => {
            const mappedServices = services.filter(
              (s) => (s.category?._id || s.category) === c._id
            );
            const iconConfig = ICON_MAP[c.iconName] || ICON_MAP.tractor;
            const CategoryIcon = iconConfig.icon;
            const isExpanded = Boolean(expandedCategories[c._id]);

            return (
              <div
                key={c._id}
                className="card"
                style={{
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* 16:9 Hero Image Banner */}
                <div
                  style={{
                    height: '175px',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#02200c',
                  }}
                >
                  <img
                    src={c.imageUrl || CATEGORY_PRESET_IMAGES[0].url}
                    alt={c.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to bottom, rgba(2, 32, 12, 0.25) 0%, rgba(2, 32, 12, 0.88) 100%)',
                    }}
                  />

                  {/* Top Priority Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(2, 32, 12, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Priority #{c.order || 0}
                  </span>

                  {/* Active / Inactive Status Switch */}
                  <button
                    onClick={(e) => handleToggleStatus(c, e)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: c.isActive !== false ? 'rgba(21, 128, 61, 0.95)' : 'rgba(153, 27, 27, 0.95)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Click to toggle active status"
                  >
                    {c.isActive !== false ? (
                      <>
                        <Check size={12} /> Active
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Disabled
                      </>
                    )}
                  </button>

                  {/* Floating Category Icon & Name overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        color: iconConfig.color,
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIcon size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {c.name}
                      </div>
                      <div style={{ color: '#c8eccb', fontSize: '11.5px', fontFamily: 'monospace' }}>
                        /catalog/{c.slug}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.description || 'Specialized agricultural machinery and implement hiring category.'}
                  </p>

                  {/* Equipment Tags Preview */}
                  {Array.isArray(c.equipmentTags) && c.equipmentTags.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Equipment Tags ({c.equipmentTags.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {c.equipmentTags.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#e8f5e4',
                              color: '#15803d',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #c8eccb',
                            }}
                          >
                            + {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mapped Services Control Bar */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-sunken)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned Offerings:</span>
                      <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 800 }}>
                        {mappedServices.length} Active Services
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenAddService(c._id)}
                        className="btn btn-primary btn-sm"
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 700,
                        }}
                        title={`Add new service directly to ${c.name}`}
                      >
                        <Plus size={14} />
                        <span>Add Service</span>
                      </button>

                      {mappedServices.length > 0 && (
                        <button
                          onClick={() => toggleAccordion(c._id)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            height: '32px',
                            padding: '0 10px',
                            fontSize: '11.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="View / collapse services list"
                        >
                          <span>{isExpanded ? 'Hide' : 'View'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDABLE ACCORDION: SERVICES IN THIS CATEGORY */}
                  {isExpanded && (
                    <div
                      style={{
                        backgroundColor: '#fbfdf9',
                        borderRadius: '10px',
                        border: '1px solid #dce8d6',
                        padding: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Services in {c.name}
                      </div>

                      {mappedServices.map((srv) => (
                        <div
                          key={srv._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#ffffff',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#02200c' }}>
                            <img src={srv.imageUrl || CATEGORY_PRESET_IMAGES[0].url} alt={srv.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {srv.title}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{srv.machineryType}</span>
                              <span>•</span>
                              <strong style={{ color: 'var(--primary)' }}>
                                ₹{srv.basePrice} / {srv.pricingModel === 'per_acre' ? 'Acre' : srv.pricingModel === 'per_hour' ? 'Hour' : 'Fixed'}
                              </strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenEditService(srv)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Edit this service"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => onDeleteService && onDeleteService(srv._id)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: '28px', height: '28px', padding: 0, color: '#dc2626' }}
                              title="Delete this service"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                    <button
                      onClick={() => handleOpenEditCategory(c)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, height: '36px', fontWeight: 600 }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Category</span>
                    </button>

                    <button
                      onClick={() => onDeleteCategory && onDeleteCategory(c._id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#dc2626', height: '36px', padding: '0 12px' }}
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Banner</th>
                  <th>Category Name</th>
                  <th>Slug Path</th>
                  <th>Icon Class</th>
                  <th style={{ textAlign: 'center' }}>Priority Order</th>
                  <th style={{ textAlign: 'center' }}>Services Mapped</th>
                  <th style={{ textAlign: 'center' }}>Mobile Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c) => {
                  const mappedCount = services.filter(
                    (s) => (s.category?._id || s.category) === c._id
                  ).length;
                  const iconConfig = ICON_MAP[c.iconName] || ICON_MAP.tractor;
                  const CategoryIcon = iconConfig.icon;

                  return (
                    <tr key={c._id}>
                      <td>
                        <div
                          style={{
                            width: '60px',
                            height: '42px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#02200c',
                          }}
                        >
                          <img
                            src={c.imageUrl || CATEGORY_PRESET_IMAGES[0].url}
                            alt={c.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {c.description ? c.description.slice(0, 50) + '...' : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          /{c.slug}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          <CategoryIcon size={16} color={iconConfig.color} />
                          <span>{iconConfig.label.split('/')[0]}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="pill-count" style={{ fontSize: '11px' }}>
                          #{c.order || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{mappedCount}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`status-pill ${c.isActive !== false ? 'active' : 'suspended'}`}>
                          {c.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenAddService(c._id)}
                            className="btn btn-primary btn-sm"
                            title={`Add service to ${c.name}`}
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEditCategory(c)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Category"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteCategory && onDeleteCategory(c._id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#dc2626' }}
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={selectedCategory ? `Edit Category: ${selectedCategory.name}` : 'Create New Agricultural Category'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitCategory} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              Category Name *
            </label>
            <input
              type="text"
              required
              className="form-control"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="e.g. Drone Nano-Spraying & Foliar Care"
              style={{ fontSize: '14px', height: '42px' }}
            />
            {categoryFormData.name && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Generated slug: <code style={{ color: 'var(--primary)' }}>/catalog/{categoryFormData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</code>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              Scope & Agricultural Description
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              placeholder="Explain the farming machinery and operations in this category..."
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Equipment & Machinery Tags Builder (for Service Provider App) */}
          <div style={{ backgroundColor: '#fcfdfa', border: '1px solid #d9e6d0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#02200c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={15} color="var(--primary)" /> Equipment & Machinery Tags
              </label>
              <span style={{ fontSize: '11px', color: '#16a34a', backgroundColor: '#eef8eb', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {(categoryFormData.equipmentTags || []).length} Tags Active
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Service Providers will see these tags during registration under <strong>"Tap to quickly append equipment tags"</strong> to describe their fleet.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipmentTag(newTagInput);
                  }
                }}
                placeholder="Type tag (e.g. 4WD Tractor, Laser Leveler) and press Enter"
                style={{ fontSize: '13px', height: '38px', flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAddEquipmentTag(newTagInput)}
                style={{
                  height: '38px',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} /> Add Tag
              </button>
            </div>

            {/* Added Tag Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '34px', alignItems: 'center', marginBottom: '8px' }}>
              {(categoryFormData.equipmentTags || []).length === 0 ? (
                <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                  No equipment tags added yet. Type a tag above or click suggestions below.
                </span>
              ) : (
                (categoryFormData.equipmentTags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#e8f5e4',
                      border: '1px solid #c3e5bc',
                      color: '#0e3d16',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  >
                    <span>+ {tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipmentTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove tag"
                    >
                      <XCircle size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Suggestions */}
            <div style={{ paddingTop: '8px', borderTop: '1px dashed #d1e2c4', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700 }}>Quick suggestions:</span>
              {[
                '4WD Tractor',
                'Laser Land Leveler',
                'Super Seeder',
                'Precision Seed Drill',
                'Rotavator',
                'Combine Harvester',
                'Agri-Drone Sprayer',
                'High-Density Straw Baler',
                'Soil Testing Kit',
              ]
                .filter((s) => !(categoryFormData.equipmentTags || []).includes(s))
                .slice(0, 5)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddEquipmentTag(suggestion)}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Plus size={10} /> {suggestion}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Category Icon & Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(ICON_MAP).map(([key, item]) => {
                const ItemIcon = item.icon;
                const isSelected = categoryFormData.iconName === key;

                return (
                  <div
                    key={key}
                    onClick={() => setCategoryFormData({ ...categoryFormData, iconName: key })}
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? '#f6fbf1' : '#ffffff',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                      <ItemIcon size={20} color={isSelected ? 'var(--primary)' : item.color} />
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#02200c' : 'var(--text-secondary)', lineHeight: 1.2 }}>
                      {item.label.split('/')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Display Priority Order
              </label>
              <input
                type="number"
                className="form-control"
                value={categoryFormData.order}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, order: e.target.value })}
                placeholder="1, 2, 3..."
                style={{ height: '40px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Customer Visibility
              </label>
              <div
                onClick={() => setCategoryFormData({ ...categoryFormData, isActive: !categoryFormData.isActive })}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  background: categoryFormData.isActive ? '#f6fbf1' : '#fef2f2',
                }}
              >
                <input
                  type="checkbox"
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: categoryFormData.isActive ? '#16a34a' : '#dc2626' }}>
                  {categoryFormData.isActive ? 'Active in Mobile Apps' : 'Disabled / Hidden'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Category Cover Photo (Cloud S3 or Presets)
            </label>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={categoryFormData.imageUrl}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                placeholder="https://..."
                style={{ height: '38px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {CATEGORY_PRESET_IMAGES.map((preset) => (
                <div
                  key={preset.label}
                  onClick={() => setCategoryFormData({ ...categoryFormData, imageUrl: preset.url })}
                  style={{
                    height: '50px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    border: categoryFormData.imageUrl === preset.url ? '2px solid var(--primary)' : '1px solid var(--border-light)',
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
                      fontSize: '9.5px',
                      fontWeight: 700,
                    }}
                  >
                    {preset.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ padding: '0 20px', fontWeight: 700 }}>
              {isProcessing ? 'Saving...' : selectedCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. SHARED SERVICE MODAL (For adding/editing services directly from categories) */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={serviceToEdit}
        categories={categories}
        preselectedCategoryId={serviceModalTargetCategory}
        onSave={onSaveService}
        isProcessing={isProcessing}
      />
    </div>
  );
};
