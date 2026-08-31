<<<<<<< HEAD
# Multi-Tenant SaaS Platform

A professional, multi-service subscription management platform built with React, featuring separate dashboards for users and administrators.

## 🚀 Features

### User Features
- **Single Login Portal** - Unified login for all users with automatic admin detection
- **Service Dashboard** - View all available services with subscription status
- **Subscription-Based Access** - Services locked behind subscriptions with elegant "Subscription Required" screens
- **Real-time Monitoring** - Live sensor data and analytics for subscribed services
- **Professional UI** - Navy blue theme with gradient designs and smooth animations

### Admin Features
- **Full System Control** - Complete access to all features and services
- **User Management** - Create, edit, and delete users
- **Subscription Control** - Assign services to users, manage billing
- **Analytics Dashboard** - View platform statistics, revenue, and user activity
- **Service Configuration** - Control which services are available to which users

## 🎨 Design

- **Color Scheme**: Navy blue (#1a237e to #3f51b5) with primary accent (#0066ff)
- **Professional & Clean**: Minimalist design with focus on functionality
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Consistent Branding**: Unified design language across all pages

## 📦 Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom configuration
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **State Management**: Context API for authentication

## 🏗️ Project Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication context and logic
├── pages/
│   ├── Login.jsx                # Login page with admin detection
│   ├── UserDashboard.jsx        # User dashboard with service tiles
│   ├── AdminDashboard.jsx       # Admin panel with full controls
│   └── ServiceDetail.jsx        # Detailed service view with analytics
├── components/
│   └── SubscriptionRequired.jsx # Subscription required screen
├── App.jsx                      # Main app with routing
├── main.jsx                     # Entry point
└── index.css                    # Global styles with Tailwind
```

## 🔐 Access Credentials

### Admin Access
- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Dashboard**: Full system control at `/admin`

### Regular User Access
- **Any Email**: Accepts any valid email
- **Any Password**: No validation (for frontend demo)
- **Additional Fields Required**:
  - Full Name
  - Mobile Number
- **Dashboard**: Service-specific view at `/dashboard`

## 🎯 Services

The platform currently supports 3 services (placeholder names):

1. **Service 1** - Smart Agriculture Cold Storage Monitoring
   - 14 sensors
   - Temperature & humidity tracking
   - Real-time alerts
   - Analytics dashboard

2. **Service 2** - Industrial Equipment Analytics
   - Equipment monitoring
   - Uptime tracking
   - Maintenance alerts

3. **Service 3** - IoT Device Management Platform
   - Device connectivity monitoring
   - Data usage tracking
   - Remote management

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The optimized files will be in the `dist/` folder.

## 📱 User Flow

### For Regular Users:
1. Navigate to login page
2. Click "New User? Click here to register"
3. Fill in: Name, Mobile, Email, Password
4. Login → Redirected to `/dashboard`
5. See services with subscription status
6. Click subscribed service → View detailed analytics
7. Click unsubscribed service → See "Subscription Required" screen

### For Admins:
1. Navigate to login page
2. Enter admin credentials
3. Login → Redirected to `/admin`
4. Access all features:
   - Overview with statistics
   - User management (add/edit/delete)
   - Subscription management
   - System settings

## 🔧 Configuration

### Default User Subscriptions
Users created through the login page automatically get access to **Service 1** only. Admins can modify this in the User Management section.

### Admin Credentials
Hardcoded in `src/context/AuthContext.jsx`:
```javascript
const ADMIN_EMAIL = 'admin@company.com';
const ADMIN_PASSWORD = 'admin123';
```

### Service Definitions
Edit services in `src/pages/UserDashboard.jsx`:
```javascript
const SERVICES = [
  {
    id: 1,
    name: 'Service 1',
    description: 'Smart Agriculture Cold Storage Monitoring',
    // ... more configuration
  },
  // Add more services
];
```

## 🎨 Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: { ... },  // Main accent color
  navy: { ... },     // Dark theme color
}
```

### Custom Components
All reusable component classes are in `src/index.css`:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container style
- `.input-field` - Input field style

## 🚀 Future Enhancements

### Backend Integration
- Connect to REST API or GraphQL
- Real database (PostgreSQL, MongoDB)
- JWT authentication
- Payment gateway integration

### Features to Add
- User profile management
- Billing and invoicing
- Email notifications
- Two-factor authentication
- Service analytics and reporting
- Export data functionality
- Multi-language support
- Dark mode toggle

## 📞 Contact Information

For subscription inquiries:
- **Phone**: +91 90904 80044
- **WhatsApp**: +91 91961 94288
- **Email**: sales@company.com

## 📄 License

This is a proprietary project for [Your Company Name]. All rights reserved.

## 👥 Development

**Current Status**: Frontend prototype complete
**Next Steps**: Backend integration and database setup

---

Built with ❤️ using React + Vite + Tailwind CSS
=======
# Mew
>>>>>>> 3f1527759b5ddc21a66617d76c8583b8c245a1b4
