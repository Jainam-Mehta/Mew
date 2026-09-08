import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Users,
  MapPin,
  Compass,
  RefreshCw,
  Search,
  Shield,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLiveUsersMap({ liveUsers = [], onSelectUser }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { isDark } = useTheme();

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [mapStyle, setMapStyle] = useState('streets'); // streets, dark, satellite

  const cities = ['all', ...Array.from(new Set(liveUsers.map((u) => u.city || 'Unknown')))];

  const filteredUsers = liveUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesCity = selectedCity === 'all' || u.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const getTileUrl = () => {
    if (mapStyle === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapStyle === 'dark' || (mapStyle === 'streets' && isDark)) {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const getTileAttribution = () => {
    if (mapStyle === 'satellite') return '&copy; Esri World Imagery';
    return '&copy; OpenStreetMap contributors';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = 20.5937;
      const initialLng = 78.9629; // Center on India
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 5,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add updated tile layer
    L.tileLayer(getTileUrl(), {
      maxNativeZoom: 18,
      maxZoom: 22,
      attribution: getTileAttribution(),
    }).addTo(map);
  }, [mapStyle, isDark]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (filteredUsers.length === 0) return;

    const bounds = L.latLngBounds();

    filteredUsers.forEach((user) => {
      const lat = user.lat || 18.5204;
      const lng = user.lng || 73.8567;
      bounds.extend([lat, lng]);

      const isAdmin = user.role === 'admin';
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

      // Custom pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'custom-live-user-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24],
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background-color: ${
              isAdmin ? 'rgba(99, 102, 241, 0.35)' : 'rgba(16, 185, 129, 0.35)'
            }; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: ${
              isAdmin
                ? 'linear-gradient(135deg, #4f46e5, #312e81)'
                : 'linear-gradient(135deg, #10b981, #047857)'
            }; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 2.5px solid white;">
              ${initial}
            </div>
            <div style="position: absolute; bottom: 0; right: 2px; width: 11px; height: 11px; border-radius: 9999px; background-color: #22c55e; border: 2px solid white;"></div>
          </div>
        `,
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const servicesListHtml = (user.services || [])
        .map(
          (s) =>
            `<span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: 600; border-radius: 4px; background-color: #f1f5f9; color: #1e293b; margin: 2px 2px 0 0;">${s}</span>`
        )
        .join('');

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background: ${
              isAdmin ? '#4f46e5' : '#10b981'
            }; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">
              ${initial}
            </div>
            <div>
              <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${user.name}</div>
              <div style="font-size: 11px; color: #64748b;">${user.email}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; background-color: ${
              isAdmin ? '#e0e7ff' : '#dcfce7'
            }; color: ${isAdmin ? '#3730a3' : '#166534'};">
              ${isAdmin ? 'System Admin' : 'App User'}
            </span>
            <span style="display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;">
              ● ${user.last_active || 'Active now'}
            </span>
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            📍 <strong>${user.city || 'Region'}</strong> — ${user.region || 'Active Gateway'}
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
            <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
              Active Subscribed Services (${user.active_services_count || (user.services || []).length}):
            </div>
            <div>${servicesListHtml || '<span style="font-size: 11px; color: #94a3b8;">No services assigned</span>'}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
    });

    if (filteredUsers.length > 0 && mapInstanceRef.current) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [filteredUsers, isDark]);

  const handleResetBounds = () => {
    if (!mapInstanceRef.current || filteredUsers.length === 0) return;
    const bounds = L.latLngBounds();
    filteredUsers.forEach((u) => {
      bounds.extend([u.lat || 18.5204, u.lng || 73.8567]);
    });
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header & Controls Toolbar */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-50 dark:bg-primary-950/60 rounded-xl text-primary-600 dark:text-primary-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                Live Active Users Telemetry Map
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {filteredUsers.length} Online
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Real-time regional footprint of all registered users and administrators actively utilizing Mew.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search user / city..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="py-1.5 px-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-lg text-xs outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Regions' : c}
              </option>
            ))}
          </select>

          {/* Map Layer Switcher */}
          <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-lg p-0.5 bg-gray-50 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapStyle === 'streets'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapStyle === 'satellite'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Fit Bounds Button */}
          <button
            onClick={handleResetBounds}
            className="p-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Fit All Users in View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-[380px] z-10" />

        {/* Floating Quick Region Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 pointer-events-none">
          {cities
            .filter((c) => c !== 'all')
            .slice(0, 4)
            .map((city) => {
              const count = liveUsers.filter((u) => u.city === city).length;
              return (
                <div
                  key={city}
                  className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/60 dark:border-slate-800 text-[11px] font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-primary-500" />
                  <span>{city}</span>
                  <span className="px-1.5 py-0.2 bg-primary-100 dark:bg-primary-900/70 text-primary-700 dark:text-primary-300 rounded-full text-[10px]">
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
