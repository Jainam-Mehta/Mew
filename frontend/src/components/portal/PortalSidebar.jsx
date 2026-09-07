import React from 'react';
import { 
  LayoutDashboard, LineChart, BellRing, ClipboardList, 
  FileText, CalendarClock, AlertOctagon, HelpCircle, 
  ChevronRight, Shield, Cpu, Flame, Layers
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analysis', label: 'Analysis', icon: LineChart },
  { id: 'alarms', label: 'Set Alerts', icon: BellRing },
  { id: 'alarms_list', label: 'Alarms List', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'all_alerts', label: 'All Alerts', icon: AlertOctagon },
  { id: 'help', label: 'Help Desk', icon: HelpCircle },
];

const SUB_DOMAINS = [
  { id: 'main', label: 'Primary Section' },
  { id: 'indoor', label: 'Indoor Rooms' },
  { id: 'outdoor', label: 'Outdoor Weather' },
  { id: 'busbar', label: 'BusBar Chamber' },
];

const PortalSidebar = ({
  activeTab,
  onSelectTab,
  activeSubDomain = 'main',
  onSelectSubDomain,
  categoryLabel = 'Temperature & Cold Chain',
  meterName = 'Temp',
  sensorLocation = 'Server Room Section 1',
  profile
}) => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col shrink-0 min-h-[calc(100vh-6.5rem)] shadow-xs transition-colors duration-300">
      {/* Category Subtitle & Active Meter Pill */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 transition-colors duration-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
            Active Domain
          </span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate" title={categoryLabel}>
          {categoryLabel}
        </h3>

        {/* Selected Meter Badge */}
        <div className="mt-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 shadow-2xs flex items-center gap-2.5 transition-colors duration-300">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-600 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">{meterName}</p>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">#225</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{sensorLocation}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 py-3 px-3 overflow-y-auto space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-3 py-1">
          Navigation
        </div>

        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold shadow-2xs border border-primary-100 dark:border-primary-800'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-600" />}
            </button>
          );
        })}

        {/* Sub-Domains / Sections */}
        <div className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-3 py-1">
            Facility Sub-Zones
          </div>
          <div className="space-y-0.5 mt-1">
            {SUB_DOMAINS.map((sub) => {
              const isSubActive = activeSubDomain === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubDomain && onSelectSubDomain(sub.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSubActive
                      ? 'text-primary-700 dark:text-primary-400 font-semibold bg-blue-50/50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{sub.label}</span>
                  {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organization Account Footer Status */}
      <div className="p-3 m-3 bg-gradient-to-br from-navy-700 to-navy-800 text-white rounded-xl shadow-xs text-xs">
        <div className="flex items-center gap-2 mb-1.5 text-primary-300 font-semibold text-[11px]">
          <Shield className="w-3.5 h-3.5" />
          <span>{profile?.user_name || '1 Accord'}</span>
        </div>
        <p className="text-[11px] text-navy-200 mb-2">
          Renewal: {profile?.renewal_date || '13-July-2027'}
        </p>
        <div className="flex items-center justify-between text-[10px] bg-white/10 px-2 py-1 rounded-lg border border-white/10">
          <span className="text-navy-200">Balance</span>
          <span className="font-bold text-white">{profile?.credit !== undefined ? profile.credit : 100} Credits</span>
        </div>
      </div>
    </aside>
  );
};

export default PortalSidebar;
