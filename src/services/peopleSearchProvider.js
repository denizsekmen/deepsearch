/**
 * PeopleSearchProvider Interface
 * 
 * This interface defines the contract for people search providers.
 * Implementations can be swapped (mock, real API, etc.) without changing consumer code.
 * 
 * To plug in a real API later:
 * 1. Create a new provider class implementing these methods
 * 2. Replace MockPeopleSearchProvider with your real provider in the service
 * 3. All screens will automatically use the new provider
 */

export class PeopleSearchProvider {
  /**
   * Search for a person by name
   * @param {string} name - Full name or partial name
   * @param {string} extraDetails - Additional search details (optional)
   * @returns {Promise<SearchResult[]>} Array of search results grouped by source
   */
  async searchByName(name, extraDetails = '') {
    throw new Error('searchByName must be implemented');
  }

  /**
   * Search for a person by phone number
   * @param {string} phone - Phone number (any format)
   * @param {string} extraDetails - Additional search details (optional)
   * @returns {Promise<SearchResult[]>} Array of search results grouped by source
   */
  async searchByPhone(phone, extraDetails = '') {
    throw new Error('searchByPhone must be implemented');
  }

  /**
   * Search for a person by email address
   * @param {string} email - Email address
   * @param {string} extraDetails - Additional search details (optional)
   * @returns {Promise<SearchResult[]>} Array of search results grouped by source
   */
  async searchByEmail(email, extraDetails = '') {
    throw new Error('searchByEmail must be implemented');
  }

  /**
   * Search for a person by username
   * @param {string} username - Username/handle
   * @param {string} extraDetails - Additional search details (optional)
   * @returns {Promise<SearchResult[]>} Array of search results grouped by source
   */
  async searchByUsername(username, extraDetails = '') {
    throw new Error('searchByUsername must be implemented');
  }
}

/**
 * SearchResult Model
 * @typedef {Object} SearchResult
 * @property {string} sourceName - Name of the source/platform (e.g., "LinkedIn", "Instagram")
 * @property {string} title - Display name or title
 * @property {string} subtitle - Additional info or description
 * @property {string|null} url - Optional external link
 * @property {number} confidence - Confidence score (0-1)
 * @property {string[]} highlights - Array of highlight strings
 * @property {Object} metadata - Additional metadata (optional)
 */

/**
 * MockPeopleSearchProvider
 * 
 * Provides deterministic fake results for development/testing.
 * Returns results grouped by platform/source.
 */
export class MockPeopleSearchProvider extends PeopleSearchProvider {
  constructor() {
    super();
    this.sources = [
      'Google',
      'LinkedIn',
      'Instagram',
      'X (Twitter)',
      'Facebook',
      'TikTok',
      'GitHub',
      'Public Records',
      'YouTube',
      'Reddit',
      'Pinterest',
      'Snapchat',
      'Tumblr',
      'Medium',
      'Quora',
    ];
  }

  /**
   * Generate mock results for any search type
   */
  async _generateMockResults(query, searchType, extraDetails = '') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const results = [];
    const numResults = 10 + Math.floor(Math.random() * 6); // 10-15 results

    // Shuffle sources to get random order, then take first numResults
    const shuffledSources = [...this.sources].sort(() => Math.random() - 0.5);
    const selectedSources = shuffledSources.slice(0, Math.min(numResults, shuffledSources.length));

    for (let i = 0; i < numResults && i < selectedSources.length; i++) {
      const sourceName = selectedSources[i];
      const baseName = query || 'John Doe';
      
      // Include extraDetails in subtitle if provided
      let subtitle = this._generateSubtitle(sourceName, searchType);
      if (extraDetails && extraDetails.trim()) {
        subtitle = `${subtitle} · ${extraDetails.trim()}`;
      }
      
      results.push({
        sourceName,
        title: this._generateTitle(baseName, sourceName, searchType),
        subtitle: subtitle,
        url: this._generateUrl(sourceName, query),
        confidence: 0.7 + Math.random() * 0.25, // 0.7-0.95
        highlights: this._generateHighlights(query, sourceName, extraDetails),
        metadata: {
          lastSeen: this._randomDate(),
          verified: Math.random() > 0.7,
        },
      });
    }

