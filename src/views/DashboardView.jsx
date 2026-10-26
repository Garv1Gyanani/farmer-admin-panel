import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Tractor,
  Activity,
  IndianRupee,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Radio,
  MapPin,
  CloudSun,
  Wind,
  Droplets,
  Compass,
  Coins,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '../api';

export const DashboardView = ({ data, onNavigate }) => {
  const kpis = data?.kpis || {};
  const users = kpis.users || {};
  const ops = kpis.operations || {};
  const financials = kpis.financials || {};
  const recentBookings = data?.recentBookings || [];
  const serviceStatistics = kpis.serviceStatistics || [];

  const [weather, setWeather] = useState(null);
  const [demandClusters, setDemandClusters] = useState([]);
  const [isVesting, setIsVesting] = useState(false);
  const [vestingMsg, setVestingMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/weather?lat=30.9010&lng=75.8573')
      .then((res) => {
        if (isMounted) setWeather(res);
      })
      .catch((err) => console.warn('Weather fetch error:', err));

    apiFetch('/api/providers/demand-map')
      .then((res) => {
        if (isMounted && res.clusters) setDemandClusters(res.clusters);
      })
      .catch((err) => console.warn('Demand map fetch error:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickVest = async () => {
    setIsVesting(true);
    setVestingMsg(null);
    try {
      const res = await apiFetch('/api/admin/commissions/vest-now', { method: 'POST' });
      setVestingMsg(res.message || 'Commission vesting sweep executed successfully.');
    } catch (err) {
      alert(`Vesting failed: ${err.message}`);
    } finally {
      setIsVesting(false);
    }
  };

  const formatForecastDate = (dateStr, idx) => {
    if (idx === 0) return 'Today';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[d.getDay()]} ${d.getDate()}`;
      }
    } catch (_) {}
    return dateStr;
  };

  return (
    <div>
      {/* 6 Key KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Users</span>
            <div className="kpi-icon-wrap forest">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{users.totalUsers || 0}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill forest">
              <span>{users.totalFarmers || 0} Farmers</span>
              <span className="dot">•</span>
              <span>{users.totalAgents || 0} Agents</span>
              <span className="dot">•</span>
              <span>{users.totalProviders || 0} Fleets</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Active & Online</span>
            <div className="kpi-icon-wrap blue">
              <Tractor size={18} />
            </div>
          </div>
          <div className="kpi-value">{users.activeUsers || 0}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill blue">
              <span className="pulse-beacon-inline"></span>
              <span>{users.onlineProviders || 0} Fleet Operators Online</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Field Operations</span>
            <div className="kpi-icon-wrap purple">
              <Activity size={18} />
            </div>
          </div>
          <div className="kpi-value">{ops.totalBookings || (ops.activeBookings + ops.completedBookings) || 0}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill purple">
              <Clock size={12} />
              <span>{ops.activeBookings || 0} Active • {ops.completedBookings || 0} Completed</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Gross Volume (GMV)</span>
            <div className="kpi-icon-wrap emerald">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{(financials.grossMerchandiseValue || 0).toLocaleString()}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill emerald">
              <ShieldCheck size={12} />
              <span>Escrow Protected Volume</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Platform Revenue</span>
            <div className="kpi-icon-wrap amber">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{(financials.platformRevenue || 0).toLocaleString()}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill amber">
              <Coins size={12} />
              <span>₹{(financials.agentCommissions || 0).toLocaleString()} Agent Commission</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Pending Approvals</span>
            <div className="kpi-icon-wrap rose">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="kpi-value">{(ops.pendingVerifications || 0) + (ops.pendingPayouts || 0)}</div>
          <div className="kpi-footer-metric">
            <div className="kpi-pill rose">
              <span>{ops.pendingVerifications || 0} KYC Pending • {ops.pendingPayouts || 0} Payouts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agro-Weather & Micro-Climate Telemetry Card */}
      {weather && (
        <div className="weather-telemetry-hero">
          <div className="weather-header-strip">
            <div className="weather-brand">
              <div className="weather-icon-badge">
                <CloudSun size={24} />
              </div>
              <div>
                <div className="weather-title-row">
                  <span className="weather-title">Agricultural Weather & Field Telemetry</span>
                  <span className="weather-badge-region">Punjab Core</span>
                  <span
                    className={`weather-misting-badge ${
                      weather.advisories?.droneSpraying?.status === 'Ideal'
                        ? 'ideal'
                        : weather.advisories?.droneSpraying?.status === 'Caution'
                        ? 'caution'
                        : 'warning'
                    }`}
                  >
                    <span className="pulse-beacon-inline light"></span>
                    <span>Drone Misting: {weather.advisories?.droneSpraying?.status?.toUpperCase() || 'IDEAL'}</span>
                  </span>
                </div>
                <div className="weather-advisory-sub">
                  {weather.advisories?.droneSpraying?.reason || 'Wind speed is below 12 km/h with zero precipitation. Ideal for pesticide and fertilizer misting.'}
                </div>
              </div>
            </div>

            <div className="weather-live-telemetry">
              <div className="weather-temp-block">
                <div className="temp-number">{weather.current?.temperature}°C</div>
                <div className="temp-condition">{weather.current?.condition}</div>
              </div>
              <div className="weather-metrics-divider"></div>
              <div className="weather-metric-chips">
                <div className="metric-chip">
                  <Wind size={13} />
                  <span>{weather.current?.windSpeed} km/h Wind</span>
                </div>
                <div className="metric-chip">
                  <Droplets size={13} />
                  <span>{weather.current?.humidity}% Humidity</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-day daily forecast strip */}
          <div className="weather-forecast-strip">
            {(weather.dailyForecast || []).map((day, idx) => (
              <div key={idx} className="forecast-card">
                <div className="forecast-day">{formatForecastDate(day.date, idx)}</div>
                <div className="forecast-temp">
                  <span className="temp-hi">{day.tempMax}°</span>
                  <span className="temp-slash">/</span>
                  <span className="temp-lo">{day.tempMin}°</span>
                </div>
                <div className="forecast-cond">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations Grid: Live Field Dispatch Radar & Command Cards */}
      <div className="dashboard-main-grid">
        {/* Live Operations Dispatch Radar */}
        <div className="card live-radar-card">
          <div className="card-header">
            <div className="card-title">
              <Radio size={18} color="#10b981" />
              <span>Live Field Dispatch Radar</span>
            </div>
            <button
              onClick={() => onNavigate('bookings')}
              className="btn btn-secondary btn-sm"
            >
              View All Dispatches
            </button>
          </div>

          <div className="table-responsive">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Farmer & Parcel</th>
                  <th>Service Requested</th>
                  <th>Assigned Fleet</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No active dispatches found in the current rotation.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          {b.bookingNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.farmerId?.name || 'Farmer'}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} />
                          {b.parcelDetails?.village || 'Field Parcel'} ({b.parcelDetails?.acreage || 5} Acres)
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{b.serviceId?.title || 'Mechanization Service'}</span>
                      </td>
                      <td>
                        {b.providerId ? (
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#047857' }}>
                            {b.providerId.name}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                            Broadcasting to Area Fleets...
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${b.status}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{b.pricing?.totalAmount?.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Operations Column: Service Stats, Actions & Revenue Flow */}
        <div className="dashboard-side-column">
          {/* Service Statistics Breakdown */}
          <div className="card service-stats-card">
            <div className="card-header">
              <div className="card-title">
                <Tractor size={18} color="#10b981" />
                <span>Service Inventory & Rates</span>
              </div>
              <span className="badge-subtle">{serviceStatistics.length} Active</span>
            </div>

            <div className="service-stats-list">
              {serviceStatistics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No machinery registered yet.
                </div>
              ) : (
                serviceStatistics.map((stat, idx) => {
                  const maxUnits = Math.max(...serviceStatistics.map((s) => s.machineryCount || 1), 12);
                  const pct = Math.min(100, Math.round(((stat.machineryCount || 1) / maxUnits) * 100));
                  return (
                    <div key={idx} className="service-stat-item">
                      <div className="stat-top-row">
                        <span className="stat-category-name">{stat.categoryName}</span>
                        <span className="stat-rate-badge">₹{stat.avgPrice.toLocaleString()} / ac</span>
                      </div>
                      <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="stat-bottom-row">
                        <span className="stat-units-count">{stat.machineryCount} Machinery Units</span>
                        <span className="stat-demand-pill">Active Deployment</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Center */}
          <div className="card action-center-card">
            <div className="card-header">
              <div className="card-title">
                <CheckCircle2 size={18} color="#10b981" />
                <span>Operational Control Center</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onNavigate('live_map')}
                className="btn btn-primary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '11px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={16} />
                  <span>Geospatial Radar & Fleets</span>
                </div>
                <span className="pill-count" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                  {demandClusters.length} Hubs
                </span>
              </button>

              <button
                onClick={() => onNavigate('verification')}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '11px 14px' }}
              >
                <span>Review KYC Verification Queue</span>
                <span className="pill-count">{ops.pendingVerifications || 0}</span>
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '11px 14px' }}
              >
                <span>Approve Provider Payouts</span>
                <span className="pill-count">{ops.pendingPayouts || 0}</span>
              </button>

              <button
                onClick={handleQuickVest}
                disabled={isVesting}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '11px 14px',
                  borderColor: '#bbf7d0',
                  background: '#f0fdf4',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={15} color="#10b981" />
                  <span>{isVesting ? 'Running Vesting Sweep...' : 'Trigger Commission Vesting'}</span>
                </div>
                <Sparkles size={14} color="#d97706" />
              </button>

              {vestingMsg && (
                <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600, padding: '4px 6px' }}>
                  ✓ {vestingMsg}
                </div>
              )}
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="card revenue-flow-card">
            <div className="card-header">
              <div className="card-title">
                <span>Revenue Flow Distribution</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fleet Operators (85%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(financials.providerPayouts || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Field Agents Commission (10%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(financials.agentCommissions || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '10%', background: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ProFarmer Platform Margin (5%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(financials.platformRevenue || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '5%', background: '#0f172a', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


