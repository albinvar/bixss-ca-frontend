# Test Credentials - Frontend

Quick reference for testing the CA Management System frontend.

## All Accounts Use Password: `password123`

---

## Quick Login Guide

### Super Admin Login
```
Email:    admin@bixssca.com
Password: password123
```
**What you'll see:**
- System Administration dashboard
- Access to all system features
- User management tools
- System settings

### CA (Chartered Accountant) Login
```
Email:    ca@bixssca.com
Password: password123
```
**What you'll see:**
- Company switcher in the header
- Access to 3 companies (Tech Solutions, Global Enterprises, Innovation Corp)
- Document management interface
- Analysis and history tools

### Company Admin Login
```
Email:    john@techsolutions.com
Password: password123
```
**What you'll see:**
- Tech Solutions Inc company dashboard
- Company management tools
- User management (company scope)
- Document access

**Alternative Company Admin Accounts:**
- `michael@globalenterprises.com` - Global Enterprises Ltd
- `sarah@innovationcorp.com` - Innovation Corp

### Company User Login
```
Email:    jane@techsolutions.com
Password: password123
```
**What you'll see:**
- Tech Solutions Inc company dashboard
- Limited access (view-only for most features)
- Cannot manage users or settings

---

## Testing Flow

1. **Start the backend server** (on port 3001):
   ```bash
   cd ../bixss-ca-backend
   npm run dev
   ```

2. **Start the frontend** (on port 3000):
   ```bash
   npm run dev
   ```

3. **Access the application**:
   ```
   http://localhost:3000
   ```

4. **Login** with any of the test credentials above

5. **Test logout** by clicking on your avatar in the top-right corner

---

## Full Credentials List

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | admin@bixssca.com | password123 | Full system |
| CA | ca@bixssca.com | password123 | 3 companies |
| Company Admin | john@techsolutions.com | password123 | Tech Solutions |
| Company Admin | michael@globalenterprises.com | password123 | Global Enterprises |
| Company Admin | sarah@innovationcorp.com | password123 | Innovation Corp |
| Company User | jane@techsolutions.com | password123 | Tech Solutions (limited) |

---

## Troubleshooting Login Issues

### CORS Errors
If you see CORS errors in the browser console:
- Ensure backend is running on port **3001**
- Ensure frontend is running on port **3000**
- Check that backend `.env` has `CORS_ORIGIN=http://localhost:3000`

### "Invalid credentials" Error
- Double-check the email address
- Ensure password is `password123`
- Verify backend database was seeded (run `npm run seed` in backend)

### Can't See Logout Button
- Click on your **avatar/profile picture** in the top-right corner
- The logout button is at the bottom of the dropdown menu (in red)

---

## API Endpoint Configuration

The frontend is configured to connect to:
```
http://localhost:3001/api
```

This is set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Resetting Test Data

To reset all test data on the backend:

```bash
cd ../bixss-ca-backend
npm run seed
```

This will recreate all test users and companies.
