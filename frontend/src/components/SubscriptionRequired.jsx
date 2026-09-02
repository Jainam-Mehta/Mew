import { useState, useEffect } from 'react';
import { AlertCircle, Phone, MessageCircle, Mail, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const SubscriptionRequired = ({ serviceName }) => {
  const navigate = useNavigate();

  const [contact, setContact] = useState({
    supportPhone: '+91 90904 80044',
    supportWhatsApp: '+91 91961 94288',
    supportEmail: 'sales@company.com',
    companyName: 'Mew Telematics & Cold Chain Solutions'
  });

  useEffect(() => {
    api.get('/settings/contact')
      .then((data) => {
        if (data) {
          setContact((prev) => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch((err) => {
        console.warn('Using fallback contact info:', err);
      });
  }, []);

  const cleanPhone = (contact.supportPhone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (contact.supportWhatsApp || '').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Message */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Subscription Required</h1>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Your current account does not have access to <strong className="text-gray-800">{serviceName}</strong>. 
              Activate or upgrade your plan to continue using live monitoring and analytics.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Why am I seeing this?</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Trial period is over</li>
                <li>Subscription expired or payment pending</li>
                <li>Service not assigned to your organization account</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Contact us to activate:</h3>
              
              <a 
                href={`tel:${cleanPhone}`} 
                className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
              >
                <Phone className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Call Support Hotline</div>
                  <div className="text-sm font-bold text-primary-600">{contact.supportPhone}</div>
                </div>
              </a>

              <a 
                href={`https://wa.me/${cleanWhatsApp}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Connect on WhatsApp Desk</div>
                  <div className="text-sm font-bold text-green-600">{contact.supportWhatsApp}</div>
                </div>
              </a>

              <a 
                href={`mailto:${contact.supportEmail}`} 
                className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors group"
              >
                <Mail className="w-5 h-5 text-navy-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Email Sales / Billing</div>
                  <div className="text-sm font-bold text-navy-600">{contact.supportEmail}</div>
                </div>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Contact our sales desk and we will immediately activate your account.
            </p>
          </div>

          {/* Right side - Illustration */}
          <div className="bg-gradient-to-br from-navy-600 to-primary-700 p-8 md:p-12 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.2">
                  <rect x="50" y="80" width="100" height="80" fill="white" />
                  <path d="M50 80 L100 50 L200 50 L150 80 Z" fill="white" />
                  <path d="M150 80 L200 50 L200 130 L150 160 Z" fill="white" />
                </g>
                
                <circle cx="100" cy="100" r="35" fill="white" opacity="0.3" />
                <rect x="85" y="100" width="30" height="35" rx="4" fill="white" />
                <path d="M90 100 V90 C90 83 93 78 100 78 C107 78 110 83 110 90 V100" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="115" r="4" fill="#1a237e" />
                <rect x="98" y="115" width="4" height="10" fill="#1a237e" />
              </svg>
              
              <h3 className="text-white text-xl font-semibold mt-6 mb-2">Service Access Locked</h3>
              <p className="text-navy-200 text-sm">
                Upgrade your subscription to unlock this service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
