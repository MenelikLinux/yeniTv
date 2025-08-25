import { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { EventGrid } from '@/components/EventGrid';
import { useEvents } from '@/hooks/useEvents';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const {
    groupedEvents,
    availableDates,
    liveEvents,
    filters,
    setFilters,
    isLoading,
    isRefreshing,
    error,
    handleRefresh,
  } = useEvents();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          liveEventCount={0}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="p-4 gradient-primary rounded-full mb-4 shadow-primary mx-auto w-fit">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Events</h2>
            <p className="text-muted-foreground">Fetching the latest sports events...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        liveEventCount={liveEvents.length}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Connection Status */}
        {!isOnline && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && isOnline && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to the sports API. Showing demo data for development purposes.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            availableDates={availableDates}
          />
        </div>

        {/* Events Grid */}
        <EventGrid groupedEvents={groupedEvents} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Wifi className="w-4 h-4" />
            <span>Real-time sports streaming aggregator</span>
          </div>
          <p>Stream responsibly and respect broadcasting rights</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
