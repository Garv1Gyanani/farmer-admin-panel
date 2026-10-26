import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Briefcase,
  Tractor,
  CalendarCheck,
  Wallet,
  Settings,
  ScrollText,
  LogOut,
  Layers,
  Compass,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({
  currentView,
  onViewChange,
  pendingQueueCount = 0,
  pendingPayoutCount = 0,
  onOpenAdminProfile,
}) => {
  const { admin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Operations', icon: LayoutDashboard },
    { id: 'live_map', label: 'Live Map & Radar', icon: Compass },
    {
      id: 'verification',
      label: 'Verification Queue',
      icon: ShieldCheck,
      badge: pendingQueueCount > 0 ? pendingQueueCount : null,
      badgeColor: 'danger',
    },
    { id: 'farmers', label: 'Farmer Management', icon: Users },
    { id: 'agents', label: 'Field Agent Network', icon: Briefcase },
    { id: 'providers', label: 'Fleet & Providers', icon: Tractor },
    { id: 'bookings', label: 'Bookings & Dispatch', icon: CalendarCheck },
    {
      id: 'finance',
      label: 'Wallets & Payouts',
      icon: Wallet,
      badge: pendingPayoutCount > 0 ? pendingPayoutCount : null,
    },
    { id: 'services', label: 'Service Catalog', icon: Layers },
    { id: 'categories', label: 'Service Categories', icon: FolderTree },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-icon">
            <Tractor size={22} />
          </div>
          <div>
            <div className="brand-title">ProFarmer</div>
            <div className="brand-subtitle">Console • Operations</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Core Operations</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeColor || ''}`}>{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div
          className="user-profile-tile"
          onClick={onOpenAdminProfile}
          style={{ cursor: 'pointer' }}
          title="Click to view & edit Admin Profile"
        >
          <img
            src={
              admin?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt={admin?.name}
            className="user-avatar"
            style={{ flexShrink: 0 }}
          />
          <div className="user-info">
            <div className="user-name" title={admin?.name || 'Administrator'}>
              {admin?.name || 'Administrator'}
            </div>
            <span className="user-role-badge">Super Admin</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="action-icon-btn"
            title="Log Out"
            style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', color: '#ffb4ab' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
