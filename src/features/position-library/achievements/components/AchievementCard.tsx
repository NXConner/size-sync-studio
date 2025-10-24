import React from 'react';
import { Achievement } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Lock, Eye, EyeOff } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onView?: (achievement: Achievement) => void;
  showProgress?: boolean;
  isCompact?: boolean;
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  uncommon: 'bg-green-100 text-green-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800',
  mythic: 'bg-red-100 text-red-800'
};

const rarityIcons = {
  common: '⭐',
  uncommon: '🌟',
  rare: '💎',
  epic: '👑',
  legendary: '🏆',
  mythic: '🔥'
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onView,
  showProgress = true,
  isCompact = false
}) => {
  const isUnlocked = achievement.isUnlocked;
  const isSecret = achievement.isSecret && !isUnlocked;
  const progress = achievement.progress;
  const points = achievement.points;

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg ${
        isUnlocked ? 'ring-2 ring-yellow-400 shadow-lg' : 'hover:shadow-md'
      } ${isSecret ? 'opacity-75' : ''}`}
    >
      <CardHeader className={isCompact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">
              {isSecret ? '❓' : achievement.icon}
            </div>
            <div>
              <CardTitle className={`text-lg ${isSecret ? 'text-muted-foreground' : ''}`}>
                {isSecret ? 'Secret Achievement' : achievement.name}
              </CardTitle>
              {!isCompact && (
                <CardDescription className="text-sm">
                  {isSecret ? 'Complete requirements to reveal' : achievement.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={rarityColors[achievement.rarity]}>
              {rarityIcons[achievement.rarity]} {achievement.rarity}
            </Badge>
            {isUnlocked && (
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                <Trophy className="h-3 w-3 mr-1" />
                Unlocked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {!isCompact && (
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {showProgress && !isUnlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Requirements */}
          {!isSecret && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requirements:</h4>
              <ul className="space-y-1">
                {achievement.requirements.map((req, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {req.current >= req.target ? (
                        <Star className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={req.current >= req.target ? 'text-green-600' : ''}>
                        {req.description}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {req.current}/{req.target}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Points and Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {points} points
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {achievement.category.replace('_', ' ')}
              </Badge>
            </div>
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(achievement)}
                className="flex items-center gap-1"
              >
                {isSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                View
              </Button>
            )}
          </div>

          {/* Unlock Date */}
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-muted-foreground">
              Unlocked on {achievement.unlockedAt.toLocaleDateString()}
            </div>
          )}

          {/* Tags */}
          {achievement.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {achievement.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}

      {/* Compact Mode Content */}
      {isCompact && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={rarityColors[achievement.rarity]}>
                {achievement.rarity}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {points} points
              </span>
            </div>
            {isUnlocked ? (
              <Trophy className="h-4 w-4 text-yellow-500" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
