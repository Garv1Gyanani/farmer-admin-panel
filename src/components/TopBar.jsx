import React from 'react';
import { Search, Bell, RefreshCw, UserCheck } from 'lucide-react';

export const TopBar = ({
  title,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  onOpenAdminProfile,
}) => {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="page-title">{title}</h1>
        <div className="connection-pill">
          <span className="pulse-beacon"></span>
          <span>MongoDB Atlas Sync • Live</span>
        </div>
      </div>

      <div className="top-bar-right">
        {onSearchChange && (
          <div className="search-box">
            <Search size={16} color="#727971" />
            <input
              type="text"
              placeholder="Search by name, phone, ID..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="action-icon-btn"
            title="Refresh Real-time Data"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
          </button>
        )}

        <div className="action-icon-btn" title="Live System Alerts">
          <Bell size={16} />
          <span className="btn-dot"></span>
        </div>

        {onOpenAdminProfile && (
          <button
            onClick={onOpenAdminProfile}
            className="action-icon-btn"
            title="Admin Profile & Permissions"
            style={{ color: 'var(--primary)', borderColor: '#c8eccb' }}
          >
            <UserCheck size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
