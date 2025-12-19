import axios from 'axios';

/**
 * SerpAPI Service
 * 
 * Handles Google search queries via SerpAPI
 * Monthly limit: 250 searches
 * Falls back to mock data if limit exceeded or API error
 */
class SerpApiService {
  constructor() {
    this.apiKey = 'de2212cddfb081eb881762783cb3cda96802d2443e9f9b0ad92a50c7a68f918d';
    this.baseUrl = 'https://serpapi.com/search.json';
  }

  /**
   * Get location name from country code
   * @param {string} countryCode - ISO country code (e.g., 'TR', 'US')
   * @returns {string} Location name for SerpAPI
   */
  _getLocationFromCountryCode(countryCode) {
    const countryToLocation = {
      'TR': 'Turkey',
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'PT': 'Portugal',
      'RU': 'Russia',
      'VN': 'Vietnam',
      'CA': 'Canada',
      'AU': 'Australia',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'IN': 'India',
      'JP': 'Japan',
      'KR': 'South Korea',
      'CN': 'China',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'GR': 'Greece',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'IE': 'Ireland',
      'NZ': 'New Zealand',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'ZA': 'South Africa',
      'EG': 'Egypt',
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'IL': 'Israel',
      'TH': 'Thailand',
      'ID': 'Indonesia',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'PH': 'Philippines',
    };

    return countryToLocation[countryCode] || 'Turkey';
  }

  /**
   * Get Google domain from country code
   * @param {string} countryCode - ISO country code
   * @returns {string} Google domain
   */
  _getGoogleDomain(countryCode) {
    const domainMap = {
      'TR': 'google.com.tr',
      'US': 'google.com',
      'GB': 'google.co.uk',
      'DE': 'google.de',
      'FR': 'google.fr',
      'IT': 'google.it',
      'ES': 'google.es',
      'PT': 'google.pt',
      'RU': 'google.ru',
      'JP': 'google.co.jp',
      'KR': 'google.co.kr',
      'CN': 'google.com.hk',
      'AU': 'google.com.au',
      'CA': 'google.ca',
      'BR': 'google.com.br',
      'MX': 'google.com.mx',
      'IN': 'google.co.in',
    };

    return domainMap[countryCode] || 'google.com';
  }

  /**
   * Get Google country code (gl) from country code
   * @param {string} countryCode - ISO country code
   * @returns {string} Google country code
   */
  _getGoogleCountryCode(countryCode) {
    const specialCases = {
      'GB': 'uk',
    };

    return specialCases[countryCode] || countryCode.toLowerCase();
  }

  /**
   * Search Google using SerpAPI
   * @param {string} query - Search query
   * @param {string} countryCode - Device country code (e.g., 'TR', 'US')
   * @param {string} language - Language code (default: "tr")
   * @returns {Promise<Object>} SerpAPI response
   */
  async searchGoogle(query, countryCode = 'TR', language = 'tr') {
    try {
      const location = this._getLocationFromCountryCode(countryCode);
      const gl = this._getGoogleCountryCode(countryCode);
      const googleDomain = this._getGoogleDomain(countryCode);

      const params = {
        q: query,
        location: location,
        hl: language,
        gl: gl,
        google_domain: googleDomain,
        device: 'desktop',
        api_key: this.apiKey,
      };

      const response = await axios.get(this.baseUrl, { params });

      if (response.data && response.data.search_metadata) {
        return {
          success: true,
          data: response.data,
        };
      }

      throw new Error('Invalid response from SerpAPI');
    } catch (error) {
      console.error('SerpAPI error:', error);

      // Handle rate limit (429) or quota exceeded
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 429 || status === 402) {
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'RATE_LIMIT_EXCEEDED', // Will be translated in AI service
          };
        }

        if (status === 400) {
          return {
            success: false,
            error: 'INVALID_REQUEST',
            message: errorData?.error || 'Invalid search request',
          };
        }

