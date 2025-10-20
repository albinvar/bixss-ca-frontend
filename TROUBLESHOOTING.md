# Troubleshooting Guide

## 401 Unauthorized Error on Companies API

### Symptoms:
- Error: `GET http://localhost:3001/api/companies?limit=100 401 (Unauthorized)`
- Failed to fetch companies
- Network error in console

### Root Cause:
The JWT authentication token is either:
1. Missing from localStorage
2. Expired
3. Invalid (backend restarted with different JWT secret)

### Solution:

#### Step 1: Verify Backend is Running
```bash
cd /Users/athul/Desktop/bixss-ca-backend
npm run dev
```

Should see:
```
✓ Server running on port 3001
✓ MongoDB connected
```

#### Step 2: Check Browser Console
Open browser DevTools (F12) and run:
```javascript
const user = localStorage.getItem('user');
console.log('Stored user:', user ? JSON.parse(user) : 'No user found');
```

If no user or no token, proceed to Step 3.

#### Step 3: Logout and Login Again
1. Click on avatar (top-right)
2. Click "Log Out"
3. Login again with test credentials:
   - **Email**: `ca@bixssca.com`
   - **Password**: `password123`

This will generate a fresh JWT token.

#### Step 4: Verify Token in Network Tab
1. Open DevTools → Network tab
2. Refresh the page
3. Look for `/api/companies` request
4. Check Request Headers - should see:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### If Still Not Working:

#### Check JWT Secret Mismatch
The backend `.env` file has:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

If this changed after you logged in, old tokens won't work.

**Solution**: Just logout and login again.

#### Check CORS Configuration
Backend `.env` should have:
```env
CORS_ORIGIN=http://localhost:3000
```

Frontend must be running on `http://localhost:3000`

#### Check MongoDB Connection
If MongoDB isn't running, user authentication won't work:
```bash
# Check if MongoDB is running
ps aux | grep mongod
```

If not running, start it or use Docker.

## Other Common Issues

### Backend Not Running
**Symptoms**:
- `ERR_CONNECTION_REFUSED`
- `Failed to fetch`

**Solution**:
```bash
cd /Users/athul/Desktop/bixss-ca-backend
npm run dev
```

### Port Already in Use
**Symptoms**:
- `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev
```

### Analysis Microservice Not Running
**Symptoms**:
- Upload works but analysis fails
- No job progress updates

**Solution**:
```bash
cd /Users/athul/Desktop/BixssCA/financial-analysis-microservice
python -m uvicorn src.main:app --reload --port 8000
```

### No Companies Showing in Dropdown
**Symptoms**:
- "No companies assigned to you" message
- Empty dropdown

**Solutions**:

1. **Check if CA is assigned to companies**:
```bash
cd /Users/athul/Desktop/bixss-ca-backend
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function check() {
  await mongoose.connect('mongodb://admin:admin123@localhost:27017/ca_management?authSource=admin');
  const ca = await User.findOne({ email: 'ca@bixssca.com' }).populate('invitedCompanies');
  console.log('CA Companies:', ca.invitedCompanies.map(c => c.name));
  await mongoose.connection.close();
  process.exit(0);
}
check();
"
```

2. **Re-run the seeder** to assign companies:
```bash
npm run seed
```

## Quick Checklist

Before reporting an issue, verify:

- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 3000
- [ ] MongoDB is running
- [ ] You're logged in (check localStorage)
- [ ] JWT token exists in localStorage
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows Authorization header in requests

## Test Credentials

All test accounts use password: `password123`

- **Super Admin**: `admin@bixssca.com`
- **CA**: `ca@bixssca.com`
- **Company Admin**: `john@techsolutions.com`

## Reset Everything

If all else fails, completely reset:

```bash
# 1. Kill all processes
lsof -ti:3000,3001,8000 | xargs kill -9

# 2. Reseed database
cd /Users/athul/Desktop/bixss-ca-backend
npm run seed

# 3. Restart backend
npm run dev

# 4. Restart frontend
cd /Users/athul/Desktop/bixss-ca-frontend
npm run dev

# 5. Clear browser data
# - Open DevTools → Application → Local Storage → Clear All
# - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 6. Login again
# Email: ca@bixssca.com
# Password: password123
```
