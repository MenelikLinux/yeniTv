import { APIMatch, MatchesResponse, SportType } from '@/types/events';

const API_BASE_URL = 'http://localhost:8080/api'; // Update this to your actual API base URL

// CORS proxy fallback if needed
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

class ApiService {
  private cache: Map<string, { data: APIMatch[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchMatches(sport?: SportType, type: 'all' | 'live' | 'today' | 'top-today' = 'all'): Promise<APIMatch[]> {
    const cacheKey = `matches-${sport || 'all'}-${type}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let endpoint = '/matches';
    if (sport && sport !== 'All') {
      endpoint = `/${sport}/matches`;
    }
    
    switch (type) {
      case 'live':
        endpoint += '/live';
        break;
      case 'today':
        endpoint += '/today';
        break;
      case 'top-today':
        endpoint += '/top-today';
        break;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const matches = Array.isArray(data) ? data : data.matches || [];
      
      // Cache the successful response
      this.cache.set(cacheKey, { data: matches, timestamp: Date.now() });
      return matches;
      
    } catch (error) {
      console.warn('API call failed, using mock data...', error);
      return this.getMockData();
    }
  }

  async fetchSports(): Promise<SportType[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sports`);
      if (response.ok) {
        const sports = await response.json();
        return sports;
      }
    } catch (error) {
      console.warn('Failed to fetch sports, using defaults', error);
    }
    
    return ['football', 'basketball', 'tennis', 'baseball', 'hockey', 'soccer'];
  }

  private getMockData(): APIMatch[] {
    const now = Date.now();
    
    return [
      {
        id: '1',
        slug: 'chiefs-vs-bills',
        title: 'Kansas City Chiefs vs Buffalo Bills',
        live: true,
        category: 'football',
        date: now + 3600000, // 1 hour from now
        popular: true,
        teams: {
          home: { name: 'Kansas City Chiefs', badge: '/logos/chiefs.png' },
          away: { name: 'Buffalo Bills', badge: '/logos/bills.png' }
        },
        league: 'NFL',
        sources: [
          { id: '1', name: 'Stream 1', embed: 'https://example.com/stream1' },
          { id: '2', name: 'Stream 2', embed: 'https://example.com/stream2' }
        ]
      },
      {
        id: '2',
        slug: 'lakers-vs-celtics',
        title: 'Los Angeles Lakers vs Boston Celtics',
        live: false,
        category: 'basketball',
        date: now + 7200000, // 2 hours from now
        popular: true,
        teams: {
          home: { name: 'Los Angeles Lakers', badge: '/logos/lakers.png' },
          away: { name: 'Boston Celtics', badge: '/logos/celtics.png' }
        },
        league: 'NBA',
        sources: [
          { id: '3', name: 'Stream 3', embed: 'https://example.com/stream3' }
        ]
      },
      {
        id: '3',
        slug: 'djokovic-vs-alcaraz',
        title: 'Novak Djokovic vs Carlos Alcaraz',
        live: false,
        category: 'tennis',
        date: now + 86400000 + 3600000, // Tomorrow + 1 hour
        popular: false,
        league: 'ATP US Open',
        sources: [
          { id: '4', name: 'Stream 4', embed: 'https://example.com/stream4' }
        ]
      }
    ];
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const apiService = new ApiService();