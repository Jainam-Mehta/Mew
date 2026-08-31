# 🎭 Demo Users Documentation

## Overview

The platform now includes 3 pre-configured demo users with different service access levels for easy testing and demonstration.

---

## 🔐 Demo User Credentials

### User 1: Rajesh Kumar
- **Email**: `user1@demo.com`
- **Password**: Any (e.g., `demo`, `123`, `password`)
- **Mobile**: +91 98765 43210
- **Access Level**: Basic
- **Subscribed Services**: 
  - ✅ **Sheela** (Service 1)
  - ❌ Mohan (Locked)
  - ❌ Godbaldeshlalputin (Locked)
- **Subscription Plan**: Monthly
- **Status**: Active

**Use Case**: Demonstrates basic user with single service access

---

### User 2: Priya Sharma
- **Email**: `user2@demo.com`
- **Password**: Any (e.g., `demo`, `123`, `password`)
- **Mobile**: +91 87654 32109
- **Access Level**: Intermediate
- **Subscribed Services**:
  - ✅ **Sheela** (Service 1)
  - ✅ **Mohan** (Service 2)
  - ❌ Godbaldeshlalputin (Locked)
- **Subscription Plan**: Yearly
- **Status**: Active

**Use Case**: Demonstrates user with multiple services but not full access

---

### User 3: Amit Patel
- **Email**: `user3@demo.com`
- **Password**: Any (e.g., `demo`, `123`, `password`)
- **Mobile**: +91 76543 21098
- **Access Level**: Premium
- **Subscribed Services**:
  - ✅ **Sheela** (Service 1)
  - ✅ **Mohan** (Service 2)
  - ✅ **Godbaldeshlalputin** (Service 3)
- **Subscription Plan**: Yearly
- **Status**: Active

**Use Case**: Demonstrates premium user with full access to all services

---

## 🎯 Quick Access

On the login page, you'll find:

1. **Credential List**: Shows all demo user emails and their access levels
2. **Quick Login Buttons**: Click "User 1", "User 2", or "User 3" to auto-fill credentials
3. **Simple Login**: Just email + any password (no name/mobile required for demo users)

### Quick Login Flow:
```
1. Go to login page
2. Click one of the three demo buttons (User 1, User 2, User 3)
3. Email auto-fills
4. Click "Sign In" (password already filled as "demo")
5. Instantly access dashboard
```

---

## 🔄 Service Access Matrix

| User | Sheela | Mohan | Godbaldeshlalputin |
|------|--------|-------|---------------------|
| **Rajesh Kumar** (user1) | ✅ Full Access | 🔒 Locked | 🔒 Locked |
| **Priya Sharma** (user2) | ✅ Full Access | ✅ Full Access | 🔒 Locked |
| **Amit Patel** (user3) | ✅ Full Access | ✅ Full Access | ✅ Full Access |

---

## 💡 Testing Scenarios

### Scenario 1: Basic User Experience
**Login as**: user1@demo.com
- See Sheela card as **accessible** (green, clickable)
- See Mohan as **locked** (red lock icon)
- See Godbaldeshlalputin as **locked** (red lock icon)
- Click Sheela → View full service dashboard
- Click Mohan → See "Subscription Required" screen
- Click Godbaldeshlalputin → See "Subscription Required" screen

### Scenario 2: Multi-Service User
**Login as**: user2@demo.com
- See Sheela and Mohan as **accessible**
- See Godbaldeshlalputin as **locked**
- Access both Sheela and Mohan dashboards
- Get subscription prompt for Godbaldeshlalputin

### Scenario 3: Premium User
**Login as**: user3@demo.com
- See all three services as **accessible**
- No locked services
- Full access to all dashboards
- Complete platform experience

### Scenario 4: Admin Overview
**Login as**: admin@company.com (password: admin123)
- View all 3 demo users in user management
- See subscription breakdown per service
- Monitor activity feed with demo user actions
- Manage service assignments

---

## 🎨 Visual Indicators

