import { Search, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MatchFilters, SportType } from '@/types/events';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  availableDates: string[];
  liveCount: number;
}

const SPORTS: SportType[] = ['All', 'football', 'basketball', 'baseball', 'tennis', 'hockey', 'soccer'];

export function FilterBar({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  isRefreshing = false,
  availableDates,
  liveCount
}: FilterBarProps) {
  const getSportIcon = (sport: SportType) => {
    const icons = {
      'All': '🏟️',
      'football': '🏈',
      'basketball': '🏀',
      'baseball': '⚾',
      'tennis': '🎾',
      'hockey': '🏒',
      'soccer': '⚽',
    };
    return icons[sport] || '🏟️';
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  return (
    <div className="space-y-4">{/* Search Bar */}
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search events, teams, or tournaments..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-smooth"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Date Filter */}
        <Select 
          value={filters.selectedDate || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            selectedDate: value === 'all' ? undefined : value 
          })}
        >
          <SelectTrigger className="w-[180px] bg-muted/30 border-border/50">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {availableDates.map((date) => (
              <SelectItem key={date} value={date}>
                {formatDateForDisplay(date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sport Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <Badge
              key={sport}
              variant={filters.sport === sport ? "default" : "outline"}
              className={cn(
                'cursor-pointer transition-smooth hover:scale-105',
                filters.sport === sport 
                  ? 'gradient-primary shadow-primary text-primary-foreground border-0' 
                  : 'bg-muted/30 hover:bg-muted/50 border-border/50'
              )}
              onClick={() => onFiltersChange({ ...filters, sport })}
            >
              <span className="mr-1">{getSportIcon(sport)}</span>
              {sport === 'All' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.searchQuery || filters.selectedDate || filters.sport !== 'All') && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Active filters:</span>
          {filters.sport !== 'All' && (
            <Badge variant="secondary" className="text-xs">
              {filters.sport.charAt(0).toUpperCase() + filters.sport.slice(1)}
            </Badge>
          )}
          {filters.selectedDate && (
            <Badge variant="secondary" className="text-xs">
              {formatDateForDisplay(filters.selectedDate)}
            </Badge>
          )}
          {filters.searchQuery && (
            <Badge variant="secondary" className="text-xs">
              "{filters.searchQuery}"
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ sport: 'All', searchQuery: '', selectedDate: undefined, liveOnly: false })}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}