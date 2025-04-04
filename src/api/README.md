# API Integration Layer

This directory contains the API integration layer for the Vue.js application, providing a structured approach to communicate with the backend API.

## Directory Structure

```
src/api/
├── index.ts                  # Main API client configuration
├── services/                 # Feature-specific API services
│   ├── alert-subscriptions.service.ts
│   ├── cached.service.ts     # Caching utility service
│   ├── cached-changes.service.ts # Example of cached service
│   ├── cached-providers.service.ts # Example of cached service
│   ├── changes.service.ts
│   ├── email-channels.service.ts
│   ├── providers.service.ts
│   └── sources.service.ts
└── utils/                    # Utility functions
    └── rate-limiting.ts      # Rate limiting with exponential backoff
```

## Features

### Rate Limiting

The API integration includes rate limiting functionality with exponential backoff to handle API rate limits (HTTP 429 responses). This helps prevent API abuse and ensures graceful handling of rate limit errors.

Key features:
- Exponential backoff retry mechanism
- Configurable retry attempts and delay
- Helper utility to create rate-limited API methods

Usage example:
```typescript
import { withBackoff, createRateLimitedApiMethod } from '../utils/rate-limiting';

// Direct usage with withBackoff
const result = await withBackoff(() => apiClient.get('/endpoint'));

// Creating a rate-limited version of an API method
const rateLimitedApiCall = createRateLimitedApiMethod(
  async (id: number) => {
    const response = await apiClient.get(`/endpoint/${id}`);
    return response.data;
  }
);
```

### Caching

The API integration includes a caching mechanism using VueUse's `useStorage` to store API responses locally. This reduces unnecessary API calls and improves application performance.

Key features:
- Configurable cache duration
- Cache invalidation based on time
- Methods to manually clear or update cache
- Type-safe implementation

Usage example:
```typescript
import { createCachedApiService } from './cached.service';

// Create a cached service for an endpoint
const cachedService = createCachedApiService<ResponseType>('/endpoint');

// Get data (from cache if available, otherwise from API)
const data = await cachedService.get();

// Clear cache
cachedService.clearCache();
```

## Implementation

See the individual service files for implementation details and examples of how to use these features in your application.