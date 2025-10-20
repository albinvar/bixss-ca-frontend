# Frontend Configuration Guide

## API Configuration

The frontend is configured to connect to the backend API. Follow these steps to set up the configuration:

### 1. Environment Variables

Copy the `.env.example` file to create your local environment file:

```bash
cp .env.example .env.local
```

### 2. Environment Variables Explanation

- **NEXT_PUBLIC_API_URL**: The URL of your backend API server
  - Default: `http://localhost:3001`
  - For production, change this to your production API URL

### 3. Backend Requirements

Ensure your backend is running on the correct port and has CORS configured to allow requests from the frontend.

**Backend must be running on**: `http://localhost:3001` (or the URL specified in NEXT_PUBLIC_API_URL)

**Backend CORS configuration**: Must allow origin `http://localhost:3000` (default Next.js dev server port)

## API Client

The frontend uses a centralized API client located at `lib/api.ts`. This client handles:

- Authentication token management
- Request/response formatting
- Error handling
- CORS and headers

### Available API Services

#### Auth API (`authApi`)
- `login(email, password)` - User login
- `register(data)` - User registration
- `getProfile()` - Get current user profile
- `logout()` - User logout
- `refreshToken(token)` - Refresh access token
- `changePassword(current, new)` - Change user password

#### Companies API (`companiesApi`)
- `getAll(params)` - Get all companies with pagination/search
- `getById(id)` - Get company by ID
- `create(data)` - Create new company (Super Admin only)
- `update(id, data)` - Update company
- `delete(id)` - Delete company (Super Admin only)
- `inviteCA(companyId, caId)` - Invite CA to company
- `removeCA(companyId, caId)` - Remove CA from company
- `addAdmin(companyId, userId)` - Add company admin
- `removeAdmin(companyId, userId)` - Remove company admin

#### Users API (`usersApi`)
- `getAll()` - Get all users
- `getById(id)` - Get user by ID
- `update(id, data)` - Update user
- `updateRole(id, role)` - Update user role (Super Admin only)
- `deactivate(id)` - Deactivate user
- `activate(id)` - Activate user
- `delete(id)` - Delete user (Super Admin only)

## Authentication Flow

1. User logs in via `/login` page
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage with user data
4. API client automatically includes token in all subsequent requests
5. On logout, token is removed from localStorage

## Backend Role Mapping

The frontend maps backend roles to simplified frontend roles:

- `SUPER_ADMIN` → `admin`
- `CA` → `ca`
- `COMPANY_ADMIN` → `company`
- `COMPANY_USER` → `company`

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production

For production deployment:

1. Update `NEXT_PUBLIC_API_URL` in your environment to point to your production API
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Ensure backend CORS_ORIGIN is set to `http://localhost:3000`
- Check that backend is running on the correct port (3001)
- Verify the NEXT_PUBLIC_API_URL is correct

### Authentication Errors

If login fails:
- Check backend is running and accessible
- Verify the API endpoint URL is correct
- Check browser console for detailed error messages
- Ensure user credentials exist in the backend database

### Network Errors

If API calls fail:
- Verify backend server is running
- Check the NEXT_PUBLIC_API_URL environment variable
- Inspect Network tab in browser DevTools to see request details
