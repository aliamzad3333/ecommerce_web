# Environment Configuration

This file contains environment variable configuration for the ecommerce application.

This project automatically detects whether it's running locally or on the server and configures the API endpoints accordingly.

## How It Works

The app checks the `window.location.hostname` to determine the environment:

### 🏠 Local Development
- **Hostname**: `localhost` or `127.0.0.1`
- **API URL**: `http://localhost:8080/api`
- **Go Backend**: Your local Go server running on port 8080

### 🚀 Production Server
- **Hostname**: `130.94.40.85`
- **API URL**: `http://130.94.40.85:8080/api`
- **Go Backend**: Server's Go backend running on port 8080

## Files

- `src/config/environment.ts` - Main environment configuration
- `src/config/api.ts` - Simple API URL configuration (alternative)
- `src/services/api.ts` - Uses environment config for API calls

## Usage

```typescript
import { ENV } from '../config/environment'

// Check if running locally
if (ENV.IS_DEVELOPMENT) {
  console.log('Running in development mode')
}

// Get API URL
const apiUrl = ENV.API_BASE_URL
```

## Benefits

✅ **No manual configuration** needed when switching between local and server
✅ **Automatic detection** based on hostname
✅ **Easy debugging** with console logs
✅ **Type-safe** environment configuration
