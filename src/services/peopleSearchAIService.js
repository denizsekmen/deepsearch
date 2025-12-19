import axios from 'axios';
import peopleSearchProvider from './peopleSearchProvider';
import LanguageService from './languageService';

class PeopleSearchAIService {
  constructor() {
    this.apiKey = null;
  }

  async fetchApiKey() {
    try {
      const request = await axios.get(
        "https://erbgarage.com/aivideosummarizer.php?query=aivideosummarizerwithardacmen"
      );
      const openaiToken = request.data.openaiApiKey;

      if (openaiToken) {
        this.apiKey = openaiToken;
        return openaiToken;
      }

      throw new Error("Failed to fetch OpenAI API key");
    } catch (error) {
      console.error("Error fetching API key:", error);
      throw new Error("Unable to connect to API service");
    }
  }

  /**
   * Extract search query and type from user input
   */
  extractSearchInfo(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Email pattern
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = userInput.match(emailRegex);
    if (emailMatch) {
      return {
        query: emailMatch[0],
        type: 'email',
        hasSearchIntent: true,
      };
    }

    // Phone pattern
    const phoneRegex = /(\+?[\d\s\-\(\)]{7,})/g;
    const phoneMatch = userInput.match(phoneRegex);
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
      return {
        query: phoneMatch[0],
        type: 'phone',
        hasSearchIntent: true,
      };
    }

    // Username pattern (@username or "username" in context)
    if (input.includes('@') || input.includes('username') || input.includes('handle')) {
      const usernameMatch = userInput.match(/@?([a-zA-Z0-9._-]+)/);
      if (usernameMatch && usernameMatch[1]) {
        return {
          query: usernameMatch[1],
          type: 'username',
          hasSearchIntent: true,
        };
      }
    }

    // Search intent keywords
    const searchKeywords = ['search', 'find', 'look for', 'ara', 'bul', 'araştır'];
    const hasSearchIntent = searchKeywords.some(keyword => input.includes(keyword));

    // Name pattern - if user mentions a name or asks about someone
    if (hasSearchIntent || input.includes('who is') || input.includes('bu kişi') || input.includes('kim')) {
      // Try to extract name (simple heuristic: words after "search for", "find", etc.)
      const namePatterns = [
        /(?:search|find|look for|ara|bul)\s+(?:for\s+)?([a-zA-Z\s]{2,})/i,
        /(?:who is|bu kişi|about|kim)\s+([a-zA-Z\s]{2,})/i,
        /([A-Z][a-z]+\s+[A-Z][a-z]+)/, // First Last name pattern
        /([a-zA-Z\s]{2,})\s+(?:kim|who|is)/i, // Name before "kim" or "who"
      ];

      for (const pattern of namePatterns) {
        const match = userInput.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          // Filter out common words
          const commonWords = ['search', 'find', 'look', 'for', 'who', 'is', 'kim', 'bu', 'kişi', 'about'];
          const nameWords = name.split(' ').filter(word => !commonWords.includes(word.toLowerCase()));
          if (nameWords.length >= 1 && name.length >= 2) {
            return {
              query: nameWords.join(' '),
              type: 'name',
              hasSearchIntent: true,
            };
          }
        }
      }

      // Try to find any capitalized name pattern (First Last)
      const capitalizedNamePattern = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/;
      const capitalizedMatch = userInput.match(capitalizedNamePattern);
      if (capitalizedMatch && capitalizedMatch[1]) {
        return {
          query: capitalizedMatch[1],
          type: 'name',
          hasSearchIntent: true,
        };
      }

