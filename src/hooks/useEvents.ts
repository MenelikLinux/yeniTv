import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { SportsEvent, EventFilters, GroupedEvents } from '@/types/events';
import { useToast } from '@/hooks/use-toast';

export function useEvents() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<EventFilters>({
    sport: 'All',
    searchQuery: '',
    selectedDate: undefined,
  });

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.fetchEvents(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast({
        title: "Events Updated",
        description: "Successfully refreshed event data",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to update events. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Process and filter events
  const processedEvents = useCallback(() => {
    if (!eventsData?.events) return { grouped: {}, all: [], dates: [] };

    const allEvents: (SportsEvent & { date: string })[] = [];
    
    // Flatten all events with their dates
    Object.entries(eventsData.events).forEach(([date, events]) => {
      events.forEach(event => {
        allEvents.push({ ...event, date });
      });
    });

    // Apply filters
    let filteredEvents = allEvents.filter(event => {
      // Sport filter
      if (filters.sport !== 'All' && event.sport !== filters.sport) {
        return false;
      }

      // Date filter
      if (filters.selectedDate && event.date !== filters.selectedDate) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          event.match.toLowerCase().includes(query) ||
          event.tournament.toLowerCase().includes(query) ||
          event.sport.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Sort by timestamp
    filteredEvents.sort((a, b) => a.unix_timestamp - b.unix_timestamp);

    // Group by date
    const grouped: GroupedEvents = {};
    filteredEvents.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });

    // Get available dates for filter
    const dates = Object.keys(eventsData.events).sort();

    return {
      grouped,
      all: filteredEvents,
      dates,
    };
  }, [eventsData, filters]);

  const { grouped: groupedEvents, all: allEvents, dates: availableDates } = processedEvents();

  // Calculate live events
  const liveEvents = allEvents.filter(event => {
    const eventDate = new Date(event.unix_timestamp * 1000);
    const now = new Date();
    return eventDate <= now && eventDate.getTime() > now.getTime() - 3 * 60 * 60 * 1000;
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: "Using demo data. Check your connection and try refreshing.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return {
    groupedEvents,
    allEvents,
    availableDates,
    liveEvents,
    filters,
    setFilters,
    isLoading,
    isRefreshing: isRefetching,
    error,
    handleRefresh,
  };
}