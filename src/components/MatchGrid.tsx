import { format } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { APIMatch, GroupedMatches } from '@/types/events';
import { cn } from '@/lib/utils';

interface MatchGridProps {
  groupedMatches: GroupedMatches;
  className?: string;
}

export function MatchGrid({ groupedMatches, className }: MatchGridProps) {
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

  const getMatchCount = (matches: APIMatch[]) => {
    const liveCount = matches.filter(match => match.live).length;
    return { total: matches.length, live: liveCount };
  };

  const dates = Object.keys(groupedMatches).sort();

  if (dates.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
        <div className="p-4 gradient-card rounded-full mb-4 shadow-card">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Matches Found</h3>
        <p className="text-muted-foreground max-w-md">
          No matches match your current filters. Try adjusting your search criteria or check back later for new matches.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {dates.map((date) => {
        const matches = groupedMatches[date];
        const { total, live } = getMatchCount(matches);

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
                    <span>{total} match{total !== 1 ? 'es' : ''}</span>
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
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
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