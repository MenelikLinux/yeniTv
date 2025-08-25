export interface SportsEvent {
  unix_timestamp: number;
  sport: string;
  tournament: string;
  match: string;
  channels: string[];
}

export interface EventsResponse {
  events: {
    [date: string]: SportsEvent[];
  };
}

export interface GroupedEvents {
  [date: string]: SportsEvent[];
}

export type SportType = 'Football' | 'Basketball' | 'Tennis' | 'Baseball' | 'Hockey' | 'Soccer' | 'Equestrian' | 'All';

export interface EventFilters {
  sport: SportType;
  searchQuery: string;
  selectedDate?: string;
}