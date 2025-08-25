import { format } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { EventCard } from './EventCard';
import { SportsEvent, GroupedEvents } from '@/types/events';
import { cn } from '@/lib/utils';

interface EventGridProps {
  groupedEvents: GroupedEvents;
  className?: string;
}

export function EventGrid({ groupedEvents, className }: EventGridProps) {
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  const getEventCount = (events: SportsEvent[]) => {
    const now = new Date();
    const liveCount = events.filter(event => {
      const eventDate = new Date(event.unix_timestamp * 1000);
      return eventDate <= now && eventDate.getTime() > now.getTime() - 3 * 60 * 60 * 1000;
    }).length;

    return { total: events.length, live: liveCount };
  };

  const dates = Object.keys(groupedEvents).sort();

  if (dates.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
        <div className="p-4 gradient-card rounded-full mb-4 shadow-card">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
        <p className="text-muted-foreground max-w-md">
          No events match your current filters. Try adjusting your search criteria or check back later for new events.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {dates.map((date) => {
        const events = groupedEvents[date];
        const { total, live } = getEventCount(events);

        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-foreground">
                  {formatDateHeader(date)}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>{total} event{total !== 1 ? 's' : ''}</span>
                  </div>
                  {live > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-live">
                      <div className="w-2 h-2 bg-live rounded-full animate-pulse" />
                      <span>{live} live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard
                  key={`${event.unix_timestamp}-${index}`}
                  event={event}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}