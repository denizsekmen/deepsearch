# People Search Provider - Integration Guide

## Overview

The people search functionality uses a provider pattern that allows easy swapping between mock and real API implementations.

## Current Implementation

Currently, the app uses `MockPeopleSearchProvider` which returns deterministic fake results for development and testing.

## How to Plug in Real APIs

### Step 1: Create Your Real Provider

Create a new file `src/services/realPeopleSearchProvider.js`:

```javascript
import { PeopleSearchProvider } from './peopleSearchProvider';

export class RealPeopleSearchProvider extends PeopleSearchProvider {
  constructor(apiKey, baseUrl) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl; // e.g., 'https://api.yourprovider.com/v1'
  }

  async searchByName(name) {
    try {
      const response = await fetch(`${this.baseUrl}/search/name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ query: name }),
      });
      
      const data = await response.json();
      
      // Transform API response to match SearchResult format
      return this._transformResults(data.results);
    } catch (error) {
      console.error('Search by name error:', error);
      throw error;
    }
  }

  async searchByPhone(phone) {
    // Similar implementation
  }

  async searchByEmail(email) {
    // Similar implementation
  }

  async searchByUsername(username) {
    // Similar implementation
  }

  // Helper to transform API response to SearchResult format
  _transformResults(apiResults) {
    return apiResults.map(result => ({
      sourceName: result.platform || 'Unknown',
      title: result.displayName || result.name,
      subtitle: result.description || '',
      url: result.profileUrl || null,
      confidence: result.matchScore || 0.8,
      highlights: result.matches || [],
      metadata: {
        lastSeen: result.lastUpdated,
        verified: result.isVerified || false,
      },
    }));
  }
}
```

### Step 2: Update the Service Export

In `src/services/peopleSearchProvider.js`, replace the export:

```javascript
// OLD:
const peopleSearchProvider = new MockPeopleSearchProvider();
export default peopleSearchProvider;

// NEW:
import { RealPeopleSearchProvider } from './realPeopleSearchProvider';
import Config from 'react-native-config';

const peopleSearchProvider = new RealPeopleSearchProvider(
  Config.API_KEY,
  Config.API_BASE_URL
);
export default peopleSearchProvider;
```

### Step 3: Add Environment Variables

Add to your `.env` file:

```
API_KEY=your_api_key_here
API_BASE_URL=https://api.yourprovider.com/v1
```

### Step 4: Update Error Handling

The provider should handle:
- Network errors
- Rate limiting
- Invalid responses
- Authentication failures

All screens will automatically use the new provider without any code changes.

## SearchResult Format

Your API must return results in this format (or transform them):

```typescript
interface SearchResult {
  sourceName: string;        // Platform name (e.g., "LinkedIn")
  title: string;              // Display name
  subtitle: string;           // Description/additional info
  url: string | null;         // External link (optional)
  confidence: number;          // 0-1 match confidence
  highlights: string[];       // Array of highlight strings
  metadata?: {                 // Optional metadata
    lastSeen?: string;        // ISO timestamp
    verified?: boolean;
    [key: string]: any;        // Additional fields
  };
}
```

## Testing

1. Keep `MockPeopleSearchProvider` for development
2. Use feature flags to switch between mock and real
3. Test with real API in staging environment

## Example: Feature Flag Approach

```javascript
import { MockPeopleSearchProvider } from './peopleSearchProvider';
import { RealPeopleSearchProvider } from './realPeopleSearchProvider';
import Config from 'react-native-config';

const USE_REAL_API = Config.USE_REAL_API === 'true';

const peopleSearchProvider = USE_REAL_API
  ? new RealPeopleSearchProvider(Config.API_KEY, Config.API_BASE_URL)
  : new MockPeopleSearchProvider();

export default peopleSearchProvider;
```

## Notes

- All screens (`SearchHomeScreen`, `SearchResultsScreen`, etc.) use the provider through `peopleSearchProvider` import
- No changes needed to UI components when switching providers
- Ensure your API respects rate limits and privacy laws
- Only return publicly available information







