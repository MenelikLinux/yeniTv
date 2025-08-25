import { EventsResponse } from '@/types/events';

const API_BASE_URL = 'https://topembed.pw/api.php';

// CORS proxy fallback if needed
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

class ApiService {
  private cache: Map<string, { data: EventsResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchEvents(): Promise<EventsResponse> {
    const cacheKey = 'events';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let url = API_BASE_URL;
    let fallbackUsed = false;

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
      
      // Cache the successful response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
      
    } catch (error) {
      console.warn('Direct API call failed, trying CORS proxy...', error);
      
      try {
        // Fallback to CORS proxy
        url = `${PROXY_URL}${encodeURIComponent(API_BASE_URL)}`;
        fallbackUsed = true;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Proxy HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the successful response
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
        
      } catch (proxyError) {
        console.error('Both direct and proxy API calls failed:', proxyError);
        
        // Return mock data for development/demo purposes
        return this.getMockData();
      }
    }
  }

  private getMockData(): EventsResponse {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      events: {
        [today]: [
          {
            unix_timestamp: Date.now() + 3600000, // 1 hour from now
            sport: 'Football',
            tournament: 'NFL',
            match: 'Kansas City Chiefs - Buffalo Bills',
            channels: ['https://topembed.pw/channel/FOXSports1[USA]', 'https://topembed.pw/channel/ESPN[USA]']
          },
          {
            unix_timestamp: Date.now() + 7200000, // 2 hours from now
            sport: 'Basketball',
            tournament: 'NBA',
            match: 'Los Angeles Lakers - Boston Celtics',
            channels: ['https://topembed.pw/channel/TNT[USA]']
          }
        ],
        [tomorrow]: [
          {
            unix_timestamp: Date.now() + 86400000 + 3600000, // Tomorrow + 1 hour
            sport: 'Tennis',
            tournament: 'ATP US Open',
            match: 'Novak Djokovic - Carlos Alcaraz',
            channels: ['https://topembed.pw/channel/ESPNTennis[USA]']
          }
        ]
      }
    };
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const apiService = new ApiService();