# ⚡ Quick Start Guide

## 🚀 Getting Started (5 minutes)

### 1. Start the Server
```bash
npm run dev
```
**URL**: http://localhost:5173

### 2. Test Admin Access
- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Result**: Full admin dashboard at `/admin`

### 3. Test User Access
- Click "New User? Click here to register"
- **Name**: John Doe
- **Mobile**: +91 98765 43210
- **Email**: john@example.com
- **Password**: password123
- **Result**: User dashboard at `/dashboard` with Service 1 access

---

## 📱 User Features to Test

### ✅ Service 1 (Accessible)
1. Login as user
2. Click "Service 1" card
3. See sensor monitoring dashboard
4. View temperature/humidity data

### 🔒 Service 2 & 3 (Locked)
1. Click "Service 2" or "Service 3" card
2. See "Subscription Required" screen
3. View contact options

---

## 👨‍💼 Admin Features to Test

### User Management
1. Login as admin
2. Click "Users" tab
3. View all registered users
4. See subscription status
5. Access Edit/Delete controls

### Overview Dashboard
1. View total users, revenue, active subscriptions
2. See recent activity feed
3. Monitor system statistics

### Subscriptions
1. Click "Subscriptions" tab
2. View revenue per service
3. See active users per service

---

## 🎨 UI Elements to Explore

- **Gradients**: Navy blue to primary blue
- **Cards**: Hover effects and shadows
- **Icons**: Lucide React icons throughout
- **Responsive**: Try different screen sizes
- **Animations**: Smooth transitions

---

## 🔧 Common Customizations

### Change Admin Password
**File**: `src/context/AuthContext.jsx`
```javascript
const ADMIN_EMAIL = 'admin@company.com';
const ADMIN_PASSWORD = 'admin123'; // Change this
```

### Add New Service
**File**: `src/pages/UserDashboard.jsx`
```javascript
{
  id: 4,
  name: 'Service 4',
  description: 'Your new service',
  icon: YourIcon,
  color: 'from-blue-500 to-blue-600',
  stats: { ... }
}
```

### Change Colors
**File**: `tailwind.config.js`
```javascript
colors: {
  primary: { ... },  // Brand color
  navy: { ... },     // Dark theme
}
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main routing |
| `src/context/AuthContext.jsx` | Authentication logic |
| `src/pages/Login.jsx` | Login page |
| `src/pages/UserDashboard.jsx` | User main page |
| `src/pages/AdminDashboard.jsx` | Admin panel |
| `src/pages/ServiceDetail.jsx` | Service view |
| `tailwind.config.js` | Theme config |

---

## 🐛 Troubleshooting

### Server won't start?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Styles not loading?
- Check `postcss.config.js` has `@tailwindcss/postcss`
- Restart dev server

### Routing not working?
- Check React Router is installed
- Verify `BrowserRouter` in App.jsx

---

## 📞 Support

**Questions?** Check these files:
- `README.md` - Full documentation
- `ARCHITECTURE.md` - Technical details
- `PROJECT_SUMMARY.md` - Complete overview

---

## ✅ Checklist for Demo

- [ ] Server running on localhost:5173
- [ ] Admin login works
- [ ] User registration works
- [ ] Service 1 accessible for users
- [ ] Service 2/3 shows subscription screen
- [ ] Admin dashboard loads all tabs
- [ ] UI looks professional
- [ ] No console errors

---

**You're all set! 🎉**

Navigate to **http://localhost:5173** and start exploring!
