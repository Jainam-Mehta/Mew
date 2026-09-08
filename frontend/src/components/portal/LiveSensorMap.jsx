import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, Layers, Maximize2, Minimize2, 
  Thermometer, Droplets, WifiOff, Wifi, Compass, RefreshCw, CheckCircle2 
} from 'lucide-react';

const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  carto: {
    name: 'Carto Light Clean',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  topo: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap'
  }
};

// Facility coordinates for 1 Accord / Server Room Section 1
const FACILITY_LAT = 19.0760;
const FACILITY_LNG = 72.8777;

const LiveSensorMap = ({ 
  sensor = { 
    id: 225, 
    name: 'Temp', 
    location: 'Server Room Section 1', 
    temperature: 22.5, 
    humidity: 63.2, 
    status: 'offline', 
    lastSeen: '31-Aug-26 19:14' 
  },
  onConfigureAlerts
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const facilityMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('osm');
  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [FACILITY_LAT, FACILITY_LNG],
      zoom: 13,
      maxZoom: 22,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Add Tile Layer
    const tileLayer = L.tileLayer(TILE_LAYERS[activeLayer].url, {
      attribution: TILE_LAYERS[activeLayer].attribution,
      maxNativeZoom: 19,
      maxZoom: 22,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Add Zoom Control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom Sensor Marker (HTML DivIcon)
    const isOnline = sensor.status === 'online';
    const markerHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: #0f172a;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          margin-bottom: 4px;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isOnline ? '#22c55e' : '#ef4444'};"></span>
          <span>${sensor.name} #${sensor.id} • ${sensor.temperature !== undefined ? sensor.temperature + '°C' : 'Live'}</span>
        </div>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1e40af;
          border: 3px solid white;
          box-shadow: 0 0 15px rgba(30, 64, 175, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          📍
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'mew-custom-marker',
      html: markerHtml,
      iconSize: [40, 60],
      iconAnchor: [20, 50],
    });

    const facilityMarker = L.marker([FACILITY_LAT, FACILITY_LNG], { icon: customIcon }).addTo(map);
    facilityMarkerRef.current = facilityMarker;

    // Popup Content
    const popupContent = `
      <div style="font-family: inherit; padding: 4px; min-width: 200px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; margin-bottom: 2px;">
          Facility Probe Location
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
          ${sensor.location}
        </div>
        <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 6px 8px; background: #f8fafc; border-radius: 6px; font-size: 12px;">
          <span style="color: #334155;">Temperature: <strong>${sensor.temperature}°C</strong></span>
          <span style="color: #0f766e;">Humidity: <strong>${sensor.humidity}%</strong></span>
        </div>
        <div style="font-size: 11px; color: ${isOnline ? '#16a34a' : '#dc2626'}; font-weight: 600; display: flex; align-items: center; gap: 4px;">
          <span>Status: ${sensor.status.toUpperCase()}</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
          Last seen: ${sensor.lastSeen || 'Recently'}
        </div>
      </div>
    `;
    facilityMarker.bindPopup(popupContent);

    return () => {
      map.remove();
    };
  }, []);

  // Handle Layer change
  const handleLayerChange = (layerKey) => {
    setActiveLayer(layerKey);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(TILE_LAYERS[layerKey].url, {
        attribution: TILE_LAYERS[layerKey].attribution,
        maxNativeZoom: 19,
        maxZoom: 22,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  };

  // Recenter on Facility
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([FACILITY_LAT, FACILITY_LNG], 14, { duration: 1.2 });
      if (facilityMarkerRef.current) {
        facilityMarkerRef.current.openPopup();
      }
    }
  };

  // Locate User's Physical GPS Location
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);

        const map = mapInstanceRef.current;
        if (!map) return;

        // Remove old user marker
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }
        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
        }

        // Custom User Marker
        const userMarkerHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0284c7; border: 3px solid white; box-shadow: 0 0 12px rgba(2,132,199,0.8);"></div>
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(2,132,199,0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          </div>
        `;

        const userIcon = L.divIcon({
          className: 'user-gps-marker',
          html: userMarkerHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const uMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        uMarker.bindPopup(`
          <div style="padding: 4px; font-family: inherit;">
            <strong style="color: #0369a1;">Your Live Position</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}
            </div>
          </div>
        `);
        userMarkerRef.current = uMarker;

        // Draw dotted connecting route
        const latlngs = [
          [latitude, longitude],
          [FACILITY_LAT, FACILITY_LNG]
        ];
        const polyline = L.polyline(latlngs, {
          color: '#2563eb',
          dashArray: '6, 8',
          weight: 3,
          opacity: 0.8
        }).addTo(map);
        routeLineRef.current = polyline;

        // Calculate distance (Haversine formula)
        const R = 6371; // km
        const dLat = ((FACILITY_LAT - latitude) * Math.PI) / 180;
        const dLon = ((FACILITY_LNG - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((FACILITY_LAT * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = (R * c).toFixed(1);
        setDistanceKm(d);

        // Fit both markers in view
        const bounds = L.latLngBounds([
          [latitude, longitude],
          [FACILITY_LAT, FACILITY_LNG]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      },
      (err) => {
        setLocating(false);
        setGeoError(err.message || 'Unable to retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden transition-all flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      {/* Map Header Controls */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-primary-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900">Live Hardware & Facility Map</h4>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-primary-800 text-[10px] font-bold">
                OpenStreetMap GIS
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Sensor Node: <span className="font-semibold text-gray-700">{sensor.location}</span> ({FACILITY_LAT.toFixed(4)}°N, {FACILITY_LNG.toFixed(4)}°E)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-0.5 text-xs">
            {Object.entries(TILE_LAYERS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleLayerChange(key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeLayer === key
                    ? 'bg-navy-800 text-white shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Locate User Button */}
          <button
            onClick={handleLocateUser}
            disabled={locating}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Pinpoint your live physical location on the map"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Locate My Device'}</span>
          </button>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            title="Recenter on Facility Sensor"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Geolocation Feedback Alert */}
      {geoError && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{geoError}</span>
          <button onClick={() => setGeoError('')} className="text-amber-600 font-bold ml-2">&times;</button>
        </div>
      )}

      {distanceKm && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-primary-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary-600" />
          <span>Device located! Distance to Cold Storage Facility: <strong>{distanceKm} km</strong></span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className={`w-full relative z-0 ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-72 sm:h-96'}`}
      />

      {/* Map Bottom Status Bar */}
      <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Facility Node: <strong>Server Room Section 1</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-red-500" />
            <strong>{sensor.temperature}°C</strong>
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-teal-600" />
            <strong>{sensor.humidity}% RH</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[11px]">
            Live OpenStreetMap Stream
          </span>
          {onConfigureAlerts && (
            <button
              onClick={onConfigureAlerts}
              className="text-primary-600 hover:text-primary-800 font-semibold underline text-xs"
            >
              Configure Node Alerts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSensorMap;
