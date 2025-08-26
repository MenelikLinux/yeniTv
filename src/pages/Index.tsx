import React from 'react';
import { useMatches } from '@/hooks/useEvents';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { MatchGrid } from '@/components/MatchGrid';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const {
    groupedMatches,
    allMatches,
    availableDates,
    liveMatches,
    filters,
    setFilters,
    isLoading,
    isRefreshing,
    error,
    handleRefresh,
  } = useMatches();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Yeni Tv Loading matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        totalMatches={allMatches.length}
        liveMatches={liveMatches.length}
      />
      
      <main className="container mx-auto px-4 py-8">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          availableDates={availableDates}
          liveCount={liveMatches.length}
        />
        
        <MatchGrid 
          groupedMatches={groupedMatches}
          className="mt-8"
        />
      </main>
    </div>
  );
};

export default Index;
