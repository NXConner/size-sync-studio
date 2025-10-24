import React from 'react';
import { SexPosition } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, Heart, Zap, CheckCircle, Lightbulb, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PositionDetailsProps {
  position: SexPosition;
  onStartTimer?: (position: SexPosition) => void;
  onAddToSession?: (position: SexPosition) => void;
  isActive?: boolean;
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

export const PositionDetails: React.FC<PositionDetailsProps> = ({
  position,
  onStartTimer,
  onAddToSession,
  isActive = false,
  timeRemaining = 0
}) => {
  const CategoryIcon = categoryIcons[position.category] || Heart;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CategoryIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{position.name}</CardTitle>
                <CardDescription className="text-base">
                  {position.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={difficultyColors[position.difficulty]}>
                {position.difficulty}
              </Badge>
              <Badge variant="outline">{position.category}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timer Display */}
      {isActive && (
        <Card className="bg-primary/10 border-primary">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-lg text-muted-foreground">
              Time Remaining
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm">
                Pause Timer
              </Button>
              <Button variant="outline" size="sm">
                Add Time
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => onStartTimer?.(position)}
          className="flex-1"
          disabled={isActive}
        >
          <Clock className="h-4 w-4 mr-2" />
          {isActive ? 'Timer Active' : 'Start Timer'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onAddToSession?.(position)}
          className="flex-1"
        >
          <Star className="h-4 w-4 mr-2" />
          Add to Session
        </Button>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Step-by-Step Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {position.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {position.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm">
                      💡
                    </span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Benefits & Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {position.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Requirements & Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {position.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm">{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Duration Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recommended Duration:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.floor(position.duration.min / 60)} - {Math.floor(position.duration.max / 60)} minutes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {position.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
