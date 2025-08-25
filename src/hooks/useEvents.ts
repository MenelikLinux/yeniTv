import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { APIMatch, MatchFilters, GroupedMatches, SportType } from '@/types/events';
import { useToast } from '@/hooks/use-toast';

export function useMatches() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<MatchFilters>({
    sport: 'All',
    searchQuery: '',
    selectedDate: undefined,
    liveOnly: false,
  });

  const {
    data: matchesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['matches', filters.sport, filters.liveOnly ? 'live' : 'all'],
    queryFn: () => apiService.fetchMatches(
      filters.sport === 'All' ? undefined : filters.sport,
      filters.liveOnly ? 'live' : 'all'
    ),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast({
        title: "Matches Updated",
        description: "Successfully refreshed match data",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to update matches. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  // Process and filter matches
  const processedMatches = useCallback(() => {
    if (!matchesData) return { grouped: {}, all: [], dates: [] };

    const allMatches = matchesData.map(match => ({
      ...match,
      dateString: new Date(match.date).toISOString().split('T')[0]
    }));

    // Apply filters
    let filteredMatches = allMatches.filter(match => {
      // Sport filter
      if (filters.sport !== 'All' && match.category !== filters.sport) {
        return false;
      }

      // Date filter
      if (filters.selectedDate && match.dateString !== filters.selectedDate) {
        return false;
      }

      // Live filter
      if (filters.liveOnly && !match.live) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          match.title.toLowerCase().includes(query) ||
          match.league.toLowerCase().includes(query) ||
          match.category.toLowerCase().includes(query) ||
          (match.teams?.home?.name.toLowerCase().includes(query)) ||
          (match.teams?.away?.name.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Sort by date
    filteredMatches.sort((a, b) => a.date - b.date);

    // Group by date
    const grouped: GroupedMatches = {};
    filteredMatches.forEach(match => {
      if (!grouped[match.dateString]) {
        grouped[match.dateString] = [];
      }
      grouped[match.dateString].push(match);
    });

    // Get available dates for filter
    const dates = [...new Set(allMatches.map(m => m.dateString))].sort();

    return {
      grouped,
      all: filteredMatches,
      dates,
    };
  }, [matchesData, filters]);

  const { grouped: groupedMatches, all: allMatches, dates: availableDates } = processedMatches();

  // Calculate live matches
  const liveMatches = allMatches.filter(match => match.live);

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
    groupedMatches,
    allMatches,
    availableDates,
    liveMatches,
    filters,
    setFilters,
    isLoading,
    isRefreshing: isRefetching,
    error,
    handleRefresh,
  };
}