import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Play, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StreamModal } from './StreamModal';
import { SportsEvent } from '@/types/events';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: SportsEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const [streamModal, setStreamModal] = useState<{
    isOpen: boolean;
    streamUrl: string;
  }>({
    isOpen: false,
    streamUrl: '',
  });

  const eventDate = new Date(event.unix_timestamp * 1000);
  const now = new Date();
  const isLive = eventDate <= now && eventDate.getTime() > now.getTime() - 3 * 60 * 60 * 1000; // Live if within 3 hours
  const isUpcoming = eventDate > now && eventDate.getTime() - now.getTime() < 60 * 60 * 1000; // Upcoming if within 1 hour

  const getSportColor = (sport: string) => {
    const colors = {
      'Football': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Basketball': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Baseball': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Tennis': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Hockey': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Soccer': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Equestrian': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[sport as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleStreamClick = (channelUrl: string) => {
    setStreamModal({
      isOpen: true,
      streamUrl: channelUrl,
    });
  };

  const closeStreamModal = () => {
    setStreamModal({
      isOpen: false,
      streamUrl: '',
    });
  };

  return (
    <>
      <Card className={cn(
        'gradient-card shadow-card transition-smooth hover:shadow-primary/20 hover:scale-[1.02] border-border/50',
        isLive && 'ring-2 ring-live pulse-live',
        isUpcoming && 'ring-2 ring-accent',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-foreground truncate">
                {event.match}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn('text-xs font-medium border', getSportColor(event.sport))}>
                  {event.sport}
                </Badge>
                {isLive && (
                  <Badge className="bg-live/20 text-live border-live/30 animate-pulse">
                    <div className="w-2 h-2 bg-live rounded-full mr-1" />
                    LIVE
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    Starting Soon
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span className="truncate">{event.tournament}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(eventDate, 'MMM d, h:mm a')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {event.channels.length} stream{event.channels.length !== 1 ? 's' : ''} available
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {event.channels.slice(0, 2).map((channel, index) => (
                <Button
                  key={index}
                  onClick={() => handleStreamClick(channel)}
                  className={cn(
                    'flex-1 min-w-0 transition-smooth',
                    isLive 
                      ? 'gradient-live shadow-live hover:shadow-live/80 text-white border-0' 
                      : 'gradient-primary shadow-primary hover:shadow-primary/80 text-primary-foreground border-0'
                  )}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Stream {index + 1}
                </Button>
              ))}
              {event.channels.length > 2 && (
                <Button
                  variant="outline"
                  onClick={() => handleStreamClick(event.channels[2])}
                  className="border-border/50 hover:bg-muted/50 text-muted-foreground"
                >
                  +{event.channels.length - 2} more
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <StreamModal
        isOpen={streamModal.isOpen}
        onClose={closeStreamModal}
        streamUrl={streamModal.streamUrl}
        matchTitle={event.match}
        tournament={event.tournament}
        sport={event.sport}
      />
    </>
  );
}