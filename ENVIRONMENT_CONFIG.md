# Environment Configuration

All hardcoded URLs have been removed and replaced with dynamic environment configuration.

## Changes Made

### Backend Configuration

**File**: `backend/config/env.php`
- Auto-detects localhost vs production
- Defines `BACKEND_URL`, `FRONTEND_URL`, and `API_URL` constants
- Automatically loaded in `backend/index.php`

**Usage in PHP files**:
```php
// These constants are now available everywhere:
BACKEND_URL   // e.g., http://localhost:8000 or https://your-domain.com
FRONTEND_URL  // e.g., http://localhost:5173 or https://your-domain.com
API_URL       // e.g., http://localhost:8000/api or https://your-domain.com/api
```

### Frontend Configuration

**File**: `src/config/env.js`
- Auto-detects localhost vs production
- Exports `BACKEND_URL`, `FRONTEND_URL`, and `API_BASE_URL`

**Usage in React files**:
```javascript
import { API_BASE_URL } from '../config/env';

// Then use it:
fetch(`${API_BASE_URL}/auth/login`, {...})
```

## Updated Files

### Backend (PHP)
- ✅ `backend/index.php` - Loads env config
- ✅ `backend/config/paystack.php` - Uses FRONTEND_URL for callback
- ✅ `backend/routes/generate-pdf.php` - Uses BACKEND_URL for file URLs

### Frontend (React)
- ✅ `src/App.jsx` - Uses API_BASE_URL for auth endpoints
- ✅ `src/services/api.js` - Uses API_BASE_URL for all API calls
- ✅ `src/components/Login.jsx` - Uses API_BASE_URL
- ✅ `src/components/Register.jsx` - Uses API_BASE_URL
- ✅ `src/components/Dashboard.jsx` - Uses API_BASE_URL
- ✅ `src/components/DashboardLayout.jsx` - Uses API_BASE_URL

## Production Deployment

When deploying to production, **no code changes are needed!**

The system automatically detects the environment and uses:
- Production: `https://your-domain.com`
- Development: `http://localhost:8000` and `http://localhost:5173`

### Optional: Manual Override

If you need to manually set production URLs (e.g., separate frontend/backend domains):

**Backend** (`backend/config/env.php`):
```php
// Force production URLs
define('BACKEND_URL', 'https://api.your-domain.com');
define('FRONTEND_URL', 'https://your-domain.com');
```

**Frontend** (`src/config/env.js`):
```javascript
// Force production URLs
export const BACKEND_URL = 'https://api.your-domain.com';
export const FRONTEND_URL = 'https://your-domain.com';
export const API_BASE_URL = `${BACKEND_URL}/api`;
```

## Cron Job Configuration

For the auto-debit cron job, update it based on your environment:

**Development**:
```bash
0 2 * * * curl http://localhost:8000/api/process-auto-debit
```

**Production**:
```bash
0 2 * * * curl https://your-domain.com/api/process-auto-debit
```

## Benefits

✅ **No hardcoded URLs** - Everything is dynamic
✅ **Automatic detection** - Works in dev and production
✅ **Easy deployment** - No code changes needed
✅ **Flexible** - Can override if needed
✅ **Maintainable** - Single source of truth for URLs
