import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calendar, Download, Thermometer, Droplets, 
  Activity, ArrowUpRight, ArrowDownRight, Sliders, Check 
} from 'lucide-react';

const TelemetryChart = ({ 
  currentTemp = 22.5, 
  currentHum = 63.2, 
  meterName = 'Temp', 
  meterId = 225, 
  location = 'Server Room Section 1' 
}) => {
  const [period, setPeriod] = useState('today'); // 'today', 'yesterday', 'week', 'month'
  const [trendMode, setTrendMode] = useState('daily'); // 'daily', 'monthly'
  const [showTemp, setShowTemp] = useState(true);
  const [showHum, setShowHum] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate deterministic time-series data based on current readings and period
  const seriesData = useMemo(() => {
    const points = [];
    if (period === 'today' || period === 'yesterday') {
      const hours = [
        '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', 
        '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:59'
      ];
      hours.forEach((h, i) => {
        const offset = Math.sin((i / 12) * Math.PI * 2);
        const tempVal = +(currentTemp + offset * 1.8 + ((i % 3) * 0.2 - 0.2)).toFixed(1);
        const humVal = +(currentHum - offset * 3.2 + ((i % 2) * 0.4 - 0.2)).toFixed(1);
        points.push({ time: h, temp: tempVal, hum: humVal });
      });
    } else if (period === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach((d, i) => {
        const offset = Math.sin((i / 7) * Math.PI);
        const tempVal = +(currentTemp - 0.6 + offset * 2.2).toFixed(1);
        const humVal = +(currentHum + 1.2 - offset * 4.1).toFixed(1);
        points.push({ time: d, temp: tempVal, hum: humVal });
      });
    } else {
      // Month
      for (let day = 1; day <= 30; day += 2) {
        const offset = Math.sin((day / 30) * Math.PI * 2);
        const tempVal = +(currentTemp + offset * 2.4).toFixed(1);
        const humVal = +(currentHum - offset * 3.8).toFixed(1);
        points.push({ time: `Day ${day}`, temp: tempVal, hum: humVal });
      }
    }
    return points;
  }, [period, currentTemp, currentHum]);

  // Calculate statistics
  const stats = useMemo(() => {
    const temps = seriesData.map(p => p.temp);
    const hums = seriesData.map(p => p.hum);
    return {
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      avgTemp: +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      maxHum: Math.max(...hums),
      minHum: Math.min(...hums),
      avgHum: +(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
    };
  }, [seriesData]);

  // SVG Chart Geometry
  const width = 800;
  const height = 300;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Scales
  const minTempScale = Math.min(0, stats.minTemp - 2);
  const maxTempScale = Math.max(35, stats.maxTemp + 3);
  const minHumScale = 20;
  const maxHumScale = 100;

  const getX = (index) => paddingLeft + (index / (seriesData.length - 1)) * innerWidth;
  const getYTemp = (val) => paddingTop + innerHeight - ((val - minTempScale) / (maxTempScale - minTempScale)) * innerHeight;
  const getYHum = (val) => paddingTop + innerHeight - ((val - minHumScale) / (maxHumScale - minHumScale)) * innerHeight;

  // Generate smooth SVG Bézier path
  const generateSplinePath = (pts, getYFn) => {
    if (pts.length === 0) return '';
    const points = pts.map((p, i) => ({ x: getX(i), y: getYFn(p) }));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const tempPath = useMemo(() => generateSplinePath(seriesData.map(d => d.temp), getYTemp), [seriesData]);
  const humPath = useMemo(() => generateSplinePath(seriesData.map(d => d.hum), getYHum), [seriesData]);

  // Export Data to CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Probe Name', 'Location', 'Temperature (C)', 'Humidity (%)'];
    const rows = seriesData.map(p => [
      p.time,
      meterName,
      `"${location}"`,
      p.temp,
      p.hum
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mew_Telemetry_${period}_trend.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter & Toolbar Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Presets Button Group */}
        <div className="flex items-center gap-1.5 flex-wrap bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'Last week' },
            { id: 'month', label: 'This Month' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === t.id
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Trend Mode & Series Toggles */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTrendMode('daily')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                trendMode === 'daily' ? 'bg-primary-600 text-white font-semibold' : 'text-gray-600'
              }`}
            >
              Daily Trend
            </button>
            <button
              onClick={() => setTrendMode('monthly')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                trendMode === 'monthly' ? 'bg-primary-600 text-white font-semibold' : 'text-gray-600'
              }`}
            >
              Monthly Trend
            </button>
          </div>

          {/* Temperature Toggle Pill */}
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showTemp
                ? 'bg-blue-50 border-blue-200 text-primary-700'
                : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
            <span>Temp (°C)</span>
            {showTemp && <Check className="w-3 h-3" />}
          </button>

          {/* Humidity Toggle Pill */}
          <button
            onClick={() => setShowHum(!showHum)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showHum
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Humidity (%)</span>
            {showHum && <Check className="w-3 h-3" />}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Export trend telemetry data as CSV"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* High-Resolution Dual-Axis Spline SVG Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-gray-900">
                Temperature & Humidity Highcharts Spline Graph
              </h4>
              <span className="px-2 py-0.5 bg-blue-50 text-primary-700 text-[10px] font-bold rounded-full">
                Dual Axis Spline
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Probe #{meterId} ({meterName}) • Location: {location}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-primary-700">
              <span className="w-3 h-1 bg-primary-600 rounded" />
              Left Axis: Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-3 h-1 bg-teal-500 rounded" />
              Right Axis: Humidity (%)
            </span>
          </div>
        </div>

        {/* SVG Canvas Area */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-72 sm:h-80 select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* Temperature Area Gradient */}
              <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>

              {/* Humidity Area Gradient */}
              <linearGradient id="humAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * innerHeight;
              const tempLabel = Math.round(maxTempScale - ratio * (maxTempScale - minTempScale));
              const humLabel = Math.round(maxHumScale - ratio * (maxHumScale - minHumScale));

              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  {/* Left Y-axis (Temp) */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#64748b"
                    fontFamily="monospace"
                  >
                    {tempLabel}°C
                  </text>
                  {/* Right Y-axis (Humidity) */}
                  <text
                    x={width - paddingRight + 8}
                    y={y + 4}
                    textAnchor="start"
                    fontSize="10"
                    fill="#0f766e"
                    fontFamily="monospace"
                  >
                    {humLabel}%
                  </text>
                </g>
              );
            })}

            {/* Critical Temp Threshold Guides */}
            <line
              x1={paddingLeft}
              y1={getYTemp(28.0)}
              x2={width - paddingRight}
              y2={getYTemp(28.0)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <text
              x={paddingLeft + 10}
              y={getYTemp(28.0) - 4}
              fontSize="9"
              fill="#ef4444"
              fontWeight="bold"
            >
              High Alarm Limit: 28.0°C
            </text>

            {/* Temperature Fill & Spline Path */}
            {showTemp && (
              <>
                <path
                  d={`${tempPath} L ${getX(seriesData.length - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`}
                  fill="url(#tempAreaGrad)"
                />
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Humidity Fill & Spline Path */}
            {showHum && (
              <>
                <path
                  d={`${humPath} L ${getX(seriesData.length - 1)} ${paddingTop + innerHeight} L ${getX(0)} ${paddingTop + innerHeight} Z`}
                  fill="url(#humAreaGrad)"
                />
                <path
                  d={humPath}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Data Interactive Anchor Points & Hover Detection */}
            {seriesData.map((d, i) => {
              const x = getX(i);
              const yT = getYTemp(d.temp);
              const yH = getYHum(d.hum);

              return (
                <g key={i}>
                  {/* Invisible Hit Area */}
                  <rect
                    x={x - innerWidth / (seriesData.length * 2)}
                    y={paddingTop}
                    width={innerWidth / seriesData.length}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint({ ...d, x, yT, yH })}
                    className="cursor-crosshair"
                  />

                  {/* Temperature Dot */}
                  {showTemp && (
                    <circle
                      cx={x}
                      cy={yT}
                      r="4"
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth="2"
                    />
                  )}

                  {/* Humidity Dot */}
                  {showHum && (
                    <circle
                      cx={x}
                      cy={yH}
                      r="4"
                      fill="#ffffff"
                      stroke="#0d9488"
                      strokeWidth="2"
                    />
                  )}

                  {/* X Axis Time Labels */}
                  <text
                    x={x}
                    y={height - paddingBottom + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                    fontWeight="500"
                  >
                    {d.time}
                  </text>
                </g>
              );
            })}

            {/* Hover Tooltip and Crosshair Line */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={paddingTop}
                  x2={hoveredPoint.x}
                  y2={paddingTop + innerHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </g>
            )}
          </svg>

          {/* Hover Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-navy-900 text-white p-2.5 rounded-xl shadow-xl text-xs z-10 animate-fade-in"
              style={{
                left: Math.min(width - 150, Math.max(20, hoveredPoint.x - 60)),
                top: Math.max(10, hoveredPoint.yT - 75),
              }}
            >
              <div className="font-bold text-gray-300 pb-1 border-b border-white/20 mb-1 flex items-center justify-between gap-3">
                <span>{hoveredPoint.time}</span>
                <span className="text-[10px] text-gray-400">Node #{meterId}</span>
              </div>
              <div className="space-y-0.5">
                <p className="flex items-center gap-1.5 text-blue-300 font-semibold">
                  <span>Temp:</span> <strong>{hoveredPoint.temp} °C</strong>
                </p>
                <p className="flex items-center gap-1.5 text-teal-300 font-semibold">
                  <span>Humidity:</span> <strong>{hoveredPoint.hum} % RH</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Maximum Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
              Maximum Values
            </span>
            <div className="mt-2 space-y-1">
              <p className="text-xl font-extrabold text-navy-900">
                {stats.maxTemp} <span className="text-xs font-normal text-gray-500">°C (Temp)</span>
              </p>
              <p className="text-base font-bold text-teal-700">
                {stats.maxHum} <span className="text-xs font-normal text-gray-500">% (Humidity)</span>
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            Max
          </div>
        </div>

        {/* Minimum Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-blue-500" />
              Minimum Values
            </span>
            <div className="mt-2 space-y-1">
              <p className="text-xl font-extrabold text-navy-900">
                {stats.minTemp} <span className="text-xs font-normal text-gray-500">°C (Temp)</span>
              </p>
              <p className="text-base font-bold text-teal-700">
                {stats.minHum} <span className="text-xs font-normal text-gray-500">% (Humidity)</span>
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            Min
          </div>
        </div>

        {/* Average Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-primary-500" />
              Average Values
            </span>
            <div className="mt-2 space-y-1">
              <p className="text-xl font-extrabold text-navy-900">
                {stats.avgTemp} <span className="text-xs font-normal text-gray-500">°C (Temp)</span>
              </p>
              <p className="text-base font-bold text-teal-700">
                {stats.avgHum} <span className="text-xs font-normal text-gray-500">% (Humidity)</span>
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            Avg
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryChart;
