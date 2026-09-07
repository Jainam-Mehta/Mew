import React, { useState } from 'react';
import { 
  LogOut, Bell, Phone, User, Activity, CheckCircle2, 
  ChevronDown, ShieldCheck, Thermometer, Zap, Radio, 
  Gauge, BatteryCharging, Droplets, Wind, Vibrate, 
  Flame, ShieldAlert, Sprout, FlameKindling, Sun, Moon
} from 'lucide-react';
import MewIcon from '../MewIcon';
import { useTheme } from '../../context/ThemeContext';

export const CATEGORIES = [
  { id: 'temp', label: 'Temp/Humidity', icon: Thermometer, color: 'text-blue-500' },
  { id: 'ems', label: 'Energy', icon: Zap, color: 'text-amber-500' },
  { id: 'dg', label: 'DG', icon: Radio, color: 'text-orange-500' },
  { id: 'trans', label: 'Transformer', icon: Gauge, color: 'text-indigo-500' },
  { id: 'pump', label: 'Pump', icon: Activity, color: 'text-cyan-500' },
  { id: 'bms', label: 'UPS', icon: BatteryCharging, color: 'text-green-500' },
  { id: 'wms', label: 'Tank', icon: Droplets, color: 'text-blue-600' },
  { id: 'hvc', label: 'HVAC', icon: Wind, color: 'text-teal-500' },
  { id: 'vib', label: 'Vibration', icon: Vibrate, color: 'text-purple-500' },
  { id: 'fms', label: 'Fire System', icon: Flame, color: 'text-red-500' },
  { id: 'nbs', label: 'Netsafe', icon: ShieldAlert, color: 'text-emerald-500' },
  { id: 'agr', label: 'Agriculture', icon: Sprout, color: 'text-lime-500' },
  { id: 'steam', label: 'Steam/Boiler', icon: FlameKindling, color: 'text-rose-500' },
];

const PortalNavbar = ({
  activeCategory,
  onSelectCategory,
  onOpenProfile,
  onOpenAlarms,
  user,
  profile,
  logout,
  alarmCount = 1,
  contactPhone = '+91 90904 80044',
  platformName = 'Mew',
  tagline = 'Cold Storage & IoT Telematics'
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const cleanPhone = (contactPhone || '').replace(/[^0-9+]/g, '');
  const orgName = profile?.user_name || user?.name || 'Mew';
  const credits = profile?.credit !== undefined ? profile.credit : 100.0;

  return (
    <nav className="bg-navy-800 text-white shadow-lg sticky top-0 z-40 border-b border-navy-700">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="p-1 bg-navy-700/80 rounded-xl border border-white/10 shadow-inner">
              <MewIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">{platformName}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded text-xs font-semibold">
                  Enterprise IoT
                </span>
              </div>
              <span className="text-xs text-navy-200 block truncate max-w-[200px] sm:max-w-none">
                {orgName} • {tagline}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Direct Support Hotline */}
            <a
              href={`tel:${cleanPhone}`}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-700/70 hover:bg-navy-600 text-navy-100 hover:text-white text-xs border border-navy-600 transition-all shadow-xs"
              title="Direct Operations Hotline"
            >
              <Phone className="w-3.5 h-3.5 text-primary-300" />
              <span>{contactPhone}</span>
            </a>

            {/* Live Operational Status */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Alarm Notification Bell */}
            <button
              onClick={onOpenAlarms}
              className="relative p-2 text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
              title="Active Alarms Feed"
            >
              <Bell className="w-5 h-5" />
              {alarmCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow">
                  {alarmCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-300 animate-spin-slow" /> : <Moon className="w-5 h-5 text-navy-200" />}
            </button>

            {/* User Profile Pill / Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                  {orgName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{orgName}</p>
                  <p className="text-[10px] text-primary-300 leading-none">{credits} Cr</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-navy-300" />
              </button>

              {/* Profile Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 text-gray-800 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{orgName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Renewal: {profile?.renewal_date || '13-July-2027'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-primary-600" />
                    <span>Organization Profile & Meters</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAlarms();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-primary-600" />
                    <span>Alarms & Notifications</span>
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Switcher Bar (Top Nav Tabs) */}
      <div className="bg-navy-900 border-t border-navy-700/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-1.5 min-w-max">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20 font-semibold'
                      : 'text-navy-200 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PortalNavbar;
