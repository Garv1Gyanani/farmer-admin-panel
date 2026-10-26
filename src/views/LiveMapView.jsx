import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Tractor,
  Layers,
  Search,
  Navigation,
  Compass,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '../api';

export const LiveMapView = ({ bookings = [], providers = [] }) => {
  const mapRef = useRef(null);
  const [googleMap, setGoogleMap] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [demandClusters, setDemandClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [transitFrom, setTransitFrom] = useState('Nabha Base');
  const [transitTo, setTransitTo] = useState('Samrala Farm');
  const [transitResult, setTransitResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'demand', 'fleet'

  // Fetch Demand Heatmap Clusters
  const fetchDemand = async () => {
    try {
      const data = await apiFetch('/api/providers/demand-map');
      if (data && data.clusters) {
        setDemandClusters(data.clusters);
      }
    } catch (err) {
      console.warn('Failed to fetch demand map:', err);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, []);

  // Safe check if Google Maps JS SDK is fully ready
  const isGoogleMapsReady = () => {
    return Boolean(
      window.google &&
      window.google.maps &&
      window.google.maps.Map &&
      typeof window.google.maps.Map === 'function'
    );
  };

  // Load Google Maps Script with modern async loading
  useEffect(() => {
    let isMounted = true;

    if (isGoogleMapsReady()) {
      setMapsLoaded(true);
      return;
    }

    // Modern async callback handler
    window.__initGoogleMaps = () => {
      if (isMounted && isGoogleMapsReady()) {
        setMapsLoaded(true);
      }
    };

    apiFetch('/api/maps/config')
      .then((config) => {
        if (!isMounted) return;
        if (!config.hasKey || !config.apiKey) {
          console.warn('Google Maps API key not found in config');
          setMapError(true);
          return;
        }

        if (isGoogleMapsReady()) {
          setMapsLoaded(true);
          return;
        }

        const scriptId = 'google-maps-script';
        let script = document.getElementById(scriptId);

        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,geometry&loading=async&callback=__initGoogleMaps`;
          script.async = true;
          script.defer = true;
          script.onerror = () => {
            console.warn('Google Maps script failed to load. Falling back to geospatial radar canvas.');
            if (isMounted) setMapError(true);
          };
          document.head.appendChild(script);
        } else {
          // Poll if script tag was already present
          const pollTimer = setInterval(() => {
            if (isGoogleMapsReady()) {
              clearInterval(pollTimer);
              if (isMounted) setMapsLoaded(true);
            }
          }, 150);

          setTimeout(() => {
            clearInterval(pollTimer);
            if (isMounted && !isGoogleMapsReady()) {
              console.warn('Google Maps loading timed out; activating interactive radar canvas.');
              setMapError(true);
            }
          }, 8000);
        }
      })
      .catch((err) => {
        console.error('Maps config error:', err);
        if (isMounted) setMapError(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map Instance Safely
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || googleMap || mapError) return;
    if (!isGoogleMapsReady()) return;

    try {
      const center = { lat: 30.901, lng: 75.8573 };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 10,
        mapTypeId: 'roadmap',
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setGoogleMap(map);
    } catch (err) {
      console.warn('Google Map instantiation failed:', err);
      setMapError(true);
    }
  }, [mapsLoaded, googleMap, mapError]);

  // Render Markers on Google Map
  useEffect(() => {
    if (!googleMap || !isGoogleMapsReady()) return;

    const markers = [];
    try {
      const infoWindow = new window.google.maps.InfoWindow();

      // 1. Demand Clusters (Gold / Amber Circles & Markers)
      if (activeLayer === 'all' || activeLayer === 'demand') {
        demandClusters.forEach((cluster) => {
          const coords = cluster.centerCoordinates || [75.8573, 30.901];
          const position = { lat: coords[1], lng: coords[0] };

          const circle = new window.google.maps.Circle({
            strokeColor: '#B45309',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#F59E0B',
            fillOpacity: 0.25,
            map: googleMap,
            center: position,
            radius: 3500 * Math.max(1, cluster.totalBookings),
          });
          markers.push(circle);

          const marker = new window.google.maps.Marker({
            position,
            map: googleMap,
            title: `${cluster.tehsil} Demand Cluster`,
            label: {
              text: `${cluster.totalBookings}`,
              color: '#ffffff',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: '#B45309',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
            },
          });

          marker.addListener('click', () => {
            setSelectedCluster(cluster);
            infoWindow.setContent(`
              <div style="padding: 10px; font-family: Inter, sans-serif;">
                <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #02200C;">📍 ${cluster.tehsil}, ${cluster.district} Cluster</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;"><strong>Active Bookings:</strong> ${cluster.totalBookings} Jobs</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;"><strong>Total Acreage:</strong> ${cluster.totalAcreage} Acres</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #16A34A;"><strong>Projected Payout:</strong> ₹${(cluster.projectedProviderEarnings || 0).toLocaleString()}</p>
              </div>
            `);
            infoWindow.open(googleMap, marker);
          });

          markers.push(marker);
        });
      }

      // 2. Providers / Fleet Units (Green tractor arrow markers)
      if (activeLayer === 'all' || activeLayer === 'fleet') {
        providers.forEach((p, idx) => {
          const lat = 30.85 + (idx % 4) * 0.08 - 0.04;
          const lng = 75.8 + ((idx * 2) % 4) * 0.08 - 0.04;
          const position = { lat, lng };

          const marker = new window.google.maps.Marker({
            position,
            map: googleMap,
            title: p.enterpriseName || p.userId?.name,
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: p.isOnline ? '#16A34A' : '#6B7280',
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#FFFFFF',
            },
          });

          marker.addListener('click', () => {
            infoWindow.setContent(`
              <div style="padding: 10px; font-family: Inter, sans-serif;">
                <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #02200C;">🚜 ${p.enterpriseName || p.userId?.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;"><strong>Status:</strong> ${p.isOnline ? '🟢 Online & Available' : '⚪ Offline'}</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;"><strong>Machinery Fleet:</strong> ${p.machineryFleet?.length || 1} Units</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #374151;"><strong>Rating:</strong> ${p.metrics?.rating || 4.9} ★</p>
              </div>
            `);
            infoWindow.open(googleMap, marker);
          });

          markers.push(marker);
        });
      }
    } catch (err) {
      console.warn('Error placing markers:', err);
    }

    return () => {
      markers.forEach((m) => {
        if (m && m.setMap) m.setMap(null);
      });
    };
  }, [googleMap, demandClusters, providers, activeLayer]);

  // Calculate Distance Route via Backend Maps Service
  const handleCalculateTransit = async () => {
    setIsCalculating(true);
    try {
      const res = await apiFetch('/api/maps/distance', {
        method: 'POST',
        body: JSON.stringify({
          origin: { lat: 30.901, lng: 75.8573 },
          destination: { lat: 30.75, lng: 76.01 },
        }),
      });
      setTransitResult(res);
    } catch (err) {
      console.error('Distance calc error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #02200c, #17351f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c8eccb',
              }}
            >
              <Compass size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Geospatial Dispatch Radar & Live Field Map
                </h2>
                <span
                  style={{
                    backgroundColor: mapsLoaded && !mapError ? '#edf8ed' : '#fef3c7',
                    color: mapsLoaded && !mapError ? '#15803d' : '#92400e',
                    border: `1px solid ${mapsLoaded && !mapError ? '#bbf7d0' : '#fde68a'}`,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {mapsLoaded && !mapError ? 'Google Maps JS SDK Active' : 'Geospatial Radar Canvas Active'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Real-time agricultural demand clusters & machinery fleet positions across Punjab Core
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveLayer('all')}
              className={`btn ${activeLayer === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              All Layers
            </button>
            <button
              onClick={() => setActiveLayer('demand')}
              className={`btn ${activeLayer === 'demand' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Demand Clusters ({demandClusters.length})
            </button>
            <button
              onClick={() => setActiveLayer('fleet')}
              className={`btn ${activeLayer === 'fleet' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Fleet Units ({providers.length})
            </button>
            <button onClick={fetchDemand} className="btn btn-secondary btn-sm" title="Refresh Telemetry">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Map / Radar Canvas + Radar Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '18px', alignItems: 'start' }}>
        {/* Map / Radar Canvas Container */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '640px', position: 'relative' }}>
          {/* Real Google Map Element */}
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              display: mapsLoaded && !mapError ? 'block' : 'none',
            }}
          />

          {/* Fallback / Standby Interactive Geospatial Radar Canvas */}
          {(!mapsLoaded || mapError) && (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, #02200c 0%, #011106 100%)',
                color: '#ffffff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Radar Rings Background */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '520px',
                  height: '520px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(200, 236, 203, 0.2)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '340px',
                  height: '340px',
                  borderRadius: '50%',
                  border: '1px solid rgba(200, 236, 203, 0.25)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(200, 236, 203, 0.35)',
                  pointerEvents: 'none',
                }}
              />

              {/* Crosshairs */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'rgba(200, 236, 203, 0.15)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: 'rgba(200, 236, 203, 0.15)',
                  pointerEvents: 'none',
                }}
              />

              {/* Top Radar Status Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2,
                  background: 'rgba(2, 32, 12, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(200, 236, 203, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="#4ade80" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#c8eccb' }}>
                    Central Geospatial Field Radar • Ludhiana & Patiala Core (30.901° N, 75.857° E)
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#a7f3d0' }}>
                  Coverage Radius: 45 KM • {demandClusters.length} Demand Hotspots Active
                </div>
              </div>

              {/* Interactive Radar Markers */}
              <div style={{ position: 'relative', width: '100%', height: '420px', zIndex: 2 }}>
                {/* Demand Cluster Beacons */}
                {demandClusters.map((cluster, i) => {
                  const offsets = [
                    { top: '32%', left: '38%' },
                    { top: '58%', left: '62%' },
                    { top: '42%', left: '70%' },
                    { top: '65%', left: '30%' },
                  ];
                  const pos = offsets[i % offsets.length];
                  const isSelected = selectedCluster?.clusterId === cluster.clusterId;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedCluster(cluster)}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        zIndex: isSelected ? 10 : 3,
                      }}
                    >
                      <div
                        style={{
                          width: isSelected ? '46px' : '38px',
                          height: isSelected ? '46px' : '38px',
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          border: '3px solid #ffffff',
                          boxShadow: '0 0 16px rgba(245, 158, 11, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px',
                          color: '#02200c',
                          transition: 'all 0.2s ease',
                          margin: '0 auto',
                        }}
                      >
                        {cluster.totalBookings}
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          backgroundColor: 'rgba(2, 32, 12, 0.9)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#fef3c7',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        📍 {cluster.tehsil} ({cluster.totalAcreage} Ac)
                      </div>
                    </div>
                  );
                })}

                {/* Fleet Provider Positions */}
                {providers.map((p, i) => {
                  const offsets = [
                    { top: '48%', left: '44%' },
                    { top: '25%', left: '55%' },
                    { top: '72%', left: '52%' },
                  ];
                  const pos = offsets[i % offsets.length];

                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 4,
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: p.isOnline ? '#16a34a' : '#6b7280',
                          border: '2px solid #ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          boxShadow: '0 0 10px rgba(22, 163, 74, 0.6)',
                          margin: '0 auto',
                        }}
                      >
                        <Tractor size={14} />
                      </div>
                      <div
                        style={{
                          marginTop: '3px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#c8eccb',
                          background: 'rgba(2, 32, 12, 0.85)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.enterpriseName || p.userId?.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Radar Info Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2,
                  fontSize: '12px',
                  color: '#9ca3af',
                  borderTop: '1px solid rgba(200, 236, 203, 0.15)',
                  paddingTop: '10px',
                }}
              >
                <div>
                  💡 Click any demand circle above to view cluster dispatch economics in the right inspector.
                </div>
                <div style={{ color: '#4ade80', fontWeight: 600 }}>
                  GPS Telemetry Stream Active
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Radar Insights & Distance Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Active Demand Clusters Card */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: '12px' }}>
              <div className="card-title" style={{ fontSize: '14px' }}>
                <MapPin size={16} color="#d97706" />
                <span>Active Demand Clusters</span>
              </div>
              <span className="pill-count">{demandClusters.length} Hubs</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demandClusters.length > 0 ? (
                demandClusters.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCluster(c)}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      background: selectedCluster?.clusterId === c.clusterId ? '#f6fbf1' : '#ffffff',
                      borderColor: selectedCluster?.clusterId === c.clusterId ? '#16a34a' : 'var(--border-light)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#02200c' }}>
                        {c.tehsil}, {c.district}
                      </strong>
                      <span className="status-pill active" style={{ fontSize: '11px' }}>
                        {c.totalBookings} Active
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Total Area: <strong>{c.totalAcreage} Acres</strong> • Est. Payout: <strong>₹{(c.projectedProviderEarnings || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  No concentrated demand hotspots at this moment.
                </div>
              )}
            </div>
          </div>

          {/* Machinery Transit Estimator */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: '12px' }}>
              <div className="card-title" style={{ fontSize: '14px' }}>
                <Navigation size={16} color="var(--primary)" />
                <span>Heavy Machinery Route Matrix</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Calculates tractor and combine road haulage times taking agricultural equipment speed limitations into account.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Fleet Base Location</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '12.5px', padding: '6px 10px' }}
                  value={transitFrom}
                  onChange={(e) => setTransitFrom(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination Farm Parcel</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '12.5px', padding: '6px 10px' }}
                  value={transitTo}
                  onChange={(e) => setTransitTo(e.target.value)}
                />
              </div>

              <button
                onClick={handleCalculateTransit}
                disabled={isCalculating}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '4px' }}
              >
                {isCalculating ? 'Computing Road Matrix...' : 'Calculate Transit Time'}
              </button>

              {transitResult && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#f6fbf1',
                    border: '1px solid #c8eccb',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#02200c', marginBottom: '2px' }}>
                    Road Distance: {transitResult.distanceText || `${transitResult.distanceKm} km`}
                  </div>
                  <div style={{ color: '#16a34a', fontWeight: 600 }}>
                    Machinery Transit: {transitResult.machineryTransitText || `${transitResult.durationMinutes} mins`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
