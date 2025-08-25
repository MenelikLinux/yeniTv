import { Trophy, Radio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  totalMatches: number;
  liveMatches: number;
  className?: string;
}

export function Header({ totalMatches, liveMatches, className }: HeaderProps) {
  return (
    <header className={cn('border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50', className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 gradient-primary rounded-lg shadow-primary">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  SportStream Hub
                </h1>
                <p className="text-sm text-muted-foreground">Live sports streaming made easy</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {totalMatches} matches
            </div>
            {liveMatches > 0 && (
              <Badge className="bg-live/20 text-live border-live/30 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                {liveMatches} Live
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}