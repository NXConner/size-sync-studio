import React from 'react';
import { SexPosition } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, Heart, Zap } from 'lucide-react';

interface PositionCardProps {
  position: SexPosition;
  isActive?: boolean;
  onSelect?: (position: SexPosition) => void;
  showTimer?: boolean;
  timeRemaining?: number;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const categoryIcons = {
  missionary: Heart,
  cowgirl: Users,
  doggy: Users,
  standing: Users,
  sitting: Users,
  kneeling: Users,
  side: Users,
  spooning: Heart,
  oral: Heart,
  anal: Heart,
  kinky: Zap,
  tantric: Star,
  beginner: Heart,
  advanced: Star,
  acrobatic: Zap
};

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  isActive = false,
  onSelect,
  showTimer = false,
  timeRemaining = 0
}) => {
  const CategoryIcon = categoryIcons[position.category] || Heart;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={() => onSelect?.(position)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{position.name}</CardTitle>
          </div>
          <Badge className={difficultyColors[position.difficulty]}>
            {position.difficulty}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {position.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer Display */}
        {showTimer && isActive && (
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground">
              Time Remaining
            </div>
          </div>
        )}

        {/* Duration Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {Math.floor(position.duration.min / 60)}-{Math.floor(position.duration.max / 60)} minutes
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {position.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {position.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{position.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Quick Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {position.tips.slice(0, 2).map((tip, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Benefits:</h4>
          <div className="flex flex-wrap gap-1">
            {position.benefits.slice(0, 2).map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
