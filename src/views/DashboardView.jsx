import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Tractor,
  Activity,
  IndianRupee,
  ShieldAlert,
  ArrowUpRight,
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
  const charts = kpis.charts || [
    { month: 'May', gmv: 68000, bookings: 14, revenue: 3400 },
    { month: 'Jun', gmv: 95000, bookings: 21, revenue: 4750 },
    { month: 'Jul', gmv: 140000, bookings: 32, revenue: 7000 },
    { month: 'Aug', gmv: 215000, bookings: 48, revenue: 10750 },
    { month: 'Sep', gmv: 385000, bookings: 68, revenue: 19250 },
  ];
  const serviceStatistics = kpis.serviceStatistics || [
    { categoryName: 'Land Preparation', machineryCount: 12, avgPrice: 1850 },
    { categoryName: 'Drone Nano-Urea Spraying', machineryCount: 6, avgPrice: 450 },
    { categoryName: 'Sowing & Precision Seeding', machineryCount: 8, avgPrice: 1400 },
    { categoryName: 'Harvesting & Residue Mgmt', machineryCount: 9, avgPrice: 2600 },
  ];

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

  return (
    <div>
      {/* 6 Key KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Users</span>
            <div className="kpi-icon-wrap forest">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{users.totalUsers || 0}</div>
          <div className="kpi-trend positive" style={{ fontSize: '12px' }}>
            <span>{users.totalFarmers || 0} Farmers • {users.totalAgents || 0} Agents • {users.totalProviders || 0} Fleets</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Active & Online</span>
            <div className="kpi-icon-wrap blue">
              <Tractor size={20} />
            </div>
          </div>
          <div className="kpi-value">{users.activeUsers || 0}</div>
          <div className="kpi-trend positive">
            <span className="pulse-beacon" style={{ display: 'inline-block' }}></span>
            <span>{users.onlineProviders || 0} Fleet Operators Online</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Field Operations</span>
            <div className="kpi-icon-wrap purple">
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{ops.totalBookings || (ops.activeBookings + ops.completedBookings) || 0}</div>
          <div className="kpi-trend positive">
            <Clock size={14} />
            <span>{ops.activeBookings || 0} Active • {ops.completedBookings || 0} Done</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Gross Volume (GMV)</span>
            <div className="kpi-icon-wrap forest">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{(financials.grossMerchandiseValue || 0).toLocaleString()}</div>
          <div className="kpi-trend positive">
            <span>Escrow Protected Volume</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Platform Revenue</span>
            <div className="kpi-icon-wrap earth">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{(financials.platformRevenue || 0).toLocaleString()}</div>
          <div className="kpi-trend positive">
            <span>₹{(financials.agentCommissions || 0).toLocaleString()} to Agents</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Pending Approvals</span>
            <div className="kpi-icon-wrap earth">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="kpi-value">{(ops.pendingVerifications || 0) + (ops.pendingPayouts || 0)}</div>
          <div className="kpi-trend urgent">
            <span>{ops.pendingVerifications || 0} KYC • {ops.pendingPayouts || 0} Payouts</span>
          </div>
        </div>
      </div>

      {/* Agro-Weather & Micro-Climate Telemetry Card */}
      {weather && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #02200c 0%, #17351f 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(200, 236, 203, 0.25)',
            boxShadow: '0 8px 24px rgba(2, 32, 12, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(200, 236, 203, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c8eccb',
                }}
              >
                <CloudSun size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>
                    Agricultural Weather & Field Telemetry • Punjab Core
                  </span>
                  <span
                    style={{
                      background:
                        weather.advisories?.droneSpraying?.status === 'Ideal'
                          ? '#15803d'
                          : weather.advisories?.droneSpraying?.status === 'Caution'
                          ? '#b45309'
                          : '#b91c1c',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    Drone Misting: {weather.advisories?.droneSpraying?.status?.toUpperCase() || 'IDEAL'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#c8eccb', opacity: 0.9, marginTop: '2px' }}>
                  {weather.advisories?.droneSpraying?.reason}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{weather.current?.temperature}°C</div>
                <div style={{ fontSize: '11px', color: '#c8eccb', opacity: 0.85 }}>{weather.current?.condition}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Wind size={14} color="#c8eccb" />
                  <span>{weather.current?.windSpeed} km/h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Droplets size={14} color="#c8eccb" />
                  <span>{weather.current?.humidity}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-day strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {(weather.dailyForecast || []).map((day, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: '#c8eccb', fontWeight: 600 }}>{day.date}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0' }}>
                  {day.tempMax}° / {day.tempMin}°
                </div>
                <div style={{ fontSize: '10.5px', color: '#e5e7eb', opacity: 0.8 }}>{day.condition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics & Service Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Growth Trends Chart Card */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--primary)" />
              <span>Platform Trajectory & GMV Growth</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              May – September 2026
            </div>
          </div>

          <div style={{ padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#15803d', borderRadius: '3px', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 600 }}>GMV (₹ Lakhs)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#b45309', borderRadius: '3px', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 600 }}>Bookings Placed</span>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                Peak Season Run-rate: ₹3.85 Lakhs / mo
              </div>
            </div>

            {/* SVG Interactive Area & Bar Chart */}
            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#15803d" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#15803d" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#e5e7eb" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#e5e7eb" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#e5e7eb" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#d1d5db" />

                {/* Area path */}
                <path
                  d="M 60 115 L 150 98 L 240 78 L 330 52 L 420 22 L 420 130 L 60 130 Z"
                  fill="url(#gmvGrad)"
                />

                {/* Line path */}
                <path
                  d="M 60 115 L 150 98 L 240 78 L 330 52 L 420 22"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data points & labels */}
                {charts.map((c, i) => {
                  const x = 60 + i * 90;
                  const y = 115 - i * 23;
                  return (
                    <g key={i}>
                      <rect
                        x={x - 12}
                        y={130 - (c.bookings * 1.3)}
                        width="24"
                        height={c.bookings * 1.3}
                        fill="#b45309"
                        opacity="0.85"
                        rx="3"
                      />
                      <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#15803d" strokeWidth="3" />
                      <text x={x} y="146" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">
                        {c.month}
                      </text>
                      <text x={x} y={y - 8} textAnchor="middle" fontSize="10.5" fill="#15803d" fontWeight="700">
                        ₹{(c.gmv / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Service Statistics Breakdown */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Tractor size={18} color="var(--primary)" />
              <span>Service Statistics</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {serviceStatistics.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{stat.categoryName}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '13px' }}>
                    ₹{stat.avgPrice}/Acre
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  <span>{stat.machineryCount} Units Registered</span>
                  <span style={{ color: '#15803d', fontWeight: 600 }}>High Demand</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Live Radar & Financial Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Live Operations Activity */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Radio size={18} color="#16a34a" />
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
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {b.bookingNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.farmerId?.name || 'Farmer'}</div>
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
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1b5e20' }}>
                          {b.providerId.name}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#b7791f', fontWeight: 600 }}>
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
                      <span style={{ fontWeight: 700 }}>₹{b.pricing?.totalAmount?.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations & Financial Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Queue */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <CheckCircle2 size={18} color="#16a34a" />
                <span>Action Center</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onNavigate('live_map')}
                className="btn btn-primary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={16} />
                  <span>Open Live Geospatial Radar</span>
                </div>
                <span className="pill-count" style={{ background: '#ffffff', color: '#02200c' }}>
                  {demandClusters.length} Hubs
                </span>
              </button>

              <button
                onClick={() => onNavigate('verification')}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '12px 14px' }}
              >
                <span>Review Pending KYC Queue</span>
                <span className="pill-count">{ops.pendingVerifications || 0}</span>
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', width: '100%', padding: '12px 14px' }}
              >
                <span>Approve Withdrawal Payouts</span>
                <span className="pill-count">{ops.pendingPayouts || 0}</span>
              </button>

              <button
                onClick={handleQuickVest}
                disabled={isVesting}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderColor: '#c8eccb',
                  background: '#f6fbf1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={15} color="var(--primary)" />
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
          <div className="card" style={{ margin: 0, flex: 1 }}>
            <div className="card-header">
              <div className="card-title">
                <span>Revenue Flow Distribution</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operators / Fleet Payout (85%)</span>
                  <span style={{ fontWeight: 700 }}>₹{(financials.providerPayouts || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', background: '#edf2eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: '#2e7d32', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Field Agent Commissions (10%)</span>
                  <span style={{ fontWeight: 700 }}>₹{(financials.agentCommissions || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', background: '#edf2eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '10%', background: '#b7791f', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform Net Margin (5%)</span>
                  <span style={{ fontWeight: 700 }}>₹{(financials.platformRevenue || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', background: '#edf2eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '5%', background: '#02200c', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
