// Brave Search API wrapper

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export class SearchService {
  private static instance: SearchService;
  private googleCseId: string;
  private googleApiKey: string;
  private braveApiKey: string;
  
  private constructor() {
    this.googleCseId = process.env.GOOGLE_CSE_ID || '';
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.braveApiKey = process.env.BRAVE_API_KEY || '';
  }
  
  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async searchWeb(query: string): Promise<SearchResult[]> {
    console.log(`🔍 Searching for: ${query}`);
    
    // Tier 1: Google Programmable Search (for specific domains)
    if (this.isProgrammingQuery(query)) {
      const googleResults = await this.searchGoogleCSE(query);
      if (googleResults.length > 0) {
        console.log(`✅ Google CSE found ${googleResults.length} results`);
        return googleResults;
      }
    }
    
    // Tier 2: Brave Search API
    if (this.braveApiKey) {
      try {
        const braveResults = await this.searchBrave(query);
        if (braveResults.length > 0) {
          console.log(`✅ Brave Search found ${braveResults.length} results`);
          return braveResults;
        }
      } catch (error) {
        console.log('❌ Brave Search failed, trying next tier...');
      }
    }
    
    // Tier 3: DuckDuckGo (fallback)
    try {
      const ddgResults = await this.searchDuckDuckGo(query);
      if (ddgResults.length > 0) {
        console.log(`✅ DuckDuckGo found ${ddgResults.length} results`);
        return ddgResults;
      }
    } catch (error) {
      console.log('❌ DuckDuckGo failed, using curated results...');
    }
    
    // Tier 4: Curated results (final fallback)
    console.log('📚 Using curated results as fallback');
    return this.getCuratedResults(query);
  }

  private isProgrammingQuery(query: string): boolean {
    const programmingTerms = [
      'leetcode', 'codeforces', 'contest', 'algorithm', 'data structure',
      'binary search', 'dynamic programming', 'graph', 'tree', 'array',
      'linked list', 'stack', 'queue', 'heap', 'sorting', 'searching'
    ];
    
    const lowerQuery = query.toLowerCase();
    return programmingTerms.some(term => lowerQuery.includes(term));
  }

  private async searchGoogleCSE(query: string): Promise<SearchResult[]> {
    if (!this.googleCseId || !this.googleApiKey) {
      return [];
    }

    try {
      // Add programming-specific sites to the search
      const programmingSites = [
        'site:leetcode.com',
        'site:codeforces.com',
        'site:geeksforgeeks.org',
        'site:stackoverflow.com',
        'site:github.com'
      ];
      
      const enhancedQuery = `${query} ${programmingSites.join(' OR ')}`;
      
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleCseId}&q=${encodeURIComponent(enhancedQuery)}&num=5`
      );

      if (!response.ok) {
        throw new Error(`Google CSE failed: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      if (data.items && data.items.length > 0) {
        data.items.forEach((item: any) => {
          results.push({
            title: item.title || '',
            link: item.link || '',
            snippet: item.snippet || ''
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Google CSE error:', error);
      return [];
    }
  }

  private async searchBrave(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        {
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': this.braveApiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Brave Search failed: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      if (data.web && data.web.results) {
        data.web.results.forEach((result: any) => {
          results.push({
            title: result.title || '',
            link: result.url || '',
            snippet: result.description || ''
          });
        });
      }

      return results;
    } catch (error) {
      console.error('Brave Search error:', error);
      return [];
    }
  }

  private async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error(`DuckDuckGo failed: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      // Add abstract if available
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          link: data.AbstractURL || '',
          snippet: data.AbstractText
        });
      }

      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              link: topic.FirstURL,
              snippet: topic.Text
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo error:', error);
      return [];
    }
  }

  private getCuratedResults(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    
    // Programming contests
    if (lowerQuery.includes('leetcode') || lowerQuery.includes('contest')) {
      return [
        {
          title: "LeetCode Contests",
          link: "https://leetcode.com/contest/",
          snippet: "LeetCode hosts weekly contests every Sunday at 10:30 AM UTC and biweekly contests every other Saturday at 2:30 PM UTC. Check the contest page for upcoming competitions."
        },
        {
          title: "Codeforces Contests",
          link: "https://codeforces.com/contests",
          snippet: "Codeforces hosts regular programming contests including Div. 1, Div. 2, Div. 3, and educational rounds multiple times per week."
        },
        {
          title: "Programming Contest Calendar",
          link: "https://clist.by/",
          snippet: "Clist.by aggregates programming contests from multiple platforms including Codeforces, LeetCode, AtCoder, HackerRank, and more."
        }
      ];
    }
    
    // Algorithms and DSA
    if (lowerQuery.includes('algorithm') || lowerQuery.includes('data structure')) {
      return [
        {
          title: "GeeksforGeeks - Data Structures and Algorithms",
          link: "https://www.geeksforgeeks.org/data-structures/",
          snippet: "Comprehensive tutorials on data structures and algorithms with implementation examples in multiple programming languages."
        },
        {
          title: "LeetCode - Algorithm Problems",
          link: "https://leetcode.com/problemset/all/",
          snippet: "Practice algorithm problems with difficulty levels from easy to hard, covering all major DSA topics."
        },
        {
          title: "HackerRank - Algorithms",
          link: "https://www.hackerrank.com/domains/algorithms",
          snippet: "Practice algorithms with interactive challenges and real-time feedback."
        }
      ];
    }
    
    // Specific algorithms
    if (lowerQuery.includes('binary search')) {
      return [
        {
          title: "Binary Search Algorithm",
          link: "https://en.wikipedia.org/wiki/Binary_search_algorithm",
          snippet: "Binary search is an efficient algorithm for finding an element in a sorted array. Time complexity: O(log n), Space complexity: O(1)."
        },
        {
          title: "Binary Search - GeeksforGeeks",
          link: "https://www.geeksforgeeks.org/binary-search/",
          snippet: "Detailed explanation with implementation examples in multiple programming languages."
        }
      ];
    }
    
    if (lowerQuery.includes('dynamic programming')) {
      return [
        {
          title: "Dynamic Programming",
          link: "https://en.wikipedia.org/wiki/Dynamic_programming",
          snippet: "Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems. Common applications include optimization problems."
        },
        {
          title: "DP Tutorial - GeeksforGeeks",
          link: "https://www.geeksforgeeks.org/dynamic-programming/",
          snippet: "Comprehensive tutorial with examples and practice problems."
        }
      ];
    }
    
    // Default fallback
    return [
      {
        title: `Search results for: ${query}`,
        link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `For the most up-to-date information about "${query}", please visit the search link above.`
      }
    ];
  }

  async searchLeetCodeContests(): Promise<SearchResult[]> {
    return this.searchWeb('LeetCode contests 2024');
  }

  async searchCodeforcesContests(): Promise<SearchResult[]> {
    return this.searchWeb('Codeforces contests 2024');
  }

  async searchStockInfo(symbol: string): Promise<SearchResult[]> {
    return this.searchWeb(`${symbol} stock price today`);
  }

  async searchAlgorithmInfo(algorithm: string): Promise<SearchResult[]> {
    return this.searchWeb(`${algorithm} algorithm implementation examples`);
  }
} 