        if (status === 401) {
          return {
            success: false,
            error: 'INVALID_API_KEY',
            message: 'Invalid API key',
          };
        }
      }

      // Network or other errors
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: error.message || 'Failed to connect to SerpAPI',
      };
    }
  }

  /**
   * Parse SerpAPI response to SearchResult format
   * @param {Object} serpApiResponse - Raw SerpAPI response
   * @param {string} originalQuery - Original search query
   * @param {string} searchType - Type of search (name, email, phone, username)
   * @param {string} extraDetails - Additional search details
   * @returns {Array<SearchResult>} Parsed search results
   */
  parseSerpApiResponse(serpApiResponse, originalQuery, searchType, extraDetails = '') {
    const results = [];
    const data = serpApiResponse.data;

    if (!data || !data.organic_results) {
      return results;
    }

    // Process organic results
    if (Array.isArray(data.organic_results)) {
      data.organic_results.forEach((item, index) => {
        // Extract source from link or displayed_link
        const link = item.link || item.redirect_link || '';
        const sourceName = this._extractSourceName(link, item.source);
        
        // Build title and subtitle
        const title = item.title || originalQuery;
        let subtitle = item.snippet || item.displayed_link || '';
        
        // Add extra details if provided
        if (extraDetails && extraDetails.trim()) {
          subtitle = `${subtitle} · ${extraDetails.trim()}`;
        }

        // Calculate confidence based on position and snippet relevance
        const confidence = this._calculateConfidence(index, item, originalQuery);

        // Generate highlights
        const highlights = this._generateHighlights(item, originalQuery, extraDetails);

        results.push({
          sourceName,
          title,
          subtitle: subtitle.substring(0, 150), // Limit subtitle length
          url: link,
          confidence,
          highlights,
          metadata: {
            position: item.position || index + 1,
            lastSeen: new Date().toISOString(),
            verified: false,
            serpApiData: {
              displayedLink: item.displayed_link,
              favicon: item.favicon,
            },
          },
        });
      });
    }

    // Process related questions if available
    if (Array.isArray(data.related_questions)) {
      data.related_questions.slice(0, 2).forEach((question, index) => {
        const sourceName = 'Google Q&A';
        const title = question.question || '';
        const subtitle = question.snippet || 'Related question from Google';

        results.push({
          sourceName,
          title,
          subtitle,
          url: question.link || null,
          confidence: 0.75,
          highlights: [
            'Related question',
            'Google search result',
          ],
          metadata: {
            position: results.length + 1,
            lastSeen: new Date().toISOString(),
            verified: false,
          },
        });
      });
    }

    return results;
  }

  /**
   * Extract source name from URL
   */
  _extractSourceName(url, source) {
    if (source) {
      return source;
    }

    if (!url) {
      return 'Google';
    }

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Map common domains to source names
      const domainMap = {
        'linkedin.com': 'LinkedIn',
        'instagram.com': 'Instagram',
        'twitter.com': 'X (Twitter)',
        'x.com': 'X (Twitter)',
        'facebook.com': 'Facebook',
        'tiktok.com': 'TikTok',
        'github.com': 'GitHub',
        'youtube.com': 'YouTube',
        'reddit.com': 'Reddit',
        'pinterest.com': 'Pinterest',
        'snapchat.com': 'Snapchat',
        'medium.com': 'Medium',
        'quora.com': 'Quora',
      };

      // Check for exact match
      for (const [domain, name] of Object.entries(domainMap)) {
        if (hostname.includes(domain)) {
          return name;
        }
      }

      // Extract domain name (e.g., "example.com" -> "Example")
      const domainParts = hostname.replace('www.', '').split('.');
      if (domainParts.length > 0) {
        const domainName = domainParts[0];
        return domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }

      return 'Google';
    } catch (error) {
      return 'Google';
    }
  }

  /**
   * Calculate confidence score based on position and relevance
   */
  _calculateConfidence(position, item, query) {
    // Base confidence decreases with position
    let confidence = Math.max(0.6, 0.95 - (position * 0.05));

    // Boost confidence if query appears in title or snippet
    const title = (item.title || '').toLowerCase();
    const snippet = (item.snippet || '').toLowerCase();
    const queryLower = query.toLowerCase();

    if (title.includes(queryLower) || snippet.includes(queryLower)) {
      confidence = Math.min(0.95, confidence + 0.1);
    }

    // Boost if it's a social media platform
    const link = (item.link || '').toLowerCase();
    const socialPlatforms = ['linkedin', 'instagram', 'twitter', 'facebook', 'github'];
    if (socialPlatforms.some(platform => link.includes(platform))) {
      confidence = Math.min(0.95, confidence + 0.05);
    }

    return Math.round(confidence * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate highlights from SerpAPI result
   */
  _generateHighlights(item, query, extraDetails) {
    const highlights = [];

    // Add snippet excerpt if available
    if (item.snippet) {
      const snippetWords = item.snippet.split(' ').slice(0, 5).join(' ');
      highlights.push(snippetWords);
    }

    // Add source info
    if (item.source) {
      highlights.push(`Found on ${item.source}`);
    } else {
      highlights.push('Google search result');
    }

    // Add extra details if provided
    if (extraDetails && extraDetails.trim()) {
      const detailsWords = extraDetails.trim().split(/\s+/).slice(0, 2).join(' ');
      highlights.push(`Details: ${detailsWords}`);
    }

    return highlights.slice(0, 3); // Max 3 highlights
  }
}

// Export singleton instance
const serpApiService = new SerpApiService();
export default serpApiService;

