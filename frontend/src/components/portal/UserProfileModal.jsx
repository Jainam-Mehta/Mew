import React from 'react';
import { 
  X, User, Mail, Phone, Calendar, CreditCard, Shield, 
  Cpu, Clock, MapPin, CheckCircle, Bell, Sparkles 
} from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, profile, user }) => {
  if (!isOpen) return null;

  const data = profile || {
    user_name: user?.name || '1 Accord',
    client_email: user?.email || 'adityadesu@1accord.in',
    contact_no: '+91 9819393688',
    credit: 100.0,
    renewal_date: '13-July-2027',
    dashboard_type: 'Temperature & Humidity',
    temp_meters: [
      {
        id: 2696,
        location_name: 'Server Room Section 1',
        sensor_id: 225,
        sensor_name: 'Temp',
        shift_time: '00:00:00',
      }
    ],
    company_name: 'Mew Telematics & Cold Chain Solutions'
  };

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-navy-700 flex items-center justify-center text-white shadow-md font-bold text-lg">
              {data.user_name ? data.user_name.charAt(0).toUpperCase() : '1'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {data.user_name}
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold border border-green-200">
                  Active Account
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Organization Profile & Assigned Telemetry Gateways
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Credits</span>
            </div>
            <p className="text-2xl font-bold text-navy-900">{data.credit.toFixed(1)}</p>
            <span className="text-xs text-blue-600 font-medium">Auto-renew enabled</span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Renewal Date</span>
            </div>
            <p className="text-lg font-bold text-navy-900">{data.renewal_date}</p>
            <span className="text-xs text-purple-600 font-medium">Valid Subscription</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Primary System</span>
            </div>
            <p className="text-sm font-bold text-navy-900 truncate" title={data.dashboard_type}>
              {data.dashboard_type}
            </p>
            <span className="text-xs text-emerald-600 font-medium">Live Telemetry</span>
          </div>
        </div>

        {/* Contact Information Details */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200/80">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Organization Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">Registered Email</span>
                <span className="font-medium text-gray-800">{data.client_email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">Contact Phone</span>
                <span className="font-medium text-gray-800">{data.contact_no}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">Account Role</span>
                <span className="font-medium text-gray-800 capitalize">{user?.role || 'user'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">Alert Escalation</span>
                <span className="font-medium text-green-700">SMS & WhatsApp Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Meters & Hardware Sensors */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Assigned Sensors & Hardware Gateways</span>
            <span className="text-xs font-normal text-gray-400">
              {data.temp_meters?.length || 0} Registered Unit(s)
            </span>
          </h4>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Sensor / Meter</th>
                  <th className="p-3">Hardware ID</th>
                  <th className="p-3">Facility Location</th>
                  <th className="p-3">Shift Time</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.temp_meters && data.temp_meters.length > 0 ? data.temp_meters : [
                  { id: 2696, location_name: 'Server Room Section 1', sensor_id: 225, sensor_name: 'Temp', shift_time: '00:00:00' }
                ]).map((meter, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3 font-semibold text-gray-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary-600" />
                      {meter.sensor_name || 'Temp'}
                    </td>
                    <td className="p-3 text-gray-600">
                      #{meter.sensor_id || 225}
                    </td>
                    <td className="p-3 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {meter.location_name || 'Server Room Section 1'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {meter.shift_time || '00:00:00'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Configured
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Platform powered by {data.company_name}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
