import axios from 'axios';

/**
 * Serper.dev Service
 * 
 * Alternative Google search API service
 * Used as fallback when SerpAPI fails
 */
class SerperService {
  constructor() {
    this.apiKey = 'c6c9204e34cc5fa776792a28196623bb800e2be6';
    this.baseUrl = 'https://google.serper.dev/search';
  }

  /**
   * Map country code to location name
   * @param {string} countryCode - ISO country code (e.g., 'TR', 'US')
   * @returns {string} Location name for API
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

    return countryToLocation[countryCode] || 'Turkey'; // Default to Turkey
  }

  /**
   * Get Google country code (gl) from country code
   * @param {string} countryCode - ISO country code
   * @returns {string} Google country code
   */
  _getGoogleCountryCode(countryCode) {
    // Most country codes match, but some need special handling
    const specialCases = {
      'GB': 'uk', // United Kingdom
      'VN': 'vn', // Vietnam
    };

    return specialCases[countryCode] || countryCode.toLowerCase();
  }

  /**
   * Get language and location mapping
   * @param {string} languageCode - Language code from app
   * @param {string} countryCode - Device country code (e.g., 'TR', 'US')
   * @returns {Object} {gl, hl, location}
   */
  _getLanguageParams(languageCode, countryCode = 'TR') {
    // Use device country code for location
    const location = this._getLocationFromCountryCode(countryCode);
    const gl = this._getGoogleCountryCode(countryCode);
    
    // Use language code for hl (language)
    const languageMap = {
      'tr': 'tr',
      'en': 'en',
      'de': 'de',
      'fr': 'fr',
      'it': 'it',
      'es': 'es',
      'pt': 'pt',
      'ru': 'ru',
      'vi': 'vi',
      'km': 'tr', // Khmer defaults to Turkish
    };

    const hl = languageMap[languageCode] || 'en';

    return { gl, hl, location };
  }

  /**
   * Search Google using Serper.dev API
   * @param {string} query - Search query
   * @param {string} languageCode - Language code from app (default: 'tr')
   * @param {string} countryCode - Device country code (e.g., 'TR', 'US')
   * @returns {Promise<Object>} Serper.dev response
   */
  async searchGoogle(query, languageCode = 'tr', countryCode = 'TR') {
    try {
      const langParams = this._getLanguageParams(languageCode, countryCode);
      
      const requestBody = {
        q: query,
        gl: langParams.gl,
        hl: langParams.hl,
        location: langParams.location,
      };

      const response = await axios.post(
        this.baseUrl,
        requestBody,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && (response.data.organic || response.data.organic === [])) {
        return {
          success: true,
          data: response.data,
        };
      }

      throw new Error('Invalid response from Serper.dev');
    } catch (error) {
      console.error('Serper.dev error:', error);

      // Handle rate limit or errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 429 || status === 402) {
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'RATE_LIMIT_EXCEEDED',
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

        return {
          success: false,
          error: 'API_ERROR',
          message: errorData?.error || 'Unknown Serper.dev error',
        };
      }

      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error connecting to Serper.dev',
      };
    }
  }

  /**
   * Parse Serper.dev response to SearchResult format
   * @param {Object} serperResponse - Response from Serper.dev
   * @param {string} originalQuery - Original search query
   * @param {string} searchType - Type of search (name, email, phone, username)
   * @param {string} extraDetails - Additional search details
   * @returns {Array<SearchResult>} Parsed search results
   */
  parseSerperResponse(serperResponse, originalQuery, searchType, extraDetails) {
    const results = [];
    const organicResults = serperResponse.data?.organic || [];

    const sourceMap = {
      'linkedin.com': 'LinkedIn',
      'instagram.com': 'Instagram',
      'twitter.com': 'X (Twitter)',
      'facebook.com': 'Facebook',
      'tiktok.com': 'TikTok',
      'github.com': 'GitHub',
      'youtube.com': 'YouTube',
      'reddit.com': 'Reddit',
      'pinterest.com': 'Pinterest',
      'snapchat.com': 'Snapchat',
      'tumblr.com': 'Tumblr',
      'medium.com': 'Medium',
      'quora.com': 'Quora',
    };

    organicResults.forEach((item, index) => {
      let sourceName = 'Google'; // Default source
      let url = item.link;
      let title = item.title;
      let subtitle = item.snippet;

      // Try to identify specific social media platforms
      for (const domain in sourceMap) {
        if (item.link && item.link.includes(domain)) {
          sourceName = sourceMap[domain];
          break;
        }
      }

      // Adjust title/subtitle for specific sources if needed
      if (sourceName === 'LinkedIn' && item.title.includes(' | ')) {
        title = item.title.split(' | ')[0];
        subtitle = item.title.split(' | ')[1] || item.snippet;
      } else if (sourceName === 'X (Twitter)' && item.title.includes(' on X')) {
        title = item.title.replace(' on X', '');
      }

      // Add extra details to subtitle if provided
      if (extraDetails && extraDetails.trim()) {
        subtitle = `${subtitle} · ${extraDetails.trim()}`;
      }

      results.push({
        sourceName: sourceName,
        title: title,
        subtitle: subtitle,
        url: url,
        confidence: Math.max(0.6, 1 - (index * 0.05)), // Higher position = higher confidence
        highlights: item.snippet ? item.snippet.split(' ') : [],
        metadata: {
          serperData: true, // Flag to indicate this came from Serper.dev
          position: item.position,
        },
      });
    });

    return results;
  }
}

const serperService = new SerperService();
export default serperService;

