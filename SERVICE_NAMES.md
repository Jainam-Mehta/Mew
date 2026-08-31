# Service Names Configuration

## 🎯 Current Service Names

The platform now uses these custom service names:

### Service 1: **Sheela**
- **Description**: Smart Agriculture Cold Storage Monitoring
- **Icon**: Thermometer
- **Color**: Blue gradient (from-blue-500 to-blue-600)
- **Features**:
  - 1 Location
  - 14 Sensors
  - 13 Online sensors
  - Temperature & Humidity monitoring
  - Real-time alerts
- **Default Access**: New users get access to Sheela by default

### Service 2: **Mohan**
- **Description**: Industrial Equipment Analytics
- **Icon**: Box
- **Color**: Purple gradient (from-purple-500 to-purple-600)
- **Features**:
  - 8 Devices
  - 99.2% Uptime
  - 2 Active alerts
  - Equipment monitoring
  - Maintenance tracking
- **Default Access**: Requires subscription

### Service 3: **Godbaldeshlalputin**
- **Description**: IoT Device Management Platform
- **Icon**: CPU/Chip
- **Color**: Green gradient (from-green-500 to-green-600)
- **Features**:
  - 24 Total devices
  - 22 Connected devices
  - 1.2GB Data usage
  - Remote device management
  - Connectivity monitoring
- **Default Access**: Requires subscription

---

## 📁 Files Updated

The following files have been updated with the new service names:

1. **src/pages/UserDashboard.jsx**
   - Updated SERVICES array with new names

2. **src/pages/ServiceDetail.jsx**
   - Added service name mapping
   - Dynamic title display

3. **src/App.jsx**
   - Updated SubscriptionRequiredWrapper with name mapping

4. **src/pages/AdminDashboard.jsx**
   - Updated recent activity feed
   - Updated subscription management cards

5. **src/context/AuthContext.jsx**
   - Updated comment for default subscription (Sheela)

---

## 🔧 How to Change Service Names

If you need to update service names in the future:

### 1. Update UserDashboard.jsx
```javascript
const SERVICES = [
  {
    id: 1,
    name: 'Your New Name',  // Change here
    description: 'Your description',
    // ...
  },
  // ...
];
```

### 2. Update ServiceDetail.jsx
```javascript
const serviceNames = {
  '1': 'Your New Name',  // Change here
  '2': 'Another Name',
  '3': 'Third Name'
};
```

### 3. Update App.jsx
```javascript
const serviceNames = {
  '1': 'Your New Name',  // Change here
  '2': 'Another Name',
  '3': 'Third Name'
};
```

### 4. Update AdminDashboard.jsx
Update the activity feed and subscription cards with new names.

---

## 💡 Service Name Guidelines

When choosing service names, consider:

- **Memorable**: Easy to remember and pronounce
- **Unique**: Distinguishable from each other
- **Relevant**: Related to the service function (optional)
- **Professional**: Appropriate for business context
- **Length**: Not too long for UI display (Godbaldeshlalputin is at the limit!)

---

## 🎨 Current Display Examples

### Dashboard Cards
```
┌─────────────────────────┐
│   🌡️  Sheela            │
│   Smart Agriculture     │
│   Cold Storage          │
│   ✅ Accessible         │
└─────────────────────────┘

┌─────────────────────────┐
│   📦  Mohan             │
│   Industrial Equipment  │
│   Analytics             │
│   🔒 Subscription Req.  │
└─────────────────────────┘

┌─────────────────────────┐
│   🖥️  Godbaldeshlalputin│
│   IoT Device Management │
│   Platform              │
│   🔒 Subscription Req.  │
└─────────────────────────┘
```

### Service Detail Page Header
```
← Back    Sheela
         Temperature & Humidity Monitoring
```

### Subscription Required Screen
```
⚠️ Subscription Required

Your current account does not have access to Mohan.
Activate or upgrade your plan to continue...
```

### Admin Recent Activity
```
• John Doe subscribed to Sheela (2 hours ago)
• Jane Smith renewed subscription for Mohan (5 hours ago)
• Bob Johnson cancelled subscription to Godbaldeshlalputin (1 day ago)
```

---

## ✅ Testing Checklist

After changing service names, test:

- [ ] Dashboard displays new names correctly
- [ ] Service cards show new names
- [ ] Service detail pages show correct names in headers
- [ ] Subscription required screens show correct names
- [ ] Admin dashboard activity feed shows new names
- [ ] Admin subscription management shows new names
- [ ] No console errors
- [ ] All navigation still works

---

## 🚀 Current Status

✅ **All service names successfully updated to:**
- Service 1 → **Sheela**
- Service 2 → **Mohan**
- Service 3 → **Godbaldeshlalputin**

The platform is fully functional with the new names!

---

**Last Updated**: August 29, 2026
**Status**: ✅ Complete
