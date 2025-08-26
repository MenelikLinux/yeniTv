import { APIMatch, RawEventsResponse, RawEvent, SportType } from '@/types/events';

const API_BASE_URL = 'https://topembed.pw/api.php?format=json';

// CORS proxy for handling potential CORS issues
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

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RawEventsResponse = await response.json();
      const matches = this.transformEvents(data, sport, type);
      
      // Cache the successful response
      this.cache.set(cacheKey, { data: matches, timestamp: Date.now() });
      return matches;
      
    } catch (error) {
      console.warn('API call failed, trying with CORS proxy...', error);
      
      try {
        const response = await fetch(`${PROXY_URL}${encodeURIComponent(API_BASE_URL)}`);
        const data: RawEventsResponse = await response.json();
        const matches = this.transformEvents(data, sport, type);
        
        this.cache.set(cacheKey, { data: matches, timestamp: Date.now() });
        return matches;
      } catch (proxyError) {
        console.warn('Proxy call also failed, using mock data...', proxyError);
        return this.getMockData();
      }
    }
  }

  private transformEvents(data: RawEventsResponse, sport?: SportType, type?: string): APIMatch[] {
    const allMatches: APIMatch[] = [];
    const now = Date.now();

    Object.entries(data.events || {}).forEach(([dateStr, events]) => {
      events.forEach((event, index) => {
        const eventTime = event.unix_timestamp * 1000; // Convert to milliseconds
        const isLive = Math.abs(now - eventTime) < 3 * 60 * 60 * 1000; // Within 3 hours
        
        const match: APIMatch = {
          id: `${dateStr}-${index}`,
          slug: this.createSlug(event.match),
          title: event.match,
          live: isLive,
          category: event.sport,
          date: eventTime,
          popular: ['Football', 'Basketball', 'Baseball', 'Soccer'].includes(event.sport),
          league: event.tournament,
          sources: event.channels.map((channel, idx) => ({
            id: `${event.match}-${idx}`,
            name: this.extractChannelName(channel),
            embed: channel,
          })),
        };

        allMatches.push(match);
      });
    });

    // Apply filters
    let filteredMatches = allMatches;

    if (sport && sport !== 'All') {
      filteredMatches = filteredMatches.filter(match => match.category === sport);
    }

    if (type === 'live') {
      filteredMatches = filteredMatches.filter(match => match.live);
    } else if (type === 'today') {
      const today = new Date().toDateString();
      filteredMatches = filteredMatches.filter(match => 
        new Date(match.date).toDateString() === today
      );
    } else if (type === 'top-today') {
      const today = new Date().toDateString();
      filteredMatches = filteredMatches.filter(match => 
        new Date(match.date).toDateString() === today && match.popular
      );
    }

    return filteredMatches.sort((a, b) => a.date - b.date);
  }

  private createSlug(match: string): string {
    return match.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private extractChannelName(channelUrl: string): string {
    const match = channelUrl.match(/\/channel\/([^\/]+)/);
    if (match) {
      return match[1].replace(/\[.*?\]/g, '').trim() || 'Stream';
    }
    return 'Stream';
  }

  async fetchSports(): Promise<SportType[]> {
    // Extract sports from cached events data or use defaults
    const allMatches = await this.fetchMatches();
    const uniqueSports = [...new Set(allMatches.map(match => match.category as SportType))];
    
    if (uniqueSports.length > 0) {
      return uniqueSports.sort();
    }
    
    return ['Football', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Soccer', 'Softball'];
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