    return results;
  }

  _generateTitle(baseName, sourceName, searchType) {
    const variations = {
      'Google': `${baseName} - Public Profile`,
      'LinkedIn': `${baseName} | Professional Profile`,
      'Instagram': `@${baseName.toLowerCase().replace(/\s+/g, '')}`,
      'X (Twitter)': `@${baseName.toLowerCase().replace(/\s+/g, '')}`,
      'Facebook': `${baseName}`,
      'TikTok': `@${baseName.toLowerCase().replace(/\s+/g, '')}`,
      'GitHub': `${baseName.toLowerCase().replace(/\s+/g, '-')}`,
      'Public Records': `${baseName} - Public Information`,
      'YouTube': `${baseName} - Channel`,
      'Reddit': `u/${baseName.toLowerCase().replace(/\s+/g, '_')}`,
      'Pinterest': `${baseName}`,
      'Snapchat': `${baseName.toLowerCase().replace(/\s+/g, '')}`,
      'Tumblr': `${baseName.toLowerCase().replace(/\s+/g, '')}.tumblr.com`,
      'Medium': `@${baseName.toLowerCase().replace(/\s+/g, '')}`,
      'Quora': `${baseName}`,
    };
    return variations[sourceName] || baseName;
  }

  _generateSubtitle(sourceName, searchType) {
    const subtitles = {
      'Google': 'Publicly available information',
      'LinkedIn': 'Professional network profile',
      'Instagram': 'Social media profile',
      'X (Twitter)': 'Social media account',
      'Facebook': 'Social network profile',
      'TikTok': 'Video content creator',
      'GitHub': 'Software developer profile',
      'Public Records': 'Public database records',
      'YouTube': 'Video platform channel',
      'Reddit': 'Discussion forum profile',
      'Pinterest': 'Visual discovery platform',
      'Snapchat': 'Messaging and media app',
      'Tumblr': 'Microblogging platform',
      'Medium': 'Publishing platform',
      'Quora': 'Q&A community profile',
    };
    return subtitles[sourceName] || 'Public information';
  }

  _generateUrl(sourceName, query) {
    const baseUrls = {
      'Google': `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      'LinkedIn': `https://www.linkedin.com/in/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
      'Instagram': `https://www.instagram.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'X (Twitter)': `https://twitter.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'Facebook': `https://www.facebook.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '.'))}`,
      'TikTok': `https://www.tiktok.com/@${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'GitHub': `https://github.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
      'Public Records': `https://publicrecords.example.com/search?q=${encodeURIComponent(query)}`,
      'YouTube': `https://www.youtube.com/@${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'Reddit': `https://www.reddit.com/user/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '_'))}`,
      'Pinterest': `https://www.pinterest.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'Snapchat': `https://www.snapchat.com/add/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'Tumblr': `https://${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}.tumblr.com`,
      'Medium': `https://medium.com/@${encodeURIComponent(query.toLowerCase().replace(/\s+/g, ''))}`,
      'Quora': `https://www.quora.com/profile/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
    };
    return baseUrls[sourceName] || null;
  }

  _generateHighlights(query, sourceName, extraDetails = '') {
    const highlights = [
      `Found on ${sourceName}`,
      'Publicly available information',
      'Last updated recently',
    ];
    
    // Add extra details to highlights if provided
    if (extraDetails && extraDetails.trim()) {
      const detailsWords = extraDetails.trim().split(/\s+/).slice(0, 3); // Take first 3 words
      highlights.push(`Details: ${detailsWords.join(' ')}`);
    }
    
    return highlights.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  _randomDate() {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  async searchByName(name, extraDetails = '') {
    if (!name || name.trim().length === 0) {
      return [];
    }
    return this._generateMockResults(name.trim(), 'name', extraDetails);
  }

  async searchByPhone(phone, extraDetails = '') {
    if (!phone || phone.trim().length === 0) {
      return [];
    }
    // Remove non-digit characters for search
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      return [];
    }
    return this._generateMockResults(cleanPhone, 'phone', extraDetails);
  }

  async searchByEmail(email, extraDetails = '') {
    if (!email || !this._isValidEmail(email)) {
      return [];
    }
    return this._generateMockResults(email.trim().toLowerCase(), 'email', extraDetails);
  }

  async searchByUsername(username, extraDetails = '') {
    if (!username || username.trim().length < 2) {
      return [];
    }
    return this._generateMockResults(username.trim(), 'username', extraDetails);
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * SerpAPIPeopleSearchProvider
 * 
 * Real provider using SerpAPI for Google searches
 * Returns null if API fails - AI will handle the response
 */
export class SerpAPIPeopleSearchProvider extends PeopleSearchProvider {
  constructor() {
    super();
  }

  async _searchWithSerpAPI(query, searchType, extraDetails = '') {
    try {
      // Dynamic import to avoid circular dependency
      const serpApiService = (await import('./serpApiService')).default;
      const languageService = (await import('./languageService')).default;
      
      // Get current language and country code from LanguageService (it's already a singleton instance)
      const currentLanguage = languageService.getCurrentLanguage();
      const deviceCountryCode = languageService.getDeviceCountryCode();
      
      console.log('🌍 Using device country:', deviceCountryCode, 'and language:', currentLanguage);
      
      // Build search query with extra details if provided
      let searchQuery = query;
      if (extraDetails && extraDetails.trim()) {
        searchQuery = `${query} ${extraDetails.trim()}`;
      }

      // Try SerpAPI first
      let response = null;
      try {
        response = await serpApiService.searchGoogle(searchQuery, deviceCountryCode, currentLanguage);
        
        // Check if search was successful
        if (response.success) {
          // Parse SerpAPI response
          const results = serpApiService.parseSerpApiResponse(
            response,
            query,
            searchType,
            extraDetails
          );

          // Return results (even if empty)
          return results || [];
        }
      } catch (serpApiError) {
        console.warn('SerpAPI failed, trying Serper.dev as fallback:', serpApiError.message);
      }

      // If SerpAPI failed, try Serper.dev as fallback
      if (!response || !response.success) {
        const serperService = (await import('./serperService')).default;
        
        try {
          const serperResponse = await serperService.searchGoogle(searchQuery, currentLanguage, deviceCountryCode);
          
          if (serperResponse.success) {
            // Parse Serper.dev response
            const results = serperService.parseSerperResponse(
              serperResponse,
              query,
              searchType,
              extraDetails
            );

            // Return results (even if empty)
            return results || [];
          }
        } catch (serperError) {
          console.warn('Serper.dev also failed:', serperError.message);
        }
      }

      // Both APIs failed - return empty array instead of throwing
      // This way the error is handled gracefully without showing technical details to user
      console.warn('Both SerpAPI and Serper.dev failed, returning empty results');
      return [];
    } catch (error) {
      console.error('Search API error:', error);
      // Don't throw - return empty array instead
      // Errors are handled internally, user doesn't need to see technical details
      return [];
    }
  }

  async searchByName(name, extraDetails = '') {
    if (!name || name.trim().length === 0) {
      return [];
    }

    try {
      return await this._searchWithSerpAPI(name.trim(), 'name', extraDetails);
    } catch (error) {
      // Re-throw - AI will handle
      throw error;
    }
  }

  async searchByPhone(phone, extraDetails = '') {
    if (!phone || phone.trim().length === 0) {
      return [];
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      return [];
    }

    try {
      return await this._searchWithSerpAPI(cleanPhone, 'phone', extraDetails);
    } catch (error) {
      throw error;
    }
  }

  async searchByEmail(email, extraDetails = '') {
    if (!email || !this._isValidEmail(email)) {
      return [];
    }

    try {
      return await this._searchWithSerpAPI(email.trim().toLowerCase(), 'email', extraDetails);
    } catch (error) {
      throw error;
    }
  }

  async searchByUsername(username, extraDetails = '') {
    if (!username || username.trim().length < 2) {
      return [];
    }

    try {
      return await this._searchWithSerpAPI(username.trim(), 'username', extraDetails);
    } catch (error) {
      throw error;
    }
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance - Use SerpAPI provider with mock fallback
const peopleSearchProvider = new SerpAPIPeopleSearchProvider();
export default peopleSearchProvider;

