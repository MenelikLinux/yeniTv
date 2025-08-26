import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Play, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StreamModal } from './StreamModal';
import { APIMatch } from '@/types/events';
import { getBestStreams } from '@/utils/streamUtils';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: APIMatch;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const [streamModal, setStreamModal] = useState<{
    isOpen: boolean;
    streamUrl: string;
    sourceName?: string;
    quality?: string;
  }>({
    isOpen: false,
    streamUrl: '',
  });

  const matchDate = new Date(match.date);
  const now = new Date();
  const isLive = match.live;
  const isUpcoming = matchDate > now && matchDate.getTime() - now.getTime() < 60 * 60 * 1000; // Upcoming if within 1 hour
  
  const bestStreams = getBestStreams(match.sources);

  const getSportColor = (sport: string) => {
    const colors = {
      'football': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'basketball': 'bg-red-500/20 text-red-400 border-red-500/30',
      'baseball': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'tennis': 'bg-green-500/20 text-green-400 border-green-500/30',
      'hockey': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'soccer': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[sport as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleStreamClick = (embedUrl: string, sourceName?: string, quality?: string) => {
    setStreamModal({
      isOpen: true,
      streamUrl: embedUrl,
      sourceName,
      quality,
    });
  };

  const closeStreamModal = () => {
    setStreamModal({
      isOpen: false,
      streamUrl: '',
      sourceName: undefined,
      quality: undefined,
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
                {match.title}
              </CardTitle>
              {match.teams && (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {match.teams.home && (
                    <div className="flex items-center gap-2">
                      <img src={match.teams.home.badge} alt="" className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span>{match.teams.home.name}</span>
                    </div>
                  )}
                  <span>vs</span>
                  {match.teams.away && (
                    <div className="flex items-center gap-2">
                      <img src={match.teams.away.badge} alt="" className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span>{match.teams.away.name}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn('text-xs font-medium border', getSportColor(match.category))}>
                  {match.category.charAt(0).toUpperCase() + match.category.slice(1)}
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
                {match.popular && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Popular
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
                <span className="truncate">{match.league}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(matchDate, 'MMM d, h:mm a')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {bestStreams.length} stream{bestStreams.length !== 1 ? 's' : ''} available
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {bestStreams.slice(0, 2).map((source, index) => (
                <Button
                  key={source.id}
                  onClick={() => handleStreamClick(source.embed, source.name, source.quality)}
                  className={cn(
                    'flex-1 min-w-0 transition-smooth flex-col gap-1 h-auto py-2',
                    isLive 
                      ? 'gradient-live shadow-live hover:shadow-live/80 text-white border-0' 
                      : 'gradient-primary shadow-primary hover:shadow-primary/80 text-primary-foreground border-0'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>{source.name || `Stream ${index + 1}`}</span>
                  </div>
                  {source.quality && (
                    <span className="text-xs opacity-80">{source.quality}</span>
                  )}
                </Button>
              ))}
              {bestStreams.length > 2 && (
                <Button
                  variant="outline"
                  onClick={() => handleStreamClick(bestStreams[2].embed, bestStreams[2].name, bestStreams[2].quality)}
                  className="border-border/50 hover:bg-muted/50 text-muted-foreground"
                >
                  +{bestStreams.length - 2} more
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
        matchTitle={match.title}
        tournament={match.league}
        sport={match.category}
        sourceName={streamModal.sourceName}
        quality={streamModal.quality}
      />
    </>
  );
}