### On Dashboard:
- **Accessible Services**: 
  - Green "View Dashboard" button
  - No lock icon
  - Full stats display
  - Clickable card

- **Locked Services**:
  - Red "Contact Sales" button
  - Lock icon badge
  - "Subscription Required" label
  - Clicking shows subscription screen

---

## 🔧 Technical Implementation

### Authentication Logic
Located in `src/context/AuthContext.jsx`:

```javascript
const DEMO_USERS = {
  'user1@demo.com': {
    name: 'Rajesh Kumar',
    subscribedServices: [1], // Only Sheela
  },
  'user2@demo.com': {
    name: 'Priya Sharma',
    subscribedServices: [1, 2], // Sheela + Mohan
  },
  'user3@demo.com': {
    name: 'Amit Patel',
    subscribedServices: [1, 2, 3], // All services
  },
};
```

### Login Flow
1. User enters email from demo list
2. Any password is accepted
3. System matches email to DEMO_USERS
4. Returns predefined user object with subscriptions
5. Redirects to dashboard
6. Services render based on `subscribedServices` array

---

## 📊 Admin Dashboard Data

The admin dashboard shows:

### User List:
- Rajesh Kumar (user1@demo.com) - 1 service
- Priya Sharma (user2@demo.com) - 2 services
- Amit Patel (user3@demo.com) - 3 services

### Recent Activity:
- Rajesh Kumar subscribed to Sheela (2 hours ago)
- Priya Sharma renewed subscription for Mohan (5 hours ago)
- Amit Patel upgraded to access Godbaldeshlalputin (1 day ago)

### Service Revenue:
- Sheela: 3 users, $8,450
- Mohan: 2 users, $5,200
- Godbaldeshlalputin: 1 user, $3,100

---

## 🚀 Demo Presentation Tips

1. **Start with User 1**: Show basic access and locked services
2. **Switch to User 2**: Demonstrate partial access
3. **Show User 3**: Display full premium experience
4. **End with Admin**: Show complete management overview

### Quick Demo Script (5 minutes):

```
1. Show login page with demo credentials (30 sec)
2. Login as User 1 - show locked services (1 min)
3. Logout, login as User 3 - show full access (1 min)
4. Access all three services briefly (1 min)
5. Logout, login as Admin - show management (1.5 min)
6. Questions (remaining time)
```

---

## 🔒 Security Note

**Important**: Demo users accept ANY password for demonstration purposes only.

For production:
- ❌ Remove demo users or disable them
- ✅ Implement proper password validation
- ✅ Use backend authentication
- ✅ Add password hashing (bcrypt)
- ✅ Implement JWT tokens
- ✅ Add rate limiting

---

## 📝 Customization

### To Add More Demo Users:

1. Edit `src/context/AuthContext.jsx`
2. Add to DEMO_USERS object:
```javascript
'user4@demo.com': {
  name: 'Your Name',
  mobile: '+91 XXXXXXXXXX',
  email: 'user4@demo.com',
  role: 'user',
  subscribedServices: [1, 3], // Sheela + Godbaldeshlalputin
},
```

3. Update `src/pages/Login.jsx` to show new user
4. Update `src/pages/AdminDashboard.jsx` user list

### To Change Service Access:

Change the `subscribedServices` array:
- `[1]` = Sheela only
- `[1, 2]` = Sheela + Mohan
- `[1, 2, 3]` = All services
- `[2, 3]` = Mohan + Godbaldeshlalputin (no Sheela)

---

## ✅ Testing Checklist

- [ ] All 3 demo users can login
- [ ] User 1 sees 1 accessible, 2 locked
- [ ] User 2 sees 2 accessible, 1 locked
- [ ] User 3 sees all 3 accessible
- [ ] Quick login buttons work
- [ ] Admin sees all demo users
- [ ] Subscription screens show for locked services
- [ ] No console errors

---

**Last Updated**: August 29, 2026
**Status**: ✅ Demo Users Active and Configured