      // If search intent but no clear query, return intent only
      if (hasSearchIntent) {
        return {
          query: null,
          type: null,
          hasSearchIntent: true,
        };
      }
    }

    return {
      query: null,
      type: null,
      hasSearchIntent: false,
    };
  }

  /**
   * Perform search and analyze results with AI
   * @param {string} userInput - User's search query or question
   * @param {string} extraDetails - Additional search details (optional)
   */
  async searchAndAnalyze(userInput, extraDetails = '') {
    try {
      // Get API key if not cached
      if (!this.apiKey) {
        await this.fetchApiKey();
      }

      // Extract search info from user input
      const searchInfo = this.extractSearchInfo(userInput);
      
      // If no search intent, return null to use default AI response
      if (!searchInfo.hasSearchIntent) {
        return null;
      }

      // If search intent but no query, ask for clarification
      if (searchInfo.hasSearchIntent && !searchInfo.query) {
        return {
          text: LanguageService.getTranslation('aiFallbackResponse'),
          suggestions: [
            LanguageService.getTranslation('searchByName'),
            LanguageService.getTranslation('searchByEmail'),
            LanguageService.getTranslation('searchByUsername')
          ],
          searchResults: null,
        };
      }

      // Perform actual search with SerpAPI
      let searchResults = [];
      let serpApiAvailable = true;
      let serpApiError = null;
      
      try {
        switch (searchInfo.type) {
          case 'name':
            searchResults = await peopleSearchProvider.searchByName(searchInfo.query, extraDetails);
            break;
          case 'phone':
            searchResults = await peopleSearchProvider.searchByPhone(searchInfo.query, extraDetails);
            break;
          case 'email':
            searchResults = await peopleSearchProvider.searchByEmail(searchInfo.query, extraDetails);
            break;
          case 'username':
            searchResults = await peopleSearchProvider.searchByUsername(searchInfo.query, extraDetails);
            break;
          default:
            return null;
        }
      } catch (error) {
        // SerpAPI failed - use AI only
        serpApiAvailable = false;
        serpApiError = error;
        console.warn('SerpAPI unavailable, using AI only:', error);
        
        // If we have results from partial success, use them
        if (searchResults && searchResults.length > 0) {
          // Continue with partial results
        } else {
          // No SerpAPI results - AI will generate response based on query only
          searchResults = [];
        }
      }

      // If we have SerpAPI results, analyze them with AI
      if (serpApiAvailable && searchResults && searchResults.length > 0) {
        // Analyze SerpAPI results with OpenAI
        const analysis = await this.analyzeResultsWithAI(
          searchInfo.query, 
          searchInfo.type, 
          searchResults, 
          userInput,
          true // hasSerpApiData
        );

        return {
        text: analysis,
        suggestions: searchResults.slice(0, 3).map(r => LanguageService.getTranslation('viewProfile').replace('{source}', r.sourceName)),
        searchResults: searchResults,
        };
      }

      // SerpAPI unavailable or no results - AI generates response based on query
      const aiOnlyResponse = await this.generateAIOnlyResponse(
        searchInfo.query,
        searchInfo.type,
        userInput,
        extraDetails,
        serpApiError
      );

      return aiOnlyResponse;
    } catch (error) {
      console.error('Search and analyze error:', error);
      
      // Fallback: try to perform search without AI analysis
      try {
        const searchInfo = this.extractSearchInfo(userInput);
        if (searchInfo.query && searchInfo.type) {
          let searchResults = [];
          switch (searchInfo.type) {
            case 'name':
              searchResults = await peopleSearchProvider.searchByName(searchInfo.query);
              break;
            case 'phone':
              searchResults = await peopleSearchProvider.searchByPhone(searchInfo.query);
              break;
            case 'email':
              searchResults = await peopleSearchProvider.searchByEmail(searchInfo.query);
              break;
            case 'username':
              searchResults = await peopleSearchProvider.searchByUsername(searchInfo.query);
              break;
          }

          if (searchResults && searchResults.length > 0) {
            const resultsText = LanguageService.getTranslation('aiFallbackResultsText')
              .replace('{count}', searchResults.length)
              .replace('{query}', searchInfo.query)
              .replace('{results}', searchResults.map((r, i) => `${i + 1}. ${r.sourceName}: ${r.title}\n   ${r.subtitle}`).join('\n\n'));
            
            return {
              text: resultsText,
              suggestions: searchResults.slice(0, 3).map(r => LanguageService.getTranslation('viewProfile').replace('{source}', r.sourceName)),
              searchResults: searchResults,
            };
          }
        }
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
      }

      // Don't throw SerpAPI/Serper.dev errors to user
      // Instead, return a generic AI response
      const errorType = error?.errorType || error?.message || '';
      if (errorType.includes('SERPAPI') || 
          errorType.includes('SERPER') || 
          errorType.includes('RATE_LIMIT') ||
          errorType.includes('INVALID_API_KEY') ||
          errorType.includes('NETWORK_ERROR') ||
          errorType.includes('ALL_SEARCH_APIS_FAILED')) {
        // Return generic AI response instead of throwing
        return {
          text: LanguageService.getTranslation('aiFallbackResponse'),
          suggestions: [
            LanguageService.getTranslation('searchByName'),
            LanguageService.getTranslation('searchByEmail'),
            LanguageService.getTranslation('searchByUsername')
          ],
          searchResults: null,
        };
      }

      // For other errors, throw normally
      throw error;
    }
  }

  /**
   * Generate AI-only response when SerpAPI/Serper.dev is unavailable
   * @param {string} query - Search query
   * @param {string} searchType - Type of search (name, email, phone, username)
   * @param {string} userInput - Original user input
   * @param {string} extraDetails - Additional search details
   * @param {Error} serpApiError - Error from SerpAPI (if any)
   * @returns {Promise<Object>} AI response object
   */
  async generateAIOnlyResponse(query, searchType, userInput, extraDetails, serpApiError) {
    try {
      if (!this.apiKey) {
        await this.fetchApiKey();
      }

      // Determine error context for AI
      let errorContext = '';
      if (serpApiError) {
        const errorType = serpApiError.errorType || serpApiError.message || '';
        if (errorType.includes('RATE_LIMIT')) {
          errorContext = 'Search API rate limit reached.';
        } else if (errorType.includes('NETWORK_ERROR')) {
          errorContext = 'Search API temporarily unavailable due to network issues.';
        } else {
          errorContext = 'Search API temporarily unavailable.';
        }
      }

      const systemPrompt = `You are an expert AI assistant for DeepSearch AI, a people search and social media lookup platform. 

IMPORTANT: The search API is currently unavailable, so you need to provide helpful guidance based on the user's query without actual search results.

Your role is to:
- Help users understand how to search for people
- Provide general information about what information might be available
- Suggest search strategies
- Explain privacy considerations
- Guide users on what details to provide for better searches

Keep responses helpful, concise (under 250 words), and professional. Always emphasize that DeepSearch AI only works with publicly available information and respects privacy.`;

      const userPrompt = `User's question: "${userInput}"
Search Query: "${query}"
Search Type: ${searchType}
${extraDetails ? `Additional Details: ${extraDetails}` : ''}
${errorContext ? `Note: ${errorContext}` : ''}

Please provide helpful guidance about searching for this person. Since search results are not available right now, focus on:
1. What information might be found for this type of search
2. Which platforms/sources typically have this information
3. What additional details would help improve search results
4. General privacy and ethical considerations
5. How to use the search feature effectively

Be conversational and helpful. Don't mention technical API errors to the user.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 400,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.choices[0].message.content.trim(),
        suggestions: [
          LanguageService.getTranslation('searchByName'),
          LanguageService.getTranslation('searchByEmail'),
          LanguageService.getTranslation('searchByUsername')
        ],
        searchResults: null,
      };
    } catch (error) {
      console.error('AI-only response error:', error);
      
      // Final fallback - return generic message
      return {
        text: LanguageService.getTranslation('aiFallbackResponse'),
        suggestions: [
          LanguageService.getTranslation('searchByName'),
          LanguageService.getTranslation('searchByEmail'),
          LanguageService.getTranslation('searchByUsername')
        ],
        searchResults: null,
      };
    }
  }

  /**
   * Analyze search results with OpenAI
   */
  async analyzeResultsWithAI(query, searchType, searchResults, originalQuestion, hasSerpApiData = false) {
    try {
      const systemPrompt = `You are an expert AI assistant for DeepSearch AI, a people search and social media lookup platform. Your role is to analyze search results and provide helpful, accurate, and ethical insights.

IMPORTANT GUIDELINES:
- Only work with publicly available information
- Never suggest or encourage accessing private information
- Be respectful and professional
- Focus on factual analysis, not speculation
- Highlight data consistency and reliability
- Provide confidence assessments when appropriate
- Keep responses concise but informative
- Use clear, user-friendly language

Your responses should help users understand:
1. What information was found
2. Which platforms/sources the person appears on
3. Data consistency and reliability
4. Any notable patterns or insights
5. Confidence level of the matches

Always emphasize that all information is publicly available and respect privacy.`;

      const resultsSummary = searchResults.map((r, i) => {
        let summary = `Source ${i + 1}: ${r.sourceName}
- Title: ${r.title}
- Subtitle: ${r.subtitle}
- Confidence: ${(r.confidence * 100).toFixed(0)}%
- Highlights: ${r.highlights.join(', ')}
${r.url ? `- URL: ${r.url}` : ''}`;
        
        // Add SerpAPI metadata if available
        if (r.metadata && r.metadata.serpApiData) {
          summary += `\n- Source: Google Search (via SerpAPI)`;
        }
        
        return summary;
      }).join('\n\n');

      const dataSource = hasSerpApiData 
        ? 'These results are from real Google searches via SerpAPI, providing actual publicly available information from the web.'
        : 'These results are from our search database.';

      const userPrompt = `User's question: "${originalQuestion}"

Search Query: "${query}"
Search Type: ${searchType}
Data Source: ${dataSource}

Search Results Found (${searchResults.length} sources):
${resultsSummary}

Please provide a comprehensive but concise analysis of these search results. Include:
1. A brief summary of what was found
2. Which platforms/sources the person appears on
3. Data consistency and reliability assessment
4. Any notable insights or patterns
5. Overall confidence level

${hasSerpApiData ? 'Note: These are real search results from Google via SerpAPI. ' : ''}Keep the response conversational, helpful, and under 300 words. Format it nicely with clear sections if needed.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      
      // Fallback: generate a simple summary
      const platforms = searchResults.map(r => r.sourceName).join(', ');
      const avgConfidence = (searchResults.reduce((sum, r) => sum + r.confidence, 0) / searchResults.length * 100).toFixed(0);
      
      const fallbackText = LanguageService.getTranslation('aiAnalysisFallback')
        .replace('{query}', query)
        .replace('{count}', searchResults.length)
        .replace('{platforms}', platforms)
        .replace('{confidence}', avgConfidence)
        .replace('{findings}', searchResults.map((r, i) => `• ${r.sourceName}: ${r.title} (${r.subtitle})`).join('\n'));
      
      return fallbackText;
    }
  }

  /**
   * General AI response for non-search questions
   */
  async getGeneralAIResponse(userInput) {
    try {
      if (!this.apiKey) {
        await this.fetchApiKey();
      }

      const systemPrompt = `You are an expert AI assistant for DeepSearch AI, a people search and social media lookup platform. Help users with questions about:

- How to use the search features
- Understanding search results
- Privacy and data availability
- Platform identification
- Information verification
- Risk assessment

Keep responses helpful, concise (under 200 words), and professional. Always emphasize that DeepSearch AI only works with publicly available information and respects privacy.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.choices[0].message.content.trim(),
        suggestions: ["Search by name", "Search by email", "Search by username"],
      };
    } catch (error) {
      console.error('General AI response error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const peopleSearchAIService = new PeopleSearchAIService();
export default peopleSearchAIService;

